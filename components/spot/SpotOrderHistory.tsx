"use client";

import { useState, useEffect } from "react";
import { useLanguage } from "@/context/LanguageContext";

export default function SpotOrderHistory() {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState<"open" | "history">("open");
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  async function fetchOrders() {
    try {
      setLoading(true);
      const res = await fetch(`/api/spot/all?status=${activeTab}`);
      if (!res.ok) {
        // Handle 401 unauthorized
        return;
      }
      const json = await res.json();
      if (json.success) {
        setOrders(json.data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchOrders();
    
    // Listen to new orders
    const handleRefresh = () => fetchOrders();
    window.addEventListener("spot-order-created", handleRefresh);
    
    // Auto refresh every 5s
    const interval = setInterval(fetchOrders, 5000);

    return () => {
      window.removeEventListener("spot-order-created", handleRefresh);
      clearInterval(interval);
    };
  }, [activeTab]);

  return (
    <div className="flex flex-col h-full bg-card text-xs md:text-sm">
      {/* TABS */}
      <div className="flex border-b border-border justify-between items-center pr-2">
        <div className="flex">
        <button
          onClick={() => setActiveTab("open")}
          className={`px-4 py-2 font-medium border-b-2 transition-colors ${
            activeTab === "open" 
              ? "border-primary text-primary" 
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          {t('trade.open_orders')}
        </button>
        <button
          onClick={() => setActiveTab("history")}
          className={`px-4 py-2 font-medium border-b-2 transition-colors ${
            activeTab === "history" 
              ? "border-primary text-primary" 
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          {t('trade.order_history')}
        </button>
      </div>
        <button 
           onClick={fetchOrders} 
           disabled={loading}
           className="text-muted-foreground hover:text-primary p-1 rounded hover:bg-muted"
           title="Refresh"
        >
           <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={`w-4 h-4 ${loading ? "animate-spin" : ""}`}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99" />
           </svg>
        </button>
      </div>

      {/* HEADER */}
      <div className="grid grid-cols-7 p-2 text-muted-foreground font-medium border-b border-border">
        <span className="col-span-1">{t('trade.time')}</span>
        <span className="col-span-1">{t('trade.pair')}</span>
        <span className="col-span-1">{t('trade.type')}</span>
        <span className="col-span-1">{t('trade.side')}</span>
        <span className="col-span-1">{t('trade.price')}</span>
        <span className="col-span-1 text-right">{t('trade.amount')}</span>
        <span className="col-span-1 text-right">{t('trade.action')}</span>
      </div>

      {/* CONTENT */}
      <div className="flex-1 overflow-auto">
        {loading && orders.length === 0 ? (
           <div className="text-center py-4 text-muted-foreground">{t('common.loading')}</div>
        ) : orders.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-40 text-muted-foreground gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 opacity-50">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
            </svg>
            <span>{t('trade.no_orders')}</span>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {orders.map((o) => (
              <div key={o.id} className="grid grid-cols-7 p-2 hover:bg-muted/50 items-center">
                <span className="col-span-1 text-muted-foreground text-[10px] md:text-xs">
                  {new Date(o.created_at).toLocaleString()}
                </span>
                <span className="col-span-1 font-bold">{o.symbol}</span>
                <span className="col-span-1 text-muted-foreground capitalize">{o.type}</span>
                <span className={`col-span-1 font-bold capitalize ${o.side === 'buy' ? 'text-success' : 'text-danger'}`}>
                  {o.side}
                </span>
                <span className="col-span-1">{Number(o.price).toFixed(2)}</span>
                <div className="col-span-1 text-right">
                  <div>{o.amount}</div>
                  <div className="text-[10px] text-muted-foreground">
                    {((Number(o.filled_amount || 0) / Number(o.amount || 1)) * 100).toFixed(0)}% {t('trade.fill')}
                  </div>
                </div>
                <div className="col-span-1 text-right">
                    {activeTab === 'open' && (
                        <button 
                            onClick={async () => {
                                if(!confirm("Cancel this order?")) return;
                                await fetch("/api/spot/cancel", {
                                    method: "POST",
                                    body: JSON.stringify({ orderId: o.id })
                                });
                                fetchOrders();
                            }}
                            className="text-xs bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white px-2 py-1 rounded transition-colors"
                        >
                            {t('trade.cancel')}
                        </button>
                    )}
                    {activeTab === 'history' && (
                        <span className={`text-xs px-2 py-1 rounded ${
                            o.status === 'filled' ? 'bg-green-500/10 text-green-500' : 
                            o.status === 'cancelled' ? 'bg-red-500/10 text-red-500' : 'text-muted-foreground'
                        }`}>
                            {o.status}
                        </span>
                    )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
