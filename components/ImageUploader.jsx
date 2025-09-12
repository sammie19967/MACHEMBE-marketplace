// components/ImageUploader.jsx
import { useState, useCallback } from 'react';
import useCloudinaryUpload from '@/hooks/useCloudinaryUpload';

export default function ImageUploader({ onUploadComplete, maxFiles = 5, initialImages = [] }) {
  const [images, setImages] = useState(initialImages);
  const { uploadMultipleFiles, loading, error } = useCloudinaryUpload();

  const handleFileChange = async (e) => {
    const files = Array.from(e.target.files);
    
    if (files.length + images.length > maxFiles) {
      alert(`You can only upload up to ${maxFiles} images`);
      return;
    }

    try {
      const results = await uploadMultipleFiles(files);
      const newImages = results.map(result => result.secure_url);
      const updatedImages = [...images, ...newImages];
      
      setImages(updatedImages);
      onUploadComplete(updatedImages);
    } catch (error) {
      console.error('Upload error:', error);
    }
  };

  const removeImage = (index) => {
    const newImages = images.filter((_, i) => i !== index);
    setImages(newImages);
    onUploadComplete(newImages);
  };

  return (
    <div className="space-y-4">
      <input
        type="file"
        multiple
        accept="image/*"
        onChange={handleFileChange}
        disabled={loading || images.length >= maxFiles}
        className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
      />
      
      {loading && <p>Uploading images...</p>}
      {error && <p className="text-red-500">{error}</p>}
      
      <div className="grid grid-cols-3 gap-4">
        {images.map((image, index) => (
          <div key={index} className="relative">
            <img
              src={image}
              alt={`Upload ${index + 1}`}
              className="w-full h-32 object-cover rounded"
            />
            <button
              type="button"
              onClick={() => removeImage(index)}
              className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 text-xs"
            >
              ✕
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}