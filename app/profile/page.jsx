'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import ProductForm from '@/components/ProductForm';

export default function ProfilePage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    location: '',
    avatar: ''
  });
  const [isUploading, setIsUploading] = useState(false);

  // Fetch user profile data
  useEffect(() => {
    let isMounted = true;

    async function fetchProfile() {
      try {
        const response = await fetch(`/api/users/me`, {
          credentials: 'include',
          cache: 'no-store'
        });

        if (response.status === 401) {
          router.push('/auth/login');
          return;
        }

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to fetch profile');
        }

        const userData = await response.json();
        if (!isMounted) return;
        setUser(userData);
        setFormData({
          name: userData.name || '',
          email: userData.email || '',
          location: userData.location || '',
          avatar: userData.avatar || ''
        });
      } catch (error) {
        console.error('Error fetching profile:', error);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    fetchProfile();

    return () => {
      isMounted = false;
    };
  }, [router]);

  const handleAvatarUpload = () => {
    // Implement avatar upload logic
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Implement form submission logic
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-indigo-100">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-600"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Profile Section */}
        <div className="bg-white shadow-xl rounded-2xl overflow-hidden">
          {/* Header with gradient background */}
          <div className="bg-gradient-to-r from-purple-600 to-indigo-700 px-6 py-8 text-white">
            <div className="flex flex-col sm:flex-row items-center">
              <div className="relative mb-4 sm:mb-0 sm:mr-6">
                <div className="space-y-4">
                  <div className="flex items-center space-x-4">
                    {formData.avatar ? (
                      <div className="relative w-24 h-24">
                        <Image
                          src={formData.avatar}
                          alt="Profile"
                          className="rounded-full object-cover"
                          fill
                          sizes="96px"
                        />
                      </div>
                    ) : (
                      <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center">
                        <span className="text-2xl text-gray-500">
                          {formData.name?.charAt(0) || 'U'}
                        </span>
                      </div>
                    )}
                    <div>
                      <p className="text-sm text-purple-200 mb-2">Change your profile photo</p>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleAvatarUpload}
                        className="max-w-xs text-sm text-white file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-purple-500 file:text-white hover:file:bg-purple-600"
                      />
                    </div>
                  </div>
                  {isUploading && (
                    <p className="text-sm text-purple-300">Updating your avatar...</p>
                  )}
                </div>
              </div>
              <div className="text-center sm:text-left">
                <h1 className="text-2xl font-bold">{formData.name}</h1>
                <p className="text-purple-200">{formData.email}</p>
                <p className="mt-1 flex items-center justify-center sm:justify-start">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  {formData.location || 'No location set'}
                </p>
              </div>
            </div>
          </div>

          {/* Profile Form */}
          <form onSubmit={handleSubmit} className="divide-y divide-gray-200">
            <div className="px-6 py-6 space-y-8">
              <div>
                <h2 className="text-lg font-medium text-gray-900 mb-6 pb-2 border-b border-gray-200">Personal Information</h2>
                <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                  <div className="sm:col-span-6 md:col-span-4">
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                      Full name
                    </label>
                    <div className="relative rounded-md shadow-sm">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                      </div>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                        placeholder="Your name"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="px-6 py-4 bg-gray-50 text-right">
              <button
                type="submit"
                className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
              >
                Save Changes
              </button>
            </div>
          </form>
        </div>

       </div>
    </div>
  );
}