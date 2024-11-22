// dashboard.js
const { User } = require('../models/user');
const { Post } = require('../models/post');
const { Category } = require('../models/categoryPost');
const express = require('express');
const router = express.Router();

// Route to count users
router.get('/users/count', async (req, res) => {
  try {
    const count = await User.countDocuments();
    res.json({ count });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error counting users' });
  }
});

// // Route to count posts
// router.get('/posts/count', async (req, res) => {
//   try {
//     const count = await Post.countDocuments();
//     res.json({ count });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: 'Error counting posts' });
//   }
// });


// Route to count posts by category
router.get('/posts/countByCategory', async (req, res) => {
    try {
      const categoryCounts = await Post.aggregate([
        { $group: { _id: "$category", count: { $sum: 1 } } },
        { $lookup: {
          from: 'categories',  // Assuming categories collection is named 'categories'
          localField: '_id',
          foreignField: '_id',
          as: 'categoryInfo'
        }},
        { $unwind: "$categoryInfo" },
        { $project: { categoryName: "$categoryInfo.name", count: 1 } }
      ]);
  
      res.json({ counts: categoryCounts });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Error counting posts by category' });
    }
  });
  


module.exports = router;
