"use client";

import { useState, useEffect } from "react";
import { useLanguage } from "@/context/LanguageContext";

export default function SpotOrderForm({ symbol }: { symbol: string }) {
  const { t } = useLanguage();
  const [tab, setTab] = useState<"limit" | "market">("limit");
  const [side, setSide] = useState<"buy" | "sell">("buy");
  const [price, setPrice] = useState("");
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Balances
  const [usdtBalance, setUsdtBalance] = useState(0);
  const [coinBalance, setCoinBalance] = useState(0);
  const [userId, setUserId] = useState<string | null>(null);

  // Fetch User & Balances
  useEffect(() => {
    async function loadUserAndBalances() {
       try {
          const res = await fetch("/api/auth/me");
          if (!res.ok) return;
          const data = await res.json();
          if (data.user) {
             setUserId(data.user.id);
             fetchBalances(data.user.id);
          }
       } catch (e) {
          console.error(e);
       }
    }

    async function fetchBalances(uid: string) {
       try {
          const res = await fetch(`/api/wallets?userId=${uid}`);
          if (!res.ok) return;
          const json = await res.json();
          const wallets = json.data;
          
          if (wallets) {
             const usdt = wallets.find((w: any) => w.coin === "USDT");
             const coin = wallets.find((w: any) => w.coin === symbol);
             setUsdtBalance(usdt ? Number(usdt.balance) : 0);
             setCoinBalance(coin ? Number(coin.balance) : 0);
          }
       } catch (e) {
          console.error(e);
       }
    }

    loadUserAndBalances();

    const interval = setInterval(() => {
       if (userId) fetchBalances(userId);
    }, 5000);

    return () => clearInterval(interval);
  }, [symbol, userId]);

  const total =
    tab === "market"
      ? 0 // Market order total is unknown until execution
      : (Number(price) * Number(amount)) || 0;

  async function submitOrder() {
    setError(null);

    const numAmount = Number(amount);
    const numPrice = Number(price);

    if (!numAmount || numAmount <= 0) {
      setError("Invalid amount");
      return;
    }

    if (tab === "limit" && (!numPrice || numPrice <= 0)) {
      setError("Invalid price");
      return;
    }

    setLoading(true);

    try {
      // Validasi balance client-side
      if (side === "buy") {
        const cost = tab === "limit" ? numPrice * numAmount : 0; 
        if (tab === "limit" && cost > usdtBalance) {
           throw new Error("Insufficient USDT balance");
        }
      } else {
        if (numAmount > coinBalance) {
           throw new Error(`Insufficient ${symbol} balance`);
        }
      }

      const res = await fetch("/api/spot/order", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          symbol,
          side,
          type: tab,
          price: tab === "market" ? 0 : numPrice,
          amount: numAmount,
        }),
      });

      const json = await res.json();

      if (!res.ok) {
        throw new Error(json.error || "Order failed");
      }

      // reset form
      setAmount("");
      if (tab === "limit") setPrice(""); 

      // notify history refresh
      window.dispatchEvent(new Event("spot-order-created"));
      
      // refresh balance immediately
      if (userId) {
          // fetchBalances logic duplicated here or just rely on effect. 
          // Effect dependency [userId] might not trigger re-fetch unless userId changes.
          // But interval will catch it.
      }
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col h-full bg-card p-4 text-sm">
      {/* BUY / SELL */}
      <div className="flex mb-4 bg-muted rounded p-1">
        <button
          onClick={() => setSide("buy")}
          className={`flex-1 py-1 rounded font-bold ${
            side === "buy"
              ? "bg-success text-white"
              : "text-muted-foreground"
          }`}
        >
          {t('trade.buy')}
        </button>
        <button
          onClick={() => setSide("sell")}
          className={`flex-1 py-1 rounded font-bold ${
            side === "sell"
              ? "bg-danger text-white"
              : "text-muted-foreground"
          }`}
        >
          {t('trade.sell')}
        </button>
      </div>

      {/* LIMIT / MARKET */}
      <div className="flex gap-4 mb-4 text-xs font-medium">
        <button
          onClick={() => setTab("limit")}
          className={tab === "limit" ? "text-primary" : "text-muted-foreground"}
        >
          {t('trade.limit')}
        </button>
        <button
          onClick={() => setTab("market")}
          className={tab === "market" ? "text-primary" : "text-muted-foreground"}
        >
          {t('trade.market')}
        </button>
      </div>

      {/* BALANCE DISPLAY */}
      <div className="flex justify-between text-xs text-muted-foreground mb-2">
         <span>{t('trade.avail')}</span>
         <span className="font-medium text-foreground">
            {side === "buy" 
               ? `${usdtBalance.toFixed(2)} USDT` 
               : `${coinBalance.toFixed(5)} ${symbol}`
            }
         </span>
      </div>

      {/* INPUTS */}
      <div className="flex flex-col gap-3">
        {/* PRICE */}
        <div className="relative">
           <span className="absolute left-3 top-2 text-muted-foreground text-xs">{t('trade.price')}</span>
           <input
             type="number"
             disabled={tab === "market"}
             placeholder={tab === "market" ? "Market Price" : "0.00"}
             className="w-full bg-input rounded p-2 pl-12 text-left border border-transparent focus:border-primary outline-none"
             value={price}
             onChange={(e) => setPrice(e.target.value)}
           />
           <span className="absolute right-3 top-2 text-muted-foreground text-xs">USDT</span>
        </div>

        {/* AMOUNT */}
        <div className="relative">
           <span className="absolute left-3 top-2 text-muted-foreground text-xs">{t('trade.amount')}</span>
           <input
             type="number"
             placeholder="0.00"
             className="w-full bg-input rounded p-2 pl-16 text-left border border-transparent focus:border-primary outline-none"
             value={amount}
             onChange={(e) => setAmount(e.target.value)}
           />
           <span className="absolute right-3 top-2 text-muted-foreground text-xs">{symbol}</span>
        </div>

        {/* SLIDER (Placeholder) */}
        {!loading && (
           <div className="flex justify-between text-[10px] text-muted-foreground px-1">
              <span className="cursor-pointer hover:text-primary" onClick={() => {
                 if(side === "buy" && Number(price) > 0) setAmount(((usdtBalance * 0.25) / Number(price)).toFixed(5));
                 if(side === "sell") setAmount((coinBalance * 0.25).toFixed(5));
              }}>25%</span>
              <span className="cursor-pointer hover:text-primary" onClick={() => {
                 if(side === "buy" && Number(price) > 0) setAmount(((usdtBalance * 0.50) / Number(price)).toFixed(5));
                 if(side === "sell") setAmount((coinBalance * 0.50).toFixed(5));
              }}>50%</span>
              <span className="cursor-pointer hover:text-primary" onClick={() => {
                 if(side === "buy" && Number(price) > 0) setAmount(((usdtBalance * 0.75) / Number(price)).toFixed(5));
                 if(side === "sell") setAmount((coinBalance * 0.75).toFixed(5));
              }}>75%</span>
              <span className="cursor-pointer hover:text-primary" onClick={() => {
                 if(side === "buy" && Number(price) > 0) setAmount(((usdtBalance * 1.00) / Number(price)).toFixed(5));
                 if(side === "sell") setAmount(coinBalance.toFixed(5));
              }}>100%</span>
           </div>
        )}

        {/* TOTAL */}
        <div className="flex justify-between items-center text-muted-foreground text-xs">
           <span>{t('trade.total')}</span>
           <span>{tab === "market" ? "---" : `${total.toFixed(2)} USDT`}</span>
        </div>

        {error && (
          <div className="text-danger text-xs text-center">{error}</div>
        )}

        {/* SUBMIT */}
        <button
          disabled={loading}
          onClick={submitOrder}
          className={`w-full py-3 rounded font-bold text-white mt-1 ${
            side === "buy" ? "bg-success hover:brightness-110" : "bg-danger hover:brightness-110"
          } ${loading ? "opacity-60" : ""}`}
        >

          {loading ? t('wallet.processing') : `${side === "buy" ? t('trade.buy') : t('trade.sell')} ${symbol}`}
        </button>
      </div>
    </div>
  );
}
