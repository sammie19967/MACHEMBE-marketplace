import { NextResponse } from "next/server";
import { withAdminAuth } from "@/middleware/adminAuth";
import User from "@/models/User";
import dbConnect from "@/lib/mongodb";

/**
 * Get a single user by ID
 * GET /api/admin/users/[id]
 * @returns {Promise<NextResponse>} The user object
 */
const getUser = async (req, { params }) => {
  try {
    await dbConnect();
    const { id } = params;

    const user = await User.findById(id)
      .select('-__v -createdAt -updatedAt')
      .lean();

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error('Error fetching user:', error);
    return NextResponse.json(
      { error: 'Failed to fetch user' },
      { status: 500 }
    );
  }
};

/**
 * Update a user
 * PUT /api/admin/users/[id]
 * @param {Object} updates - The fields to update
 * @returns {Promise<NextResponse>} The updated user
 */
const updateUser = async (req, { params }) => {
  try {
    await dbConnect();
    const { id } = params;
    const updates = await req.json();

    // Prevent updating sensitive fields
    const restrictedFields = ['_id', 'uid', 'createdAt', 'updatedAt', '__v'];
    for (const field of restrictedFields) {
      if (updates[field] !== undefined) {
        delete updates[field];
      }
    }

    // If email is being updated, check if it's already in use
    if (updates.email) {
      const existingUser = await User.findOne({ 
        email: updates.email, 
        _id: { $ne: id } 
      });
      
      if (existingUser) {
        return NextResponse.json(
          { error: 'Email already in use' },
          { status: 409 }
        );
      }
    }

    const user = await User.findByIdAndUpdate(
      id,
      { $set: updates },
      { new: true, runValidators: true }
    )
    .select('-__v -createdAt -updatedAt')
    .lean();

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error('Error updating user:', error);
    return NextResponse.json(
      { error: 'Failed to update user' },
      { status: 500 }
    );
  }
};

/**
 * Soft delete a user (mark as suspended)
 * DELETE /api/admin/users/[id]
 * @returns {Promise<NextResponse>} Success message
 */
const deleteUser = async (req, { params }) => {
  try {
    await dbConnect();
    const { id } = params;

    // Instead of deleting, mark as inactive
    const user = await User.findByIdAndUpdate(
      id,
      { $set: { status: 'suspended' } },
      { new: true }
    );

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: 'User suspended successfully' });
  } catch (error) {
    console.error('Error suspending user:', error);
    return NextResponse.json(
      { error: 'Failed to suspend user' },
      { status: 500 }
    );
  }
};

// Export route handlers with admin auth middleware
export const GET = withAdminAuth(getUser);
export const PUT = withAdminAuth(updateUser);
export const DELETE = withAdminAuth(deleteUser);
