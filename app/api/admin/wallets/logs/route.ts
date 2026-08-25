import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";

export async function GET(req: Request) {
  try {
    const session = await getSession();
    // Allow users to see their own logs, or admin to see all (with userId param)
    if (!session) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");

    // If param is present, enforce admin if it's not self
    if (userId && userId !== session.id) {
        if (session.role !== "admin" && session.role !== "superadmin") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
        }
    }

    // Determine target user
    const targetUserId = userId || session.id;

    // CONFIRMED: Table is wallet_logs
    const { rows } = await db.query(
        `SELECT * FROM wallet_logs WHERE user_id = $1 ORDER BY created_at DESC LIMIT 200`,
        [targetUserId]
    );

    return NextResponse.json({ data: rows });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
