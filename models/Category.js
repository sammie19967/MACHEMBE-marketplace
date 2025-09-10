// models/Category.js
import mongoose from "mongoose";

const categorySchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true }, // e.g. "Electronics"
  slug: { type: String, required: true, unique: true }, // e.g. "electronics"
  subcategories: [{ type: String }], // e.g. ["Televisions", "Laptops"]
});

const Category = mongoose.models.Category || mongoose.model("Category", categorySchema);
export default Category;
