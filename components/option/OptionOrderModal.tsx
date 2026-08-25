"use client";

import { useEffect, useState } from "react";
import { X, TrendingUp, TrendingDown } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

interface OptionOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: {
    id: string;
    symbol: string;
    direction: "buy" | "sell" | "up" | "down";
    amount: number;
    entry_price: number;
    duration: number;
    payout_percent: number;
  } | null;
  initialCountdown: number;
}

export default function OptionOrderModal({
  isOpen,
  onClose,
  order,
  initialCountdown,
}: OptionOrderModalProps) {
  const { t } = useLanguage();
  const [countdown, setCountdown] = useState(initialCountdown);
  const [currentPrice, setCurrentPrice] = useState(0);

  // Countdown timer
  useEffect(() => {
    if (!isOpen || countdown <= 0) return;

    const interval = setInterval(() => {
      setCountdown((c) => {
        if (c <= 1) {
          clearInterval(interval);
          // Auto close modal when expired
          setTimeout(() => onClose(), 2000);
          return 0;
        }
        return c - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isOpen, countdown, onClose]);

  // Fetch current price
  useEffect(() => {
    if (!isOpen || !order) return;

    // Initialize currentPrice with entry_price so we don't start at 0
    if (order.entry_price && currentPrice === 0) {
      setCurrentPrice(Number(order.entry_price));
    }

    async function fetchPrice() {
      try {
        const res = await fetch(`/api/market`);
        const json = await res.json();
        const coinData = json.data?.find((c: any) => {
          const sym1 = c.symbol?.replace(/USDT$/i, "").toUpperCase();
          const sym2 = order?.symbol?.replace(/USDT$/i, "").toUpperCase();
          return sym1 === sym2;
        });
        if (coinData) {
          setCurrentPrice(Number(coinData.price));
        }
      } catch (err) {
        console.error("Failed to fetch price:", err);
      }
    }

    fetchPrice();
    const interval = setInterval(fetchPrice, 1000);
    return () => clearInterval(interval);
  }, [isOpen, order]);

  // Reset countdown and price when modal opens
  useEffect(() => {
    if (isOpen && order) {
      setCountdown(initialCountdown);
      if (order.entry_price) {
        setCurrentPrice(Number(order.entry_price));
      }
    }
  }, [isOpen, initialCountdown, order]);

  if (!isOpen || !order) return null;

  // Convert to numbers (API might return strings)
  const amount = Number(order.amount);
  const entryPrice = Number(order.entry_price);
  const payoutPercent = Number(order.payout_percent) || 85;

  // Calculate profit/loss
  const activePrice = currentPrice || entryPrice;
  const priceDiff = activePrice - entryPrice;
  const isWinning =
    order.direction === "buy" || order.direction === "up" ? priceDiff > 0 : priceDiff < 0;

  // Binary Options PnL Calculation:
  // WIN: +Payout% of amount (e.g. +$10.00 for $100 bet at 10% payout)
  // LOSE: -100% of amount (e.g. -$100.00 for $100 bet)
  const estimatedProfit = amount * (payoutPercent / 100);
  const estimatedLoss = -amount;

  const minutes = Math.floor(countdown / 60);
  const seconds = countdown % 60;
  const timeDisplay = `${minutes}:${seconds.toString().padStart(2, "0")}`;

  const estimatedResult = isWinning
    ? `+${estimatedProfit.toFixed(2)}`
    : `${estimatedLoss.toFixed(2)}`;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto"
        onClick={onClose}
      >
        {/* Modal */}
        <div
          className="bg-card rounded-2xl border border-border max-w-sm sm:max-w-md w-full p-4 sm:p-6 shadow-2xl my-auto max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold flex items-center gap-2">
              {order.direction === "buy" || order.direction === "up" ? (
                <TrendingUp className="w-6 h-6 text-success" />
              ) : (
                <TrendingDown className="w-6 h-6 text-danger" />
              )}
              {order.symbol}/USDT
            </h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-muted rounded-full transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Countdown Timer */}
          {/* Circular Countdown */}
          <div className="flex justify-center mb-6 relative">
            <div className="relative w-32 h-32">
              {/* Background Circle */}
              <svg className="w-full h-full transform -rotate-90">
                <circle
                  cx="64"
                  cy="64"
                  r="56"
                  stroke="currentColor"
                  strokeWidth="8"
                  fill="transparent"
                  className="text-muted/20"
                />
                {/* Progress Circle */}
                <circle
                  cx="64"
                  cy="64"
                  r="56"
                  stroke="currentColor"
                  strokeWidth="8"
                  fill="transparent"
                  strokeDasharray={351.86}
                  strokeDashoffset={
                    351.86 - (351.86 * countdown) / (order.duration || 1)
                  }
                  className="text-primary transition-all duration-1000"
                />
              </svg>
              {/* Timer Text */}
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-3xl font-bold font-mono">
                  {timeDisplay}
                </span>
                <span className="text-xs text-muted-foreground">{t('option.remaining')}</span>
              </div>
            </div>
          </div>

          {/* Order Details */}
          <div className="space-y-3 text-sm">
            {/* Type */}
            <div className="flex justify-between items-center py-2 border-b border-border">
              <span className="text-muted-foreground">{t('option.type')}</span>
              <span
                className={`font-semibold uppercase ${
                  order.direction === "buy" || order.direction === "up" ? "text-success" : "text-danger"
                }`}
              >
                {order.direction === "buy" || order.direction === "up" ? t('common.buy') : t('common.sell')}
              </span>
            </div>

            {/* Amount */}
            <div className="flex justify-between items-center py-2 border-b border-border">
              <span className="text-muted-foreground">{t('option.amount')}</span>
              <span className="font-semibold">${amount.toFixed(2)}</span>
            </div>

            {/* Entry Price */}
            <div className="flex justify-between items-center py-2 border-b border-border">
              <span className="text-muted-foreground">{t('option.entry_price')}</span>
              <span className="font-semibold font-mono">
                ${entryPrice.toLocaleString()}
              </span>
            </div>

            {/* Current Price */}
            <div className="flex justify-between items-center py-2 border-b border-border">
              <span className="text-muted-foreground">{t('option.current_price')}</span>
              <span
                className={`font-semibold font-mono ${
                  priceDiff > 0 ? "text-success" : priceDiff < 0 ? "text-danger" : ""
                }`}
              >
                ${activePrice.toLocaleString()}
              </span>
            </div>

            {/* Estimate Profit/Loss */}
            <div className="flex justify-between items-center py-3 bg-muted/30 rounded-lg px-4 mt-4">
              <span className="font-medium">{t('option.estimated_result')}</span>
              <span
                className={`font-bold text-lg ${
                  isWinning ? "text-success" : "text-danger"
                }`}
              >
                {estimatedResult} USDT
              </span>
            </div>
          </div>

          {/* Footer Info */}
          <div className="mt-6 text-center text-xs text-muted-foreground">
            {countdown > 0 ? (
              <>{t('option.order_active_footer')}</>
            ) : (
              <>{t('option.order_expired_footer')}</>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
