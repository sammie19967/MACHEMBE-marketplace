import { useState, useEffect, useCallback } from 'react';

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

  const getSubcategories = useCallback((categoryName) => {
    const category = categories.find(cat => cat.name === categoryName);
    return category?.subcategories || [];
  }, [categories]); // Only recreate when categories change

  return { categories, loading, error, getSubcategories };
}