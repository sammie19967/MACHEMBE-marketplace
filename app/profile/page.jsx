'use client';
import { useState, useEffect } from 'react';
import { auth } from '@/lib/firebase-client';
import { showModal } from '@/components/SweetModal';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    location: '',
    mpesaNumber: '',
    avatar: ''
  });
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Fetch user profile data
  useEffect(() => {
    let isMounted = true;
    
    async function fetchProfile() {
      try {
        console.log('Fetching profile...');
        const currentUser = auth.currentUser;
        if (!currentUser) {
          console.log('No current user, redirecting to login');
          router.push('/auth/login');
          return;
        }

        const token = await currentUser.getIdToken();
        console.log('Current user UID:', currentUser.uid);
        
        const response = await fetch(`/api/users/${currentUser.uid}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          cache: 'no-store'
        });
        
        console.log('Response status:', response.status);
        const responseText = await response.text();
        console.log('Response text:', responseText);
        
        let result;
        try {
          result = responseText ? JSON.parse(responseText) : {};
        } catch (e) {
          console.error('Failed to parse response as JSON:', e);
          throw new Error('Invalid server response');
        }
        
        if (!response.ok) {
          console.error('API Error:', result);
          throw new Error(result.error || result.message || 'Failed to fetch profile');
        }
        
        if (!isMounted) return;
        
        if (!result.success) {
          console.error('API returned unsuccessful response:', result);
          throw new Error(result.error || 'Failed to fetch profile');
        }
        
        const userData = result.data.user;
        setUser(userData);
        setFormData(prev => ({
          ...prev,
          name: userData?.name || '',
          email: userData?.email || '',
          phone: userData?.phone || '',
          location: userData?.location || '',
          mpesaNumber: userData?.mpesaNumber || '',
          avatar: userData?.avatar || ''
        }));
      } catch (error) {
        console.error('Error fetching profile:', error);
        if (isMounted) {
          await showModal({
            title: 'Error',
            text: error.message || 'Failed to load profile data',
            icon: 'error'
          });
        }
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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleDeleteAccount = async () => {
    const { isConfirmed } = await showModal({
      title: 'Delete Account',
      text: 'Are you sure you want to delete your account? This action cannot be undone.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete my account',
      cancelButtonText: 'Cancel',
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6'
    });

    if (!isConfirmed) return;

    try {
      setIsDeleting(true);
      const token = await auth.currentUser.getIdToken();
      
      const response = await fetch(`/api/users/${auth.currentUser.uid}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || 'Failed to delete account');
      }
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to delete account');
      }

      // Sign out the user
      await auth.signOut();
      
      await showModal({
        title: 'Account Deleted',
        text: 'Your account has been successfully deleted.',
        icon: 'success'
      });
      
      // Redirect to home page
      router.push('/');
    } catch (error) {
      console.error('Error deleting account:', error);
      await showModal({
        title: 'Error',
        text: error.message || 'Failed to delete account',
        icon: 'error'
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isEditing) {
      setIsEditing(true);
      return;
    }

    setIsSaving(true);
    try {
      const token = await auth.currentUser?.getIdToken();
      if (!token) {
        router.push('/auth/login');
        return;
      }

      const response = await fetch(`/api/users/${auth.currentUser.uid}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          name: formData.name,
          phone: formData.phone,
          location: formData.location,
          mpesaNumber: formData.mpesaNumber,
          avatar: formData.avatar
        })
      });
      
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || 'Failed to update profile');
      }
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to update profile');
      }
      
      setUser(result.data.user);
      setIsEditing(false);
      
      await showModal({
        title: 'Success!',
        text: 'Profile updated successfully',
        icon: 'success'
      });
    } catch (error) {
      console.error('Error updating profile:', error);
      await showModal({
        title: 'Error',
        text: error.message || 'Failed to update profile',
        icon: 'error'
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white shadow rounded-lg overflow-hidden">
          {/* Header */}
          <div className="px-6 py-5 border-b border-gray-200">
            <h2 className="text-2xl font-semibold text-gray-900">Profile</h2>
            <p className="mt-1 text-sm text-gray-500">
              Manage your account information and settings
            </p>
          </div>

          {/* Profile Form */}
          <form onSubmit={handleSubmit} className="divide-y divide-gray-200">
            <div className="px-6 py-6 space-y-6">
              {/* Avatar */}
              <div className="flex items-center space-x-4">
                <div className="flex-shrink-0">
                  <img
                    className="h-16 w-16 rounded-full"
                    src={formData.avatar || '/default-avatar.png'}
                    alt={formData.name}
                  />
                </div>
                {isEditing && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Avatar URL
                    </label>
                    <input
                      type="url"
                      name="avatar"
                      value={formData.avatar}
                      onChange={handleChange}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      placeholder="https://example.com/avatar.jpg"
                    />
                  </div>
                )}
              </div>

              {/* Basic Information */}
              <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                <div className="sm:col-span-4">
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                    Full name
                  </label>
                  <input
                    type="text"
                    name="name"
                    id="name"
                    value={formData.name}
                    onChange={handleChange}
                    disabled={!isEditing}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm disabled:bg-gray-100"
                  />
                </div>

                <div className="sm:col-span-4">
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                    Email address
                  </label>
                  <input
                    type="email"
                    name="email"
                    id="email"
                    value={formData.email}
                    disabled
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 bg-gray-100 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                  <p className="mt-2 text-sm text-gray-500">
                    Contact support to change your email address
                  </p>
                </div>

                <div className="sm:col-span-4">
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                    Phone number
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    id="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    disabled={!isEditing}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm disabled:bg-gray-100"
                    placeholder="e.g. 254712345678"
                  />
                </div>

                <div className="sm:col-span-4">
                  <label htmlFor="location" className="block text-sm font-medium text-gray-700">
                    Location
                  </label>
                  <input
                    type="text"
                    name="location"
                    id="location"
                    value={formData.location}
                    onChange={handleChange}
                    disabled={!isEditing}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm disabled:bg-gray-100"
                    placeholder="e.g. Nairobi, Kenya"
                  />
                </div>

                <div className="sm:col-span-4">
                  <label htmlFor="mpesaNumber" className="block text-sm font-medium text-gray-700">
                    M-Pesa Number
                  </label>
                  <input
                    type="tel"
                    name="mpesaNumber"
                    id="mpesaNumber"
                    value={formData.mpesaNumber}
                    onChange={handleChange}
                    disabled={!isEditing}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm disabled:bg-gray-100"
                    placeholder="e.g. 254712345678"
                  />
                  <p className="mt-2 text-sm text-gray-500">
                    Used for receiving payments
                  </p>
                </div>
              </div>
            </div>

            {/* Form Actions */}
            <div className="px-6 py-4 bg-gray-50 text-right">
              <div className="flex justify-between mt-6">
                <button
                  type="button"
                  onClick={handleDeleteAccount}
                  disabled={isDeleting}
                  className="px-4 py-2 text-white bg-red-600 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50"
                >
                  {isDeleting ? 'Deleting...' : 'Delete Account'}
                </button>
                {isEditing ? (
                  <div className="space-x-3">
                    <button
                      type="button"
                      onClick={() => {
                        setIsEditing(false);
                        // Reset form to original values
                        fetch('/api/users/profile', {
                          headers: {
                            'Authorization': `Bearer ${user?.token}`
                          }
                        })
                        .then(res => res.json())
                        .then(data => {
                          setFormData({
                            name: data.name || '',
                            email: data.email || '',
                            phone: data.phone || '',
                            location: data.location || '',
                            mpesaNumber: data.mpesaNumber || '',
                            avatar: data.avatar || ''
                          });
                        });
                      }}
                      disabled={isSaving}
                      className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isSaving}
                      className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                    >
                      {isSaving ? (
                        <>
                          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Saving...
                        </>
                      ) : 'Save Changes'}
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setIsEditing(true)}
                    className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Edit Profile
                  </button>
                )}
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
