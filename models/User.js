// models/User.js
import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
  {
    uid: { type: String, required: true, unique: true }, // Firebase UID

    // Basic Info
    email: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    phone: { type: String },
    avatar: { type: String },

    // Role & Access
    role: { type: String, enum: ["user", "admin"], default: "user" },
    isVerified: { type: Boolean, default: false }, // email/phone verified
    location: { type: String }, // e.g. "Nairobi, Kenya"

    // Plan / Subscription
    subscription: {
      type: String,
      enum: ["free", "basic", "premium", "enterprise"],
      default: "free",
    },
    subscriptionExpiry: { type: Date },

    // Marketplace
    listings: [{ type: mongoose.Schema.Types.ObjectId, ref: "Listing" }],

    // Social Features
    followers: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    following: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: "Feed" }],

    // Payments
    mpesaNumber: { type: String },
    transactions: [{ type: mongoose.Schema.Types.ObjectId, ref: "Transaction" }],

    // Admin Control
    status: { type: String, enum: ["active", "suspended"], default: "active" },
  },
  { timestamps: true }
);

export default mongoose.models.User || mongoose.model("User", UserSchema);