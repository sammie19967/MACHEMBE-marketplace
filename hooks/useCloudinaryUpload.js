import { useState } from 'react';

export const useCloudinaryUpload = () => {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState(null);
  const [progress, setProgress] = useState(0);

  const uploadFile = async (file) => {
    if (!file) {
      setError('No file provided');
      return null;
    }

    setIsUploading(true);
    setError(null);
    setProgress(0);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/upload', {
        method: 'POST',
        credentials: 'include',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Upload failed');
      }

      const { data } = await response.json();
      return data;
    } catch (err) {
      console.error('Upload error:', err);
      setError(err.message || 'Failed to upload file');
      return null;
    } finally {
      setIsUploading(false);
      setProgress(100);
    }
  };

  const uploadMultipleFiles = async (files) => {
    if (!files || !files.length) return [];
    
    const uploadPromises = Array.from(files).map(file => uploadFile(file));
    const results = await Promise.all(uploadPromises);
    return results.filter(Boolean);
  };

  return {
    uploadFile,
    uploadMultipleFiles,
    isUploading,
    progress,
    error,
    reset: () => {
      setError(null);
      setProgress(0);
    }
  };
};
