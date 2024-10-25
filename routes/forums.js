// const express = require('express');
// const router = express.Router();
// const Forum = require('../models/forum'); // Assuming the model is in the models directory
// const mongoose = require('mongoose');

// // Middleware for authentication (optional, if needed for protected routes)
// const { verifyToken } = require('../middleware/auth');

// // Create a new forum post
// router.post('/', verifyToken, async (req, res) => {
//     const { title, categories, content, users, image } = req.body;

//     try {
//         const newForum = new Forum({
//             title,
//             categories,
//             content,
//             users,
//             image
//         });

//         const savedForum = await newForum.save();
//         res.status(201).json(savedForum);
//     } catch (error) {
//         res.status(400).json({ message: error.message });
//     }
// });

// // Get all forum posts
// router.get('/', async (req, res) => {
//     try {
//         const forums = await Forum.find().populate('users categories').exec();
//         res.status(200).json(forums);
//     } catch (error) {
//         res.status(500).json({ message: error.message });
//     }
// });

// // Get a single forum post by ID
// router.get('/:id', async (req, res) => {
//     try {
//         const forum = await Forum.findById(req.params.id).populate('users categories Comments.user Comments.replies.user').exec();
//         if (!forum) return res.status(404).json({ message: 'Forum post not found' });
//         res.status(200).json(forum);
//     } catch (error) {
//         res.status(500).json({ message: error.message });
//     }
// });

// // Update a forum post by ID
// router.put('/:id', verifyToken, async (req, res) => {
//     const { title, categories, content, image } = req.body;

//     try {
//         const updatedForum = await Forum.findByIdAndUpdate(
//             req.params.id,
//             { title, categories, content, image },
//             { new: true }
//         );

//         if (!updatedForum) return res.status(404).json({ message: 'Forum post not found' });
//         res.status(200).json(updatedForum);
//     } catch (error) {
//         res.status(500).json({ message: error.message });
//     }
// });

// // Delete a forum post by ID
// router.delete('/:id', verifyToken, async (req, res) => {
//     try {
//         const deletedForum = await Forum.findByIdAndDelete(req.params.id);
//         if (!deletedForum) return res.status(404).json({ message: 'Forum post not found' });
//         res.status(200).json({ message: 'Forum post deleted successfully' });
//     } catch (error) {
//         res.status(500).json({ message: error.message });
//     }
// });

// // Add a comment to a forum post
// router.post('/:id/comments', verifyToken, async (req, res) => {
//     const { comment } = req.body;

//     try {
//         const forum = await Forum.findById(req.params.id);
//         if (!forum) return res.status(404).json({ message: 'Forum post not found' });

//         forum.Comments.push({
//             user: req.user.id, // Assuming req.user.id contains authenticated user ID
//             comment
//         });

//         await forum.save();
//         res.status(201).json(forum);
//     } catch (error) {
//         res.status(500).json({ message: error.message });
//     }
// });

// // Add a reply to a comment
// router.post('/:forumId/comments/:commentId/replies', verifyToken, async (req, res) => {
//     const { comment } = req.body;

//     try {
//         const forum = await Forum.findById(req.params.forumId);
//         if (!forum) return res.status(404).json({ message: 'Forum post not found' });

//         const commentObj = forum.Comments.id(req.params.commentId);
//         if (!commentObj) return res.status(404).json({ message: 'Comment not found' });

//         commentObj.replies.push({
//             user: req.user.id,
//             comment
//         });

//         await forum.save();
//         res.status(201).json(forum);
//     } catch (error) {
//         res.status(500).json({ message: error.message });
//     }
// });

// module.exports = router;
