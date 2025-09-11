// app/api/users/me/route.js
import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import { requireAuth } from "@/middleware/auth";

// GET /api/users/me → get logged-in user
export async function GET(request) {
  try {
    await dbConnect();
    const authData = await requireAuth(request);

    if (!authData) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    return NextResponse.json(authData.user);
  } catch (error) {
    console.error("GET /users/me error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// PUT /api/users/me → update logged-in user
export async function PUT(request) {
  try {
    await dbConnect();
    const authData = await requireAuth(request);

    if (!authData) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { user } = authData;
    const body = await request.json();
    const { name, phone, location, avatar } = body;

    const updateData = {};
    if (name) updateData.name = name;
    if (phone) updateData.phone = phone;
    if (location) updateData.location = location;
    if (avatar) updateData.avatar = avatar;

    const updatedUser = await User.findByIdAndUpdate(
      user._id,
      updateData,
      { new: true, runValidators: true }
    ).select("-password -__v");

    if (!updatedUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error("PUT /users/me error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
