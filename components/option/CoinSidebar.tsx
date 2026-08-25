"use client";

import { X } from "lucide-react";

interface CoinSidebarProps {
  coins: any[];
  active: string;
  setActive: (s: string) => void;
  isOpen: boolean;
  onClose: () => void;
}

export default function CoinSidebar({ coins, active, setActive, isOpen, onClose }: CoinSidebarProps) {
  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar - Slide from LEFT */}
      <div
        className={`fixed top-0 left-0 h-full w-80 bg-card border-r border-border z-50 transform transition-transform duration-300 lg:hidden ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h2 className="text-lg font-bold">Select Pair</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-muted rounded-full transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Coin List */}
        <div className="overflow-y-auto h-[calc(100vh-73px)] p-4 space-y-2">
          {coins.map((coin) => {
            const isActive = active === coin.symbol;
            const changeColor = coin.change >= 0 ? "text-success" : "text-danger";

            return (
              <button
                key={coin.symbol}
                onClick={() => {
                  setActive(coin.symbol);
                  onClose();
                }}
                className={`w-full p-3 rounded-lg border transition-all ${
                  isActive
                    ? "bg-primary/10 border-primary"
                    : "bg-background border-border hover:border-muted-foreground"
                }`}
              >
                <div className="flex items-center gap-3">
                  {/* Icon */}
                  <img
                    src={`/coins/${coin.symbol.toLowerCase()}.png`}
                    className="w-10 h-10"
                    alt={coin.symbol}
                  />

                  {/* Info */}
                  <div className="flex-1 text-left">
                    <div className="font-semibold">{coin.symbol}/USDT</div>
                    <div className="flex items-center gap-2 text-xs mt-1">
                      <span className="text-muted-foreground">
                        ${coin.price.toLocaleString()}
                      </span>
                      <span className={changeColor}>
                        {coin.change >= 0 ? "+" : ""}
                        {coin.change.toFixed(2)}%
                      </span>
                    </div>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </>
  );
}
