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
    const status = searchParams.get("status");

    const validStatus =
      status === "open"
        ? ["open", "settling"]
        : ["win", "lose"];

    const res = await db.query(
      `SELECT * FROM options
       WHERE user_id = $1
       AND status = ANY($2)
       ORDER BY created_at DESC`,
      [user.id, validStatus]
    );

    return NextResponse.json({ data: res.rows });

  } catch (err) {
    console.error("OPTION ORDERS ERROR:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
