// app/api/auth/logout/route.js
import { NextResponse } from "next/server";
import admin from "@/lib/firebase-admin";
import { cookies } from "next/headers";

const COOKIE_NAME = "session";

export async function POST(req) {
  try {
    // 1. Read cookie
    const cookieStore = cookies();
    const sessionCookie = cookieStore.get(COOKIE_NAME)?.value;

    if (sessionCookie) {
      try {
        // 2. Verify session cookie
        const decoded = await admin.auth().verifySessionCookie(sessionCookie);

        // 3. Revoke Firebase refresh tokens for this user
        await admin.auth().revokeRefreshTokens(decoded.sub);
      } catch (err) {
        console.warn("Logout: invalid or expired session cookie");
      }

      // 4. Clear cookie
      cookieStore.set(COOKIE_NAME, "", {
        maxAge: 0,
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
      });
    }

    return NextResponse.json({ message: "Logged out successfully" }, { status: 200 });
  } catch (error) {
    console.error("Logout Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
