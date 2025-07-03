import React, { createContext, useContext, useState } from 'react';

const OptimisticPostContext = createContext();

export const useOptimisticPosts = () => {
  const context = useContext(OptimisticPostContext);
  if (!context) {
    throw new Error('useOptimisticPosts must be used within OptimisticPostProvider');
  }
  return context;
};

export const OptimisticPostProvider = ({ children }) => {
  const [optimisticPosts, setOptimisticPosts] = useState([]);

  const addOptimisticPost = (post) => {
    setOptimisticPosts(prev => [post, ...prev]);
  };

  const removeOptimisticPost = (postId) => {
    setOptimisticPosts(prev => prev.filter(post => post._id !== postId));
  };

  const clearOptimisticPosts = () => {
    setOptimisticPosts([]);
  };

  const value = {
    optimisticPosts,
    addOptimisticPost,
    removeOptimisticPost,
    clearOptimisticPosts
  };

  return (
    <OptimisticPostContext.Provider value={value}>
      {children}
    </OptimisticPostContext.Provider>
  );
};
