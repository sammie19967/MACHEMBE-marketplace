// lib/requireRole.js
import { requireAuth } from "./requireAuth";

export async function requireRole(req, allowedRoles = []) {
  const user = await requireAuth(req);

  if (!allowedRoles.includes(user.role)) {
    throw new Error("Forbidden: Insufficient permissions");
  }

  return user;
}
