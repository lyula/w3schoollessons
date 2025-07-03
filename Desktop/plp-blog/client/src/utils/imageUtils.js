// Image utilities for local storage and optimistic UI
export const imageUtils = {
  // Convert file to base64 for local storage
  fileToBase64: (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = error => reject(error);
    });
  },

  // Validate image file
  validateImage: (file) => {
    const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    const maxSize = 5 * 1024 * 1024; // 5MB

    if (!validTypes.includes(file.type)) {
      throw new Error('Invalid file type. Please upload a JPEG, PNG, GIF, or WebP image.');
    }

    if (file.size > maxSize) {
      throw new Error('File size too large. Please upload an image smaller than 5MB.');
    }

    return true;
  },

  // Store image in localStorage
  storeImageLocally: (postId, base64Image) => {
    try {
      const images = JSON.parse(localStorage.getItem('blogImages') || '{}');
      images[postId] = base64Image;
      localStorage.setItem('blogImages', JSON.stringify(images));
    } catch (error) {
      console.error('Error storing image locally:', error);
    }
  },

  // Retrieve image from localStorage
  getLocalImage: (postId) => {
    try {
      const images = JSON.parse(localStorage.getItem('blogImages') || '{}');
      return images[postId] || null;
    } catch (error) {
      console.error('Error retrieving local image:', error);
      return null;
    }
  },

  // Generate a temporary ID for optimistic UI
  generateTempId: () => {
    return `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  },

  // Clean up local storage (remove old images)
  cleanupLocalImages: (validPostIds) => {
    try {
      const images = JSON.parse(localStorage.getItem('blogImages') || '{}');
      const cleanedImages = {};
      
      validPostIds.forEach(postId => {
        if (images[postId]) {
          cleanedImages[postId] = images[postId];
        }
      });
      
      localStorage.setItem('blogImages', JSON.stringify(cleanedImages));
    } catch (error) {
      console.error('Error cleaning up local images:', error);
    }
  }
};

// Image compression utility
export const compressImage = (file, maxWidth = 800, quality = 0.8) => {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    
    img.onload = () => {
      // Calculate new dimensions
      const ratio = Math.min(maxWidth / img.width, maxWidth / img.height);
      canvas.width = img.width * ratio;
      canvas.height = img.height * ratio;
      
      // Draw and compress
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      canvas.toBlob(resolve, 'image/jpeg', quality);
    };
    
    img.src = URL.createObjectURL(file);
  });
};
