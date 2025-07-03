import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { postsAPI } from '../services/api';
import { imageUtils } from '../utils/imageUtils';
import { useOptimisticPosts } from '../context/OptimisticPostContext';
import SearchAndFilter from '../components/SearchAndFilter';
import Pagination from '../components/Pagination';

const Home = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [pagination, setPagination] = useState({});
  const [filters, setFilters] = useState({
    search: '',
    category: '',
    page: 1,
    limit: 6
  });
  const { optimisticPosts } = useOptimisticPosts();

  useEffect(() => {
    fetchPosts();
  }, [filters]);

  useEffect(() => {
    // Clean up old images from localStorage
    const cleanup = () => {
      const allPosts = [...posts, ...optimisticPosts];
      const validIds = allPosts.map(post => post._id);
      imageUtils.cleanupLocalImages(validIds);
    };
    
    if (posts.length > 0) {
      cleanup();
    }
  }, [posts.length, optimisticPosts]);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const response = await postsAPI.getAll(filters);
      setPosts(response.data.posts || response.data);
      setPagination(response.data.pagination || {});
    } catch (err) {
      setError('Failed to fetch posts');
      console.error('Error fetching posts:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (searchTerm) => {
    setFilters(prev => ({
      ...prev,
      search: searchTerm,
      page: 1 // Reset to first page on search
    }));
  };

  const handleFilterChange = (newFilters) => {
    setFilters(prev => ({
      ...prev,
      ...newFilters,
      page: 1 // Reset to first page on filter change
    }));
  };

  const handlePageChange = (page) => {
    setFilters(prev => ({
      ...prev,
      page
    }));
  };

  const getPostImage = (post) => {
    // First check if post has image field (from database)
    if (post.image) {
      return post.image;
    }
    // Then check localStorage for optimistic posts
    return imageUtils.getLocalImage(post._id);
  };

  // Combine real posts with optimistic posts
  const allPosts = [...optimisticPosts, ...posts];

  const truncateText = (text, maxLength = 150) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
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

  return (
    <div>
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-gray-800 mb-4">Welcome to BlogApp</h1>
        <p className="text-xl text-gray-600">Discover amazing stories and insights</p>
      </div>

      {/* Search and Filter Component */}
      <SearchAndFilter
        onSearch={handleSearch}
        onFilterChange={handleFilterChange}
        currentFilters={filters}
      />

      {/* Results Summary */}
      {!loading && pagination.totalPosts !== undefined && (
        <div className="mb-6 text-gray-600">
          <p>
            Showing {posts.length} of {pagination.totalPosts} posts
            {filters.search && ` for "${filters.search}"`}
          </p>
        </div>
      )}

      {allPosts.length === 0 ? (
        <div className="text-center text-gray-500 text-xl">
          No posts available. Be the first to create one!
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {allPosts.map((post) => {
            const postImage = getPostImage(post);
            const isOptimistic = post._id?.startsWith('temp_');
            
            return (
              <div key={post._id} className={`bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 ${isOptimistic ? 'opacity-80' : ''}`}>
                {postImage && (
                  <div className="relative">
                    <img
                      src={postImage}
                      alt={post.title}
                      className="w-full h-48 object-cover rounded-t-lg"
                    />
                    {isOptimistic && (
                      <div className="absolute top-2 right-2 bg-blue-500 text-white px-2 py-1 rounded text-xs">
                        Uploading...
                      </div>
                    )}
                  </div>
                )}
                
                <div className="p-6">
                  <h2 className="text-xl font-semibold mb-3 text-gray-800">
                    {isOptimistic ? (
                      <span className="text-gray-600">{post.title}</span>
                    ) : (
                      <Link 
                        to={`/post/${post._id}`} 
                        className="hover:text-blue-600 transition-colors duration-200"
                      >
                        {post.title}
                      </Link>
                    )}
                  </h2>
                  
                  <p className="text-gray-600 mb-4 leading-relaxed">
                    {truncateText(post.content)}
                  </p>
                  
                  {post.content.length > 150 && !isOptimistic && (
                    <div className="mb-4">
                      <Link
                        to={`/post/${post._id}`}
                        className="inline-flex items-center text-blue-600 hover:text-blue-800 font-medium transition-colors duration-200"
                      >
                        Read More
                        <svg 
                          className="w-4 h-4 ml-1" 
                          fill="none" 
                          stroke="currentColor" 
                          viewBox="0 0 24 24"
                        >
                          <path 
                            strokeLinecap="round" 
                            strokeLinejoin="round" 
                            strokeWidth={2} 
                            d="M9 5l7 7-7 7" 
                          />
                        </svg>
                      </Link>
                    </div>
                  )}
                  
                  <div className="flex justify-between items-center text-sm text-gray-500 mb-2">
                    <span className="flex items-center">
                      <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                      </svg>
                      By {post.author?.username || 'Unknown'}
                    </span>
                    
                    {post.category && (
                      <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium">
                        {post.category.name}
                      </span>
                    )}
                  </div>
                  
                  <div className="text-sm text-gray-400 flex items-center">
                    <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                    </svg>
                    {new Date(post.createdAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric'
                    })}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <Pagination
          currentPage={pagination.currentPage}
          totalPages={pagination.totalPages}
          onPageChange={handlePageChange}
          hasNextPage={pagination.hasNextPage}
          hasPrevPage={pagination.hasPrevPage}
        />
      )}
    </div>
  );
};

export default Home;
