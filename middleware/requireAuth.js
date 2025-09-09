import { cookies } from "next/headers";
import admin from "@/lib/firebase-admin";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";

const COOKIE_NAME = 'session';
const TOKEN_EXPIRATION = 14 * 24 * 60 * 60 * 1000; // 14 days

export async function requireAuth(req) {
  try {
    await dbConnect();
    
    // Get cookie store and wait for it
    const cookieStore = await cookies();
    const sessionCookie = await cookieStore.get(COOKIE_NAME);
    let decoded;

    if (sessionCookie?.value) {
      try {
        decoded = await admin.auth().verifySessionCookie(sessionCookie.value, true);
      } catch (cookieError) {
        console.warn("Invalid session cookie:", cookieError.message);
      }
    }

    // Bearer token fallback
    if (!decoded) {
      const authHeader = req.headers.get("authorization");
      if (!authHeader?.startsWith("Bearer ")) {
        throw new Error("No valid authentication provided");
      }

      const token = authHeader.split(" ")[1];
      decoded = await admin.auth().verifyIdToken(token);

      // Create new session cookie
      const newSessionCookie = await admin.auth().createSessionCookie(token, {
        expiresIn: TOKEN_EXPIRATION
      });

      // Set cookie using async operation
      await cookieStore.set({
        name: COOKIE_NAME,
        value: newSessionCookie,
        options: {
          maxAge: TOKEN_EXPIRATION / 1000,
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          path: '/'
        }
      });
    }

    // Get user from database
    const user = await User.findOne({ uid: decoded.uid })
      .select('-password -__v')
      .lean();

    if (!user) {
      throw new Error("User not found in database");
    }

    return {
      user,
      token: decoded
    };

  } catch (error) {
    console.error("Auth error:", error);
    
    // Handle cookie deletion asynchronously
    const cookieStore = await cookies();
    const existingCookie = await cookieStore.get(COOKIE_NAME);
    
    if (existingCookie) {
      await cookieStore.delete(COOKIE_NAME);
    }
    
    return null;
  }
}
