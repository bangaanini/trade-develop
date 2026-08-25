"use client";

import { useEffect, useState, Suspense } from "react";
import SpotHeader from "@/components/spot/SpotHeader";
import SpotOrderBook from "@/components/spot/SpotOrderBook";
import SpotChart from "@/components/spot/SpotChart";
import SpotRecentTrades from "@/components/spot/SpotRecentTrades";
import SpotOrderForm from "@/components/spot/SpotOrderForm";
import SpotOrderHistory from "@/components/spot/SpotOrderHistory";
import BinanceChart from "@/components/BinanceChart";

import { useSearchParams } from "next/navigation";

function SpotContent() {
  const searchParams = useSearchParams();
  const defaultSymbol = searchParams.get("symbol") || "BTC";
  const [active, setActive] = useState(defaultSymbol);
  const [coins, setCoins] = useState<any[]>([]);

  // Load coins list for Header & selector
  useEffect(() => {
    async function load() {
       try {
         const r = await fetch("/api/market");
         const j = await r.json();
         if(j.data) setCoins(j.data);
       } catch (e) {
         console.error(e);
       }
    }
    load();
    // Optional: Refresh ticker data periodically
    const timer = setInterval(load, 10000); 
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="flex flex-col h-[calc(100vh-64px)] overflow-hidden lg:mt-15">
      {/* HEADER */}
      <SpotHeader active={active} setActive={setActive} coins={coins} />

      {/* MOBILE LAYOUT (Scrollable) */}
      <div className="lg:hidden flex flex-col flex-1 overflow-y-auto bg-background">
        {/* Chart Section */}
        

        {/* Order Form & Trades Section */}
        <div className="flex w-full h-[400px] shrink-0 border-b border-border">
            <div className="w-1/2 border-r border-border h-full">
               <SpotOrderForm symbol={active} />
            </div>
            <div className="w-1/2 h-full">
               <SpotOrderBook symbol={active} />
            </div>
        </div>

        {/* History Section */}
        <div className="w-full min-h-[300px] bg-card">
           <SpotOrderHistory />
        </div>
      </div>

      {/* DESKTOP LAYOUT (Fixed 3-col + Bottom) */}
      <div className="hidden lg:flex flex-col flex-1 overflow-hidden">
        {/* TOP ROW: OrderBook | Chart | Trades/Form */}
        <div className="flex flex-1 min-h-0">
           {/* LEFT: ORDER BOOK */}
           <div className="w-[300px] border-r border-border flex flex-col shrink-0">
              <SpotOrderBook symbol={active} />
           </div>

           {/* CENTER: CHART */}
           <div className="flex-1 flex flex-col border-r border-border min-h-0 bg-card">
             <div className="flex-1 min-h-0 relative">
                <BinanceChart symbol={active} />
             </div>
           </div>

           {/* RIGHT: TRADES & FORM */}
           <div className="w-[320px] flex flex-col bg-card shrink-0">
              <div className="h-[400px] border-t border-border">
                 <SpotOrderForm symbol={active} />
              </div>
           </div>
        </div>

        {/* BOTTOM ROW: HISTORY */}
        <div className="h-[80px] border-t border-border bg-card shrink-0">
           <SpotOrderHistory />
        </div>
      </div>
    </div>
  );
}

export default function SpotPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center h-screen bg-background text-white">Loading Spot Market...</div>}>
      <SpotContent />
    </Suspense>
  );
}
