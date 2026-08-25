import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";

export async function GET(req: Request) {
  try {
    const user = await getSession();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status"); // "open" or "history"

    let query = `SELECT * FROM spot_orders WHERE user_id = $1`;
    let params: any[] = [user.id];

    if (status === "open") {
      query += ` AND status IN ('open', 'settling')`;
    } else if (status === "history") {
      query += ` AND status IN ('filled', 'cancelled')`;
    }

    query += ` ORDER BY created_at DESC`;

    const { rows } = await db.query(query, params);

    return NextResponse.json({ success: true, data: rows });

  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
