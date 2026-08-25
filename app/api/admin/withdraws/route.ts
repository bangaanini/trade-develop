import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";

export async function GET(req: Request) {
  try {
    const session = await getSession();
    if (!session || (session.role !== "admin" && session.role !== "superadmin")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");

    let query = `
      SELECT 
        w.id, 
        w.user_id, 
        w.coin, 
        w.network, 
        w.amount, 
        w.address, 
        w.status, 
        w.txid, 
        w.created_at,
        u.email 
      FROM withdraws w
      LEFT JOIN users u ON w.user_id = u.id
    `;
    const params: any[] = [];

    if (status && status !== "all") {
      query += ` WHERE w.status = $1`;
      params.push(status);
    }

    query += ` ORDER BY w.created_at DESC`;

    const { rows } = await db.query(query, params);

    return NextResponse.json({ data: rows });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
