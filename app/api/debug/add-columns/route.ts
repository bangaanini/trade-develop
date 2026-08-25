import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  try {
    await db.query(`
      ALTER TABLE users ADD COLUMN IF NOT EXISTS wallet_address_trc20 VARCHAR(255);
      ALTER TABLE users ADD COLUMN IF NOT EXISTS wallet_address_erc20 VARCHAR(255);
    `);
    return NextResponse.json({ success: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
