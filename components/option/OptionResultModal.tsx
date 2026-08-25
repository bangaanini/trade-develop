"use client";

import { X, TrendingUp, TrendingDown } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

interface OptionResultModalProps {
  isOpen: boolean;
  onClose: () => void;
  result: {
    symbol: string;
    direction: "up" | "down" | "buy" | "sell";
    amount: number;
    entry_price: number;
    exit_price: number;
    duration: number;
    payout_percent: number;
    status: "win" | "lose";
    profit: number;
    created_at: string;
    expires_at: string;
  } | null;
}

export default function OptionResultModal({
  isOpen,
  onClose,
  result,
}: OptionResultModalProps) {
  if (!isOpen || !result) return null;

  const amount = Number(result.amount);
  const entryPrice = Number(result.entry_price);
  const exitPrice = Number(result.exit_price);
  const payoutPercent = Number(result.payout_percent) || 85;

  // Binary Options Profit/Loss
  const isWin = result.status === "win";
  const profit = isWin
    ? amount * (payoutPercent / 100)
    : -amount;

  // Format timestamps
  const openTime = new Date(result.created_at).toLocaleString();
  const closeTime = new Date(result.expires_at).toLocaleString();

  const { t } = useLanguage();

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto"
        onClick={onClose}
      >
        {/* Modal */}
        <div
          className="bg-card rounded-2xl border-2 max-w-sm sm:max-w-md w-full shadow-2xl overflow-hidden my-auto max-h-[90vh] flex flex-col"
          onClick={(e) => e.stopPropagation()}
          style={{
            borderColor: isWin ? "#22c55e" : "#ef4444",
          }}
        >
          {/* Header with Result */}
          <div
            className={`relative p-4 sm:p-5 text-center shrink-0 ${
              isWin ? "bg-success/10" : "bg-danger/10"
            }`}
          >
            <button
              onClick={onClose}
              className="absolute top-3 right-3 p-1.5 text-gray-400 hover:text-white hover:bg-black/20 rounded-full transition"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center justify-center gap-2 mb-1">
              {isWin ? (
                <TrendingUp className="w-6 h-6 sm:w-7 sm:h-7 text-success" />
              ) : (
                <TrendingDown className="w-6 h-6 sm:w-7 sm:h-7 text-danger" />
              )}
              <h2 className="text-xl sm:text-2xl font-bold">{result.symbol}/USDT</h2>
            </div>

            <div
              className={`text-3xl sm:text-4xl font-bold my-1 ${
                isWin ? "text-success" : "text-danger"
              }`}
            >
              {isWin ? "+" : ""}
              {profit.toFixed(2)} USDT
            </div>

            <div
              className={`text-base sm:text-lg font-semibold ${
                isWin ? "text-success" : "text-danger"
              }`}
            >
              {isWin ? t('common.win') : t('common.lose')}
            </div>
          </div>

          {/* Body with Details */}
          <div className="p-4 sm:p-5 space-y-2.5 overflow-y-auto flex-1 text-sm">
            {/* Type */}
            <div className="flex justify-between items-center py-1.5 border-b border-border">
              <span className="text-muted-foreground">{t('option.type')}</span>
              <span
                className={`font-semibold uppercase ${
                  result.direction === "up" || result.direction === "buy" ? "text-success" : "text-danger"
                }`}
              >
                {result.direction === "up" || result.direction === "buy" ? t('common.buy') : t('common.sell')}
              </span>
            </div>

            {/* Opening Price */}
            <div className="flex justify-between items-center py-1.5 border-b border-border">
              <span className="text-muted-foreground">{t('option.entry_price')}</span>
              <span className="font-semibold font-mono">
                ${entryPrice.toLocaleString()}
              </span>
            </div>

            {/* Closing Price */}
            <div className="flex justify-between items-center py-1.5 border-b border-border">
              <span className="text-muted-foreground">{t('option.close_price')}</span>
              <span className="font-semibold font-mono">
                ${exitPrice.toLocaleString()}
              </span>
            </div>

            {/* Duration */}
            <div className="flex justify-between items-center py-1.5 border-b border-border">
              <span className="text-muted-foreground">{t('option.duration')}</span>
              <span className="font-semibold">{result.duration}s</span>
            </div>

            {/* Profit Rate */}
            <div className="flex justify-between items-center py-1.5 border-b border-border">
              <span className="text-muted-foreground">{t('option.payout')}</span>
              <span className="font-semibold text-primary">
                {payoutPercent}%
              </span>
            </div>

            {/* Amount */}
            <div className="flex justify-between items-center py-1.5 border-b border-border">
              <span className="text-muted-foreground">{t('option.amount')}</span>
              <span className="font-semibold">${amount.toFixed(2)}</span>
            </div>

            {/* Profit/Loss */}
            <div
              className={`flex justify-between items-center py-2.5 rounded-lg px-3.5 mt-3 ${
                isWin ? "bg-success/10" : "bg-danger/10"
              }`}
            >
              <span className="font-medium">{t('option.trade_result')}</span>
              <span
                className={`font-bold text-lg sm:text-xl ${
                  isWin ? "text-success" : "text-danger"
                }`}
              >
                {isWin ? "+" : ""}
                {profit.toFixed(2)} USDT
              </span>
            </div>

            {/* Timestamps */}
            <div className="pt-2 space-y-1 text-xs text-muted-foreground">
              <div className="flex justify-between">
                <span>{t('option.opened_at')}:</span>
                <span className="font-mono">{openTime}</span>
              </div>
              <div className="flex justify-between">
                <span>{t('option.closed_at')}:</span>
                <span className="font-mono">{closeTime}</span>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="p-3 sm:p-4 bg-muted/30 flex justify-center shrink-0">
            <button
              onClick={onClose}
              className="px-6 py-2 bg-primary text-primary-foreground rounded-lg font-semibold hover:opacity-90 transition text-sm sm:text-base"
            >
              {t('common.close')}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
