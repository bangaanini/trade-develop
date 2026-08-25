"use client";

import { useEffect, useState } from "react";
import { format } from "date-fns";
import { Search, RefreshCw, Check, X, Image as ImageIcon } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { toast } from "react-hot-toast";
import ProofLightbox from "@/components/admin/ProofLightbox";

export default function AdminDepositsPage() {
  const { t } = useLanguage();
  const [deposits, setDeposits] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"pending" | "all">("pending");
  const [search, setSearch] = useState("");
  const [proofSrc, setProofSrc] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    try {
      const statusParam = activeTab === "pending" ? "pending" : "all";
      const res = await fetch(`/api/admin/deposits?status=${statusParam}`);
      if (res.ok) {
        const json = await res.json();
        setDeposits(json.data || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  async function action(depositId: string, action: "approve" | "reject") {
    if(!confirm(`Are you sure you want to ${action} this deposit?`)) return;

    try {
      const res = await fetch("/api/admin/deposits/action", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ depositId, action }),
      });
      
      if(res.ok) {
        load(); 
      } else {
        toast.error("Action failed");
      }
    } catch(e) {
        toast.error("Error executing action");
    }
  }

  useEffect(() => {
    load();
  }, [activeTab]);

  const filteredDeposits = deposits.filter(d => 
    d.user_id?.toLowerCase().includes(search.toLowerCase()) ||
    d.txid?.toLowerCase().includes(search.toLowerCase()) ||
    d.email?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-linear-to-r from-yellow-400 to-orange-400">
            {t('admin.deposit_management')}
        </h1>
        
        {/* TABS */}
        <div className="flex bg-[#1f2937] p-1 rounded-lg self-start md:self-auto">
            <button
              onClick={() => setActiveTab("pending")}
              className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all ${
                activeTab === "pending" 
                  ? "bg-yellow-500 text-black shadow" 
                  : "text-gray-400 hover:text-white"
              }`}
            >
              {t('admin.pending')}
            </button>
            <button
              onClick={() => setActiveTab("all")}
              className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all ${
                activeTab === "all" 
                  ? "bg-yellow-500 text-black shadow" 
                  : "text-gray-400 hover:text-white"
              }`}
            >
              {t('admin.all_history')}
            </button>
        </div>
      </div>

      {/* TOOLBAR */}
      <div className="flex items-center justify-between gap-4 bg-[#111827] p-4 rounded-t-lg border border-gray-800 border-b-0">
          <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-500" />
              <input 
                type="text" 
                placeholder="Search by User ID or TXID..." 
                className="w-full bg-[#1f2937] border border-gray-700 rounded-lg pl-9 pr-4 py-2 text-sm text-white focus:border-yellow-500 outline-none"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
          </div>
          <button 
            onClick={load} 
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
              <th className="px-4 py-3">{t('admin.date')}</th>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">{t('admin.coin_net')}</th>
              <th className="px-4 py-3 text-right">{t('admin.amount')}</th>
              <th className="px-4 py-3">TXID / {t('admin.proof')}</th>
              <th className="px-4 py-3 text-center">{t('admin.status')}</th>
              <th className="px-4 py-3 text-right">{t('admin.action')}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800">
            {loading && deposits.length === 0 ? (
               <tr><td colSpan={7} className="text-center py-8 text-gray-500">Loading deposits...</td></tr>
            ) : filteredDeposits.length === 0 ? (
               <tr><td colSpan={7} className="text-center py-8 text-gray-500">No deposits found</td></tr>
            ) : (
                filteredDeposits.map((d) => (
                    <tr key={d.id} className="hover:bg-[#1f2937]/50 transition group">
                        <td className="px-4 py-3 text-gray-400 whitespace-nowrap">
                            {d.created_at ? format(new Date(d.created_at), "yyyy-MM-dd HH:mm") : "-"}
                        </td>
                        <td className="px-4 py-3 font-mono text-xs text-gray-300">
                            {d.email || d.user_id}
                        </td>
                        <td className="px-4 py-3">
                            <div className="flex flex-col">
                                <span className="font-bold text-white text-xs">{d.coin}</span>
                                <span className="text-[10px] text-gray-500 uppercase">{d.network}</span>
                            </div>
                        </td>
                        <td className="px-4 py-3 text-right font-medium text-green-400">
                            + {Number(d.amount).toLocaleString()}
                        </td>
                        <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                                <span className="text-xs text-gray-500 truncate max-w-[100px]" title={d.txid}>
                                    {d.txid}
                                </span>
                                {d.proof_url && (
                                    <button
                                        type="button"
                                        onClick={() => setProofSrc(`/api${d.proof_url}`)}
                                        className="text-blue-400 hover:text-blue-300"
                                        title={t('admin.view_proof')}
                                    >
                                        <ImageIcon className="w-3.5 h-3.5" />
                                    </button>
                                )}
                            </div>
                        </td>
                        <td className="px-4 py-3 text-center">
                            <StatusBadge status={d.status} t={t} />
                        </td>
                        <td className="px-4 py-3 text-right">
                            {d.status === 'pending' && (
                                <div className="flex items-center justify-end gap-2">
                                    <button
                                        onClick={() => action(d.id, "approve")}
                                        className="p-1.5 rounded bg-green-500/10 text-green-500 hover:bg-green-500 hover:text-white transition"
                                        title={t('admin.approve')}
                                    >
                                        <Check className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={() => action(d.id, "reject")}
                                        className="p-1.5 rounded bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white transition"
                                        title={t('admin.reject')}
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>
                            )}
                        </td>
                    </tr>
                ))
            )}
          </tbody>
        </table>
      </div>

      {proofSrc && (
        <ProofLightbox src={proofSrc} onClose={() => setProofSrc(null)} />
      )}
    </div>
  );
}

function StatusBadge({ status, t }: { status: string; t: any }) {
    let color = "bg-gray-500";
    if (["approved", "completed", "success"].includes(status)) color = "bg-green-500";
    else if (["rejected", "failed", "cancelled"].includes(status)) color = "bg-red-500";
    else if (["pending", "processing"].includes(status)) color = "bg-yellow-500";
    
    // Map status to translated
    let label = status;
    if(status === 'pending') label = t?.('admin.pending') || 'Pending';
    if(status === 'approved' || status === 'completed') label = t?.('admin.approved') || 'Approved';
    if(status === 'rejected' || status === 'failed') label = t?.('admin.rejected') || 'Rejected';

    return (
        <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold text-white shadow-sm ${color}`}>
            {label}
        </span>
    );
}
