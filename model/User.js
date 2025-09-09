// models/User.js
import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
  {
    uid: { type: String, required: true, unique: true }, // Firebase UID
    email: { type: String, required: true, unique: true },
    name: { type: String },
    role: { type: String, enum: ["user", "admin"], default: "user" }, // RBAC
    subscription: { type: String, enum: ["free", "premium"], default: "free" },
    avatar: { type: String }, // profile pic (Cloudinary later)
  },
  { timestamps: true }
);

export default mongoose.models.User || mongoose.model("User", UserSchema);
