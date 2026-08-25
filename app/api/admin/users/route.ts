import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";

export async function GET(req: Request) {
  try {
    const session = await getSession();
    if (!session || (session.role !== "admin" && session.role !== "superadmin")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let query = `
      SELECT u.id, u.uid, u.email, u.role, u.created_at, COALESCE(uwr.win_rate, 0) as win_rate 
      FROM users u
      LEFT JOIN user_win_rates uwr ON u.id = uwr.user_id
    `;

    const values: any[] = [];
    
    // If not superadmin, hide other admins/superadmins
    if (session.role !== "superadmin") {
        query += ` WHERE u.role NOT IN ('admin', 'superadmin')`;
    }

    query += ` ORDER BY u.created_at DESC`;

    const { rows } = await db.query(query, values);

    return NextResponse.json({ data: rows });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
