// scripts/seedCategories.mjs
import 'dotenv/config';
import mongoose from 'mongoose';
import Category from '../models/Category.js';

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
      "Men's Clothing",
      "Women's Clothing",
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
      "Children's Shoes",
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

async function seedCategories() {
  try {
    // Connect to MongoDB using the existing connection
    const MONGODB_URI = process.env.MONGODB_URI;
    if (!MONGODB_URI) {
      throw new Error('MONGODB_URI is not defined in .env');
    }
    
    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    console.log('Connected to MongoDB');
    
    // Clear existing categories
    await Category.deleteMany({});
    console.log('Cleared existing categories');
    
    // Insert new categories
    const result = await Category.insertMany(categories);
    console.log(`Seeded ${result.length} categories`);
    
    // Close the connection
    await mongoose.connection.close();
    console.log('Disconnected from MongoDB');
    
  } catch (error) {
    console.error('Error seeding categories:', error);
    process.exit(1);
  }
}

// Run the seeder
seedCategories();
