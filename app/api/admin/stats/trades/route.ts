
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const session = await getSession();
    if (!session || (session.role !== "admin" && session.role !== "superadmin")) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Count trades that are 'active' (open or settling)
    // status 'open' or 'settling' usually implies active. 
    // Based on OptionHistory, validStatus for open are ["open", "settling"].
    
    const query = `
      SELECT count(*) as count
      FROM options
      WHERE status = ANY(ARRAY['open', 'settling'])
    `;

    const { rows } = await db.query(query);
    const count = parseInt(rows[0].count);

    return NextResponse.json({ count });
  } catch (e: any) {
    console.error("Fetch active trades count error:", e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
