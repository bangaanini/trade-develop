import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  try {
    // Get option settings
    const { rows: settingsRows } = await db.query(
      `SELECT * FROM option_settings LIMIT 1`
    );
    const settings = settingsRows[0];

    // Get active durations with payout_percent and min_amount
    const { rows: durations } = await db.query(
      `SELECT id, seconds, is_active, payout_percent, min_amount 
       FROM option_durations 
       WHERE is_active = true 
       ORDER BY seconds`
    );

    // Get active pairs only
    const { rows: pairs } = await db.query(
      `SELECT * FROM option_pairs 
       WHERE is_active = true 
       ORDER BY symbol`
    );

    return NextResponse.json({
      success: true,
      settings,
      durations: durations || [],
      pairs: pairs || [],
    });
  } catch (err: any) {
    console.error("OPTION SETTINGS ERROR:", err);
    return NextResponse.json(
      { error: "Failed to load settings" },
      { status: 500 }
    );
  }
}
