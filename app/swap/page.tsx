"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowDownUp } from "lucide-react"; 
import { useLanguage } from "@/context/LanguageContext"; 
import { toast } from "react-hot-toast"; 

export default function SwapPage() {
  const router = useRouter();
  const { t } = useLanguage();
  const [coins, setCoins] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [swapping, setSwapping] = useState(false);
  const [wallets, setWallets] = useState<any[]>([]);

  // Form State
  const [direction, setDirection] = useState<"buy" | "sell">("buy"); // buy = USDT -> Coin, sell = Coin -> USDT
  const [selectedCoin, setSelectedCoin] = useState("BTC");
  const [amount, setAmount] = useState("");
  
  // Quote State
  const [quote, setQuote] = useState<any>(null);

  // Load Coins & Balance
  const loadData = async () => {
    try {
        // Coins
        const r = await fetch("/api/market");
        const j = await r.json();
        if(j.data) {
            const c = j.data.map((x: any) => ({
                symbol: x.symbol.replace("USDT", ""),
                price: x.price
            }));
            setCoins(c);
        }

        // Balance
        const authRes = await fetch("/api/auth/me");
        const authData = await authRes.json();
        if(authData.user) {
            const wRes = await fetch(`/api/wallets?userId=${authData.user.id}`);
            const wJson = await wRes.json();
            setWallets(wJson.data || []);
        }

      } catch (e) {
        console.error(e);
      }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Fetch Quote when inputs change
  useEffect(() => {
      const timeOutId = setTimeout(async () => {
          if(!amount || Number(amount) <= 0) {
              setQuote(null);
              return;
          }

          setLoading(true);
          try {
              const from = direction === "buy" ? "USDT" : selectedCoin;
              const to = direction === "buy" ? selectedCoin : "USDT";

              const res = await fetch("/api/swap/quote", {
                  method: "POST",
                  body: JSON.stringify({ fromCoin: from, toCoin: to, amount })
              });
              const data = await res.json();
              if(data.success) {
                  setQuote(data);
              } else {
                  setQuote(null);
              }
          } catch(e) {
              console.error(e);
          } finally {
              setLoading(false);
          }
      }, 500); // Debounce

      return () => clearTimeout(timeOutId);
  }, [amount, direction, selectedCoin]);

  const handleSwap = async () => {
      if(!quote) return;
      setSwapping(true);
      try {
          const from = direction === "buy" ? "USDT" : selectedCoin;
          const to = direction === "buy" ? selectedCoin : "USDT";

          const res = await fetch("/api/swap/execute", {
              method: "POST",
              body: JSON.stringify({
                  fromCoin: from,
                  toCoin: to,
                  amount,
                  quoteId: "fresh" 
              })
          });
          const json = await res.json();
          if(json.success) {
              toast.success(`${t('wallet.swap_success')} ${Number(json.amountOut).toFixed(8)} ${to}`);
              setAmount("");
              setQuote(null);
              router.refresh();
              loadData(); // Reload balance
          } else {
              toast.error(json.error || t('wallet.swap_failed'));
          }
      } catch(e) {
          toast.error(t('wallet.swap_failed'));
      } finally {
          setSwapping(false);
      }
  };

  const switchDirection = () => {
      setDirection(prev => prev === "buy" ? "sell" : "buy");
      setAmount(""); 
      setQuote(null);
  };

  const fromLabel = direction === "buy" ? "USDT" : selectedCoin;
  const toLabel = direction === "buy" ? selectedCoin : "USDT";

  // Calculate Fee in USDT
  let feeInUsdt = "0.00";
  if (quote) {
      if (quote.feeCurrency === "USDT") {
          feeInUsdt = Number(quote.fee).toFixed(4);
      } else {
          // If fee is in Coin, convert to USDT using the price
          // Price provided by API is X USDT for 1 Coin
          feeInUsdt = (Number(quote.fee) * Number(quote.price)).toFixed(4);
      }
  }

  // Rate Display
  const rateDisplay = quote ? Number(quote.price).toFixed(2) : "0.00";

  // Dynamic Balance
  const currentBalance = wallets.find(w => w.coin === fromLabel)?.balance || 0;

  return (
    <div className="max-w-md mx-auto mt-20 p-6 bg-card border border-border rounded-xl shadow-lg text-foreground">
       <div className="flex justify-between items-center mb-6">
           <h1 className="text-2xl font-bold">{t('wallet.swap_coins')}</h1>
           <div className="text-sm text-gray-400">
               {fromLabel} {t('trade.avail')}: <span className="text-yellow-400 font-bold">{Number(currentBalance).toLocaleString()}</span>
           </div>
       </div>

       {/* FROM */}
       <div className="bg-muted/10 p-4 rounded-lg mb-2">
          <div className="flex justify-between mb-2">
             <span className="text-sm text-muted-foreground">{t('wallet.from')}</span>
          </div>
          <div className="flex items-center gap-2">
             <input 
               type="number" 
               className="bg-transparent text-2xl font-bold w-full outline-none placeholder-gray-600"
               placeholder="0.00"
               value={amount}
               onChange={e => setAmount(e.target.value)}
             />
             
             {direction === "buy" ? (
                 <div className="flex items-center gap-2 bg-gray-800 px-3 py-1 rounded-full shrink-0">
                     <span className="font-bold text-green-400">USDT</span>
                 </div>
             ) : (
                 <select 
                    className="bg-gray-800 text-white px-3 py-1 rounded-full outline-none font-bold"
                    value={selectedCoin}
                    onChange={e => setSelectedCoin(e.target.value)}
                 >
                     {coins.map(c => (
                         <option key={c.symbol} value={c.symbol}>{c.symbol}</option>
                     ))}
                 </select>
             )}
          </div>
       </div>

       {/* SWITCHER */}
       <div className="flex justify-center -my-3 relative z-10">
           <button 
             onClick={switchDirection}
             className="bg-card border border-border p-2 rounded-full hover:bg-muted transition shadow-sm"
           >
               <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                 <path strokeLinecap="round" strokeLinejoin="round" d="M3 7.5 7.5 3m0 0L12 7.5M7.5 3v13.5m13.5 0L16.5 21m0 0L12 16.5m4.5 4.5V7.5" />
               </svg>
           </button>
       </div>

       {/* TO */}
       <div className="bg-muted/10 p-4 rounded-lg mt-2 mb-6">
          <div className="flex justify-between mb-2">
             <span className="text-sm text-muted-foreground">{t('wallet.estimate')}</span>
          </div>
          <div className="flex items-center gap-2">
             <div className="text-2xl font-bold w-full text-gray-400">
                 {quote ? Number(quote.amountOut).toFixed(8) : "0.00"}
             </div>

             {direction === "sell" ? (
                 <div className="flex items-center gap-2 bg-gray-800 px-3 py-1 rounded-full shrink-0">
                     <span className="font-bold text-green-400">USDT</span>
                 </div>
             ) : (
                 <select 
                    className="bg-gray-800 text-white px-3 py-1 rounded-full outline-none font-bold"
                    value={selectedCoin}
                    onChange={e => setSelectedCoin(e.target.value)}
                 >
                     {coins.map(c => (
                         <option key={c.symbol} value={c.symbol}>{c.symbol}</option>
                     ))}
                 </select>
             )}
          </div>
       </div>

       {/* QUOTE DETAILS */}
       {quote && (
           <div className="text-sm space-y-2 mb-6 p-4 bg-muted/20 rounded border border-border/50">
               <div className="flex justify-between">
                   <span className="text-muted-foreground">{t('wallet.rate')}</span>
                   <span>1 {selectedCoin} ≈ {rateDisplay} USDT</span>
               </div>
               <div className="flex justify-between">
                   <span className="text-muted-foreground">{t('wallet.fee')} (0.5%)</span>
                   <span>{feeInUsdt} USDT</span>
               </div>
           </div>
       )}

       {/* ACTION */}
       <button
         onClick={handleSwap}
         disabled={!quote || swapping || loading}
         className="w-full bg-yellow-400 hover:bg-yellow-500 text-black font-bold py-3 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
       >
           {swapping ? t('wallet.swapping') : loading ? t('wallet.calculating') : t('wallet.confirm_swap')}
       </button>

    </div>
  );
}
