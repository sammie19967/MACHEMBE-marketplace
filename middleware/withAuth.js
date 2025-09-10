import { NextResponse } from "next/server";
import admin from "@/lib/firebase-admin";

/**
 * Middleware to verify authentication
 * @param {Function} handler - The route handler function
 * @returns {Function} Protected route handler
 */
export function withAuth(handler) {
  return async (req) => {
    try {
      const authHeader = req.headers.get('authorization');
      
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return NextResponse.json(
          { error: 'Unauthorized: No token provided' },
          { status: 401 }
        );
      }

      const token = authHeader.split(' ')[1];
      const decodedToken = await admin.auth().verifyIdToken(token);
      
      // Add user ID to request object for use in route handlers
      req.auth = {
        userId: decodedToken.uid,
        role: decodedToken.role || 'user',
        email: decodedToken.email
      };

      return handler(req);
    } catch (error) {
      console.error('Authentication error:', error);
      return NextResponse.json(
        { error: 'Unauthorized: Invalid or expired token' },
        { status: 401 }
      );
    }
  };
}

export default withAuth;
