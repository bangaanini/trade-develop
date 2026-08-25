
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

    // Fetch trades from 'options' table as confirmed by OptionHistory component
    const query = `
      SELECT 
        o.id,
        o.user_id,
        u.email,
        o.amount,
        o.profit,
        o.status,
        o.duration,
        o.created_at,
        o.expires_at,
        o.symbol
      FROM options o
      JOIN users u ON o.user_id = u.id
      ORDER BY o.created_at DESC
      LIMIT 500
    `;

    const { rows } = await db.query(query);

    return NextResponse.json({ data: rows });
  } catch (e: any) {
    console.error("Fetch trades error:", e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
