// app/api/admin/users/route.js
import { NextResponse } from "next/server";
import { withAdminAuth } from "@/middleware/adminAuth";
import User from "@/models/User";
import dbConnect from "@/lib/mongodb";

/**
 * List all users with pagination
 * GET /api/admin/users?page=1&limit=10
 * Query params: page, limit, search, role, status
 * Returns: { users: [...], total: number, page: number, totalPages: number }
 */
const getUsers = async (req) => {
  try {
    await dbConnect();
    
    // Pagination
    const url = new URL(req.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '10');
    const skip = (page - 1) * limit;

    // Build query
    const query = {};
    
    // Filter by role
    if (url.searchParams.has('role')) {
      query.role = url.searchParams.get('role');
    }
    
    // Filter by status
    if (url.searchParams.has('status')) {
      query.status = url.searchParams.get('status');
    }
    
    // Search by name or email
    if (url.searchParams.has('search')) {
      const search = url.searchParams.get('search');
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } }
      ];
    }

    const [users, total] = await Promise.all([
      User.find(query)
        .select('-__v -createdAt -updatedAt')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      User.countDocuments(query)
    ]);

    return NextResponse.json({
      users,
      total,
      page,
      totalPages: Math.ceil(total / limit)
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json(
      { error: 'Failed to fetch users' },
      { status: 500 }
    );
  }
};

/**
 * Create a new user
 * POST /api/admin/users
 * Body: { email, name, role, ...otherUserFields }
 * Returns: The created user
 */
const createUser = async (req) => {
  try {
    await dbConnect();
    
    const body = await req.json();
    
    // Basic validation
    if (!body.email || !body.name) {
      return NextResponse.json(
        { error: 'Email and name are required' },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email: body.email });
    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 409 }
      );
    }

    // Create new user
    const user = new User({
      email: body.email,
      name: body.name,
      role: body.role || 'user',
      status: 'active',
      ...body
    });

    await user.save();

    // Remove sensitive data before sending response
    const userObj = user.toObject();
    delete userObj.__v;
    
    return NextResponse.json(userObj, { status: 201 });
  } catch (error) {
    console.error('Error creating user:', error);
    return NextResponse.json(
      { error: 'Failed to create user' },
      { status: 500 }
    );
  }
};

// Export route handlers with admin auth middleware
export const GET = withAdminAuth(getUsers);
export const POST = withAdminAuth(createUser);
