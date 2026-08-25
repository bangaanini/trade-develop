"use client";

import { useEffect, useState, useRef } from "react";
import { useLanguage } from "@/context/LanguageContext";

interface Trade {
  id: number;
  price: string;
  qty: string;
  time: number;
  isBuyerMaker: boolean; // true = sell, false = buy
}

export default function SpotRecentTrades({ symbol }: { symbol: string }) {
  const { t } = useLanguage();
  const [trades, setTrades] = useState<Trade[]>([]);
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    // Reset trades when symbol changes
    setTrades([]);

    const ws = new WebSocket(`wss://stream.binance.com:9443/ws/${symbol.toLowerCase()}usdt@aggTrade`);
    wsRef.current = ws;

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      // Data format: { e: 'aggTrade', p: 'price', q: 'qty', T: timestamp, m: isBuyerMaker }
      const newTrade: Trade = {
        id: data.a,
        price: Number(data.p).toFixed(2),
        qty: Number(data.q).toFixed(5), // Adjust precision based on typical volume
        time: data.T,
        isBuyerMaker: data.m,
      };

      setTrades((prev) => {
        // Prevent duplicates
        if (prev.some(t => t.id === newTrade.id)) return prev;
        
        const updated = [newTrade, ...prev];
        if (updated.length > 50) return updated.slice(0, 50); // Keep last 50
        return updated;
      });
    };

    return () => {
      if (ws.readyState === 1) ws.close();
    };
  }, [symbol]);

  return (
    <div className="flex flex-col h-full bg-card text-xs">
      <div className="flex justify-between items-center p-2 text-muted-foreground font-medium border-b border-border">
        <span>{t('trade.price')}(USDT)</span>
        <span>{t('trade.amount')}({symbol})</span>
        <span>{t('trade.time')}</span>
      </div>
      <div className="overflow-y-auto flex-1 scrollbar-hide">
        {trades.map((t) => (
          <div key={t.id} className="flex justify-between items-center px-2 py-0.5 hover:bg-muted/50">
            <span className={`font-medium ${!t.isBuyerMaker ? "text-success" : "text-danger"}`}>
              {t.price}
            </span>
            <span className="text-foreground">{t.qty}</span>
            <span className="text-muted-foreground">
              {new Date(t.time).toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
