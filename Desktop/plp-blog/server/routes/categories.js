const express = require('express');
const { body } = require('express-validator');
const auth = require('../middleware/auth');
const {
  getAllCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory
} = require('../controllers/categoryController');

const router = express.Router();

// Get all categories
router.get('/', getAllCategories);

// Get single category
router.get('/:id', getCategoryById);

// Create category
router.post(
  '/',
  auth,
  [
    body('name').notEmpty().trim().withMessage('Category name is required'),
  ],
  createCategory
);

// Update category
router.put(
  '/:id',
  auth,
  [
    body('name').notEmpty().trim().withMessage('Category name is required'),
  ],
  updateCategory
);

// Delete category
router.delete('/:id', auth, deleteCategory);

module.exports = router;