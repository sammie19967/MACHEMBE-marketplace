export const runtime = "nodejs";

import { NextResponse } from "next/server";
import admin from "@/lib/firebase-admin";

const COOKIE_NAME = "session";

// Only run middleware on routes we care about
export const config = {
  matcher: ["/profile/:path*", "/dashboard/:path*", "/post/:path*", "/checkout/:path*"],
};

export async function middleware(req) {
  const { pathname } = req.nextUrl;

  // Only check protected routes
  if (
    ![ "/dashboard", "/post", "/checkout"].some((path) =>
      pathname.startsWith(path)
    )
  ) {
    return NextResponse.next();
  }

  try {
    // ✅ Correct way to read cookies in middleware
    const sessionCookie = req.cookies.get(COOKIE_NAME)?.value;

    if (!sessionCookie) {
      return NextResponse.redirect(new URL("/auth/login", req.url));
    }

    // Verify session cookie with Firebase Admin
    await admin.auth().verifySessionCookie(sessionCookie, true);

    return NextResponse.next();
  } catch (error) {
    console.error("Middleware auth error:", error.message);

    // Invalid cookie → clear + redirect
    const res = NextResponse.redirect(new URL("/auth/login", req.url));
    res.cookies.delete(COOKIE_NAME, { path: "/" });
    return res;
  }
}
