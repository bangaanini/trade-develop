import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import crypto from "crypto";

export async function GET() {
  try {
    // 1. Create option_settings
    await db.query(`
      CREATE TABLE IF NOT EXISTS option_settings (
        id UUID PRIMARY KEY,
        min_amount DECIMAL DEFAULT 10,
        max_amount DECIMAL DEFAULT 1000,
        is_enabled BOOLEAN DEFAULT true,
        profit_percent DECIMAL DEFAULT 80,
        payout_percent DECIMAL DEFAULT 80
      );
    `);

    // 2. Create option_durations
    await db.query(`
      CREATE TABLE IF NOT EXISTS option_durations (
        id UUID PRIMARY KEY,
        seconds INTEGER NOT NULL,
        is_active BOOLEAN DEFAULT true,
        payout_percent DECIMAL DEFAULT 80
      );
    `);

    // 3. Create option_pairs
    await db.query(`
      CREATE TABLE IF NOT EXISTS option_pairs (
        id UUID PRIMARY KEY,
        symbol VARCHAR(20) NOT NULL,
        is_active BOOLEAN DEFAULT false
      );
    `);

    // Seed Settings
    const { rows: check } = await db.query("SELECT * FROM option_settings LIMIT 1");
    if (check.length === 0) {
      const id = crypto.randomUUID();
      await db.query(
        `INSERT INTO option_settings (id, min_amount, max_amount, is_enabled)
         VALUES ($1, 10, 1000, true)`,
        [id]
      );
    }
    
    // Seed Durations (Example)
    const { rows: dCheck } = await db.query("SELECT * FROM option_durations LIMIT 1");
    if (dCheck.length === 0) {
        const durations = [30, 60, 180, 300];
        for (const sec of durations) {
            await db.query(
                `INSERT INTO option_durations (id, seconds, is_active, payout_percent) VALUES ($1, $2, true, 80)`,
                [crypto.randomUUID(), sec]
            );
        }
    }

    return NextResponse.json({ message: "Tables created and seeded" });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
