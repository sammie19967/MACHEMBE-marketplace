// app/api/auth/session/route.js
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import admin from "@/lib/firebase-admin";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";

const COOKIE_NAME = "session";

export async function GET() {
  try {
    await dbConnect();

    // Grab session cookie
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get(COOKIE_NAME)?.value;

    if (!sessionCookie) {
      return NextResponse.json({ user: null }, { status: 401 });
    }

    // Verify Firebase session cookie
    const decoded = await admin.auth().verifySessionCookie(sessionCookie, true);

    // Fetch user from DB
    const user = await User.findOne({ uid: decoded.uid })
      .select("-password -__v")
      .lean();

    if (!user) {
      return NextResponse.json({ user: null }, { status: 404 });
    }

    return NextResponse.json({ user });
  } catch (error) {
    console.error("Session error:", error);
    return NextResponse.json({ user: null, error: error.message }, { status: 401 });
  }
}
