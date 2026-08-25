import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const { rows } = await db.query(
      `SELECT id, coin, network, address, qr_code_url 
       FROM deposit_methods 
       WHERE is_active = true 
       ORDER BY coin`
    );

    return NextResponse.json({ data: rows });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
