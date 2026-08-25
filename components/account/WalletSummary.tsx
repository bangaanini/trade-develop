"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useLanguage } from "@/context/LanguageContext";

export default function WalletSummary() {
  const { t } = useLanguage();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"funding" | "trading">("funding");
  const [wallets, setWallets] = useState<any[]>([]);
  const [marketCoins, setMarketCoins] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  async function loadData() {
    try {
      setLoading(true);
      
      // 1. Get User
      const authRes = await fetch("/api/auth/me");
      if (!authRes.ok) return;
      const authData = await authRes.json();
      if (!authData.user) return;

      // 2. Get Wallets
      const wRes = await fetch(`/api/wallets?userId=${authData.user.id}`);
      const wJson = await wRes.json();
      setWallets(wJson.data || []);

      // 3. Get Market Coins
      const mRes = await fetch("/api/market");
      const mJson = await mRes.json();
      setMarketCoins(mJson.data || []);

    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  // Helper to get coin image path
  const getCoinImage = (symbol: string) => {
    const symbolLower = symbol.toLowerCase();
    // Map USDT to theter.png as per uploaded file
    if (symbolLower === 'usdt') return '/coins/theter.png';
    // For other coins, use the symbol directly
    return `/coins/${symbolLower}.png`;
  };

  // Helper to find wallet balance by type (case-insensitive)
  const getBalance = (symbol: string, walletType: 'funding' | 'trading') => {
    const w = wallets.find((x) => 
      x.coin.toUpperCase() === symbol.toUpperCase() && x.wallet_type === walletType
    );
    return w ? { balance: Number(w.balance), frozen: Number(w.frozen_balance) } : { balance: 0, frozen: 0 };
  };

  return (
    <div className="bg-card border border-border rounded-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold">{t('wallet.my_wallet')}</h2>
        {/* Quick Actions (Deposit/Withdraw) always visible? Or inside tabs? User said "Wallet Funding shows coins... Wallet Trading shows USDT". Actions probably global. */}
        <div className="flex gap-2">
            <Link href="/deposit" className="px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-black font-semibold rounded text-sm transition">
                {t('common.deposit')}
            </Link>
            <Link href="/withdraw" className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white font-semibold rounded text-sm transition">
                {t('common.withdraw')}
            </Link>
        </div>
      </div>

      {/* TABS */}
      <div className="flex border-b border-border mb-4">
        <button
          onClick={() => setActiveTab("funding")}
          className={`px-6 py-2 text-sm font-semibold border-b-2 transition-colors ${
            activeTab === "funding"
              ? "border-yellow-500 text-yellow-500"
              : "border-transparent text-muted-foreground hover:text-white"
          }`}
        >
          {t('wallet.funding_wallet')}
        </button>
        <button
          onClick={() => setActiveTab("trading")}
          className={`px-6 py-2 text-sm font-semibold border-b-2 transition-colors ${
            activeTab === "trading"
              ? "border-yellow-500 text-yellow-500"
              : "border-transparent text-muted-foreground hover:text-white"
          }`}
        >
          {t('wallet.trading_wallet')}
        </button>
      </div>

      {/* CONTENT */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="text-muted-foreground border-b border-border/50">
            <tr>
              <th className="text-left py-3">{t('wallet.coin')}</th>
              <th className="text-right py-3">{t('wallet.balance')}</th>
              <th className="text-right py-3">{t('wallet.frozen')}</th>
              <th className="text-right py-3">{t('wallet.action')}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/30">
            {loading && (
              <tr>
                <td colSpan={4} className="py-8 text-center text-muted-foreground">
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                    <span>{t('wallet.loading_wallets')}</span>
                  </div>
                </td>
              </tr>
            )}

            {!loading && activeTab === "funding" && (
                <>
                {/* USDT always first */}
                <FundingRow 
                    symbol="USDT" 
                    name="Tether" 
                    data={getBalance("USDT", "funding")} 
                    getCoinImage={getCoinImage}
                    onTrade={() => router.push("/spot?symbol=BTC")}
                />

                {/* Other market coins */}
                {marketCoins.map((coin) => {
                    const data = getBalance(coin.symbol, "funding");
                    return (
                        <FundingRow 
                            key={coin.symbol}
                            symbol={coin.symbol}
                            name={coin.name || coin.symbol}
                            data={data}
                            getCoinImage={getCoinImage}
                            onTrade={() => router.push(`/spot?symbol=${coin.symbol}`)}
                        />
                    );
                })}
                
                {/* Show empty state if no data */}
                {wallets.filter(w => w.wallet_type === 'funding').length === 0 && (
                  <tr>
                    <td colSpan={4} className="py-8 text-center text-muted-foreground">
                      <p>{t('wallet.no_funding_wallet')}</p>
                    </td>
                  </tr>
                )}
                </>
            )}

            {!loading && activeTab === "trading" && (
                <>
                <tr className="hover:bg-muted/10 transition">
                    <td className="py-4">
                        <div className="flex items-center gap-2">
                           <Image 
                              src={getCoinImage("USDT")} 
                              alt="USDT" 
                              width={32} 
                              height={32} 
                              className="rounded-full"
                           />
                           <div>
                              <div className="font-bold text-base">USDT</div>
                              <div className="text-xs text-muted-foreground">Tether</div>
                           </div>
                        </div>
                    </td>
                    <td className="text-right font-medium text-base">
                        {getBalance("USDT", "trading").balance.toLocaleString()}
                    </td>
                    <td className="text-right text-muted-foreground">
                        {getBalance("USDT", "trading").frozen.toLocaleString()}
                    </td>
                    <td className="text-right">
                        <button 
                            onClick={() => router.push("/option")}
                            className="bg-primary/20 hover:bg-primary/30 text-primary px-3 py-1.5 rounded text-xs font-semibold transition"
                        >
                            {t('wallet.trade_option')}
                        </button>
                    </td>
                </tr>
                
                {/* Show empty state if no data */}
                {getBalance("USDT", "trading").balance === 0 && (
                  <tr>
                    <td colSpan={4} className="py-4 text-center text-muted-foreground text-sm">
                      <p>{t('wallet.no_trading_balance')}</p>
                    </td>
                  </tr>
                )}
                </>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function FundingRow({ symbol, name, data, getCoinImage, onTrade }: any) {
    const { t } = useLanguage();
    return (
        <tr className="hover:bg-muted/10 transition">
            <td className="py-4">
                <div className="flex items-center gap-2">
                    <Image 
                        src={getCoinImage(symbol)} 
                        alt={symbol} 
                        width={32} 
                        height={32} 
                        className="rounded-full"
                        onError={(e) => {
                            // Fallback to placeholder if image not found
                            (e.target as HTMLImageElement).style.display = 'none';
                        }}
                    />
                    <div>
                        <div className="font-bold">{symbol}</div>
                    </div>
                </div>
            </td>
            <td className="text-right font-medium">
                {data.balance > 0 ? data.balance.toLocaleString() : <span className="text-muted-foreground opacity-50">0</span>}
            </td>
            <td className="text-right text-muted-foreground">
                {data.frozen > 0 ? data.frozen.toLocaleString() : "-"}
            </td>
            <td className="text-right">
                {symbol !== "USDT" && (
                    <button 
                        onClick={onTrade}
                        className="bg-blue-600/20 hover:bg-blue-600/40 text-blue-400 px-3 py-1.5 rounded text-xs font-semibold transition"
                    >
                        {t('wallet.trade_spot')}
                    </button>
                )}
            </td>
        </tr>
    )
}
