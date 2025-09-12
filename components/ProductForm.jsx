'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { showModal } from './SweetModal';
import ImageUploader from './ImageUploader';
import useCategories from '@/hooks/useCategories';

export default function ProductForm({ initialData = {}, isEditing = false }) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [images, setImages] = useState(initialData.images || []);
  const { categories, loading: categoriesLoading, getSubcategories } = useCategories();
  const [subcategories, setSubcategories] = useState([]);
  
  const [formData, setFormData] = useState({
    title: initialData.title || '',
    description: initialData.description || '',
    price: initialData.price || '',
    category: initialData.category || '',
    subcategory: initialData.subcategory || '',
    location: initialData.location || '',
    attributes: initialData.attributes || {},
    status: initialData.status || 'active',
  });

  // Update subcategories when category changes
  useEffect(() => {
    if (formData.category) {
      const subs = getSubcategories(formData.category);
      setSubcategories(subs);
      // Reset subcategory if it's not in the new subcategories
      if (subs.length > 0 && !subs.includes(formData.subcategory)) {
        setFormData(prev => ({ ...prev, subcategory: '' }));
      }
    } else {
      setSubcategories([]);
      setFormData(prev => ({ ...prev, subcategory: '' }));
    }
  }, [formData.category, getSubcategories]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'price' ? (parseFloat(value) || 0) : value
    }));
  };

  const handleAttributeChange = (key, value) => {
    setFormData(prev => ({
      ...prev,
      attributes: {
        ...prev.attributes,
        [key]: value
      }
    }));
  };

  const addAttribute = () => {
    const newKey = `attribute_${Object.keys(formData.attributes).length + 1}`;
    handleAttributeChange(newKey, '');
  };

  const removeAttribute = (key) => {
    const newAttributes = { ...formData.attributes };
    delete newAttributes[key];
    setFormData(prev => ({
      ...prev,
      attributes: newAttributes
    }));
  };

  const handleImageUpload = (uploadedImages) => {
    setImages(uploadedImages);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (images.length === 0) {
      await showModal({
        title: 'Error',
        text: 'Please upload at least one image of your product',
        icon: 'error',
      });
      return;
    }

    if (!formData.category || !formData.subcategory) {
      await showModal({
        title: 'Error',
        text: 'Please select both category and subcategory',
        icon: 'error',
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const productData = {
        ...formData,
        images: images.map(img => typeof img === 'string' ? img : img.url),
        price: parseFloat(formData.price) || 0,
        // Filter out empty attributes
        attributes: Object.fromEntries(
          Object.entries(formData.attributes).filter(([_, v]) => v !== '')
        ),
      };

      const method = isEditing ? 'PUT' : 'POST';
      const url = isEditing ? `/api/products/${initialData._id}` : '/api/products';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(productData),
        credentials: 'include',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save product');
      }

      const result = await response.json();
      
      await showModal({
        title: 'Success!',
        text: `Product ${isEditing ? 'updated' : 'created'} successfully`,
        icon: 'success',
      });

      router.push(`/products/${result.data?._id || initialData._id}`);
      router.refresh();
    } catch (error) {
      console.error('Error saving product:', error);
      await showModal({
        title: 'Error',
        text: error.message || 'Failed to save product',
        icon: 'error',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Product Images */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Product Images *
        </label>
        <div className="mt-1">
          <ImageUploader
            onUploadComplete={handleImageUpload}
            maxFiles={5}
            initialImages={images}
          />
          <p className="mt-2 text-sm text-gray-500">
            Upload up to 5 high-quality images of your product. First image will be used as the main display.
          </p>
        </div>
      </div>

      {/* Basic Information */}
      <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
        <div className="sm:col-span-6">
          <label htmlFor="title" className="block text-sm font-medium text-gray-700">
            Product Title *
          </label>
          <div className="mt-1">
            <input
              type="text"
              name="title"
              id="title"
              required
              value={formData.title}
              onChange={handleChange}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              placeholder="e.g. iPhone 13 Pro Max 256GB"
            />
          </div>
        </div>

        <div className="sm:col-span-6">
          <label htmlFor="description" className="block text-sm font-medium text-gray-700">
            Description
          </label>
          <div className="mt-1">
            <textarea
              id="description"
              name="description"
              rows={4}
              value={formData.description}
              onChange={handleChange}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              placeholder="Provide a detailed description of your product..."
            />
          </div>
        </div>

        <div className="sm:col-span-3">
          <label htmlFor="price" className="block text-sm font-medium text-gray-700">
            Price (KES) *
          </label>
          <div className="mt-1 relative rounded-md shadow-sm">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <span className="text-gray-500 sm:text-sm">KES</span>
            </div>
            <input
              type="number"
              name="price"
              id="price"
              min="0"
              step="0.01"
              required
              value={formData.price}
              onChange={handleChange}
              className="block w-full pl-12 pr-12 sm:text-sm border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              placeholder="0.00"
            />
          </div>
        </div>

        <div className="sm:col-span-3">
          <label htmlFor="location" className="block text-sm font-medium text-gray-700">
            Location
          </label>
          <div className="mt-1">
            <input
              type="text"
              name="location"
              id="location"
              value={formData.location}
              onChange={handleChange}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              placeholder="e.g. Nairobi, Kenya"
            />
          </div>
        </div>

        <div className="sm:col-span-3">
          <label htmlFor="category" className="block text-sm font-medium text-gray-700">
            Category *
          </label>
          <select
            id="category"
            name="category"
            required
            value={formData.category}
            onChange={handleChange}
            disabled={categoriesLoading}
            className="mt-1 block w-full rounded-md border-gray-300 py-2 pl-3 pr-10 text-base focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
          >
            <option value="">Select a category</option>
            {categories.map((category) => (
              <option key={category._id} value={category.name}>
                {category.name}
              </option>
            ))}
          </select>
        </div>

        <div className="sm:col-span-3">
          <label htmlFor="subcategory" className="block text-sm font-medium text-gray-700">
            Subcategory *
          </label>
          <select
            id="subcategory"
            name="subcategory"
            required
            value={formData.subcategory}
            onChange={handleChange}
            disabled={!formData.category || categoriesLoading}
            className="mt-1 block w-full rounded-md border-gray-300 py-2 pl-3 pr-10 text-base focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
          >
            <option value="">Select a subcategory</option>
            {subcategories.map((subcategory, index) => (
              <option key={index} value={subcategory}>
                {subcategory}
              </option>
            ))}
          </select>
        </div>

        <div className="sm:col-span-3">
          <label htmlFor="status" className="block text-sm font-medium text-gray-700">
            Status
          </label>
          <select
            id="status"
            name="status"
            value={formData.status}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 py-2 pl-3 pr-10 text-base focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
          >
            <option value="active">Active</option>
            <option value="sold">Sold</option>
            <option value="archived">Archived</option>
          </select>
        </div>

        {/* Dynamic Attributes */}
        <div className="sm:col-span-6">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-medium text-gray-700">Product Attributes</h3>
            <button
              type="button"
              onClick={addAttribute}
              className="text-sm text-blue-600 hover:text-blue-800"
            >
              + Add Attribute
            </button>
          </div>
          <div className="mt-2 space-y-2">
            {Object.entries(formData.attributes).map(([key, value]) => (
              <div key={key} className="grid grid-cols-4 gap-2">
                <input
                  type="text"
                  value={key}
                  onChange={(e) => {
                    const newAttributes = { ...formData.attributes };
                    const newValue = newAttributes[key];
                    delete newAttributes[key];
                    newAttributes[e.target.value] = newValue;
                    setFormData(prev => ({
                      ...prev,
                      attributes: newAttributes
                    }));
                  }}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  placeholder="Attribute name"
                />
                <input
                  type="text"
                  value={value}
                  onChange={(e) => handleAttributeChange(key, e.target.value)}
                  className="col-span-2 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  placeholder="Value"
                />
                <button
                  type="button"
                  onClick={() => removeAttribute(key)}
                  className="inline-flex items-center justify-center px-3 py-1.5 border border-transparent text-xs font-medium rounded text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="pt-5">
        <div className="flex justify-end">
          <button
            type="button"
            onClick={() => router.back()}
            className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="ml-3 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          >
            {isSubmitting ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                {isEditing ? 'Updating...' : 'Creating...'}
              </>
            ) : isEditing ? 'Update Product' : 'Create Product'}
          </button>
        </div>
      </div>
    </form>
  );
}