"use client";

import { useEffect, useState } from "react";
import MarketItem from "@/components/MarketItem";
import MobileMarketTicker from "@/components/mobile/MobileMarketTicker";

export default function HomeMarketSection() {
  const [coins, setCoins] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    try {
      const r = await fetch("/api/market");
      const j = await r.json();
      setCoins(j.data);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    const id = setInterval(load, 8000);
    return () => clearInterval(id);
  }, []);

  return (
    <>
      {/* MOBILE MARKET TICKER */}
      <MobileMarketTicker data={coins} />

      {/* MARKET LIST (both desktop + mobile) */}
      <div className="py-8 px-4 md:px-6 bg-background">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-foreground">Market Overview</h2>
            {/* Optional: Add tabs here later */}
          </div>

          <div className="bg-card rounded-xl border border-border overflow-hidden shadow-sm">
             {/* Header Row */}
             <div className="grid grid-cols-3 px-4 py-3 border-b border-border bg-muted/30 text-xs font-semibold text-muted-foreground uppercase">
                <div>Name / Vol</div>
                <div className="text-right pr-4 md:pr-0 md:text-left md:pl-8">Price</div>
                <div className="text-right">24h Change</div>
             </div>

            {/* List */}
            {loading ? (
              <div className="p-8 text-center text-muted-foreground">
                Loading market data...
              </div>
            ) : (
              <div className="divide-y divide-border/50">
                {coins.map((coin) => (
                  <MarketItem key={coin.symbol} coin={coin} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
