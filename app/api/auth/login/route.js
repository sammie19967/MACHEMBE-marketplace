// app/api/auth/login/route.js
import { NextResponse } from "next/server";
import admin from "@/lib/firebase-admin";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";

export async function POST(req) {
  try {
    await dbConnect();
    const { token } = await req.json();

    if (!token) {
      return NextResponse.json({ error: "Missing Firebase ID token" }, { status: 400 });
    }

    // Verify token
    const decoded = await admin.auth().verifyIdToken(token);

    // Role comes from Firebase claims
    const role = decoded.role || "user";

    // Fetch additional details from MongoDB
    let user = await User.findOne({ uid: decoded.uid });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({
      message: "Login successful",
      role,
      subscription: user.subscription,
      subscriptionExpiry: user.subscriptionExpiry,
      user,
    });
  } catch (error) {
    console.error("Login Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
