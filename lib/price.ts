import { db } from "@/lib/db";

export async function getPrice(symbol: string): Promise<number> {
  let cachePrice: number | undefined;

  try {
    const { rows } = await db.query(
      `SELECT price FROM price_cache WHERE symbol = $1`,
      [symbol.toUpperCase()]
    );

    if (rows[0]?.price) {
      cachePrice = Number(rows[0].price);
    }
  } catch (err) {
    // Ignore cache error, proceed to fallback
    console.error(`[Price] Cache error for ${symbol}:`, err);
  }

  if (cachePrice) return cachePrice;

  // FALLBACK: Binance REST
  try {
    const res = await fetch(
      `https://api.binance.com/api/v3/ticker/price?symbol=${symbol.toUpperCase()}USDT`,
      { next: { revalidate: 0 } } // Ensure no Next.js caching
    );
    
    if (!res.ok) throw new Error(res.statusText);
    
    const json = await res.json();
    return Number(json.price);
  } catch (err) {
    console.error(`[Price] REST error for ${symbol}:`, err);
    throw err; // Re-throw if both fail
  }
}
