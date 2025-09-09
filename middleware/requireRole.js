import admin from "@/lib/firebase-admin";

/**
 * Middleware to check if user has required role
 * @param {Request} req - Next.js API request
 * @param {Array<string>} allowedRoles - Array of allowed roles
 * @returns {Object} Authorization result
 */
export async function requireRole(req, allowedRoles = []) {
  try {
    // Check for auth header
    const authHeader = req.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return {
        authorized: false,
        status: 401,
        error: "Authentication required"
      };
    }

    // Verify token
    const token = authHeader.split(" ")[1];
    const decoded = await admin.auth().verifyIdToken(token);

    // Check for required role
    if (!decoded.role) {
      return {
        authorized: false,
        status: 403,
        error: "No role assigned"
      };
    }

    if (!allowedRoles.includes(decoded.role)) {
      return {
        authorized: false,
        status: 403,
        error: `Access denied. Required roles: ${allowedRoles.join(", ")}`
      };
    }

    // Success case
    return {
      authorized: true,
      user: decoded
    };

  } catch (error) {
    console.error("Auth error:", error);
    return {
      authorized: false,
      status: 500,
      error: "Authentication failed"
    };
  }
}

