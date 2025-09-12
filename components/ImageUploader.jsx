'use client';

import { useState, useCallback } from 'react';
import { useCloudinaryUpload } from '@/hooks/useCloudinaryUpload';

export default function ImageUploader({ onUploadComplete, maxFiles = 5 }) {
  const [previews, setPreviews] = useState([]);
  const { uploadMultipleFiles, isUploading, progress, error } = useCloudinaryUpload();

  const handleFileChange = useCallback(async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    // Create previews
    const newPreviews = files.map(file => ({
      file,
      preview: URL.createObjectURL(file),
      isUploaded: false,
      url: null,
      publicId: null
    }));

    setPreviews(prev => [...prev, ...newPreviews].slice(0, maxFiles));

    // Upload files
    const results = await uploadMultipleFiles(files);
    
    // Update previews with uploaded URLs
    setPreviews(prev => 
      prev.map((preview, index) => ({
        ...preview,
        isUploaded: true,
        url: results[index]?.url || null,
        publicId: results[index]?.public_id || null
      }))
    );

    // Notify parent component
    if (onUploadComplete) {
      onUploadComplete(results);
    }
  }, [maxFiles, onUploadComplete, uploadMultipleFiles]);

  const removeImage = (index) => {
    setPreviews(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-4">
        {previews.map((preview, index) => (
          <div key={index} className="relative group">
            <div className="w-24 h-24 rounded-md overflow-hidden border border-gray-200">
              <img
                src={preview.preview || preview.url}
                alt={`Preview ${index}`}
                className="w-full h-full object-cover"
              />
            </div>
            <button
              type="button"
              onClick={() => removeImage(index)}
              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
              aria-label="Remove image"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
            {!preview.isUploaded && (
              <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
              </div>
            )}
          </div>
        ))}

        {previews.length < maxFiles && (
          <label className="flex flex-col items-center justify-center w-24 h-24 border-2 border-dashed border-gray-300 rounded-md cursor-pointer hover:border-blue-500 transition-colors">
            <svg
              className="w-8 h-8 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 6v6m0 0v6m0-6h6m-6 0H6"
              />
            </svg>
            <span className="mt-1 text-xs text-gray-500">
              Add {maxFiles - previews.length} more
            </span>
            <input
              type="file"
              className="hidden"
              onChange={handleFileChange}
              accept="image/*"
              multiple={maxFiles > 1}
            />
          </label>
        )}
      </div>

      {isUploading && (
        <div className="w-full bg-gray-200 rounded-full h-2.5">
          <div
            className="bg-blue-600 h-2.5 rounded-full"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
      )}

      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}

      <p className="text-xs text-gray-500">
        Upload up to {maxFiles} images (JPG, PNG, GIF)
      </p>
    </div>
  );
}
