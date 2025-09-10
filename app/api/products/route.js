import { NextResponse } from 'next/server';
import { withAuth } from '@/middleware/withAuth';
import Product from '@/models/Product';
import User from '@/models/User';
import dbConnect from '@/lib/mongodb';
import { getServerSession } from 'next-auth/next';

// Helper function to format response
function formatResponse(data, status = 200) {
  return {
    success: status >= 200 && status < 300,
    ...(status >= 400 ? { error: data.message || 'An error occurred' } : { data })
  };
}

// GET /api/products - List products with optional filters
export async function GET(req) {
  try {
    await dbConnect();
    
    // Get query parameters
    const { searchParams } = new URL(req.url);
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
    
    // Execute query
    const skip = (page - 1) * limit;
    const sort = { [sortBy]: sortOrder === 'asc' ? 1 : -1 };
    
    const [products, total] = await Promise.all([
      Product.find(query)
        .populate('seller', 'name email avatar')
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .lean(),
      Product.countDocuments(query)
    ]);
    
    return NextResponse.json({
      success: true,
      data: {
        products,
        pagination: {
          total,
          page,
          totalPages: Math.ceil(total / limit),
          limit
        }
      }
    });
    
  } catch (error) {
    console.error('Error fetching products:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch products' },
      { status: 500 }
    );
  }
}

// POST /api/products - Create a new product
export const POST = withAuth(async (req) => {
  try {
    await dbConnect();
    
    // Get user ID from auth
    const session = await getServerSession();
    if (!session?.user?.email) {
      return NextResponse.json(
        { success: false, error: 'Not authenticated' },
        { status: 401 }
      );
    }
    
    // Get user from database
    const user = await User.findOne({ email: session.user.email });
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }
    
    // Parse request body
    const body = await req.json();
    
    // Create product
    const product = new Product({
      ...body,
      seller: user._id,
      status: 'draft' // Default status
    });
    
    await product.save();
    
    return NextResponse.json({
      success: true,
      data: { product }
    }, { status: 201 });
    
  } catch (error) {
    console.error('Error creating product:', error);
    
    // Handle validation errors
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(val => val.message);
      return NextResponse.json(
        { success: false, error: 'Validation error', messages },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { success: false, error: 'Failed to create product' },
      { status: 500 }
    );
  }
});

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
