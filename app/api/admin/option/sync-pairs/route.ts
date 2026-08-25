import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";

export async function POST() {
  try {
    const session = await getSession();
    if (!session || (session.role !== "admin" && session.role !== "superadmin")) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const res = await fetch("https://api.binance.com/api/v3/ticker/price");
    if (!res.ok) throw new Error("Binance API error");

    const data = await res.json();
    const usdtPairs = data.filter((d: any) => d.symbol.endsWith("USDT"));

    for (const p of usdtPairs) {
      await db.query(
        `INSERT INTO option_pairs (symbol, is_active) 
         VALUES ($1, false) 
         ON CONFLICT (symbol) DO NOTHING`,
        [p.symbol.replace("USDT", "")]
      );
    }

    return NextResponse.json({ success: true, count: usdtPairs.length });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
