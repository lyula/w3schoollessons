const Comment = require('../models/Comment');
const Post = require('../models/Post');

// Get all comments for a post
const getCommentsByPost = async (req, res) => {
  try {
    const { postId } = req.params;
    
    const comments = await Comment.find({ post: postId })
      .populate('author', 'username')
      .sort({ createdAt: -1 });
    
    res.json(comments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create a new comment
const createComment = async (req, res) => {
  try {
    const { content } = req.body;
    const { postId } = req.params;
    
    // Verify the post exists
    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }
    
    const comment = new Comment({
      content,
      author: req.user.id,
      post: postId,
    });
    
    const savedComment = await comment.save();
    
    // Populate author info before sending response
    await savedComment.populate('author', 'username');
    
    res.status(201).json(savedComment);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Update a comment
const updateComment = async (req, res) => {
  try {
    const { id } = req.params;
    const { content } = req.body;
    
    const comment = await Comment.findById(id);
    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }
    
    // Check if user is the comment author
    if (comment.author.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to update this comment' });
    }
    
    comment.content = content;
    const updatedComment = await comment.save();
    
    await updatedComment.populate('author', 'username');
    
    res.json(updatedComment);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Delete a comment
const deleteComment = async (req, res) => {
  try {
    const { id } = req.params;
    
    const comment = await Comment.findById(id);
    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }
    
    // Check if user is the comment author
    if (comment.author.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to delete this comment' });
    }
    
    await Comment.findByIdAndDelete(id);
    
    res.json({ message: 'Comment deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getCommentsByPost,
  createComment,
  updateComment,
  deleteComment,
};
