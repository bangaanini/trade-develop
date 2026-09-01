import { NextResponse } from "next/server";

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const symbol = searchParams.get("symbol");
    const rawInterval = searchParams.get("interval");
    const limit = searchParams.get("limit") || "1000";

    if (!symbol || !rawInterval) {
      return NextResponse.json({ error: "Missing symbol or interval" }, { status: 400 });
    }

    // Binance REST API does not support "1s" interval for klines (minimum is "1m")
    // Map "1s" to "1m" for initial history load
    const interval = rawInterval === "1s" ? "1m" : rawInterval;

    const binanceUrl = `https://api.binance.com/api/v3/klines?symbol=${symbol}&interval=${interval}&limit=${limit}`;

    const res = await fetch(binanceUrl);

    if (!res.ok) {
        const errorText = await res.text();
        return NextResponse.json({ error: `Binance API Error: ${res.status}`, details: errorText }, { status: res.status });
    }

    const data = await res.json();
    return NextResponse.json(data);

  } catch (error: any) {
    console.error("Binance Proxy Error:", error);
    return NextResponse.json({ error: error.message || "Proxy Error" }, { status: 500 });
  }
}
