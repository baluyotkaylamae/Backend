const { Post } = require('../../models/post'); // Adjust the path to your Post model
const cloudinary = require('../../config/configCloudinary');
const upload = require('../../config/multer');
const jwt = require('jsonwebtoken');

// Create a new post
exports.createPost = async (req, res) => {
    const { title, content, user, category } = req.body;

    // Check for missing fields
    if (!title || !content || !user || !category) {
        return res.status(400).json({ message: 'Title, content, user ID, and category are required.' });
    }

    try {
        // Upload each image to Cloudinary
        const images = req.files.map(file => file.path); // Array of Cloudinary URLs from each uploaded file

        // Create post with the array of image URLs
        const post = new Post({
            title,
            content,
            images,  // Save array of image URLs
            user,
            category,
            likes: 0
        });

        const savedPost = await post.save();
        res.status(201).json(savedPost);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Get all posts
// exports.getPosts = async (req, res) => {
//     try {
//         const posts = await Post.find()
//             .populate('user', 'name email') // Populate user details
//             .populate('category', 'name description'); // Populate category details
//         res.status(200).json(posts);
//     } catch (error) {
//         res.status(500).json({ message: error.message });
//     }
// };
exports.getPosts = async (req, res) => {
    try {
        const posts = await Post.find()
            .populate('user', 'name email image') // Include image in the populated user details
            .populate('category', 'name description') // Populate category details
            .populate({
                path: 'comments.user',
                select: 'name image', // Populate user details for comments
            });
        res.status(200).json(posts);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


// Get a single post by ID
// exports.getPostById = async (req, res) => {
//     try {
//         const post = await Post.findById(req.params.id)
//             .populate('user', 'name email')
//             .populate('category', 'name description'); // Populate category details
//         if (!post) return res.status(404).json({ message: 'Post not found' });
//         res.status(200).json(post);
//     } catch (error) {
//         res.status(500).json({ message: error.message });
//     }
// };
exports.getPostById = async (req, res) => {
    try {
        const post = await Post.findById(req.params.id)
            .populate('user', 'name email image') // Include image in populated user details
            .populate('category', 'name description')
            .populate({
                path: 'comments.user',
                select: 'name image', // Populate user details for comments
            });
        if (!post) return res.status(404).json({ message: 'Post not found' });
        res.status(200).json(post);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


// Update a post by ID

exports.updatePost = async (req, res) => {
    try {
        const { category, ...rest } = req.body; // Extract category and other fields from the body

        // Upload each new image to Cloudinary and get their URLs
        const newImages = req.files.map(file => file.path); // Get the array of image URLs

        // Find the post to update
        const post = await Post.findById(req.params.id);

        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }

        // Update the post fields
        post.title = rest.title || post.title; // Preserve existing values if not provided
        post.content = rest.content || post.content;
        post.category = category || post.category;

        // Update images array: you can choose to replace or append
        post.images = [...post.images, ...newImages]; // Append new images to the existing array

        const updatedPost = await post.save(); // Save the updated post

        res.status(200).json(updatedPost);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Delete a post by ID
exports.deletePost = async (req, res) => {
    try {
        const post = await Post.findByIdAndDelete(req.params.id);
        if (!post) return res.status(404).json({ message: 'Post not found' });
        res.status(204).send(); // No content to send back
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


// Add a new comment to a post
// exports.addComment = async (req, res) => {
//     console.log('User from token:', req.user); // Log user data


//     const { postId } = req.params;
//     const { content } = req.body;


//     const userId = req.auth.userId;

//     if (!userId || !content) {
//         return res.status(400).json({ message: 'User ID and content are required.' });

//     }

//     try {
//         const post = await Post.findById(postId);
//         if (!post) {
//             return res.status(404).json({ message: 'Post not found' });
//         }

//         // Add new comment to the comments array
//         post.comments.push({ user: userId, content }); // Use the userId from the token
//         const updatedPost = await post.save();

//         res.status(201).json(updatedPost);
//     } catch (error) {
//         console.error('Error adding comment:', error); // Log error details
//         res.status(400).json({ message: error.message });
//     }
// };
exports.addComment = async (req, res) => {
    console.log('User from token:', req.user); // Log user data

    const { postId } = req.params;
    const { content } = req.body;

    const userId = req.auth.userId;

    if (!userId || !content) {
        return res.status(400).json({ message: 'User ID and content are required.' });
    }

    try {
        const post = await Post.findById(postId);
        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }

        // Add new comment to the comments array
        post.comments.push({ user: userId, content }); // Use the userId from the token
        const updatedPost = await post.save();

        // Populate user details for the updated post's comments
        await updatedPost.populate({
            path: 'comments.user',
            select: 'name image' // Ensure to select the user details
        });

        res.status(201).json(updatedPost);
    } catch (error) {
        console.error('Error adding comment:', error); // Log error details
        res.status(400).json({ message: error.message });
    }
};


// Add a reply to a comment within a post
// exports.addReply = async (req, res) => {
//     const { postId, commentId } = req.params;
//     const { user, content } = req.body;

//     if (!user || !content) {
//         return res.status(400).json({ message: 'User ID and content are required.' });
//     }

//     try {
//         const post = await Post.findById(postId);
//         if (!post) return res.status(404).json({ message: 'Post not found' });

//         const comment = post.comments.id(commentId);
//         if (!comment) return res.status(404).json({ message: 'Comment not found' });

//         // Add reply to the selected comment
//         comment.replies.push({ user, content });
//         const updatedPost = await post.save();

//         res.status(201).json(updatedPost);
//     } catch (error) {
//         res.status(400).json({ message: error.message });
//     }
// };

exports.addReply = async (req, res) => {
    const { postId, commentId } = req.params;
    const { content } = req.body;
    const userId = req.auth.userId;

    if (!userId || !content) {
        return res.status(400).json({ message: 'User ID and content are required.' });
    }

    try {
        const post = await Post.findById(postId);
        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }

        const comment = post.comments.id(commentId);
        if (!comment) {
            return res.status(404).json({ message: 'Comment not found' });
        }

        // Add reply to the specific comment
        comment.replies.push({ user: userId, content });
        await post.save();

        // Populate user details for each reply's user in the comment
        await post.populate({
            path: 'comments.replies.user',
            select: 'name image'
        });

        res.status(201).json(post);
    } catch (error) {
        console.error('Error adding reply:', error);
        res.status(400).json({ message: error.message });
    }
};


// // Update a comment by ID
// exports.updateComment = async (req, res) => {
//     const { postId, commentId } = req.params;
//     const { content } = req.body;

//     try {
//         const post = await Post.findById(postId);
//         if (!post) return res.status(404).json({ message: 'Post not found' });

//         const comment = post.comments.id(commentId);
//         if (!comment) return res.status(404).json({ message: 'Comment not found' });

//         // Update comment content
//         comment.content = content || comment.content;
//         const updatedPost = await post.save();

//         res.status(200).json(updatedPost);
//     } catch (error) {
//         res.status(400).json({ message: error.message });
//     }
// };

// exports.deleteComment = async (req, res) => {
//     const { postId, commentId } = req.params;

//     try {
//         const post = await Post.findById(postId);
//         if (!post) return res.status(404).json({ message: 'Post not found' });

//         // Find the comment index and remove it manually
//         const commentIndex = post.comments.findIndex(comment => comment._id.toString() === commentId);
//         if (commentIndex === -1) return res.status(404).json({ message: 'Comment not found' });

//         // Remove the comment by index
//         post.comments.splice(commentIndex, 1);

//         // Save the updated post
//         const updatedPost = await post.save();

//         res.status(204).send(); // No content response for successful deletion
//     } catch (error) {
//         res.status(500).json({ message: error.message });
//     }
// };

exports.updateComment = async (req, res) => {
    const { postId, commentId } = req.params;
    const { content } = req.body;
    const userId = req.auth.userId;
    const isAdmin = req.auth.isAdmin; // Assume isAdmin is set in authJwt middleware

    try {
        const post = await Post.findById(postId);
        if (!post) return res.status(404).json({ message: 'Post not found' });

        const comment = post.comments.id(commentId);
        if (!comment) return res.status(404).json({ message: 'Comment not found' });

        // Check if the user is the comment author
        if (comment.user.toString() !== userId && !isAdmin) {
            return res.status(403).json({ message: 'Unauthorized to edit this comment' });
        }

        // Only allow authors to edit their own comments (admin cannot edit)
        if (comment.user.toString() === userId) {
            comment.content = content || comment.content;
            const updatedPost = await post.save();
            res.status(200).json(updatedPost);
        } else {
            res.status(403).json({ message: 'Admins cannot edit comments' });
        }
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Delete a comment by ID
exports.deleteComment = async (req, res) => {
    const { postId, commentId } = req.params;
    const userId = req.auth.userId;
    const isAdmin = req.auth.isAdmin; // Assume isAdmin is set in authJwt middleware

    try {
        const post = await Post.findById(postId);
        if (!post) return res.status(404).json({ message: 'Post not found' });

        const comment = post.comments.id(commentId);
        if (!comment) return res.status(404).json({ message: 'Comment not found' });

        // Check if the user is the comment author or an admin
        if (comment.user.toString() !== userId && !isAdmin) {
            return res.status(403).json({ message: 'Unauthorized to delete this comment' });
        }

        // Remove the comment and save the post
        post.comments.id(commentId).remove();
        const updatedPost = await post.save();
        res.status(204).send(); // No content response for successful deletion
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};