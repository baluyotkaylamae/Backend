const express = require("express");
const mongoose = require("mongoose");
const { Chat } = require("../models/chat");
const { User } = require("../models/user");

const router = express.Router();

// // Fetch all chat messages (general)

router.get("/chats", async (req, res) => {
    try {
        // Get the chat messages and group them by sender and user
        const chats = await Chat.aggregate([
            { $match: { room: "general" } }, // If you're filtering by room, else remove this line
            {
                $group: {
                    _id: { sender: "$sender", user: "$user" }, // Group by sender and user (chat participant)
                    lastMessage: { $last: "$message" }, // Get the last message for this chat pair
                    lastMessageTimestamp: { $last: "$createdAt" }, // Get the timestamp of the last message
                },
            },
            {
                $lookup: {
                    from: "users", // Look up the sender's data from the 'users' collection
                    localField: "_id.sender",
                    foreignField: "_id",
                    as: "sender",
                },
            },
            {
                $lookup: {
                    from: "users", // Look up the recipient's data from the 'users' collection
                    localField: "_id.user",
                    foreignField: "_id",
                    as: "user",
                },
            },
            {
                $unwind: "$sender", // Unwind the sender array so we can access it directly
            },
            {
                $unwind: "$user", // Unwind the user array so we can access it directly
            },
            {
                $project: {
                    _id: 1,
                    lastMessage: 1,
                    lastMessageTimestamp: 1,
                    sender: {
                        _id: 1,
                        name: 1,
                        email: 1,
                        image: 1, // Include sender's image if needed
                    },
                    user: {
                        _id: 1,
                        name: 1,
                        email: 1,
                        image: 1, // Include recipient's image if needed
                    },
                },
            },
        ]);

        if (!chats.length) {
            return res.status(404).json({ success: false, message: "No chats found" });
        }

        // Return the aggregated chat data with the last message
        return res.status(200).json({ success: true, chats });
    } catch (error) {
        console.error("Error fetching chats:", error);
        return res.status(500).json({ success: false, message: "Internal server error", error: error.message });
    }
});


// Fetch messages for a specific user
router.get("/user/:userId", async (req, res) => {
    // const { userId } = req.params;
    const userId = req.params.userId;
    try {
        console.log("Fetching chats for user ID:", userId);
        const chats = await Chat.find({
            $or: [{ user: userId }, { sender: userId }],
        })
            .populate("user", "name image")
            .populate("sender", "name image");

        if (!chats.length) {
            return res.status(404).json({ message: "No chats found for this user" });
        }

        res.status(200).json({ chats });
    } catch (error) {
        console.error("Error fetching chats:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});



// Fetch messages for a specific room
router.get("/room/:room", async (req, res) => {
    try {
        const { room } = req.params;

        const chats = await Chat.find({ room })
            .populate("user", "name email")
            .populate("sender", "name email")
            .sort({ createdAt: -1 });

        if (!chats.length) {
            return res.status(404).json({ success: false, message: "No messages found for this room" });
        }

        res.status(200).json({ success: true, chats });
    } catch (error) {
        console.error("Error fetching room messages:", error);
        res.status(500).json({ success: false, message: "Internal server error", error: error.message });
    }
});


// Fetch messages between sender and receiver
router.get("/messages/:senderId/:receiverId", async (req, res) => {
    const { senderId, receiverId } = req.params;

    try {
        // Query messages where the sender is senderId and the receiver is receiverId, or vice versa
        const messages = await Chat.find({
            $or: [
                { user: senderId, sender: receiverId },
                { user: receiverId, sender: senderId }
            ]
        })
            .populate("user", "name email image")
            .populate("sender", "name email image")
            .sort({ createdAt: 1 }); // Sorting messages in ascending order by creation date

        if (!messages.length) {
            return res.status(404).json({ message: "No messages found between these users" });
        }

        res.status(200).json({ messages });
    } catch (error) {
        console.error("Error fetching messages:", error);
        res.status(500).json({ message: "Internal server error", error: error.message });
    }
});


// Create a new chat message
router.post("/messages", async (req, res) => {
    try {
        const { user, sender, message, room } = req.body;

        if (!user || !sender || !message) {
            return res.status(400).json({
                success: false,
                message: "Recipient, sender, and message are required",
            });
        }

        const newChat = new Chat({
            user,
            sender,
            message,
            room: room || "general", // Default to general if room not provided
        });

        const savedChat = await newChat.save();

        res.status(201).json({ success: true, message: "Chat created successfully", chat: savedChat });
    } catch (err) {
        console.error('Error sending message:', err.response?.data || err.message); // Log the complete error response
        setError('Error sending message');
    }
});

// Update a chat message by ID
router.put("/:id", async (req, res) => {
    try {
        const chatId = req.params.id;

        if (!mongoose.Types.ObjectId.isValid(chatId)) {
            return res.status(400).json({ success: false, message: "Invalid chat ID format" });
        }

        const updatedChat = await Chat.findByIdAndUpdate(chatId, req.body, {
            new: true,
        });

        if (!updatedChat) {
            return res.status(404).json({ success: false, message: "Chat not found" });
        }

        res.status(200).json({ success: true, message: "Chat updated successfully", chat: updatedChat });
    } catch (error) {
        console.error("Error updating chat:", error);
        res.status(500).json({ success: false, message: "Internal server error", error: error.message });
    }
});

// Delete a chat message by ID
router.delete("/:id", async (req, res) => {
    try {
        const chatId = req.params.id;

        if (!mongoose.Types.ObjectId.isValid(chatId)) {
            return res.status(400).json({ success: false, message: "Invalid chat ID format" });
        }

        const deletedChat = await Chat.findByIdAndDelete(chatId);

        if (!deletedChat) {
            return res.status(404).json({ success: false, message: "Chat not found" });
        }

        res.status(200).json({ success: true, message: "Chat deleted successfully" });
    } catch (error) {
        console.error("Error deleting chat:", error);
        res.status(500).json({ success: false, message: "Internal server error", error: error.message });
    }
});

module.exports = router;