// app/api/admin/users/route.js
import { NextResponse } from "next/server";
import { requireRole } from "@/middleware/requireRole";
import User from "@/models/User";
import dbConnect from "@/lib/mongodb";

export async function GET(req) {
  const auth = await requireRole(req, ["admin"]);
  if (!auth.authorized) {
    return NextResponse.json({ error: auth.error }, { status: 403 });
  }

  await dbConnect();
  const users = await User.find();
  return NextResponse.json(users);
}
