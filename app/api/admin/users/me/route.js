import dbConnect from "@/lib/mongodb";
import { NextResponse } from "next/server";
import { requireAuth } from "@/middleware/requireAuth";

export async function GET(req) {
  try {
    await dbConnect();

    const auth = await requireAuth(req);
    if (!auth || !auth.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    return NextResponse.json({ user: auth.user });
    
  } catch (error) {
    console.error("Error fetching user:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
