import { NextResponse } from 'next/server';
import { withAuth } from '@/middleware/auth';
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

// GET /api/products/[id] - Get a single product
export async function GET(req, { params }) {
  try {
    await dbConnect();
    const { id } = params;
    
    // Increment view count
    await Product.findByIdAndUpdate(id, { $inc: { views: 1 } });
    
    const product = await Product.findById(id)
      .populate('seller', 'name email avatar')
      .lean();
    
    if (!product) {
      return NextResponse.json(
        { success: false, error: 'Product not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      data: { product }
    });
    
  } catch (error) {
    console.error('Error fetching product:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch product' },
      { status: 500 }
    );
  }
}

// PATCH /api/products/[id] - Update a product
export const PATCH = withAuth(async (req, { params }) => {
  try {
    await dbConnect();
    const { id } = params;
    const session = await getServerSession();
    
    // Get user
    const user = await User.findOne({ email: session?.user?.email });
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }
    
    // Get product
    const product = await Product.findById(id);
    if (!product) {
      return NextResponse.json(
        { success: false, error: 'Product not found' },
        { status: 404 }
      );
    }
    
    // Check ownership
    if (product.seller.toString() !== user._id.toString()) {
      return NextResponse.json(
        { success: false, error: 'Not authorized to update this product' },
        { status: 403 }
      );
    }
    
    // Parse and validate update data
    const updates = await req.json();
    
    // Prevent changing seller or other protected fields
    const { seller, _id, ...allowedUpdates } = updates;
    
    // Apply updates
    Object.assign(product, allowedUpdates);
    await product.save();
    
    return NextResponse.json({
      success: true,
      data: { product }
    });
    
  } catch (error) {
    console.error('Error updating product:', error);
    
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(val => val.message);
      return NextResponse.json(
        { success: false, error: 'Validation error', messages },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { success: false, error: 'Failed to update product' },
      { status: 500 }
    );
  }
});

// DELETE /api/products/[id] - Delete a product
export const DELETE = withAuth(async (req, { params }) => {
  try {
    await dbConnect();
    const { id } = params;
    const session = await getServerSession();
    
    // Get user
    const user = await User.findOne({ email: session?.user?.email });
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }
    
    // Get product
    const product = await Product.findById(id);
    if (!product) {
      return NextResponse.json(
        { success: false, error: 'Product not found' },
        { status: 404 }
      );
    }
    
    // Check ownership
    if (product.seller.toString() !== user._id.toString()) {
      return NextResponse.json(
        { success: false, error: 'Not authorized to delete this product' },
        { status: 403 }
      );
    }
    
    // Soft delete (change status to archived)
    product.status = 'archived';
    await product.save();
    
    return NextResponse.json({
      success: true,
      data: { message: 'Product archived successfully' }
    });
    
  } catch (error) {
    console.error('Error deleting product:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete product' },
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
      'Access-Control-Allow-Methods': 'GET, PATCH, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}
