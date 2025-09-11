import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import admin from "@/lib/firebase-admin";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";

const COOKIE_NAME = "session";
const TOKEN_EXPIRATION = 14 * 24 * 60 * 60 * 1000; // 14 days

/**
 * Verify authentication from session cookie
 */
export async function requireAuth(req) {
  try {
    await dbConnect();

    // Get session cookie
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get(COOKIE_NAME)?.value;

    if (!sessionCookie) {
      throw new Error("No session cookie found");
    }

    // Verify Firebase session cookie
    const decoded = await admin.auth().verifySessionCookie(sessionCookie, true);

    // Get user from DB
    const user = await User.findOne({ uid: decoded.uid })
      .select("-password -__v")
      .lean();

    if (!user) {
      throw new Error("User not found in database");
    }

    return { user, token: decoded };
  } catch (error) {
    console.error("Auth error:", error);
    return null;
  }
}

/**
 * Higher-order middleware to protect routes
 */
export function withAuth(handler, allowedRoles = []) {
  return async (req) => {
    const authData = await requireAuth(req);

    if (!authData) {
      return NextResponse.json(
        { error: "Unauthorized: Please log in" },
        { status: 401 }
      );
    }

    const { user, token } = authData;

    // Role check
    if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
      return NextResponse.json(
        { error: `Forbidden: Access requires roles [${allowedRoles.join(", ")}]` },
        { status: 403 }
      );
    }

    // Attach auth data to request (so handler can use it)
    req.auth = { user, token };
    return handler(req);
  };
}
