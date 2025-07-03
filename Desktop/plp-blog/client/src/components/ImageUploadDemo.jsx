import React, { useState } from 'react';
import { imageUtils } from '../utils/imageUtils';
import ImageUpload from './ImageUpload';

const ImageUploadDemo = () => {
  const [selectedImage, setSelectedImage] = useState(null);
  const [storedImages, setStoredImages] = useState([]);

  const handleImageSelect = (base64Image) => {
    setSelectedImage(base64Image);
  };

  const storeImageDemo = () => {
    if (selectedImage) {
      const demoId = `demo_${Date.now()}`;
      imageUtils.storeImageLocally(demoId, selectedImage);
      
      // Update stored images list
      const images = JSON.parse(localStorage.getItem('blogImages') || '{}');
      setStoredImages(Object.keys(images));
      
      alert(`Image stored with ID: ${demoId}`);
    }
  };

  const loadStoredImages = () => {
    const images = JSON.parse(localStorage.getItem('blogImages') || '{}');
    setStoredImages(Object.keys(images));
  };

  const clearStorage = () => {
    localStorage.removeItem('blogImages');
    setStoredImages([]);
    alert('Image storage cleared!');
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Image Upload Demo</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Image Upload Section */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Upload Image</h2>
          
          <div className="mb-4">
            <ImageUpload 
              onImageSelect={handleImageSelect}
              currentImage={selectedImage}
            />
          </div>
          
          <div className="space-y-2">
            <button
              onClick={storeImageDemo}
              disabled={!selectedImage}
              className="w-full bg-blue-500 text-white py-2 px-4 rounded disabled:opacity-50"
            >
              Store Image in LocalStorage
            </button>
            
            <button
              onClick={loadStoredImages}
              className="w-full bg-green-500 text-white py-2 px-4 rounded"
            >
              Load Stored Images
            </button>
            
            <button
              onClick={clearStorage}
              className="w-full bg-red-500 text-white py-2 px-4 rounded"
            >
              Clear Storage
            </button>
          </div>
        </div>

        {/* Storage Info Section */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Storage Information</h2>
          
          <div className="mb-4">
            <h3 className="font-medium mb-2">Stored Images:</h3>
            <ul className="text-sm text-gray-600">
              {storedImages.length > 0 ? (
                storedImages.map(id => (
                  <li key={id} className="py-1 border-b">
                    {id}
                  </li>
                ))
              ) : (
                <li className="py-1 text-gray-400">No images stored</li>
              )}
            </ul>
          </div>
          
          <div className="text-sm text-gray-500">
            <p><strong>Storage Size:</strong> {JSON.stringify(localStorage.getItem('blogImages') || '{}').length} bytes</p>
            <p><strong>Total Keys:</strong> {Object.keys(JSON.parse(localStorage.getItem('blogImages') || '{}')).length}</p>
          </div>
        </div>
      </div>
      
      {/* Feature Demonstration */}
      <div className="mt-8 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">Key Features Demonstrated</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div className="bg-white p-4 rounded shadow">
            <h3 className="font-medium text-blue-600 mb-2">📸 Image Processing</h3>
            <ul className="text-gray-600">
              <li>• File validation</li>
              <li>• Image compression</li>
              <li>• Base64 conversion</li>
              <li>• Preview generation</li>
            </ul>
          </div>
          
          <div className="bg-white p-4 rounded shadow">
            <h3 className="font-medium text-green-600 mb-2">💾 Local Storage</h3>
            <ul className="text-gray-600">
              <li>• Persistent storage</li>
              <li>• Automatic cleanup</li>
              <li>• Efficient retrieval</li>
              <li>• Error handling</li>
            </ul>
          </div>
          
          <div className="bg-white p-4 rounded shadow">
            <h3 className="font-medium text-purple-600 mb-2">⚡ Optimistic UI</h3>
            <ul className="text-gray-600">
              <li>• Immediate feedback</li>
              <li>• Temporary posts</li>
              <li>• Loading states</li>
              <li>• Error recovery</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImageUploadDemo;
