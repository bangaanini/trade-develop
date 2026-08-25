import { NextResponse } from "next/server";
import { db } from "@/lib/db";

const COINS = ["BTC", "ETH", "XRP", "BNB", "SOL", "TRX", "DOGE", "ADA", "LTC"];

export async function GET() {
  try {
    const { rows: prices } = await db.query(
      `SELECT symbol, price FROM price_cache WHERE symbol = ANY($1)`,
      [COINS]
    );

    const result = COINS.map(symbol => {
      const row = prices.find((p: any) => p.symbol === symbol);

      return {
        symbol,
        pair: symbol + "USDT",
        price: row ? Number(row.price) : null,
        priceChangePercent: null,
        volume: null,
        high: null,
        low: null,
      };
    });

    return NextResponse.json({ data: result });

  } catch (err: any) {
    return NextResponse.json(
      { error: err.message },
      { status: 500 }
    );
  }
}
