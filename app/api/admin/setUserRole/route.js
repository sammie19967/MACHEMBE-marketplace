// app/api/admin/set-role/route.js
import { NextResponse } from "next/server";
import { setUserRole } from "@/lib/setUserRole";

export async function POST(req) {
  try {
    const { uid, role } = await req.json();

    if (!uid || !role) {
      return NextResponse.json({ error: "uid and role required" }, { status: 400 });
    }

    const result = await setUserRole(uid, role);
    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 500 });
    }

    return NextResponse.json({ message: `Role '${role}' set for user ${uid}` });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
