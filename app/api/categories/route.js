import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Category from "@/models/Category";

// GET /api/categories - Get all categories with optional filtering
export async function GET(request) {
  try {
    await dbConnect();

    const { searchParams } = new URL(request.url);
    const parent = searchParams.get('parent');
    const slug = searchParams.get('slug');
    const includeSubcategories = searchParams.get('includeSubcategories') === 'true';

    // Build query
    const query = {};
    
    if (parent) {
      query.parent = parent;
    } else if (!slug) {
      // If no parent specified and not fetching by slug, get only root categories
      query.parent = { $exists: false };
    }
    
    if (slug) {
      query.slug = slug;
    }

    // Find categories
    let categories = await Category.find(query).sort({ name: 1 }).lean();

    // If includeSubcategories is true and we're getting root categories
    if (includeSubcategories && !parent && !slug) {
      // For our current schema, subcategories are already included in the category document
      // No need for additional queries since subcategories are stored as an array of strings
      categories = categories.map(category => ({
        ...category,
        // Ensure subcategories is always an array
        subcategories: Array.isArray(category.subcategories) 
          ? category.subcategories 
          : []
      }));
    }

    return NextResponse.json({
      success: true,
      data: categories,
    });
  } catch (error) {
    console.error('Error fetching categories:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch categories' },
      { status: 500 }
    );
  }
}

// POST /api/categories - Create a new category (Admin only)
export async function POST(request) {
  try {
    await dbConnect();
    
    // Check authentication and admin role using the withAuth middleware
    const authResponse = await withAuth(request);
    if (authResponse) return authResponse; // Handle auth errors
    
    if (request.auth.role !== 'admin') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 403 }
      );
    }

    const body = await request.json();
    
    // Basic validation
    if (!body.name || !body.slug) {
      return NextResponse.json(
        { success: false, error: 'Name and slug are required' },
        { status: 400 }
      );
    }

    // Check if category with same slug already exists
    const existingCategory = await Category.findOne({ slug: body.slug });
    if (existingCategory) {
      return NextResponse.json(
        { success: false, error: 'Category with this slug already exists' },
        { status: 400 }
      );
    }

    // Create new category
    const category = new Category({
      name: body.name,
      slug: body.slug,
      description: body.description || '',
      icon: body.icon || '📦',
      parent: body.parentId || null,
      isActive: body.isActive !== undefined ? body.isActive : true,
    });

    await category.save();

    return NextResponse.json(
      { success: true, data: category },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating category:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create category' },
      { status: 500 }
    );
  }
}

// Helper function to use withAuth middleware
async function withAuth(request) {
  try {
    const authHeader = request.headers.get('authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Unauthorized: No token provided' },
        { status: 401 }
      );
    }

    const token = authHeader.split(' ')[1];
    const admin = (await import('@/lib/firebase-admin')).default;
    const decodedToken = await admin.auth().verifyIdToken(token);
    
    // Add user info to request object for use in route handlers
    request.auth = {
      userId: decodedToken.uid,
      role: decodedToken.role || 'user',
      email: decodedToken.email
    };
    
    return null; // No error, continue with the request
  } catch (error) {
    console.error('Authentication error:', error);
    return NextResponse.json(
      { error: 'Unauthorized: Invalid or expired token' },
      { status: 401 }
    );
  }
}
