import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  try {
    // Drop existing table
    await db.query(`DROP TABLE IF EXISTS spot_orders`);

    // Recreate with UUID id
    await db.query(`
      CREATE TABLE spot_orders (
        id UUID PRIMARY KEY,
        user_id UUID NOT NULL REFERENCES users(id),
        symbol VARCHAR(20) NOT NULL,
        side VARCHAR(10) NOT NULL, -- buy/sell
        type VARCHAR(10) NOT NULL, -- limit/market
        price DECIMAL NOT NULL,
        amount DECIMAL NOT NULL,
        filled_amount DECIMAL DEFAULT 0,
        status VARCHAR(20) DEFAULT 'open', -- open, filled, cancelled
        created_at TIMESTAMPTZ DEFAULT now()
      );
    `);

    return NextResponse.json({ message: "spot_orders table recreated with UUID" });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
