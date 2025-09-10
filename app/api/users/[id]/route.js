import { NextResponse } from 'next/server';
import { withAuth } from '@/middleware/withAuth';
import User from '@/models/User';
import dbConnect from '@/lib/mongodb';

// Allowed fields for update operations
const ALLOWED_UPDATE_FIELDS = [
  'name',
  'phone',
  'location',
  'mpesaNumber',
  'avatar',
  'bio',
  'dateOfBirth',
  'gender',
  'preferences'
];

// Helper function to format response
function formatResponse(data, status = 200) {
  return NextResponse.json({
    success: status >= 200 && status < 300,
    ...(status >= 400 ? { error: data.message || 'An error occurred' } : { data })
  }, { status });
}
// GET /api/users/[id]
// Get user by ID
export const GET = withAuth(async (req) => {
  try {
    await dbConnect();
    // Extract ID from URL path
    const id = req.url.split('/').pop();

    // Find user by Firebase UID
    const user = await User.findOne({ uid: id })
      .select('-__v -createdAt -updatedAt')
      .lean();

    if (!user) {
      console.log(`User not found with UID: ${id}`);
      return formatResponse({ message: 'User not found' }, 404);
    }

    return formatResponse({ user });
  } catch (error) {
    console.error('Error fetching user:', error);
    return formatResponse({ message: 'Failed to fetch user' }, 500);
  }
});

// PATCH /api/users/[id]
// Update user by ID
export const PATCH = withAuth(async (req) => {
  try {
    await dbConnect();
    // Extract ID from URL path
    const id = req.url.split('/').pop();
    const body = await req.json();
    
    // Filter and validate update data
    const updateData = {};
    Object.keys(body).forEach(key => {
      if (ALLOWED_UPDATE_FIELDS.includes(key)) {
        updateData[key] = body[key];
      }
    });

    if (Object.keys(updateData).length === 0) {
      return formatResponse({ message: 'No valid fields to update' }, 400);
    }

    const user = await User.findOneAndUpdate(
      { uid: id },
      { $set: updateData },
      { new: true, runValidators: true }
    ).select('-__v -createdAt -updatedAt');

    if (!user) {
      console.log(`User not found with UID: ${id}`);
      return formatResponse({ message: 'User not found' }, 404);
    }

    return formatResponse({ user });
  } catch (error) {
    console.error('Error updating user:', error);
    
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(val => val.message);
      return formatResponse({ message: 'Validation error', errors: messages }, 400);
    }
    
    return formatResponse({ message: 'Failed to update user' }, 500);
  }
});

// DELETE /api/users/[id]
// Soft delete user by marking as inactive
export const DELETE = withAuth(async (req) => {
  try {
    await dbConnect();
    // Extract ID from URL path
    const id = req.url.split('/').pop();

    // Instead of deleting, mark as inactive
    const user = await User.findOneAndUpdate(
      { uid: id },
      { $set: { status: 'inactive', deactivatedAt: new Date() } },
      { new: true }
    );

    if (!user) {
      console.log(`User not found with UID: ${id}`);
      return formatResponse({ message: 'User not found' }, 404);
    }

    return formatResponse({ message: 'User deactivated successfully' });
  } catch (error) {
    console.error('Error deactivating user:', error);
    return formatResponse({ message: 'Failed to deactivate user' }, 500);
  }
});
