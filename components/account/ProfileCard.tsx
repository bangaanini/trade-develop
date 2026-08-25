"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, ArrowRight, Mail } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

export default function ProfileCard() {
  const { t } = useLanguage();
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [wallets, setWallets] = useState<any[]>([]);
  const [hideBalance, setHideBalance] = useState(false);
  const [totalUSDT, setTotalUSDT] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadWallets() {
      try {
        // First, get current user
        const userRes = await fetch("/api/auth/me");
        if (!userRes.ok) {
          setLoading(false);
          return;
        }
        const userData = await userRes.json();
        if (!userData.user || !userData.user.id) {
          setLoading(false);
          return;
        }
        
        setUser(userData.user); // Save user data
        const userId = userData.user.id;
        
        // Fetch wallets for this user (both funding and trading)
        const walletRes = await fetch(`/api/wallets?userId=${userId}`);
        if (!walletRes.ok) {
          setLoading(false);
          return;
        }
        const walletData = await walletRes.json();
        const wallets = walletData.data || [];
        setWallets(wallets);

        // Fetch market prices
        const marketRes = await fetch("/api/market");
        if (!marketRes.ok) {
          setLoading(false);
          return;
        }
        const marketData = await marketRes.json();
        const prices = marketData.data || [];

        // Calculate total in USDT from BOTH funding and trading wallets
        let total = 0;
        
        wallets.forEach((wallet: any) => {
          const balance = parseFloat(wallet.balance || 0);
          
          if (wallet.coin === 'USDT') {
            // USDT is already in USDT, just add directly (from both wallet types)
            total += balance;
          } else {
            // Find price for this coin
            const coinData = prices.find((p: any) => p.symbol === wallet.coin);
            if (coinData && coinData.price) {
              const priceInUSDT = parseFloat(coinData.price);
              total += balance * priceInUSDT;
            }
          }
        });
        
        setTotalUSDT(total);
      } catch (e) {
        console.error("Failed to load wallets", e);
      } finally {
        setLoading(false);
      }
    }
    loadWallets();
    
    // Refresh every 10 seconds
    const interval = setInterval(loadWallets, 10000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="sticky top-0 z-10 bg-background pb-4">
      <div className="bg-linear-to-br from-[#1a1f2e] to-[#111827] p-6 rounded-xl border border-gray-700">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-full bg-linear-to-br from-yellow-400 to-orange-500 flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">{t('account.coin_account')}</h2>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-xs text-gray-400 bg-gray-800 px-2 py-0.5 rounded">
                  UID: {user?.uid || '...'}
                </span>
                {user?.email && (
                  <div className="flex items-center gap-1">
                    <Mail className="w-3 h-3 text-gray-400" />
                    <p className="text-xs text-gray-400">{user.email}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          <button
            onClick={() => setHideBalance(!hideBalance)}
            className="p-2 hover:bg-white/10 rounded-full transition"
          >
            {hideBalance ? (
              <EyeOff className="w-5 h-5 text-gray-400" />
            ) : (
              <Eye className="w-5 h-5 text-gray-400" />
            )}
          </button>
        </div>

        {/* Total Assets */}
        <div className="mb-6">
          <p className="text-gray-400 text-sm mb-1">{t('account.total_assets')} (USDT)</p>
          <div className="flex items-baseline gap-2">
            {loading ? (
              <div className="h-8 w-32 bg-gray-700 animate-pulse rounded"></div>
            ) : (
              <p className="text-3xl font-bold text-white">
                {hideBalance ? "****" : totalUSDT.toFixed(2)}
              </p>
            )}
            <span className="text-gray-400 text-sm">USDT</span>
          </div>
        </div>

        {/* Wallet Button */}
        <button
          onClick={() => router.push("/wallet")}
          className="w-full bg-linear-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white font-semibold py-3 px-4 rounded-lg transition flex items-center justify-between group"
        >
          <span>{t('account.view_wallet')}</span>
          <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
        </button>
      </div>
    </div>
  );
}
