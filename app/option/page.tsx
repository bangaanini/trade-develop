"use client";

import { useEffect, useState } from "react";
import OptionHeader from "@/components/option/OptionHeader";
import OptionPanel from "@/components/option/OptionPanel";
import OptionHistory from "@/components/option/OptionHistory";
import OptionChart from "@/components/option/OptionChart";
import CoinSidebar from "@/components/option/CoinSidebar";

export default function OptionTradingPage() {
  const [coins, setCoins] = useState<any[]>([]);
  const [active, setActive] = useState("BTC");
  const [showHistory, setShowHistory] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  // Settings dari database
  const [settings, setSettings] = useState<any>(null);
  const [activePairs, setActivePairs] = useState<string[]>([]);
  const [loadingSettings, setLoadingSettings] = useState(true);

  async function loadSettings() {
    try {
      const res = await fetch("/api/option/settings");
      const json = await res.json();

      if (json.success) {
        setSettings(json.settings);
        
        // Ambil list symbol yang aktif
        const pairSymbols = json.pairs?.map((p: any) => p.symbol) || [];
        setActivePairs(pairSymbols);
        
        // Set default active ke BTC jika ada, jika tidak pair pertama
        if (pairSymbols.includes("BTC")) {
          setActive("BTC");
        } else if (pairSymbols.length > 0) {
          setActive(pairSymbols[0]);
        }
      }
    } catch (err) {
      console.error("Failed to load settings:", err);
    } finally {
      setLoadingSettings(false);
    }
  }

  async function load() {
    const r = await fetch("/api/market");
    const j = await r.json();
    setCoins(j.data);
  }

  useEffect(() => {
    loadSettings();
    load();
    const id = setInterval(load, 5000);
    return () => clearInterval(id);
  }, []);

  // Filter coins berdasarkan active pairs dari database
  const filteredCoins = coins.filter(c => activePairs.includes(c.symbol));
  const current = filteredCoins.find((c) => c.symbol === active);

  // Jika option trading disabled, tampilkan notifikasi
  if (!loadingSettings && settings && !settings.is_enabled) {
    return (
      <div className="min-h-screen bg-background text-foreground pt-15 p-4 flex items-center justify-center">
        <div className="bg-red-500/20 border border-red-500 rounded-lg p-8 max-w-md text-center">
          <h2 className="text-2xl font-bold mb-4">Option Trading Disabled</h2>
          <p className="text-gray-300">
            Option trading is currently disabled by the administrator. Please check back later.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground md:pt-15 p-4">
      {/* Coin Sidebar for Mobile */}
      <CoinSidebar
        coins={filteredCoins}
        active={active}
        setActive={setActive}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* HEADER: Trading Pairs Selection */}
      <OptionHeader 
        coins={filteredCoins} 
        active={active} 
        setActive={setActive}
        onMobileMenuClick={() => setSidebarOpen(true)}
      />

      {/* STATS */}
      

      {/* MAIN TRADING AREA */}
      
      {/* DESKTOP LAYOUT (unchanged) */}
      <div className="hidden lg:grid grid-cols-12 gap-4 mt-6">
        <div className="col-span-12 lg:col-span-8">
          <div className="relative h-[400px] bg-card rounded-lg overflow-hidden border border-border shadow-md mb-6">
            <OptionChart symbol={active} />
          </div>

          <OptionHistory currentPrice={current?.price || 0} />
        </div>

        <div className="col-span-12 lg:col-span-4">
          <OptionPanel symbol={active} />
        </div>
      </div>

      {/* MOBILE LAYOUT */}
      <div className="lg:hidden">
        {/* TradingView Chart */}
        <div className="mt-6 mb-4">
           <div className="relative h-[350px] bg-card rounded-lg overflow-hidden border border-border">
             <OptionChart symbol={active} />
           </div>
        </div>

        {/* Trading Panel */}
        <div className="mb-4">
          <OptionPanel symbol={active} />
        </div>

        {/* History at Bottom */}
        <div className="mb-20">
          <OptionHistory currentPrice={current?.price || 0} />
        </div>
      </div>
    </div>
  );
}
