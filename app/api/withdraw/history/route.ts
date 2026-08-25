import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get("userId");

  if (!userId) {
    return NextResponse.json({ error: "Missing userId" }, { status: 400 });
  }

  try {
    const { rows } = await db.query(
      `SELECT id, coin, network, amount, address, txid, status, created_at 
       FROM withdraws 
       WHERE user_id = $1 
       ORDER BY created_at DESC`,
      [userId]
    );

    return NextResponse.json({ data: rows });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
