import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";
import crypto from "crypto";

export async function GET() {
  try {
    const session = await getSession();
    if (!session || (session.role !== "admin" && session.role !== "superadmin")) {
         return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { rows: settingsRows } = await db.query(`SELECT * FROM option_settings LIMIT 1`);
    const settings = settingsRows[0];

    const { rows: durations } = await db.query(
      `SELECT id, seconds, is_active, payout_percent, min_amount FROM option_durations ORDER BY seconds`
    );
    const { rows: pairs } = await db.query(
      `SELECT * FROM option_pairs ORDER BY symbol`
    );

    return NextResponse.json({
      settings,
      durations,
      pairs,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session || (session.role !== "admin" && session.role !== "superadmin")) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    
    // Check if it's the old single-update format or new bulk format
    // Bulk format has keys: settings, durations, pairs
    if (body.settings || body.durations || body.pairs) {
        // BULK UPDATE
        const { settings, durations, pairs } = body;

        // 1. Update Settings
        if (settings && settings.id) {
            await db.query(
                `UPDATE option_settings 
                 SET min_amount = $1, max_amount = $2, is_enabled = $3
                 WHERE id = $4`,
                [settings.min_amount, settings.max_amount, settings.is_enabled, settings.id]
            );
        }

        // 2. Update/Insert Durations
        if (durations && Array.isArray(durations)) {
            for (const d of durations) {
                if (d.id.startsWith("temp-")) {
                    // New duration, insert it
                    const newId = crypto.randomUUID();
                    await db.query(
                        `INSERT INTO option_durations (id, seconds, is_active, payout_percent, min_amount) 
                         VALUES ($1, $2, $3, $4, $5)`,
                        [newId, d.seconds, d.is_active, d.payout_percent, d.min_amount || 10]
                    );
                } else {
                    // Existing duration, update
                    await db.query(
                        `UPDATE option_durations 
                         SET is_active = $1, payout_percent = $2, min_amount = $3 
                         WHERE id = $4`,
                        [d.is_active, d.payout_percent, d.min_amount || 10, d.id]
                    );
                }
            }
        }

        // 3. Update/Insert Pairs
        if (pairs && Array.isArray(pairs)) {
            for (const p of pairs) {
                if (p.id.startsWith("temp-")) {
                    // New pair, insert it
                    const newId = crypto.randomUUID();
                    // Check if symbol exists first to avoid duplicates if no unique constraint
                    const { rows: exists } = await db.query("SELECT id FROM option_pairs WHERE symbol = $1", [p.symbol]);
                    
                    if (exists.length === 0) {
                        await db.query(
                            `INSERT INTO option_pairs (id, symbol, is_active) 
                             VALUES ($1, $2, $3)`,
                            [newId, p.symbol, p.is_active]
                        );
                    } else {
                        // Update existing using found ID
                         await db.query(
                            `UPDATE option_pairs SET is_active = $1 WHERE id = $2`,
                            [p.is_active, exists[0].id]
                        );
                    }
                } else {
                    // Existing pair, update
                    await db.query(
                        `UPDATE option_pairs SET is_active = $1 WHERE id = $2`,
                        [p.is_active, p.id]
                    );
                }
            }
        }

        return NextResponse.json({ success: true });
    } 
    
    // FALLBACK: Handle individual updates if still used by other components
    const { type, data } = body;

    if (type === "settings") {
      await db.query(
        `UPDATE option_settings 
         SET profit_percent = $1, min_amount = $2, max_amount = $3, is_enabled = $4, payout_percent = $5
         WHERE id = $6`,
        [data.profit_percent, data.min_amount, data.max_amount, data.is_enabled, data.payout_percent, data.id]
      );
    } else if (type === "duration_toggle") {
        await db.query(
            `UPDATE option_durations SET is_active = $1 WHERE id = $2`,
            [data.is_active, data.id]
        );
    } else if (type === "duration_payout") {
        await db.query(
            `UPDATE option_durations SET payout_percent = $1 WHERE id = $2`,
            [data.payout_percent, data.id]
        );
    } else if (type === "pair_toggle") {
        await db.query(
            `UPDATE option_pairs SET is_active = $1 WHERE id = $2`,
            [data.is_active, data.id]
        );
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("Option Settings Save Error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
