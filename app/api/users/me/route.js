import dbConnect from "@/lib/mongodb";
import { NextResponse } from "next/server";
import { requireAuth } from "@/middleware/requireAuth";

export async function GET(req) {
  try {
    await dbConnect();

    const auth = await requireAuth(req);
    if (!auth?.user) {
      return NextResponse.json(
        { error: "Authentication required" }, 
        { status: 401 }
      );
    }

    return NextResponse.json({ 
      user: auth.user,
      success: true 
    });
    
  } catch (error) {
    console.error("Error fetching user:", error);
    return NextResponse.json(
      { 
        error: process.env.NODE_ENV === 'development' ? error.message : "Internal Server Error",
        success: false 
      }, 
      { status: 500 }
    );
  }
}
