import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  try {
    await db.query(`
      CREATE TABLE IF NOT EXISTS swaps (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL,
        from_coin VARCHAR(20) NOT NULL,
        to_coin VARCHAR(20) NOT NULL,
        amount_in DECIMAL(20, 8) NOT NULL,
        amount_out DECIMAL(20, 8) NOT NULL,
        fee DECIMAL(20, 8) NOT NULL,
        rate DECIMAL(20, 8) NOT NULL,
        created_at TIMESTAMPTZ DEFAULT now()
      );
    `);
    return NextResponse.json({ message: "Swaps table created" });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
