const { validationResult } = require('express-validator');
const Category = require('../models/Category');

// Get all categories
const getAllCategories = async (req, res) => {
  try {
    const categories = await Category.find().sort({ name: 1 });
    res.json(categories);
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get single category by ID
const getCategoryById = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }
    
    res.json(category);
  } catch (error) {
    console.error('Error fetching category:', error);
    if (error.name === 'CastError') {
      return res.status(404).json({ message: 'Category not found' });
    }
    res.status(500).json({ message: 'Server error' });
  }
};

// Create new category
const createCategory = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { name } = req.body;
    
    // Check if category already exists
    const existingCategory = await Category.findOne({ name });
    if (existingCategory) {
      return res.status(400).json({ message: 'Category already exists' });
    }
    
    const category = new Category({ name });
    const newCategory = await category.save();
    
    res.status(201).json(newCategory);
  } catch (error) {
    console.error('Error creating category:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update category
const updateCategory = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { name } = req.body;
    
    const category = await Category.findById(req.params.id);
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }
    
    // Check if new name already exists (excluding current category)
    const existingCategory = await Category.findOne({ 
      name, 
      _id: { $ne: req.params.id } 
    });
    if (existingCategory) {
      return res.status(400).json({ message: 'Category name already exists' });
    }
    
    category.name = name;
    const updatedCategory = await category.save();
    
    res.json(updatedCategory);
  } catch (error) {
    console.error('Error updating category:', error);
    if (error.name === 'CastError') {
      return res.status(404).json({ message: 'Category not found' });
    }
    res.status(500).json({ message: 'Server error' });
  }
};

// Delete category
const deleteCategory = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }
    
    // Check if category is being used by any posts
    const Post = require('../models/Post');
    const postsUsingCategory = await Post.countDocuments({ category: req.params.id });
    
    if (postsUsingCategory > 0) {
      return res.status(400).json({ 
        message: `Cannot delete category. It is being used by ${postsUsingCategory} post(s)` 
      });
    }
    
    await Category.findByIdAndDelete(req.params.id);
    
    res.json({ message: 'Category deleted successfully' });
  } catch (error) {
    console.error('Error deleting category:', error);
    if (error.name === 'CastError') {
      return res.status(404).json({ message: 'Category not found' });
    }
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  getAllCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory
};
