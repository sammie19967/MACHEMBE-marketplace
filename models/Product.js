// models/Product.js
import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, // owner

    title: { type: String, required: true },
    description: { type: String },
    price: { type: Number, required: true },

    category: { type: String, required: true }, // e.g., "Electronics"
    subcategory: { type: String, required: true }, // e.g., "Televisions"

    images: [{ type: String }], // array of image URLs

    location: { type: String }, // e.g., Nairobi, Kenya

    // 🔑 This is where we allow flexibility for category-specific fields
    attributes: {
      type: Map,
      of: mongoose.Schema.Types.Mixed,
      default: {},
    },

    status: { type: String, enum: ["active", "sold", "archived"], default: "active" },
  },
  { timestamps: true }
);

const Product = mongoose.models.Product || mongoose.model("Product", productSchema);
export default Product;
