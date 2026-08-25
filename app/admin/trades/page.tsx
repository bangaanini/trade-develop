"use client";

import { useEffect, useState } from "react";
import { format } from "date-fns";
import { Search, RefreshCw, BarChart2, History, User } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

type Trade = {
  id: string;
  email: string;
  amount: number;
  duration: number;
  status: string;
  created_at: string;
  symbol: string;
};

type WinRateLog = {
  id: string;
  admin_email: string;
  details: any;
  created_at: string;
};

export default function TradePage() {
  const { t } = useLanguage();
  const [trades, setTrades] = useState<Trade[]>([]);
  const [logs, setLogs] = useState<WinRateLog[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [tab, setTab] = useState<'trades' | 'logs'>('trades');

  async function loadData() {
    setLoading(true);
    try {
      const [resTrades, resLogs] = await Promise.all([
         fetch("/api/admin/trades"),
         fetch("/api/admin/logs/winrate")
      ]);

      const dataTrades = await resTrades.json();
      const dataLogs = await resLogs.json();

      setTrades(dataTrades.data || []);
      setLogs(dataLogs.data || []);
    } catch (err) {
      console.error("Error fetching data:", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  const filteredTrades = trades.filter(t => 
      t.email?.toLowerCase().includes(search.toLowerCase()) ||
      t.status?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-linear-to-r from-yellow-400 to-orange-400">
          Trade Management
        </h1>
        <div className="flex gap-2">
            <button 
                onClick={() => setTab('trades')}
                className={`px-4 py-2 rounded-lg text-sm font-bold transition flex items-center gap-2 ${tab === 'trades' ? 'bg-yellow-500 text-black' : 'bg-gray-800 text-gray-400 hover:text-white'}`}
            >
                <BarChart2 className="w-4 h-4" />
                Trades
            </button>
            <button 
                onClick={() => setTab('logs')}
                className={`px-4 py-2 rounded-lg text-sm font-bold transition flex items-center gap-2 ${tab === 'logs' ? 'bg-yellow-500 text-black' : 'bg-gray-800 text-gray-400 hover:text-white'}`}
            >
                <History className="w-4 h-4" />
                Win/Lose Logs
            </button>
        </div>
      </div>

      {tab === 'trades' && (
        <>
            {/* TOOLBAR */}
            <div className="flex items-center justify-between gap-4 bg-[#111827] p-4 rounded-t-lg border border-gray-800 border-b-0">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-500" />
                    <input 
                        type="text" 
                        placeholder="Search by email..." 
                        className="w-full bg-[#1f2937] border border-gray-700 rounded-lg pl-9 pr-4 py-2 text-sm text-white focus:border-yellow-500 outline-none"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
                <button 
                    onClick={loadData} 
                    className="p-2 bg-[#1f2937] border border-gray-700 rounded hover:bg-gray-700 transition text-gray-400 hover:text-white"
                    title="Refresh"
                >
                    <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
                </button>
            </div>

            {/* TABLE */}
            <div className="overflow-x-auto border border-gray-800 rounded-b-lg border-t-0 -mt-6">
                <table className="w-full text-sm text-left bg-[#111827]">
                <thead className="bg-[#1f2937] text-gray-400 uppercase text-xs">
                    <tr>
                    <th className="px-4 py-3">Email</th>
                    <th className="px-4 py-3 text-right">Amount</th>
                    <th className="px-4 py-3 text-center">Duration</th>
                    <th className="px-4 py-3 text-center">Status</th>
                    <th className="px-4 py-3 text-right">Date</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-800">
                    {loading && trades.length === 0 ? (
                        <tr><td colSpan={5} className="text-center py-8 text-gray-500">Loading trades...</td></tr>
                    ) : filteredTrades.length === 0 ? (
                        <tr><td colSpan={5} className="text-center py-8 text-gray-500">No trades found</td></tr>
                    ) : (
                        filteredTrades.map((trade) => (
                            <tr key={trade.id} className="hover:bg-[#1f2937]/50 transition border-b border-gray-800 last:border-0">
                                <td className="px-4 py-3">
                                    <div className="flex items-center gap-2">
                                        <div className="w-6 h-6 rounded-full bg-gray-800 flex items-center justify-center text-gray-500">
                                            <User className="w-3 h-3" />
                                        </div>
                                        <span className="text-white">{trade.email}</span>
                                    </div>
                                </td>
                                <td className="px-4 py-3 text-right font-mono text-white">
                                    ${Number(trade.amount).toFixed(2)}
                                </td>
                                <td className="px-4 py-3 text-center text-gray-400">
                                    {trade.duration}s
                                </td>
                                <td className="px-4 py-3 text-center">
                                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                                        trade.status === 'win' 
                                            ? "bg-green-500/10 text-green-500 border-green-500/20" 
                                            : trade.status === 'loss' 
                                            ? "bg-red-500/10 text-red-500 border-red-500/20"
                                            : "bg-gray-500/10 text-gray-500 border-gray-500/20"
                                    }`}>
                                        {trade.status?.toUpperCase()}
                                    </span>
                                </td>
                                <td className="px-4 py-3 text-right text-gray-500 text-xs">
                                    {format(new Date(trade.created_at), "MMM dd, HH:mm")}
                                </td>
                            </tr>
                        ))
                    )}
                </tbody>
                </table>
            </div>
        </>
      )}

      {tab === 'logs' && (
          <div className="border border-gray-800 rounded-lg overflow-hidden">
             <div className="bg-[#1f2937] px-4 py-3 border-b border-gray-800 flex justify-between items-center">
                <h3 className="font-bold text-gray-300 flex items-center gap-2">
                    <History className="w-4 h-4 text-yellow-500" />
                    Win Rate Change History
                </h3>
                <button onClick={loadData} className="text-gray-500 hover:text-white"><RefreshCw className="w-3.5 h-3.5" /></button>
             </div>
             <div className="divide-y divide-gray-800 bg-[#111827]">
                {logs.length === 0 ? (
                    <div className="p-8 text-center text-gray-500 text-sm">No history logs found</div>
                ) : (
                    logs.map(log => (
                        <div key={log.id} className="p-4 flex items-start justify-between hover:bg-[#1f2937]/30 transition">
                            <div>
                                <p className="text-sm text-gray-300">
                                    <span className="text-yellow-500 font-bold">{log.admin_email}</span> changed winrate for <span className="text-white font-bold">{log.details.target_user}</span>
                                </p>
                                <p className="text-xs text-gray-500 mt-1">
                                    Changed from <span className="text-red-400">{log.details.old_win_rate}%</span> to <span className="text-green-400">{log.details.new_win_rate}%</span>
                                </p>
                            </div>
                            <span className="text-[10px] text-gray-600 font-mono">
                                {format(new Date(log.created_at), "yyyy-MM-dd HH:mm:ss")}
                            </span>
                        </div>
                    ))
                )}
             </div>
          </div>
      )}

    </div>
  );
}
