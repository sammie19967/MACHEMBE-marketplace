import { NextResponse } from "next/server";
import { withAuth } from "@/middleware/withAuth";
import User from "@/models/User";
import dbConnect from "@/lib/mongodb";

/**
 * Get current user's profile
 * GET /api/users/profile
 */
const getProfile = async (req) => {
  try {
    await dbConnect();
    const { userId } = req.auth;

    const user = await User.findById(userId)
      .select('-__v -createdAt -updatedAt')
      .populate('followers following', 'name email avatar')
      .lean();

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error('Error fetching profile:', error);
    return NextResponse.json(
      { error: 'Failed to fetch profile' },
      { status: 500 }
    );
  }
};

/**
 * Update current user's profile
 * PUT /api/users/profile
 * Body: { name?, phone?, avatar?, location?, mpesaNumber? }
 */
const updateProfile = async (req) => {
  try {
    await dbConnect();
    const { userId } = req.auth;
    const updates = await req.json();

    // Define allowed fields that users can update
    const allowedUpdates = ['name', 'phone', 'avatar', 'location', 'mpesaNumber'];
    const updatesToApply = {};

    // Filter updates to only include allowed fields
    Object.keys(updates).forEach(key => {
      if (allowedUpdates.includes(key)) {
        updatesToApply[key] = updates[key];
      }
    });

    // If no valid updates provided
    if (Object.keys(updatesToApply).length === 0) {
      return NextResponse.json(
        { error: 'No valid fields to update' },
        { status: 400 }
      );
    }

    // If phone is being updated, validate it
    if (updatesToApply.phone) {
      // Basic phone validation (customize based on your requirements)
      const phoneRegex = /^[0-9]{10,15}$/;
      if (!phoneRegex.test(updatesToApply.phone)) {
        return NextResponse.json(
          { error: 'Invalid phone number format' },
          { status: 400 }
        );
      }
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $set: updatesToApply },
      { new: true, runValidators: true }
    )
    .select('-__v -createdAt -updatedAt')
    .lean();

    if (!updatedUser) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error('Error updating profile:', error);
    return NextResponse.json(
      { error: 'Failed to update profile' },
      { status: 500 }
    );
  }
};

// Protected routes
export const GET = withAuth(getProfile);
export const PUT = withAuth(updateProfile);
