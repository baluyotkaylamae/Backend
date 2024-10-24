const express = require('express');
const router = express.Router();
const postController = require('../controller/PostController'); // Adjust the path as necessary
// const { authenticate } = require('../middleware/auth'); // Middleware to protect routes

// Route for creating a new post
router.post('/', postController.createPost);

// Route for getting all posts
router.get('/', postController.getPosts);

// Route for getting a single post by ID
router.get('/:id', postController.getPostById);

// Route for updating a post by ID
router.put('/:id', postController.updatePost);

// Route for deleting a post by ID
router.delete('/:id',  postController.deletePost);

// Export the router
module.exports = router;
