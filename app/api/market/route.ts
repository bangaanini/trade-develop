import { NextResponse } from "next/server";

const COINS = [
  { symbol: "BTC", name: "Bitcoin" },
  { symbol: "ETH", name: "Ethereum" },
  { symbol: "XRP", name: "XRP" },
  { symbol: "BNB", name: "BNB" },
  { symbol: "SOL", name: "Solana" },
  { symbol: "TRX", name: "TRON" },
  { symbol: "DOGE", name: "Dogecoin" },
  { symbol: "ADA", name: "Cardano" },
  { symbol: "LTC", name: "Litecoin" },
  { symbol: "TON", name: "Toncoin" },
  { symbol: "NEAR", name: "NEAR Protocol" },
  { symbol: "AVAX", name: "Avalanche" },
  { symbol: "DOT", name: "Polkadot" },
  { symbol: "MATIC", name: "Polygon" },
  { symbol: "LINK", name: "Chainlink" },
  { symbol: "UNI", name: "Uniswap" },
  { symbol: "ATOM", name: "Cosmos" },
  { symbol: "XLM", name: "Stellar" },
  { symbol: "FIL", name: "Filecoin" },
];

export async function GET() {
  try {
    const res = await fetch("https://api.binance.com/api/v3/ticker/24hr");
    const all = await res.json();

    const list = COINS.map((c) => {
      const pair = c.symbol + "USDT";
      const t = all.find((x: any) => x.symbol === pair);

      return {
        symbol: c.symbol,
        name: c.name,
        pair,
        price: t ? Number(t.lastPrice) : 0,
        change: t ? Number(t.priceChangePercent) : 0,
        volume: t ? Number(t.volume) : 0,
        high: t ? Number(t.highPrice) : 0,
        low: t ? Number(t.lowPrice) : 0,
      };
    });

    return NextResponse.json({ data: list });

  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
