import React, { useState, useRef } from 'react';
import { imageUtils, compressImage } from '../utils/imageUtils';

const ImageUpload = ({ onImageSelect, currentImage, disabled = false }) => {
  const [preview, setPreview] = useState(currentImage || null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);

  const handleFileSelect = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setError('');
    setUploading(true);

    try {
      // Validate the image
      imageUtils.validateImage(file);

      // Compress the image
      const compressedFile = await compressImage(file);
      
      // Convert to base64
      const base64Image = await imageUtils.fileToBase64(compressedFile);
      
      // Set preview for immediate feedback
      setPreview(base64Image);
      
      // Notify parent component
      onImageSelect(base64Image);
      
    } catch (err) {
      setError(err.message);
      setPreview(null);
      onImageSelect(null);
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveImage = () => {
    setPreview(null);
    setError('');
    onImageSelect(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-4">
      <label className="block text-gray-700 text-sm font-bold mb-2">
        Featured Image
      </label>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}
      
      {preview ? (
        <div className="relative">
          <img
            src={preview}
            alt="Preview"
            className="w-full h-64 object-cover rounded-lg border"
          />
          <button
            type="button"
            onClick={handleRemoveImage}
            disabled={disabled}
            className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-8 h-8 flex items-center justify-center hover:bg-red-600 disabled:opacity-50"
          >
            ×
          </button>
        </div>
      ) : (
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
          <div className="space-y-4">
            <div className="mx-auto w-12 h-12 text-gray-400">
              <svg fill="none" stroke="currentColor" viewBox="0 0 48 48">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                />
              </svg>
            </div>
            <div>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={disabled || uploading}
                className="text-blue-500 hover:text-blue-700 font-medium disabled:opacity-50"
              >
                {uploading ? 'Processing...' : 'Choose image'}
              </button>
              <p className="text-gray-500 text-sm mt-1">
                or drag and drop
              </p>
            </div>
            <p className="text-xs text-gray-400">
              PNG, JPG, GIF, WebP up to 5MB
            </p>
          </div>
        </div>
      )}
      
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        disabled={disabled || uploading}
        className="hidden"
      />
    </div>
  );
};

export default ImageUpload;
