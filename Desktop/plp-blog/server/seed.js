const mongoose = require('mongoose');
const dotenv = require('dotenv');
const connectDB = require('./config/database');
const Category = require('./models/Category');

dotenv.config();

const categories = [
  { name: 'Technology' },
  { name: 'Programming' },
  { name: 'Web Development' },
  { name: 'Lifestyle' },
  { name: 'Tutorial' },
  { name: 'News' },
  { name: 'Travel' },
  { name: 'Food' },
  { name: 'Health' },
  { name: 'Business' }
];

async function seedCategories() {
  try {
    // Connect to database
    await connectDB();

    // Clear existing categories
    await Category.deleteMany({});
    console.log('Cleared existing categories');

    // Insert new categories
    const createdCategories = await Category.insertMany(categories);
    console.log('Categories created:', createdCategories.length, 'categories');

    console.log('Database seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding categories:', error);
    process.exit(1);
  }
}

seedCategories();
