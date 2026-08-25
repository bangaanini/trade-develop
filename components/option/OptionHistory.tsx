"use client";

import { useEffect, useState, useRef } from "react";
// Removed Supabase Client import
import playSound from "@/lib/sounds";
import OptionResultModal from "./OptionResultModal";
import { useLanguage } from "@/context/LanguageContext";

export default function OptionHistory({ 
  currentPrice, 
  enableNotifications = true,
  className = "mt-6"
}: { 
  currentPrice: number;
  enableNotifications?: boolean;
  className?: string; 
}) {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState<"open" | "closed">("open");
  const [openOrders, setOpenOrders] = useState<any[]>([]);
  const [closedOrders, setClosedOrders] = useState<any[]>([]);
  const [userId, setUserId] = useState<string | null>(null);
  const [now, setNow] = useState(Date.now());
  const [profitPercent, setProfitPercent] = useState(0.8);
  // Result modal state
const [showResultModal, setShowResultModal] = useState(false);
const [selectedOrder, setSelectedOrder] = useState<any>(null);

  const prevClosedRef = useRef<Record<string, boolean>>({});
  const isFirstLoad = useRef(true); 

  async function loadSettings() {
    try {
      const res = await fetch("/api/option/settings");
      const json = await res.json();
      if (json.success && json.settings) {
        setProfitPercent(json.settings.payout_percent / 100);
      }
    } catch (err) {
      console.error("Failed to load settings:", err);
    }
  }

  async function loadUser() {
    try {
        const res = await fetch("/api/auth/me");
        if (res.ok) {
            const data = await res.json();
            if (data.user) setUserId(data.user.id);
        }
    } catch (e) {
        console.error(e);
    }
  }

  function showToast(type: "win" | "lose", amount: number) {
    if (!enableNotifications) return; 

    const toast = document.createElement("div");

    toast.className = `
      fixed top-6 right-6 z-[60] px-6 py-3 rounded-lg shadow-lg
      text-white font-semibold
      transition-all duration-500
      ${type === "win" ? "bg-green-500" : "bg-red-500"}
    `;

    toast.innerText =
      type === "win"
        ? `WIN +${amount.toFixed(2)} USDT`
        : `LOSE -${amount.toFixed(2)} USDT`;

    document.body.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = "0";
      toast.style.transform = "translateY(-10px)";
    }, 2500);

    setTimeout(() => {
      document.body.removeChild(toast);
    }, 3000);
  }
  
  async function loadOpenOrders() {
    try {
        const res = await fetch("/api/option/orders?status=open");
        if (!res.ok) return;
        const json = await res.json();
        setOpenOrders(json.data || []);
    } catch (e) {
        // quiet
    }
  }

  async function loadClosedOrders() {
    try {
        const res = await fetch("/api/option/orders?status=closed");
        if (!res.ok) return;
        const json = await res.json();
        setClosedOrders(json.data || []);
    } catch (e) {
        // quiet
    }
  }

  useEffect(() => {
    loadSettings();
    loadUser();
    
    // Initial Load delayed slightly to allow user load
    // But loadUser is async. So separate effect depending on userId might be better.
  }, []);

  useEffect(() => {
      if (!userId) return;

      loadOpenOrders();
      loadClosedOrders();

      // Timer untuk countdown - update setiap 1 detik untuk UX smooth
      const timer = setInterval(() => setNow(Date.now()), 1000);

      // Polling API - setiap 5 detik untuk hemat resource VPS
      const poll = setInterval(() => {
        loadOpenOrders();
        loadClosedOrders();
      }, 5000); // 5 detik - reduced from 1s to prevent VPS suspension

      const handler = () => loadOpenOrders();
      window.addEventListener("option-created", handler);

      return () => {
        clearInterval(timer);
        clearInterval(poll);
        window.removeEventListener("option-created", handler);
      };
  }, [userId]);

  useEffect(() => {
    if (!userId) return;

    if (isFirstLoad.current) {
      if (closedOrders.length > 0) {
        closedOrders.forEach(o => {
          prevClosedRef.current[o.id] = true;
        });
        isFirstLoad.current = false;
      }
      return;
    }
closedOrders.forEach((o) => {
  if (!prevClosedRef.current[o.id]) {
    // 🔥 Order BARU selesai
    const payoutPercent = Number(o.payout_percent) || 85;
    const profitAmount = o.status === "win"
      ? Number(o.amount) * (payoutPercent / 100)
      : Number(o.amount);

    showToast(
      o.status,
      profitAmount
    );
    prevClosedRef.current[o.id] = true;
  }
});
  }, [closedOrders, userId]);


  return (
    <div className={`bg-card p-4 rounded-lg text-foreground ${className}`}>
      <div className="flex gap-8 border-b border-border pb-2 mb-4">
        <span 
          className={`cursor-pointer ${activeTab === "open" ? "text-primary font-bold" : "text-muted-foreground hover:text-foreground"}`}
          onClick={() => setActiveTab("open")}
        >
          In transaction
        </span>
        <span 
          className={`cursor-pointer ${activeTab === "closed" ? "text-primary font-bold" : "text-muted-foreground hover:text-foreground"}`}
          onClick={() => setActiveTab("closed")}
        >
          Close position
        </span>
      </div>

      <div className="min-h-[200px]">
        {activeTab === "open" ? (
          /* 🔥 Tab Open Orders */
          openOrders.length === 0 ? (
            <div className="text-center text-muted-foreground py-10">{t('option.no_open_positions')}</div>
          ) : (
            <div className="flex flex-col gap-2">
              {openOrders.map((o) => {
                const isWinNow =
                  ((o.direction === "up" || o.direction === "buy") && currentPrice >= (Number(o.entry_price) || 0)) ||
                  ((o.direction === "down" || o.direction === "sell") && currentPrice <= (Number(o.entry_price) || 0));

                const orderPayoutPercent = o.payout_percent || 85;
                const winProfit = Number(o.amount) * (orderPayoutPercent / 100);
                const loseAmount = Number(o.amount); // 100% loss of bet amount

                const total = Math.floor(
                  (new Date(o.expires_at).getTime() -
                    new Date(o.created_at).getTime()) /
                    1000
                );

                const timeLeft = Math.max(
                  0,
                  Math.floor((new Date(o.expires_at).getTime() - now) / 1000)
                );

                const progress = Math.max(
                  0,
                  Math.min(100, ((total - timeLeft) / total) * 100)
                );

                return (
                  <div
                    key={o.id}
                    className="rounded-lg border border-border bg-background p-4"
                  >
                    {/* HEADER */}
                    <div className="flex justify-between items-center mb-2">
                      <div className="flex items-center gap-2">
                        <span className="font-bold">{o.symbol}</span>

                        <span
                          className={`px-2 py-0.5 text-xs rounded ${
                            o.direction === "up" || o.direction === "buy"
                              ? "bg-success text-white"
                              : "bg-danger text-white"
                          }`}
                        >
                          {o.direction === "up" || o.direction === "buy" ? t('common.buy') : t('common.sell')}
                        </span>
                      </div>

                      <span className="text-xs text-muted-foreground">
                        {new Date(o.created_at).toLocaleTimeString()}
                      </span>
                    </div>

                    {/* PRICE */}
                    <div className="grid grid-cols-2 text-sm text-secondary-foreground mb-2">
                      <div>{t('option.entry_price')}: {Number(o.entry_price).toFixed(2)}</div>
                      <div className="text-right">{t('common.market')}: {currentPrice}</div>
                    </div>

                    {/* STATUS */}
                    <div className="flex justify-between items-center mb-2">
                      <span
                        className={`font-bold ${
                          isWinNow ? "text-success" : "text-danger"
                        }`}
                      >
                        {isWinNow ? t('common.win') : t('common.lose')}
                      </span>

                      <span className="font-mono text-primary">
                        {timeLeft}s
                      </span>
                    </div>

                    {/* PROFIT ESTIMATE */}
                    <div className="flex justify-between text-sm mb-2">
                       {isWinNow ? (
                        <span className="text-success font-semibold transition-all duration-300">
                           +{winProfit.toFixed(2)} USDT
                        </span>
                       ) : (
                        <span className="text-danger font-semibold transition-all duration-300">
                           -{loseAmount.toFixed(2)} USDT
                        </span>
                       )}

                       <span className="text-muted-foreground text-xs">
                          {t('option.payout')} {o.payout_percent || 85}%
                       </span>
                    </div>

                    {/* PROGRESS BAR */}
                    <div className="w-full h-2 bg-muted rounded overflow-hidden">
                      <div
                        className="h-full bg-primary transition-all duration-1000"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>
                );
              })}

            </div>
          )
        ) : (
          /* 📜 Tab Closed Orders */
          closedOrders.length === 0 ? (
            <div className="text-center text-muted-foreground py-10">{t('option.no_closed_positions')}</div>
          ) : (
                        <div className="flex flex-col gap-3">
              {closedOrders.map((o) => {
                // Calculate profit/loss: WIN = +payout%, LOSE = -100% amount
                const payoutPercent = Number(o.payout_percent) || 85;
                const amount = Number(o.amount);
                const isWin = o.status === "win";
                const profit = isWin
                  ? amount * (payoutPercent / 100)
                  : -amount;
                
                return (
                  <div
                    key={o.id}
                    onClick={() => {
                      setSelectedOrder(o);
                      setShowResultModal(true);
                    }}
                    className="border border-border rounded-lg p-4 hover:bg-muted/30 cursor-pointer transition bg-background"
                  >
                    {/* Header */}
                    <div className="flex items-center gap-2 mb-3 pb-2 border-b border-border/50">
                      <span className="font-bold">{t('option.close_position')}</span>
                      {o.direction === "up" || o.direction === "buy" ? (
                        <span className="text-success">{t('common.buy')}</span>
                      ) : (
                        <span className="text-danger">{t('common.sell')}</span>
                      )}
                      <span className="font-semibold">{o.symbol}/USDT</span>
                      <span className="text-xs text-muted-foreground">
                        {o.duration}s duration
                      </span>
                    </div>

                    {/* Details Grid */}
                    <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm mb-3">
                      <div>
                        <div className="text-muted-foreground text-xs">Quantity</div>
                        <div className="font-medium">{amount.toFixed(2)}</div>
                      </div>
                      
                      <div className="text-right">
                        <div className="text-muted-foreground text-xs">Profit and loss</div>
                        <div className={`font-bold ${o.status === "win" ? "text-success" : "text-danger"}`}>
                          {o.status === 'win' ? '+' : ''}{profit.toFixed(4)}
                        </div>
                      </div>

                      <div>
                        <div className="text-muted-foreground text-xs">Purchase price</div>
                        <div className="font-medium">{Number(o.entry_price || 0).toFixed(6)}</div>
                      </div>

                      <div className="text-right">
                        <div className="text-muted-foreground text-xs">Transaction price</div>
                        <div className="font-medium">{Number(o.exit_price || 0).toFixed(6)}</div>
                      </div>
                    </div>

                    {/* Timestamps */}
                    <div className="grid grid-cols-2 gap-x-4 text-xs text-muted-foreground pt-2 border-t border-border/50">
                      <div>
                        <div>Opening order time</div>
                        <div className="font-mono">{new Date(o.created_at).toLocaleString()}</div>
                      </div>
                      
                      <div className="text-right">
                        <div>Closing order time</div>
                        <div className="font-mono">{new Date(o.expires_at).toLocaleString()}</div>
                      </div>
                    </div>
                  </div>
                );
              })}

            </div>
          )
        )}
      </div>
      <OptionResultModal
  isOpen={showResultModal}
  onClose={() => {
    setShowResultModal(false);
    setSelectedOrder(null);
  }}
  result={selectedOrder}
/>
    </div>
  );
}
