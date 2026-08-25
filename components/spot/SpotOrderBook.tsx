"use client";

import { useEffect, useState, useRef } from "react";
import { useLanguage } from "@/context/LanguageContext";

interface OrderBookItem {
  price: string;
  qty: string;
  total?: string;
}

export default function SpotOrderBook({ symbol }: { symbol: string }) {
  const { t } = useLanguage();
  const [bids, setBids] = useState<OrderBookItem[]>([]);
  const [asks, setAsks] = useState<OrderBookItem[]>([]);
  const [error, setError] = useState<string>("");
  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    
    
    // Reset
    setBids([]);
    setAsks([]);
    setError("");

    // Clear any existing interval
    if (pollIntervalRef.current) {
      clearInterval(pollIntervalRef.current);
    }

    // Use PROXY API endpoint (bypasses mobile ISP blocks)
    const fetchData = async () => {
      try {
        const pair = `${symbol.toUpperCase()}USDT`;
        // CHANGED: Use proxy endpoint instead of direct Binance API
        const url = `/api/orderbook?symbol=${pair}&limit=15`;
        
        
        
        const res = await fetch(url);
        
        
        
        if (!res.ok) {
          throw new Error(`HTTP ${res.status}`);
        }

        const data = await res.json();
        
        if (data.error) {
          throw new Error(data.error);
        }
        
        

        const mapData = (list: any[]) =>
          (list || []).slice(0, 15).map((item: any[]) => ({
            price: Number(item[0]).toFixed(2),
            qty: Number(item[1]).toFixed(5),
            total: (Number(item[0]) * Number(item[1])).toFixed(2)
          }));

        const mappedBids = mapData(data.bids);
        const mappedAsks = mapData(data.asks).reverse();
        
        

        setBids(mappedBids);
        setAsks(mappedAsks);
        setError("");
        
      } catch (err: any) {
        const errorMsg = err.message || 'Unknown error';
        console.error('❌ Fetch error:', errorMsg);
        setError(errorMsg);
      }
    };

    // Initial fetch
    fetchData();

    // Poll every 3 seconds
    pollIntervalRef.current = setInterval(() => {
      fetchData();
    }, 3000);

    return () => {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
      }
    };
  }, [symbol]);

  return (
    <div className="flex flex-col h-full bg-card text-xs">
      {/* HEADER */}
      <div className="flex justify-between p-2 text-muted-foreground font-medium">
        <span>{t('trade.price')}(USDT)</span>
        <span>{t('trade.amount')}({symbol})</span>
        <span>{t('trade.total')}</span>
      </div>

      {/* Error State */}
      {error && (
        <div className="flex-1 flex items-center justify-center text-danger p-4 text-center">
          <div>
            <p className="text-sm font-semibold mb-1">{t('common.connection_error')}</p>
            <p className="text-xs">{error}</p>
          </div>
        </div>
      )}

      {/* Loading State */}
      {!error && bids.length === 0 && (
        <div className="flex-1 flex items-center justify-center text-muted-foreground">
          <div className="text-center">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto mb-2"></div>
            <p className="text-xs">{t('common.loading')}</p>
          </div>
        </div>
      )}

      {/* ASKS (SELL ORDERS) - RED */}
      <div className="flex-1 overflow-y-auto flex flex-col-reverse scrollbar-hide">
        {asks.map((ask, i) => (
          <div key={i} className="flex justify-between px-2 py-0.5 hover:bg-danger/10 relative">
            <span className="text-danger z-10">{ask.price}</span>
            <span className="text-foreground z-10">{ask.qty}</span>
            <span className="text-muted-foreground z-10">{ask.total}</span>
            <div className="absolute top-0 right-0 h-full bg-danger/10" style={{ width: `${Math.min(100, Number(ask.qty) * 20)}%` }} />
          </div>
        ))}
      </div>

      {/* SPREAD / CURRENT PRICE */}
      <div className="py-2 px-2 text-lg font-bold text-foreground border-y border-border text-center">
        {bids[0]?.price || "---"} <span className="text-xs font-normal text-muted-foreground">≈ ${bids[0]?.price}</span>
      </div>

      {/* BIDS (BUY ORDERS) - GREEN */}
      <div className="flex-1 overflow-y-auto scrollbar-hide">
        {bids.map((bid, i) => (
          <div key={i} className="flex justify-between px-2 py-0.5 hover:bg-success/10 relative">
            <span className="text-success z-10">{bid.price}</span>
            <span className="text-foreground z-10">{bid.qty}</span>
            <span className="text-muted-foreground z-10">{bid.total}</span>
            <div className="absolute top-0 right-0 h-full bg-success/10" style={{ width: `${Math.min(100, Number(bid.qty) * 20)}%` }} />
          </div>
        ))}
      </div>
    </div>
  );
}
