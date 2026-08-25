
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const session = await getSession();
    if (!session || (session.role !== "admin" && session.role !== "superadmin")) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const query = `
      SELECT 
        l.id,
        l.admin_id,
        au.email as admin_email,
        l.action,
        l.details,
        l.created_at
      FROM admin_logs l
      LEFT JOIN users au ON l.admin_id = au.id
      WHERE l.action = 'CHANGE_WINRATE'
      ORDER BY l.created_at DESC
      LIMIT 100
    `;

    const { rows } = await db.query(query);

    return NextResponse.json({ data: rows });
  } catch (e: any) {
    console.error("Fetch winrate logs error:", e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
