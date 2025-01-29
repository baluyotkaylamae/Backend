const express = require('express');
const router = express.Router();
const postController = require('../controller/PostController'); // Adjust the path as necessary
const upload = require('../../config/multer');
const authJwt = require('../../helpers/jwt'); 

// Route for creating a new post
router.post('/', upload.array('images', 5), postController.createPost);

// Route for getting all posts
router.get('/', postController.getPosts);

// Route for getting a single post by ID
router.get('/:id', postController.getPostById);

// Route for updating a post by ID
router.put('/:id', upload.array('images', 5), postController.updatePost);

// Route for deleting a post by ID
router.delete('/:id', postController.deletePost);

// Protected routes for comments - Add the authJwt middleware
router.post('/:postId/comments', authJwt(), postController.addComment); // Add a comment to a post
router.post('/:postId/comments/:commentId/replies', authJwt(), postController.addReply); // Add a reply to a comment
router.put('/:postId/comments/:commentId', authJwt(), postController.updateComment); // Update a comment by ID
router.delete('/:postId/comments/:commentId', authJwt(), postController.deleteComment); // Delete a comment by ID
router.get('/user/:userId', postController.getUserPosts);
router.put('/:postId/like', authJwt(), postController.likePost);

// Routes for managing replies
router.put('/:postId/comments/:commentId/replies/:replyId', authJwt(), postController.editReply); // Edit a reply
router.delete('/:postId/comments/:commentId/replies/:replyId', authJwt(), postController.deleteReply); // Delete a reply
router.put('/status/:id', authJwt(), postController.updatePostStatus);

// Export the router
module.exports = router;
