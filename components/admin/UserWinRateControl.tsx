"use client";

import { useState } from "react";
import { toast } from "react-hot-toast";
import { Settings, Save } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

export default function UserWinRateControl({ userId, initialWinRate = 0 }: { userId: string, initialWinRate: number }) {
  const { t } = useLanguage();
  const [winRate, setWinRate] = useState(initialWinRate);
  const [loading, setLoading] = useState(false);

  async function saveWinRate() {
    setLoading(true);
    try {
        const res = await fetch("/api/admin/users/winrate", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ userId, winRate: Number(winRate) }),
        });
        const json = await res.json();
        
        if (json.success) {
            toast.success("Win rate updated successfully");
        } else {
            toast.error(json.error || "Failed to update win rate");
        }
    } catch (e) {
        toast.error("Error saving win rate");
    } finally {
        setLoading(false);
    }
  }

  return (
    <div className="bg-[#111827] border border-gray-800 rounded-lg p-6 shadow-sm">
        <h3 className="text-white font-bold mb-4 flex items-center gap-2">
            <Settings className="w-5 h-5 text-yellow-500" />
            User Win Rate
        </h3>
        
        <div className="space-y-4">
            <div>
                <label className="block text-sm font-bold text-gray-400 mb-2">Target Win Probability (%)</label>
                <input 
                    type="number" 
                    min="0" 
                    max="100" 
                    value={winRate}
                    onChange={(e) => setWinRate(Number(e.target.value))}
                    className="w-full bg-[#1f2937] border border-gray-700 rounded-lg p-3 text-white focus:border-yellow-500 outline-none font-mono font-bold"
                />
            </div>
            
            <p className="text-xs text-gray-500">
                0% = No manipulation (Fair Market). <br/>
                &gt;0% = System attempts to force a win with this probability.
            </p>

            <button 
                onClick={saveWinRate}
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-lg bg-yellow-500 text-black hover:bg-yellow-400 font-bold transition disabled:opacity-50"
            >
                {loading ? "Saving..." : "Update Win Rate"}
                {!loading && <Save className="w-4 h-4" />}
            </button>
        </div>
    </div>
  );
}
