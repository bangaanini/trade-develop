// app/api/binance/top10/route.ts
import { NextResponse } from "next/server";

let cached: { ts: number; data: any[] } | null = null;
const CACHE_TTL = 10_000; // 10 detik

export async function GET() {
  try {
    // gunakan cache
    if (cached && Date.now() - cached.ts < CACHE_TTL) {
      return NextResponse.json({ source: "cache", data: cached.data });
    }

    const response = await fetch("https://api.binance.com/api/v3/ticker/24hr");
    if (!response.ok) {
      return NextResponse.json(
        { error: "Binance API error", status: response.status },
        { status: 502 }
      );
    }

    const all = await response.json();

    // Filter USDT pairs
    const filtered = all
      .filter((t: any) => t.symbol.endsWith("USDT"))
      .map((t: any) => ({
        symbol: t.symbol,
        priceChangePercent: t.priceChangePercent,
        lastPrice: t.lastPrice,
        volume: t.volume,
        highPrice: t.highPrice,
        lowPrice: t.lowPrice,
      }))
      .filter((t: any) => parseFloat(t.volume) > 0);

    filtered.sort(
      (a: any, b: any) => parseFloat(b.volume) - parseFloat(a.volume)
    );

    const top10 = filtered.slice(0, 10);

    cached = { ts: Date.now(), data: top10 };

    return NextResponse.json({ source: "binance", data: top10 });
  } catch (e: any) {
    return NextResponse.json(
      { error: e.message || "Server Error" },
      { status: 500 }
    );
  }
}

