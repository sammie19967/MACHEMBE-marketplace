// scripts/seedCategories.js
import dbConnect from "../lib/mongodb.js";
import Category from "../models/Category.js";

const categories = [
  {
    name: "Electronics",
    slug: "electronics",
    subcategories: [
      "Televisions",
      "Audio & Music Equipment",
      "Cameras & Video Equipment",
      "Video Games & Consoles",
      "Headphones",
      "Laptops & Computers",
      "Printers & Scanners",
      "Networking Products",
    ],
  },
  {
    name: "Phones & Tablets",
    slug: "phones-tablets",
    subcategories: [
      "Smartphones",
      "Feature Phones",
      "Tablets",
      "Smartwatches & Wearables",
      "Phone Accessories",
      "Tablet Accessories",
    ],
  },
  {
    name: "Vehicles",
    slug: "vehicles",
    subcategories: [
      "Cars",
      "Motorcycles & Scooters",
      "Trucks & Trailers",
      "Buses & Minibuses",
      "Vehicle Parts & Accessories",
      "Tyres & Rims",
      "Boats & Watercraft",
      "Agricultural Machinery",
    ],
  },
  {
    name: "Property",
    slug: "property",
    subcategories: [
      "Houses & Apartments for Rent",
      "Houses & Apartments for Sale",
      "Land & Plots for Sale",
      "Land & Plots for Rent/Lease",
      "Commercial Property for Rent",
      "Commercial Property for Sale",
      "Short Let",
    ],
  },
  {
    name: "Beauty",
    slug: "beauty",
    subcategories: [
      "Makeup",
      "Fragrances",
      "Hair Beauty",
      "Skin Care",
      "Bath & Body",
      "Health Supplements",
      "Personal Care Tools",
    ],
  },
  {
    name: "Fashion",
    slug: "fashion",
    subcategories: [
      "Men’s Clothing",
      "Women’s Clothing",
      "Shoes",
      "Bags",
      "Jewelry & Watches",
      "Accessories",
    ],
  },
  {
    name: "Kids",
    slug: "kids",
    subcategories: [
      "Baby Clothing",
      "Baby Gear",
      "Toys",
      "Children’s Shoes",
      "Kids Furniture",
      "School Supplies",
    ],
  },
  {
    name: "Food & Agriculture",
    slug: "food-agriculture",
    subcategories: [
      "Farm Produce",
      "Livestock",
      "Poultry",
      "Fish & Seafood",
      "Feeds & Seeds",
      "Farm Machinery & Tools",
    ],
  },
  {
    name: "Repair & Construction",
    slug: "repair-construction",
    subcategories: [
      "Building Materials",
      "Electrical Equipment",
      "Plumbing & Water Supply",
      "Tools & Equipment",
      "Doors & Windows",
      "Paints & Finishes",
      "Roofing Materials",
    ],
  },
];

export async function seedCategories() {
  await dbConnect();
  await Category.deleteMany({});
  await Category.insertMany(categories);
  console.log("✅ Categories seeded successfully");
}

seedCategories().then(() => process.exit());
