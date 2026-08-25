"use client";

import { useEffect, useState } from "react";
import { useAdmin } from "@/components/admin/AdminContext";
import { Settings, DollarSign, Clock, ArrowRightLeft, Save, Plus, Trash2 } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { toast } from "react-hot-toast";

interface OptionSettings {
  id: string;
  min_amount: number;
  max_amount: number;
  is_enabled: boolean;
}

interface Duration {
  id: string;
  seconds: number;
  is_active: boolean;
  payout_percent: number;
  min_amount: number;
}

interface Pair {
  id: string;
  symbol: string;
  is_active: boolean;
}

export default function AdminOptionSettingsPage() {
  const { role } = useAdmin();
  const { t } = useLanguage();
  const [settings, setSettings] = useState<OptionSettings | null>(null);
  const [durations, setDurations] = useState<Duration[]>([]);
  const [pairs, setPairs] = useState<Pair[]>([]);
  const [allCoins, setAllCoins] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [syncing, setSyncing] = useState(false);
  
  // New duration form
  const [newDuration, setNewDuration] = useState({
    seconds: 60,
    payout_percent: 80,
    min_amount: 10
  });

  async function load() {
    const res = await fetch("/api/admin/option/settings");
    const json = await res.json();

    setSettings(json.settings);
    setDurations(json.durations || []);
    setPairs(json.pairs || []);
  }

  async function loadAllCoins() {
    const res = await fetch("/api/market");
    const json = await res.json();
    setAllCoins(json.data || []);
  }

  useEffect(() => {
    load();
    loadAllCoins();
  }, []);

  async function syncPairs() {
    setSyncing(true);
    try {
      const res = await fetch("/api/admin/option/sync-pairs", {
        method: "POST",
      });
      const json = await res.json();
      
      if (json.success) {
        toast.success(json.message);
        await load();
      } else {
        toast.error("Failed to sync pairs");
      }
    } catch (err) {
      toast.error("Error syncing pairs");
    } finally {
      setSyncing(false);
    }
  }

  async function saveAll() {
    if (!settings) return;
    setLoading(true);

    try {
      await fetch("/api/admin/option/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          settings,
          durations,
          pairs,
        }),
      });

      toast.success("✅ Settings saved successfully!");
      await load();
    } catch (err) {
      toast.error("❌ Failed to save settings");
    } finally {
      setLoading(false);
    }
  }

  function togglePair(symbol: string, active: boolean) {
    const existingPair = pairs.find((p) => p.symbol === symbol);
    
    if (existingPair) {
      setPairs(
        pairs.map((p) =>
          p.symbol === symbol ? { ...p, is_active: active } : p
        )
      );
    } else {
      setPairs([
        ...pairs,
        {
          id: `temp-${symbol}`,
          symbol,
          is_active: active,
        },
      ]);
    }
  }

  function updateDuration(id: string, field: string, value: any) {
    setDurations(
      durations.map((d) =>
        d.id === id ? { ...d, [field]: value } : d
      )
    );
  }

  function addDuration() {
    if (!newDuration.seconds || newDuration.seconds <= 0) {
      toast.error("Please enter valid duration in seconds");
      return;
    }

    const tempId = `temp-${Date.now()}`;
    setDurations([
      ...durations,
      {
        id: tempId,
        seconds: newDuration.seconds,
        payout_percent: newDuration.payout_percent,
        min_amount: newDuration.min_amount,
        is_active: true,
      },
    ]);

    // Reset form
    setNewDuration({
      seconds: 60,
      payout_percent: 80,
      min_amount: 10
    });
  }

  function removeDuration(id: string) {
    if (confirm("Remove this duration?")) {
      setDurations(durations.filter((d) => d.id !== id));
    }
  }

  if (role !== "superadmin") {
    return <div className="text-red-400 p-6">Access denied</div>;
  }

  if (!settings) {
    return <div className="text-gray-500 p-8 flex items-center gap-2 animate-pulse">Loading settings...</div>;
  }

  return (
    <div className="space-y-6 pb-24">
      {/* HEADER */}
      <div className="flex flex-col">
        <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-linear-to-r from-yellow-400 to-orange-400">
          {t('admin.option_settings_title')}
        </h1>
        <p className="text-sm text-gray-400 mt-1">{t('admin.option_settings_desc')}</p>
      </div>

      {/* 1. ENABLE/DISABLE TOGGLE */}
      <div className="bg-[#111827] p-6 rounded-lg border border-gray-800 shadow-sm">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-full ${settings.is_enabled ? 'bg-green-500/10 text-green-500' : 'bg-gray-800 text-gray-400'}`}>
                <Settings className="w-5 h-5" />
            </div>
            <div>
                <div className="font-semibold text-white">{t('admin.enable_option_trading')}</div>
                <div className="text-xs text-gray-400 mt-0.5">
                {t('admin.enable_option_desc')}
                </div>
            </div>
          </div>

          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={settings.is_enabled}
              onChange={(e) =>
                setSettings({ ...settings, is_enabled: e.target.checked })
              }
              className="sr-only peer"
            />
            <div className="w-14 h-7 bg-gray-700 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-yellow-500/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-yellow-500"></div>
          </label>
        </div>
      </div>

      {/* ADD NEW DURATION - Full Width */}
      <div className="bg-[#111827] p-6 rounded-lg border border-gray-800 shadow-sm">
        <h3 className="font-semibold text-lg mb-6 flex items-center gap-2 text-white border-b border-gray-800 pb-2">
          <Plus className="w-5 h-5 text-yellow-500" />
          {t('admin.add_new_duration')}
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="text-xs text-gray-400 block mb-1.5 uppercase font-medium">{t('admin.duration_seconds')}</label>
            <input
              type="number"
              value={newDuration.seconds}
              onChange={(e) => setNewDuration({...newDuration, seconds: Number(e.target.value)})}
              className="w-full bg-[#1f2937] p-2.5 rounded-lg border border-gray-700 focus:border-yellow-500 focus:outline-none text-white text-sm"
            />
          </div>

          <div>
            <label className="text-xs text-gray-400 block mb-1.5 uppercase font-medium">{t('admin.payout_percent')}</label>
            <input
              type="number"
              step="0.01"
              value={newDuration.payout_percent}
              onChange={(e) => setNewDuration({...newDuration, payout_percent: Number(e.target.value)})}
              className="w-full bg-[#1f2937] p-2.5 rounded-lg border border-gray-700 focus:border-yellow-500 focus:outline-none text-white text-sm"
            />
          </div>

          <div>
            <label className="text-xs text-gray-400 block mb-1.5 uppercase font-medium">{t('admin.min_amount')}</label>
            <input
              type="number"
              value={newDuration.min_amount}
              onChange={(e) => setNewDuration({...newDuration, min_amount: Number(e.target.value)})}
              className="w-full bg-[#1f2937] p-2.5 rounded-lg border border-gray-700 focus:border-yellow-500 focus:outline-none text-white text-sm"
            />
          </div>
        </div>

        <button
          onClick={addDuration}
          className="w-full mt-4 bg-yellow-500 hover:bg-yellow-600 text-black font-semibold py-2.5 rounded-lg transition flex items-center justify-center gap-2"
        >
          <Plus className="w-4 h-4" />
          {t('admin.add_duration_btn')}
        </button>
      </div>

      {/* 4. DURATIONS LIST */}
      <div className="bg-[#111827] p-6 rounded-lg border border-gray-800 shadow-sm">
        <h3 className="font-semibold text-lg mb-6 flex items-center gap-2 text-white border-b border-gray-800 pb-2">
          <Clock className="w-5 h-5 text-yellow-500" />
          {t('admin.manage_durations')}
        </h3>

        <div className="space-y-2">
          {durations.map((d) => (
            <div
              key={d.id}
              className={`flex items-center gap-3 p-4 rounded-lg border transition-all ${d.is_active ? 'bg-[#1f2937] border-gray-700' : 'bg-[#111827] border-gray-800 opacity-60'}`}
            >
              <input
                type="checkbox"
                checked={d.is_active}
                onChange={(e) =>
                  updateDuration(d.id, "is_active", e.target.checked)
                }
                className="w-4 h-4 cursor-pointer accent-yellow-500 rounded"
              />

              <span className="font-mono text-sm w-20 text-yellow-400 font-bold">{d.seconds}s</span>

              <div className="flex-1 grid grid-cols-2 gap-3">
                <div className="flex items-center gap-2">
                  <label className="text-xs text-gray-500 uppercase font-medium whitespace-nowrap">Payout:</label>
                  <div className="relative flex-1">
                    <input
                        type="number"
                        step="0.01"
                        value={d.payout_percent}
                        onChange={(e) =>
                        updateDuration(
                            d.id,
                            "payout_percent",
                            Number(e.target.value)
                        )
                        }
                        className="w-full bg-[#111827] p-1.5 pr-6 rounded border border-gray-600 focus:border-yellow-500 focus:outline-none text-sm text-right text-white"
                        disabled={!d.is_active}
                    />
                    <span className="absolute right-2 top-1.5 text-xs text-gray-500">%</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <label className="text-xs text-gray-500 uppercase font-medium whitespace-nowrap">Min:</label>
                  <div className="relative flex-1">
                    <span className="absolute left-2 top-1.5 text-xs text-gray-500">$</span>
                    <input
                        type="number"
                        value={d.min_amount}
                        onChange={(e) =>
                        updateDuration(
                            d.id,
                            "min_amount",
                            Number(e.target.value)
                        )
                        }
                        className="w-full bg-[#111827] p-1.5 pl-6 rounded border border-gray-600 focus:border-yellow-500 focus:outline-none text-sm text-right text-white"
                        disabled={!d.is_active}
                    />
                  </div>
                </div>
              </div>

              <button
                onClick={() => removeDuration(d.id)}
                className="p-2 hover:bg-red-500/20 text-red-500 rounded transition"
                title="Remove duration"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>

        {durations.length === 0 && (
          <div className="text-center text-gray-500 py-8">
            No durations configured. Add one above!
          </div>
        )}
      </div>

      {/* 5. TRADING PAIRS */}
      <div className="bg-[#111827] p-6 rounded-lg border border-gray-800 shadow-sm">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4 border-b border-gray-800 pb-4">
          <div className="flex items-center gap-2">
               <ArrowRightLeft className="w-5 h-5 text-yellow-500" />
               <h3 className="font-semibold text-lg text-white">{t('admin.trading_pairs')}</h3>
          </div>

          <button
            onClick={syncPairs}
            disabled={syncing}
            className="px-3 py-1.5 bg-[#1f2937] hover:bg-gray-700 text-gray-300 rounded-lg flex items-center gap-2 disabled:opacity-50 transition text-xs border border-gray-700"
          >
            <span>{syncing ? "⏳" : "🔄"}</span>
            {syncing ? "Syncing..." : t('admin.sync_markets')}
          </button>
        </div>

        <div className="text-sm text-gray-400 mb-4">
          Select which trading pairs are available for users.
        </div>

        {allCoins.length === 0 ? (
          <div className="text-center text-gray-500 py-12 flex flex-col items-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-500 mb-2"></div>
            Loading market pairs...
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {allCoins.map((coin) => {
              const pair = pairs.find((p) => p.symbol === coin.symbol);
              const isActive = pair?.is_active || false;

              return (
                <label
                  key={coin.symbol}
                  className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all hover:bg-[#1f2937] ${
                    isActive
                      ? "bg-yellow-500/10 border-yellow-500/40 text-white"
                      : "bg-[#111827] border-gray-800 text-gray-500"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={isActive}
                    onChange={(e) =>
                      togglePair(coin.symbol, e.target.checked)
                    }
                    className="w-4 h-4 cursor-pointer accent-yellow-500 rounded"
                  />
                  <span className={`text-xs font-semibold ${isActive ? 'text-yellow-500' : ''}`}>
                    {coin.symbol}/USDT
                  </span>
                </label>
              );
            })}
          </div>
        )}
      </div>

      {/* SAVE BUTTON (Sticky) */}
      <div className="fixed bottom-6 right-6 z-50">
        <button
            onClick={saveAll}
            disabled={loading}
            className="px-6 py-3 bg-yellow-500 text-black font-bold rounded-full shadow-lg hover:bg-yellow-400 hover:shadow-yellow-500/20 disabled:opacity-50 transition flex items-center gap-2 text-base transform hover:-translate-y-1"
        >
            {loading ? <div className="animate-spin h-5 w-5 border-2 border-black border-t-transparent rounded-full"/> : <Save className="w-5 h-5" />}
            {loading ? t('admin.saving') : t('admin.save_changes')}
        </button>
      </div>
    </div>
  );
}

