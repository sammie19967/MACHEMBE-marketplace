import { cookies } from "next/headers";
import admin from "@/lib/firebase-admin";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";

const COOKIE_NAME = 'session';
const TOKEN_EXPIRATION = 14 * 24 * 60 * 60 * 1000; // 14 days

export async function requireAuth(req) {
  try {
    await dbConnect();

    // Try cookie first - make cookies() call async
    const cookieStore = cookies();
    const sessionCookie = await cookieStore.get(COOKIE_NAME)?.value;
    let decoded;

    if (sessionCookie) {
      try {
        decoded = await admin.auth().verifySessionCookie(sessionCookie, true);
      } catch (cookieError) {
        console.warn("Invalid session cookie:", cookieError.message);
      }
    }

    // Fallback to Bearer token if no valid cookie
    if (!decoded) {
      const authHeader = req.headers.get("authorization");
      if (!authHeader?.startsWith("Bearer ")) {
        throw new Error("No valid authentication provided");
      }

      const token = authHeader.split(" ")[1];
      decoded = await admin.auth().verifyIdToken(token);

      // Create new session cookie
      const sessionCookie = await admin.auth().createSessionCookie(token, {
        expiresIn: TOKEN_EXPIRATION
      });

      // Set cookie for future requests - make cookies() call async
      const cookieStore = cookies();
      await cookieStore.set(COOKIE_NAME, sessionCookie, {
        maxAge: TOKEN_EXPIRATION / 1000, // Convert to seconds
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/'
      });
    }

    // Get user from database
    const user = await User.findOne({ uid: decoded.uid });
    if (!user) {
      throw new Error("User not found in database");
    }

    // Check if user is banned
    if (user.isBanned) {
      throw new Error("User is banned");
    }

    // Update last active timestamp
    await User.findByIdAndUpdate(user._id, {
      lastActive: new Date(),
    });

    return {
      user,
      token: decoded,
      isAdmin: user.role === 'admin',
      isModerator: user.role === 'moderator'
    };

  } catch (error) {
    console.error("Auth error:", error);
    
    // Clear invalid cookie if present - make cookies() call async
    const cookieStore = cookies();
    if (await cookieStore.get(COOKIE_NAME)) {
      await cookieStore.delete(COOKIE_NAME);
    }

    throw new Error("Unauthorized: " + error.message);
  }
}

// Helper to create session cookie
export async function createSessionCookie(idToken) {
  try {
    const sessionCookie = await admin.auth().createSessionCookie(idToken, {
      expiresIn: TOKEN_EXPIRATION
    });

    cookies().set(COOKIE_NAME, sessionCookie, {
      maxAge: TOKEN_EXPIRATION / 1000,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/'
    });

    return true;
  } catch (error) {
    console.error("Session cookie creation failed:", error);
    return false;
  }
}

// Helper to clear session
export function clearSession() {
  cookies().delete(COOKIE_NAME);
}
