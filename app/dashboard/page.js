"use client";
import { useState, useEffect } from 'react';
import { auth } from '@/lib/firebase-client';
import { showModal } from '@/components/SweetModal';
import { useRouter } from 'next/navigation';

export default function Dashboard() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchUserData() {
      try {
        const token = await auth.currentUser?.getIdToken();
        if (!token) return;

        const res = await fetch('/api/users/me', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!res.ok) throw new Error('Failed to fetch user data');

        const data = await res.json();
        setUser(data.user);
      } catch (error) {
        showModal({
          title: 'Error',
          text: error.message,
          icon: 'error'
        });
      } finally {
        setLoading(false);
      }
    }

    fetchUserData();
  }, []);

  const handleSignOut = async () => {
    try {
      await auth.signOut();
      
      // Call backend to clear session
      await fetch('/api/auth/logout', {
        method: 'POST'
      });

      await showModal({
        title: 'Success',
        text: 'You have been signed out successfully',
        icon: 'success',
        timer: 1500
      });

      router.push('/auth/login');
    } catch (error) {
      showModal({
        title: 'Error',
        text: 'Failed to sign out. Please try again.',
        icon: 'error'
      });
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
    </div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold">User Dashboard</h1>
            <button
              onClick={handleSignOut}
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-colors"
            >
              Sign Out
            </button>
          </div>
          
          {user ? (
            <div className="space-y-6">
              {/* User Profile Section */}
              <div className="border rounded-lg p-4">
                <h2 className="text-xl font-semibold mb-4">Profile Information</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-600">Name</label>
                    <p className="mt-1">{user.name}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600">Email</label>
                    <p className="mt-1">{user.email}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600">Role</label>
                    <p className="mt-1 capitalize">{user.role || 'user'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600">Account Status</label>
                    <p className={`mt-1 ${user.isBanned ? 'text-red-600' : 'text-green-600'}`}>
                      {user.isBanned ? 'Banned' : 'Active'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Subscription Section */}
              <div className="border rounded-lg p-4">
                <h2 className="text-xl font-semibold mb-4">Subscription Details</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-600">Plan</label>
                    <p className="mt-1 capitalize">{user.subscription || 'Free'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600">Expires</label>
                    <p className="mt-1">
                      {user.subscriptionExpiry 
                        ? new Date(user.subscriptionExpiry).toLocaleDateString()
                        : 'N/A'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Activity Section */}
              <div className="border rounded-lg p-4">
                <h2 className="text-xl font-semibold mb-4">Account Activity</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-600">Last Active</label>
                    <p className="mt-1">
                      {user.lastActive 
                        ? new Date(user.lastActive).toLocaleString()
                        : 'Never'}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600">Member Since</label>
                    <p className="mt-1">
                      {user.createdAt 
                        ? new Date(user.createdAt).toLocaleDateString()
                        : 'Unknown'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <p className="text-gray-500">No user data available</p>
          )}
        </div>
      </div>
    </div>
  );
}