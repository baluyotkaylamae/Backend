const { Post } = require('../../models/post'); // Adjust the path to your Post model
const cloudinary = require('../../config/configCloudinary');
const upload = require('../../config/multer');

// Create a new post
exports.createPost = async (req, res) => {
    const { title, content, image, user, category } = req.body;

    // Check for missing fields
    if (!title || !content || !user || !category) {
        return res.status(400).json({ message: 'Title, content, user ID, and category are required.' });
    }

    try {
        const post = new Post({
            title,
            content,
            image: image || '',
            user, // Use user from the request body
            category, // Use category from the request body
            likes: 0 // Initialize likes to 0
        });

        const savedPost = await post.save();
        res.status(201).json(savedPost);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Get all posts
exports.getPosts = async (req, res) => {
    try {
        const posts = await Post.find()
            .populate('user', 'name email') // Populate user details
            .populate('category', 'name description'); // Populate category details
        res.status(200).json(posts);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get a single post by ID
exports.getPostById = async (req, res) => {
    try {
        const post = await Post.findById(req.params.id)
            .populate('user', 'name email')
            .populate('category', 'name description'); // Populate category details
        if (!post) return res.status(404).json({ message: 'Post not found' });
        res.status(200).json(post);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Update a post by ID
exports.updatePost = async (req, res) => {
    try {
        const { category, ...rest } = req.body; // Extract category from the body
        const post = await Post.findByIdAndUpdate(
            req.params.id,
            { ...rest, category }, // Include category in the update
            { new: true, runValidators: true }
        );
        if (!post) return res.status(404).json({ message: 'Post not found' });
        res.status(200).json(post);
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
