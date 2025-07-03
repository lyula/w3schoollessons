import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { postsAPI } from '../services/api';
import { imageUtils } from '../utils/imageUtils';
import Comments from '../components/Comments';

const PostDetail = () => {
  const { id } = useParams();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchPost();
  }, [id]);

  const fetchPost = async () => {
    try {
      const response = await postsAPI.getById(id);
      setPost(response.data);
    } catch (err) {
      setError('Failed to fetch post');
    } finally {
      setLoading(false);
    }
  };

  const getPostImage = (post) => {
    // First check if post has image field (from database)
    if (post.image) {
      return post.image;
    }
    // Then check localStorage for optimistic posts
    return imageUtils.getLocalImage(post._id);
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this post?')) {
      try {
        await postsAPI.delete(id);
        navigate('/');
      } catch (err) {
        setError('Failed to delete post');
      }
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-red-500 text-xl">{error}</div>
    );
  }

  if (!post) {
    return (
      <div className="text-center text-gray-500 text-xl">Post not found</div>
    );
  }

  const isAuthor = user && post.author && user.id === post.author._id;

  return (
    <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-md p-8">
      <div className="mb-6">
        <h1 className="text-4xl font-bold text-gray-800 mb-4">{post.title}</h1>
        
        {/* Featured Image */}
        {getPostImage(post) && (
          <div className="mb-6">
            <img
              src={getPostImage(post)}
              alt={post.title}
              className="w-full h-64 md:h-96 object-cover rounded-lg"
            />
          </div>
        )}
        
        <div className="flex justify-between items-center text-sm text-gray-500 mb-4">
          <div>
            <span>By {post.author?.username || 'Unknown'}</span>
            <span className="mx-2">•</span>
            <span>{new Date(post.createdAt).toLocaleDateString()}</span>
          </div>
          <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded">
            {post.category?.name}
          </span>
        </div>
        
        {isAuthor && (
          <div className="flex space-x-4 mb-6">
            <Link
              to={`/edit/${post._id}`}
              className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
            >
              Edit
            </Link>
            <button
              onClick={handleDelete}
              className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
            >
              Delete
            </button>
          </div>
        )}
      </div>
      
      <div className="prose max-w-none">
        <div className="whitespace-pre-wrap text-gray-700 leading-relaxed">
          {post.content}
        </div>
      </div>
      
      {/* Comments Section */}
      <Comments postId={post._id} />
      
      <div className="mt-8 pt-6 border-t">
        <Link
          to="/"
          className="text-blue-500 hover:text-blue-700 font-medium"
        >
          ← Back to Home
        </Link>
      </div>
    </div>
  );
};

export default PostDetail;