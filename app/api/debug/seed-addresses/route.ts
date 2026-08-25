import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  try {
    await db.query(`
      CREATE TABLE IF NOT EXISTS wallet_addresses (
        id UUID PRIMARY KEY,
        user_id UUID NOT NULL REFERENCES users(id),
        network VARCHAR(50) NOT NULL,
        address VARCHAR(255) NOT NULL,
        label VARCHAR(100),
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW(),
        UNIQUE(user_id, network) 
      );
    `);
    
    // Check if created
    const { rows } = await db.query("SELECT * FROM information_schema.tables WHERE table_name = 'wallet_addresses'");

    return NextResponse.json({ success: true, table: rows });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
