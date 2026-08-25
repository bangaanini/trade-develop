"use client";

import { Menu } from "lucide-react";

export default function OptionHeader({ 
  coins, 
  active, 
  setActive,
  onMobileMenuClick 
}: { 
  coins: any[]; 
  active: string; 
  setActive: (s: string) => void;
  onMobileMenuClick?: () => void;
}) {
  if (coins.length === 0) {
    return (
      <div className="text-center text-muted-foreground py-4 border-b border-border">
        No trading pairs available
      </div>
    );
  }

  const currentCoin = coins.find(c => c.symbol === active);
  const changeColor = currentCoin && currentCoin.change >= 0 ? "text-success" : "text-danger";

  return (
    <div className="border-b border-border pb-4 mb-6">
      
      {/* MOBILE: Show menu button + current coin */}
      <div className="lg:hidden flex items-center justify-between">
        <button
          onClick={onMobileMenuClick}
          className="p-2 hover:bg-muted rounded-lg transition"
        >
          <Menu className="w-6 h-6" />
        </button>
        
        <div className="flex items-center gap-3 flex-1 ml-2">
          {currentCoin && (
            <>
              <img
                src={`/coins/${currentCoin.symbol.toLowerCase()}.png`}
                className="w-10 h-10"
                alt={currentCoin.symbol}
              />
              <div>
                <div className="font-semibold">{currentCoin.symbol}/USDT</div>
                <div className="flex items-center gap-2 text-xs">
                  <span className="text-muted-foreground">${currentCoin.price.toLocaleString()}</span>
                  <span className={changeColor}>
                    {currentCoin.change >= 0 ? '+' : ''}{currentCoin.change.toFixed(2)}%
                  </span>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* DESKTOP: Horizontal scrollable list */}
      <div className="hidden lg:flex overflow-x-auto gap-3 pb-2 pt-5">
        {coins.map((coin) => {
          const isActive = active === coin.symbol;
          const changeColor = coin.change >= 0 ? "text-success" : "text-danger";
          
          return (
            <button
              key={coin.symbol}
              onClick={() => setActive(coin.symbol)}
              className={`shrink-0 px-3 py-2 rounded-lg border transition-all ${
                isActive
                  ? "bg-primary/10 border-primary"
                  : "bg-card border-border hover:border-muted-foreground"
              }`}
            >
              <div className="flex items-center gap-3">
                {/* Icon */}
                <img
                  src={`/coins/${coin.symbol.toLowerCase()}.png`}
                  className="w-8 h-8"
                  alt={coin.symbol}
                />
                
                {/* Info */}
                <div className="text-left">
                  <div className="font-semibold text-sm">{coin.symbol}/USDT</div>
                  <div className="flex items-center gap-2 text-xs">
                    <span className="text-muted-foreground">${coin.price.toLocaleString()}</span>
                    <span className={changeColor}>{coin.change >= 0 ? '+' : ''}{coin.change.toFixed(2)}%</span>
                  </div>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
