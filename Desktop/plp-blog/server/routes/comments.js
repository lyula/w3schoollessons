const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const {
  getCommentsByPost,
  createComment,
  updateComment,
  deleteComment,
} = require('../controllers/commentController');

// Get comments for a specific post
router.get('/post/:postId', getCommentsByPost);

// Create a new comment (requires authentication)
router.post('/post/:postId', auth, createComment);

// Update a comment (requires authentication)
router.put('/:id', auth, updateComment);

// Delete a comment (requires authentication)
router.delete('/:id', auth, deleteComment);

module.exports = router;
