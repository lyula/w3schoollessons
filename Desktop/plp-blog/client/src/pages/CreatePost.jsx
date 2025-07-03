import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useOptimisticPosts } from '../context/OptimisticPostContext';
import { postsAPI, categoriesAPI } from '../services/api';
import ImageUpload from '../components/ImageUpload';
import { imageUtils } from '../utils/imageUtils';

const CreatePost = () => {
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category: '',
    image: null,
  });
  const [categories, setCategories] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const { addOptimisticPost, removeOptimisticPost } = useOptimisticPosts();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    fetchCategories();
  }, [user, navigate]);

  const fetchCategories = async () => {
    try {
      const response = await categoriesAPI.getAll();
      setCategories(response.data);
    } catch (err) {
      setError('Failed to fetch categories');
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleImageSelect = (base64Image) => {
    setFormData({
      ...formData,
      image: base64Image,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Create optimistic post for immediate UI feedback
    const tempId = imageUtils.generateTempId();
    const optimisticPostData = {
      _id: tempId,
      ...formData,
      author: user,
      createdAt: new Date().toISOString(),
      category: categories.find(cat => cat._id === formData.category),
    };

    // Store image locally if present
    if (formData.image) {
      imageUtils.storeImageLocally(tempId, formData.image);
    }

    // Add optimistic post to context
    addOptimisticPost(optimisticPostData);

    try {
      const response = await postsAPI.create(formData);
      
      // If successful and there's an image, update local storage with real ID
      if (formData.image && response.data._id) {
        imageUtils.storeImageLocally(response.data._id, formData.image);
        // Remove temporary image storage
        const images = JSON.parse(localStorage.getItem('blogImages') || '{}');
        delete images[tempId];
        localStorage.setItem('blogImages', JSON.stringify(images));
      }
      
      // Remove optimistic post from context
      removeOptimisticPost(tempId);
      
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create post');
      
      // Remove optimistic post and cleanup on error
      removeOptimisticPost(tempId);
      
      if (formData.image) {
        const images = JSON.parse(localStorage.getItem('blogImages') || '{}');
        delete images[tempId];
        localStorage.setItem('blogImages', JSON.stringify(images));
      }
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="text-center text-gray-500">
        Please log in to create a post.
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold text-center mb-6">Create New Post</h2>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {loading && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
          <div className="flex items-center space-x-2 mb-2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
            <span className="text-blue-700 font-medium">Creating your post...</span>
          </div>
          <div className="text-sm text-blue-600">
            Your post will appear on the home page once it's saved!
          </div>
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2">
            Title
          </label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-blue-500"
            required
          />
        </div>
        
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2">
            Category
          </label>
          <select
            name="category"
            value={formData.category}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-blue-500"
            required
          >
            <option value="">Select a category</option>
            {categories.map((category) => (
              <option key={category._id} value={category._id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>

        <div className="mb-4">
          <ImageUpload
            onImageSelect={handleImageSelect}
            currentImage={formData.image}
            disabled={loading}
          />
        </div>
        
        <div className="mb-6">
          <label className="block text-gray-700 text-sm font-bold mb-2">
            Content
          </label>
          <textarea
            name="content"
            value={formData.content}
            onChange={handleChange}
            rows="10"
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-blue-500"
            required
          />
        </div>
        
        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={() => navigate('/')}
            className="px-4 py-2 text-gray-600 border rounded-lg hover:bg-gray-100"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50"
          >
            {loading ? 'Creating...' : 'Create Post'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreatePost;
