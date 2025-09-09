// app/api/auth/signup/route.js
import { NextResponse } from "next/server";
import admin from "@/lib/firebase-admin";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";

export async function POST(req) {
  try {
    await dbConnect();
    const body = await req.json();
    const { token, name, phone, location } = body;

    if (!token) {
      return NextResponse.json({ error: "Missing Firebase ID token" }, { status: 400 });
    }

    // 1. Verify Firebase ID token
    const decoded = await admin.auth().verifyIdToken(token);

    // 2. Check if user already exists
    let user = await User.findOne({ uid: decoded.uid });

    if (!user) {
      // 3. Create new user
      user = await User.create({
        uid: decoded.uid,
        email: decoded.email,
        name,
        phone,
        location,
        role: "user", // default
        subscription: "free",
        subscriptionExpiry: null,
      });
    }

    return NextResponse.json(
      { message: "User synced successfully", user },
      { status: 201 }
    );
  } catch (error) {
    console.error("Signup Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
