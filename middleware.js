import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import admin from "@/lib/firebase-admin";

const COOKIE_NAME = "session";

// Paths that require authentication
const protectedPaths = ["/profile", "/dashboard", "/post", "/checkout"];

export async function middleware(req) {
  const { pathname } = req.nextUrl;

  // Only check protected routes
  if (!protectedPaths.some((path) => pathname.startsWith(path))) {
    return NextResponse.next();
  }

  try {
    const cookieStore = cookies();
    const sessionCookie = cookieStore.get(COOKIE_NAME);

    if (!sessionCookie) {
      // Not logged in → redirect to login
      return NextResponse.redirect(new URL("/auth/login", req.url));
    }

    // Verify session cookie
    await admin.auth().verifySessionCookie(sessionCookie.value, true);

    return NextResponse.next();
  } catch (error) {
    console.error("Middleware auth error:", error.message);

    // Invalid cookie → clear it + redirect
    const res = NextResponse.redirect(new URL("/auth/login", req.url));
    res.cookies.delete(COOKIE_NAME);
    return res;
  }
}

// Only run middleware on routes we care about
export const config = {
  matcher: ["/profile/:path*", "/dashboard/:path*", "/post/:path*", "/checkout/:path*"],
};
