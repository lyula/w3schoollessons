const express = require('express');
const { body } = require('express-validator');
const auth = require('../middleware/auth');
const {
  getAllPosts,
  getPostById,
  createPost,
  updatePost,
  deletePost
} = require('../controllers/postController');

const router = express.Router();

// Get all posts
router.get('/', getAllPosts);

// Get single post
router.get('/:id', getPostById);

// Create post
router.post(
  '/',
  auth,
  [
    body('title').notEmpty().trim().withMessage('Title is required'),
    body('content').notEmpty().withMessage('Content is required'),
    body('category').isMongoId().withMessage('Valid category is required'),
  ],
  createPost
);

// Update post
router.put(
  '/:id',
  auth,
  [
    body('title').optional().notEmpty().trim().withMessage('Title cannot be empty'),
    body('content').optional().notEmpty().withMessage('Content cannot be empty'),
    body('category').optional().isMongoId().withMessage('Valid category is required'),
  ],
  updatePost
);

// Delete post
router.delete('/:id', auth, deletePost);

module.exports = router;