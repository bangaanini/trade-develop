import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";

export async function GET(req: Request) {
  try {
    // Admin check optional depending on requirement, but safer to have
    const session = await getSession();
    if (!session || (session.role !== "admin" && session.role !== "superadmin")) {
       return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json({ error: "Missing userId" }, { status: 400 });
    }

    const { rows } = await db.query(
      `SELECT * FROM deposits WHERE user_id = $1 ORDER BY created_at DESC`,
      [userId]
    );

    return NextResponse.json({ data: rows });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
