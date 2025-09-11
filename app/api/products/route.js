import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Product from '@/models/Product';
import { requireAuth } from '@/middleware/auth';

// Helper function to format response
function formatResponse(data, status = 200) {
  return {
    success: status >= 200 && status < 300,
    ...(status >= 400 ? { error: data.message || 'An error occurred' } : { data })
  };
}

// GET /api/products - List products with optional filters
export async function GET(request) {
  try {
    await dbConnect();
    
    // Get query parameters
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const category = searchParams.get('category');
    const minPrice = searchParams.get('minPrice');
    const maxPrice = searchParams.get('maxPrice');
    const sortBy = searchParams.get('sortBy') || 'createdAt';
    const sortOrder = searchParams.get('sortOrder') || 'desc';
    const sellerId = searchParams.get('sellerId');
    const status = searchParams.get('status') || 'published';
    
    // Build query
    const query = {};
    
    // Text search
    if (searchParams.get('q')) {
      query.$text = { $search: searchParams.get('q') };
    }
    
    // Category filter
    if (category) {
      query.category = category;
    }
    
    // Price range filter
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = parseFloat(minPrice);
      if (maxPrice) query.price.$lte = parseFloat(maxPrice);
    }
    
    // Seller filter
    if (sellerId) {
      query.seller = sellerId;
    }
    
    // Status filter
    if (status) {
      query.status = status;
    }
    
    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;
    
    // Execute query with pagination
    const skip = (page - 1) * limit;
    const total = await Product.countDocuments(query);
    const products = await Product.find(query)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .populate('seller', 'name email')
      .lean();
    
    return NextResponse.json({
      data: products,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
    
  } catch (error) {
    console.error('Error fetching products:', error);
    return NextResponse.json(
      { error: 'Failed to fetch products' },
      { status: 500 }
    );
  }
}

// POST /api/products - Create a new product
export async function POST(request) {
  try {
    await dbConnect();
    
    // Require authentication
    const authData = await requireAuth(request);
    if (!authData) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const { user } = authData;
    
    // Check if user is a seller or admin
    if (user.role !== 'seller' && user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Forbidden: Only sellers can create products' },
        { status: 403 }
      );
    }
    
    const data = await request.json();
    
    // Basic validation
    const requiredFields = ['name', 'description', 'price', 'category'];
    const missingFields = requiredFields.filter(field => !data[field]);
    
    if (missingFields.length > 0) {
      return NextResponse.json(
        { 
          error: `Missing required fields: ${missingFields.join(', ')}`,
          fields: missingFields
        },
        { status: 400 }
      );
    }
    
    // Create new product
    const product = new Product({
      ...data,
      seller: user._id,
      status: 'active',
    });
    
    await product.save();
    
    return NextResponse.json(product, { status: 201 });
    
  } catch (error) {
    console.error('Error creating product:', error);
    
    // Handle validation errors
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(val => val.message);
      return NextResponse.json(
        { error: 'Validation error', messages },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to create product' },
      { status: 500 }
    );
  }
}

// Add OPTIONS method for CORS preflight
export async function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}
