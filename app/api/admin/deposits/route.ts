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
      SELECT d.*, u.email 
      FROM deposits d
      LEFT JOIN users u ON d.user_id = u.id
    `;
    const params: any[] = [];

    if (status && status !== "all") {
      query += ` WHERE d.status = $1`;
      params.push(status);
    }

    query += ` ORDER BY d.created_at DESC`;

    const { rows } = await db.query(query, params);

    return NextResponse.json({ data: rows });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
