// lib/requireAuth.js
import admin from "@/lib/firebase-admin";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";

export async function requireAuth(req) {
  try {
    await dbConnect();

    const authHeader = req.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      throw new Error("No authorization token provided");
    }

    const token = authHeader.split(" ")[1];
    const decoded = await admin.auth().verifyIdToken(token);

    const user = await User.findOne({ uid: decoded.uid });
    if (!user) throw new Error("User not found in database");

    return user; // return the full user object
  } catch (error) {
    throw new Error("Unauthorized: " + error.message);
  }
}
