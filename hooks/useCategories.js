import { useState, useEffect } from 'react';

export default function useCategories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch('/api/categories?includeSubcategories=true');
        if (!response.ok) {
          throw new Error('Failed to fetch categories');
        }
        const data = await response.json();
        setCategories(data.data || []);
      } catch (err) {
        console.error('Error fetching categories:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  const getSubcategories = (categoryName) => {
    const category = categories.find(cat => cat.name === categoryName);
    return category?.subcategories || [];
  };

  return { categories, loading, error, getSubcategories };
}
