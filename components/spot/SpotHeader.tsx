"use client";

import { useState, useEffect } from "react";
import { ChevronDown } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

interface SpotHeaderProps {
  active: string;
  setActive: (symbol: string) => void;
  coins: any[];
}

export default function SpotHeader({ active, setActive, coins }: SpotHeaderProps) {
  const { t } = useLanguage();
  const [stats, setStats] = useState<any>(null);
  const [isOpen, setIsOpen] = useState(false);

  // Cari data coin aktif dari list coins
  useEffect(() => {
    if (coins && coins.length > 0) {
      const current = coins.find((c) => c.symbol === active);
      if (current) {
        setStats(current);
      }
    }
  }, [active, coins]);

  if (!stats) return <div className="h-16 border-b border-border animate-pulse bg-card" />;

  const isUp = stats.change >= 0;

  return (
    <div className="h-16 border-b border-border flex items-center justify-between px-4 bg-card text-xs md:text-sm">
      {/* LEFT: Pair Selector & Price */}
      <div className="flex items-center gap-6 relative">
        <div className="relative">
          <h1 
            onClick={() => setIsOpen(!isOpen)}
            className="text-lg font-bold text-foreground flex items-center gap-1 cursor-pointer hover:text-primary transition select-none"
          >
            {active}/USDT
            <ChevronDown className={`w-4 h-4 transition ${isOpen ? "rotate-180" : ""}`} />
          </h1>
          <a href="#" className="text-muted-foreground underline decoration-dashed text-xs">{t('trade.base_price')}</a>
          
          {/* DROPDOWN */}
          {isOpen && (
            <>
              {/* Backdrop */}
              <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
              
              {/* Content */}
              <div className="absolute top-full left-0 mt-2 w-[280px] bg-card border border-border shadow-2xl rounded-xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                  <div className="p-2">
                       <input 
                          type="text" 
                          placeholder="Search..." 
                          className="w-full bg-[#1f2937] border border-gray-700 rounded px-3 py-2 text-sm text-white focus:border-yellow-500 outline-none"
                          autoFocus
                       />
                  </div>
                  <div className="max-h-[300px] overflow-y-auto">
                      <table className="w-full text-xs">
                          <thead className="text-gray-500 sticky top-0 bg-card border-b border-border">
                              <tr>
                                  <th className="text-left py-2 px-3 font-medium">{t('trade.pair')}</th>
                                  <th className="text-right py-2 px-3 font-medium">{t('trade.price')}</th>
                                  <th className="text-right py-2 px-3 font-medium">{t('wallet.change')}</th>
                              </tr>
                          </thead>
                          <tbody>
                                {coins.map(c => (
                                    <tr 
                                      key={c.symbol} 
                                      onClick={() => {
                                          setActive(c.symbol);
                                          setIsOpen(false);
                                      }}
                                      className={`border-b border-border/50 hover:bg-muted/10 cursor-pointer transition ${active === c.symbol ? "bg-yellow-500/10" : ""}`}
                                    >
                                        <td className="py-2.5 px-3 font-bold text-foreground">{c.symbol}</td>
                                        <td className="py-2.5 px-3 text-right text-foreground">{c.price.toLocaleString()}</td>
                                        <td className={`py-2.5 px-3 text-right ${c.change >= 0 ? "text-green-500" : "text-red-500"}`}>
                                            {c.change >= 0 ? "+" : ""}{c.change.toFixed(2)}%
                                        </td>
                                    </tr>
                                ))}
                          </tbody>
                      </table>
                  </div>
              </div>
            </>
          )}
        </div>

        <div className={`flex flex-col ${isUp ? "text-success" : "text-danger"}`}>
          <span className="text-xl font-bold">{stats.price.toLocaleString()}</span>
          <span className="text-xs">≈ ${stats.price.toLocaleString()}</span>
        </div>
      </div>

      {/* RIGHT: 24h Stats */}
      <div className="hidden md:flex items-center gap-8 text-xs">
        <div className="flex flex-col">
          <span className="text-muted-foreground">{t('trade.change_24h')}</span>
          <span className={`font-medium ${isUp ? "text-success" : "text-danger"}`}>
             {stats.price} {isUp ? "+" : ""}{stats.change.toFixed(2)}%
          </span>
        </div>
        <div className="flex flex-col">
          <span className="text-muted-foreground">{t('trade.high_24h')}</span>
          <span className="text-foreground font-medium">{stats.high.toLocaleString()}</span>
        </div>
        <div className="flex flex-col">
          <span className="text-muted-foreground">{t('trade.low_24h')}</span>
          <span className="text-foreground font-medium">{stats.low.toLocaleString()}</span>
        </div>
        <div className="flex flex-col">
          <span className="text-muted-foreground">{t('trade.vol_24h')}({active})</span>
          <span className="text-foreground font-medium">{Number(stats.volume).toLocaleString(undefined, { maximumFractionDigits: 2 })}</span>
        </div>
        <div className="flex flex-col">
           <span className="text-muted-foreground">{t('trade.vol_24h')}(USDT)</span>
           {/* Estimasi kasar volume * price */}
           <span className="text-foreground font-medium">{(Number(stats.volume) * stats.price).toLocaleString(undefined, { maximumFractionDigits: 2 })}</span>
        </div>
      </div>
    </div>
  );
}
