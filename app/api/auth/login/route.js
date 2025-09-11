// app/api/auth/login/route.js
import { NextResponse } from "next/server";
import admin from "@/lib/firebase-admin";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";

const COOKIE_NAME = "session";
const TOKEN_EXPIRATION = 14 * 24 * 60 * 60 * 1000; // 14 days

export async function POST(req) {
  try {
    await dbConnect();
    const { token } = await req.json();

    if (!token) {
      return NextResponse.json(
        { error: "Missing Firebase ID token" },
        { status: 400 }
      );
    }

    // 1. Verify Firebase ID token
    const decoded = await admin.auth().verifyIdToken(token);

    // 2. Create a session cookie (so user doesn’t send bearer token every time)
    const sessionCookie = await admin.auth().createSessionCookie(token, {
      expiresIn: TOKEN_EXPIRATION,
    });

    // 3. Fetch user from MongoDB
    let user = await User.findOne({ uid: decoded.uid });
    if (!user) {
      return NextResponse.json(
        { error: "User not found, please sign up first" },
        { status: 404 }
      );
    }

    // 4. Attach session cookie to response
    const response = NextResponse.json(
      {
        message: "Login successful",
        role: decoded.role || "user",
        subscription: user.subscription,
        subscriptionExpiry: user.subscriptionExpiry,
        user,
      },
      { status: 200 }
    );

    response.cookies.set({
      name: COOKIE_NAME,
      value: sessionCookie,
      maxAge: TOKEN_EXPIRATION / 1000, // in seconds
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("Login Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
