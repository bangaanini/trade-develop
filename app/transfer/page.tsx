"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeftRight, ArrowLeft } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { toast } from "react-hot-toast";

export default function TransferPage() {
  const { t } = useLanguage();
  const router = useRouter();
  const [direction, setDirection] = useState<"funding-to-trading" | "trading-to-funding">("funding-to-trading");
  const [amount, setAmount] = useState("");
  const [balances, setBalances] = useState({ funding: 0, trading: 0 });
  const [loading, setLoading] = useState(false);
  const [loadingBalances, setLoadingBalances] = useState(true);

  useEffect(() => {
    loadBalances();
  }, []);

  async function loadBalances() {
    try {
      const res = await fetch("/api/transfer");
      if (res.ok) {
        const data = await res.json();
        setBalances(data.balances);
      }
    } catch (e) {
      console.error("Failed to load balances", e);
    } finally {
      setLoadingBalances(false);
    }
  }

  const handleTransfer = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/transfer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount, direction }),
      });

      const data = await res.json();

      if (res.ok) {
        toast.success(`✅ Transfer successful! ${data.amount} USDT transferred from ${data.from} to ${data.to}`);
        setAmount("");
        await loadBalances();
      } else {
        toast.error(`❌ ${data.error}`);
      }
    } catch (err: any) {
      toast.error("❌ Transfer failed: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const sourceBalance = direction === "funding-to-trading" ? balances.funding : balances.trading;
  const destBalance = direction === "funding-to-trading" ? balances.trading : balances.funding;
  const sourceLabel = direction === "funding-to-trading" ? "Funding" : "Trading";
  const destLabel = direction === "funding-to-trading" ? "Trading" : "Funding";

  return (
    <div className="min-h-screen bg-background text-foreground pb-20">
      {/* Header */}
      <div className="bg-card border-b border-border p-4">
        <div className="max-w-md mx-auto flex items-center gap-3">
          <button onClick={() => router.back()} className="p-2 hover:bg-muted rounded-full">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-xl font-bold">{t('transfer.title')}</h1>
        </div>
      </div>

      <div className="max-w-md mx-auto p-4 space-y-6 mt-6">
        {/* Direction Selector */}
        <div className="bg-card border border-border rounded-xl p-6">
          <h2 className="text-sm font-medium text-muted-foreground mb-4">{t('wallet.transfer_direction')}</h2>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => setDirection("funding-to-trading")}
              className={`p-4 rounded-lg border-2 transition ${
                direction === "funding-to-trading"
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border hover:border-muted-foreground"
              }`}
            >
              <div className="text-sm font-semibold">{t('wallet.funding_to_trading')}</div>
            </button>
            <button
              onClick={() => setDirection("trading-to-funding")}
              className={`p-4 rounded-lg border-2 transition ${
                direction === "trading-to-funding"
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border hover:border-muted-foreground"
              }`}
            >
              <div className="text-sm font-semibold">{t('wallet.trading_to_funding')}</div>
            </button>
          </div>
        </div>

        {/* Balances */}
        <div className="bg-card border border-border rounded-xl p-6">
          <h2 className="text-sm font-medium text-muted-foreground mb-4">{t('wallet.current_balances')}</h2>
          <div className="space-y-3">
            <div className="flex justify-between items-center p-3 bg-muted/20 rounded-lg">
              <span className="text-sm font-medium">{t('wallet.funding_wallet')}</span>
              <span className="text-lg font-bold">
                {loadingBalances ? "..." : balances.funding.toFixed(2)} USDT
              </span>
            </div>
            <div className="flex justify-between items-center p-3 bg-muted/20 rounded-lg">
              <span className="text-sm font-medium">{t('wallet.trading_wallet')}</span>
              <span className="text-lg font-bold">
                {loadingBalances ? "..." : balances.trading.toFixed(2)} USDT
              </span>
            </div>
          </div>
        </div>

        {/* Transfer Form */}
        <form onSubmit={handleTransfer} className="bg-card border border-border rounded-xl p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-2">
              {t('wallet.transfer_amount')} (USDT)
            </label>
            <div className="relative">
              <input
                type="number"
                step="0.01"
                min="0"
                max={sourceBalance}
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                className="w-full p-4 pr-20 rounded-lg bg-input border border-border focus:outline-none focus:ring-2 focus:ring-primary text-lg font-semibold"
                required
              />
              <button
                type="button"
                onClick={() => setAmount(sourceBalance.toString())}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-sm font-semibold text-primary hover:text-primary/80"
              >
                {t('wallet.max')}
              </button>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              {t('transfer.available')} {sourceLabel}: {sourceBalance.toFixed(2)} USDT
            </p>
          </div>

          {/* Transfer Summary */}
          <div className="bg-muted/20 rounded-lg p-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">{t('wallet.from')}</span>
              <span className="font-semibold">{sourceLabel}</span>
            </div>
            <div className="flex justify-center">
              <ArrowLeftRight className="w-5 h-5 text-primary" />
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">{t('wallet.to')}</span>
              <span className="font-semibold">{destLabel}</span>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || !amount || parseFloat(amount) <= 0}
            className="w-full bg-linear-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white font-bold py-4 px-6 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? t('wallet.processing') : t('wallet.confirm_transfer')}
          </button>
        </form>

        {/* Info Note */}
        <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
          <p className="text-sm text-blue-400">
            <strong>ℹ️ {t('transfer.note')}</strong>
          </p>
        </div>
      </div>
    </div>
  );
}
