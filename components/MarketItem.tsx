"use client";

import { useRouter } from "next/navigation";

export default function MarketItem({ coin }: any) {
  const router = useRouter();
  // Binance uses specific colors: Text is usually standard, Change is Green/Red
  const isPositive = coin.change >= 0;
  const changeColor = isPositive ? "text-success" : "text-danger";

  const handleClick = () => {
    router.push(`/spot?symbol=${coin.symbol}`);
  };

  return (
    <div 
      onClick={handleClick}
      className="grid grid-cols-3 items-center py-4 px-4 border-b border-border hover:bg-muted/50 cursor-pointer transition-colors"
    >
      {/* Name / Volume */}
      <div className="flex items-center gap-3">
        <img
            src={`/coins/${coin.symbol.toLowerCase()}.png`}
            className="w-8 h-8 rounded-full"
            alt={coin.symbol}
            onError={(e) => {
              (e.target as HTMLImageElement).src = "/coins/default.png"; // Fallback if you have one
            }} 
        />
        <div>
          <div className="font-bold text-base text-foreground">{coin.symbol}</div>
          <div className="text-xs text-muted-foreground">Vol {Number(coin.volume).toLocaleString()}</div>
        </div>
      </div>

      {/* Price */}
      <div className="text-right pr-4 md:pr-0 md:text-left md:pl-8">
        <div className="font-medium text-foreground text-base">
          ${Number(coin.price).toLocaleString()}
        </div>
        <div className="text-xs text-muted-foreground">
             ≈ ${Number(coin.price).toLocaleString()} 
        </div>
      </div>

      {/* Change */}
      <div className="flex justify-end">
        <div className={`
          flex items-center justify-center w-20 h-8 rounded-lg font-medium text-sm
          ${isPositive ? 'bg-success/15 text-success' : 'bg-danger/15 text-danger'}
        `}>
          {isPositive ? '+' : ''}{coin.change.toFixed(2)}%
        </div>
      </div>
    </div>
  );
}
