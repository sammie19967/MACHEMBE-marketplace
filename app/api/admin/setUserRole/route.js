// app/api/admin/setUserRole/route.js
import { NextResponse } from "next/server";
import { withAdminAuth } from "@/middleware/adminAuth";
import { setUserRole } from "@/lib/setUserRole";
import admin from "@/lib/firebase-admin";

/**
 * Set user role (both in Firebase and database)
 * POST /api/admin/setUserRole
 * Body: { uid: string, role: 'user' | 'admin' }
 * Returns: { message: string }
 */
const setUserRoleHandler = async (req) => {
  try {
    const { uid, role } = await req.json();

    // Input validation
    if (!uid || !role) {
      return NextResponse.json(
        { error: "User ID and role are required" }, 
        { status: 400 }
      );
    }

    if (!['user', 'admin'].includes(role)) {
      return NextResponse.json(
        { error: "Invalid role. Must be 'user' or 'admin'" },
        { status: 400 }
      );
    }

    // Update Firebase custom claims
    await admin.auth().setCustomUserClaims(uid, { role });

    // Update user in database
    const result = await setUserRole(uid, role);
    
    if (!result.success) {
      return NextResponse.json(
        { error: result.error || "Failed to update user role in database" },
        { status: 500 }
      );
    }

    return NextResponse.json({ 
      message: `Successfully set role '${role}' for user ${uid}` 
    });
  } catch (error) {
    console.error('Error setting user role:', error);
    return NextResponse.json(
      { error: error.message || "Failed to update user role" },
      { status: 500 }
    );
  }
};

export const POST = withAdminAuth(setUserRoleHandler);
