// app/api/admin/users/route.js
import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import { requireRole } from "@/middleware/requireRole";

export async function GET(req) {
  try {
    await dbConnect();

    // ✅ Only admins can access
    await requireRole(req, ["admin"]);

    const users = await User.find();
    return NextResponse.json(users, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 403 });
  }
}
