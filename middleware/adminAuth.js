import { NextResponse } from "next/server";
import admin from "@/lib/firebase-admin";

/**
 * Middleware to verify admin role
 * @param {Request} req - The incoming request
 * @returns {Promise<{error: string, status: number}|{user: object}>}
 */
export async function requireAdminAuth(req) {
  try {
    const authHeader = req.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return { error: 'Unauthorized: No token provided', status: 401 };
    }

    const token = authHeader.split(' ')[1];
    const decodedToken = await admin.auth().verifyIdToken(token);
    
    if (decodedToken.role !== 'admin') {
      return { error: 'Forbidden: Admin access required', status: 403 };
    }

    return { user: decodedToken };
  } catch (error) {
    console.error('Admin auth error:', error);
    return { error: 'Unauthorized: Invalid token', status: 401 };
  }
}

/**
 * Higher-order function to protect admin routes
 * @param {Function} handler - The route handler function
 * @returns {Function} Protected route handler
 */
export function withAdminAuth(handler) {
  return async (req) => {
    const { error, status } = await requireAdminAuth(req);
    if (error) {
      return NextResponse.json({ error }, { status });
    }
    return handler(req);
  };
}

export default withAdminAuth;
