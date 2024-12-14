const mongoose = require("mongoose");

const chatSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, // The recipient
  sender: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, // The sender
  message: { type: String, required: true },
  room: { type: String, default: "general", index: true }, // Room for group chats or general chat
  isRead: { type: Boolean, default: false }, // Read status of the message
  createdAt: { type: Date, default: Date.now, index: true }, // Timestamp of the message
});

const Chat = mongoose.model("Chat", chatSchema);

module.exports = { Chat };

