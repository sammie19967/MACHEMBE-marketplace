// lib/setUserRole.js
import admin from "@/lib/firebase-admin";

export async function setUserRole(uid, role) {
  try {
    await admin.auth().setCustomUserClaims(uid, { role });
    console.log(`Role '${role}' set for user ${uid}`);
    return { success: true };
  } catch (error) {
    console.error("Error setting role:", error);
    return { success: false, error: error.message };
  }
}
