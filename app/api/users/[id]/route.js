import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import { requireAuth } from "@/middleware/auth";
import mongoose from "mongoose";

// Helper function to check if a string is a valid MongoDB ObjectId
function isValidObjectId(id) {
  return mongoose.Types.ObjectId.isValid(id) && 
         new mongoose.Types.ObjectId(id).toString() === id;
}

// GET /api/users/[id]
export async function GET(request, { params }) {
  try {
    const { id } = await params;
    const userId = id;
    
    await dbConnect();
    
    const authData = await requireAuth(request);
    if (!authData) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { user: authUser } = authData;

    // Check if user is authorized to view this profile
    // Allow if admin OR if the userId matches either authUser's _id or uid
    const isAuthorized = 
      authUser.role === "admin" || 
      authUser._id.toString() === userId || 
      authUser.uid === userId;

    if (!isAuthorized) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    let foundUser;

    // Only try to find by ObjectId if the ID is a valid ObjectId
    if (isValidObjectId(userId)) {
      foundUser = await User.findById(userId).select("-password -__v").lean();
    }
    
    // If not found by _id (or ID wasn't a valid ObjectId), try to find by Firebase UID
    if (!foundUser) {
      foundUser = await User.findOne({ uid: userId }).select("-password -__v").lean();
    }

    if (!foundUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json(foundUser);
  } catch (error) {
    console.error("GET /users/[id] error:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}

// PUT /api/users/[id]
export async function PUT(request, { params }) {
  try {
    const { id } = await params;
    const userId = id;
    
    await dbConnect();
    
    const authData = await requireAuth(request);
    if (!authData) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { user: authUser } = authData;

    // Check if user is authorized to update this profile
    // Allow if admin OR if the userId matches either authUser's _id or uid
    const isAuthorized = 
      authUser.role === "admin" || 
      authUser._id.toString() === userId || 
      authUser.uid === userId;

    if (!isAuthorized) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const { name, phone, location, avatar } = body;

    // Only allow updating specific fields
    const updateData = {};
    if (name) updateData.name = name;
    if (phone) updateData.phone = phone;
    if (location) updateData.location = location;
    if (avatar) updateData.avatar = avatar;

    let updatedUser;

    // Only try to update by ObjectId if the ID is a valid ObjectId
    if (isValidObjectId(userId)) {
      updatedUser = await User.findByIdAndUpdate(
        userId,
        updateData,
        { new: true, runValidators: true }
      ).select("-password -__v");
    }
    
    // If not found by _id (or ID wasn't a valid ObjectId), try to update by Firebase UID
    if (!updatedUser) {
      updatedUser = await User.findOneAndUpdate(
        { uid: userId },
        updateData,
        { new: true, runValidators: true }
      ).select("-password -__v");
    }

    if (!updatedUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error("PUT /users/[id] error:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}