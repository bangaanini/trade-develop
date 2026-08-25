import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session || (session.role !== "admin" && session.role !== "superadmin")) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { userId, winRate } = await req.json();

    if (!userId || typeof winRate !== "number") {
        return NextResponse.json({ error: "Invalid data" }, { status: 400 });
    }

    if (winRate < 0 || winRate > 100) {
        return NextResponse.json({ error: "Win rate must be between 0 and 100" }, { status: 400 });
    }

    // Get current win rate to log the change properly (optional, but good for history)
    const { rows: currentRows } = await db.query(`SELECT win_rate, email FROM user_win_rates LEFT JOIN users ON users.id = user_win_rates.user_id WHERE user_win_rates.user_id = $1`, [userId]);
    const oldWinRate = currentRows[0]?.win_rate || 0;
    
    // We also need the user email for better logging, let's fetch it if not present
    // Actually, let's just log the IDs and fetching details on read if needed, or fetch email now.
    // Let's fetch the user email to log meaningful details
    const { rows: userRows } = await db.query(`SELECT email FROM users WHERE id = $1`, [userId]);
    const userEmail = userRows[0]?.email || userId;

    await db.query(`BEGIN`);

    await db.query(
        `INSERT INTO user_win_rates (user_id, win_rate, updated_at)
         VALUES ($1, $2, now())
         ON CONFLICT (user_id) 
         DO UPDATE SET win_rate = $2, updated_at = now()`,
        [userId, winRate]
    );

    await db.query(
        `INSERT INTO admin_logs (id, admin_id, action, details, created_at)
         VALUES (gen_random_uuid(), $1, 'CHANGE_WINRATE', $2, now())`,
        [session.id, JSON.stringify({ target_user: userEmail, target_user_id: userId, old_win_rate: oldWinRate, new_win_rate: winRate })]
    );

    await db.query(`COMMIT`);

    return NextResponse.json({ success: true });
  } catch (e: any) {
    console.error("Update winrate error:", e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
