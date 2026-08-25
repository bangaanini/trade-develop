"use client";

import { useState, useEffect } from "react";
import Accordion from "@/components/ui/Accordion";
import { Search, ChevronLeft, ChevronRight, RefreshCw } from "lucide-react";
import { format } from "date-fns";
import { useLanguage } from "@/context/LanguageContext";
import ProofLightbox from "@/components/admin/ProofLightbox";

export default function TransactionsPage() {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState<"trading" | "wallet">("trading");

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-linear-to-r from-yellow-400 to-orange-400">
        {t('admin.transactions')}
      </h1>

      {/* TABS */}
      <div className="flex border-b border-gray-800">
        <button
          onClick={() => setActiveTab("trading")}
          className={`px-6 py-3 font-medium text-sm transition-colors relative ${
            activeTab === "trading"
              ? "text-yellow-400"
              : "text-gray-400 hover:text-white"
          }`}
        >
          {t('admin.trading_tab')}
          {activeTab === "trading" && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-yellow-400" />
          )}
        </button>
        <button
          onClick={() => setActiveTab("wallet")}
          className={`px-6 py-3 font-medium text-sm transition-colors relative ${
            activeTab === "wallet"
              ? "text-yellow-400"
              : "text-gray-400 hover:text-white"
          }`}
        >
          {t('admin.wallet_tab')}
          {activeTab === "wallet" && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-yellow-400" />
          )}
        </button>
      </div>

      {/* CONTENT */}
      {activeTab === "trading" ? (
        <div className="space-y-4">
          <Accordion title={t('admin.options_history')}>
             <TransactionTable type="options" t={t} />
          </Accordion>
          <Accordion title={t('admin.spot_history')}>
             <TransactionTable type="spot" t={t} />
          </Accordion>
          <Accordion title={t('admin.swap_history')}>
             <TransactionTable type="swap" t={t} />
          </Accordion>
        </div>
      ) : (
        <div className="space-y-4">
          <Accordion title={t('admin.deposit_history')}>
             <TransactionTable type="deposits" t={t} />
          </Accordion>
          <Accordion title={t('admin.withdrawal_history')}>
            <TransactionTable type="withdraws" t={t} />
          </Accordion>
        </div>
      )}
    </div>
  );
}

function TransactionTable({ type, t }: { type: string; t: any }) {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");
  const [proofSrc, setProofSrc] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    try {
      const p = new URLSearchParams({
          type,
          page: page.toString(),
          search
      });
      const res = await fetch(`/api/admin/transactions?${p.toString()}`);
      if (res.ok) {
        const json = await res.json();
        setData(json.data || []);
        setTotalPages(json.totalPages || 1);
      }
    } catch(e) {
        console.error(e);
    } finally {
        setLoading(false);
    }
  }

  // Reload when page or search (debounced) changes
  useEffect(() => {
     load();
  }, [page]); 

  // Handle Search Input Enter
  const handleSearch = (e: React.KeyboardEvent) => {
      if(e.key === "Enter") {
          setPage(1); // Reset to page 1
          load();
      }
  }

  return (
    <div className="space-y-4">
        
        {/* TOOLBAR */}
        <div className="flex items-center justify-between mb-4">
            <div className="relative">
                <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-500" />
                <input 
                  type="text" 
                  placeholder={t('admin.search_placeholder')}
                  className="bg-[#1f2937] border border-gray-700 rounded-lg pl-9 pr-4 py-2 text-sm text-white focus:border-yellow-500 outline-none w-64"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  onKeyDown={handleSearch}
                />
            </div>
            <button onClick={load} className="p-2 bg-[#1f2937] border border-gray-700 rounded hover:bg-gray-700 transition">
                <RefreshCw className={`w-4 h-4 text-gray-400 ${loading ? "animate-spin" : ""}`} />
            </button>
        </div>

        {/* TABLE */}
        <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
                <thead className="bg-[#1f2937] text-gray-400 uppercase text-xs">
                    <tr>
                        <th className="px-4 py-3">{t('admin.time')}</th>
                        <th className="px-4 py-3">{t('admin.email')}</th>
                        <th className="px-4 py-3">{t('admin.pair_coin')}</th>
                        <th className="px-4 py-3 text-right">{t('admin.amount')}</th>
                        <th className="px-4 py-3 text-right">{t('admin.status')}</th>
                        {/* Dynamic Columns based on type */}
                        {(type === "options" || type === "spot") && <th className="px-4 py-3 text-right">{t('admin.direction')}</th>}
                        {type === "deposits" && <th className="px-4 py-3 text-right">{t('admin.proof')}</th>}
                    </tr>
                </thead>
                <tbody>
                    {loading && data.length === 0 ? (
                        <tr><td colSpan={6} className="text-center py-6 text-gray-500">Loading...</td></tr>
                    ) : data.length === 0 ? (
                        <tr><td colSpan={6} className="text-center py-6 text-gray-500">No transactions found</td></tr>
                    ) : (
                        data.map((item) => (
                            <tr key={item.id} className="border-b border-gray-800 hover:bg-[#1f2937]/50 transition">
                                <td className="px-4 py-3 text-gray-400 whitespace-nowrap">
                                    {format(new Date(item.created_at), "yyyy-MM-dd HH:mm")}
                                </td>
                                <td className="px-4 py-3 font-medium text-white">{item.email}</td>
                                <td className="px-4 py-3 text-yellow-500 font-bold">{item.pair}</td>
                                <td className="px-4 py-3 text-right font-medium">
                                    {Number(item.amount).toFixed(4)}
                                </td>
                                <td className="px-4 py-3 text-right">
                                    <StatusBadge status={item.status} t={t} />
                                </td>
                                {(type === "options" || type === "spot") && (
                                    <td className={`px-4 py-3 text-right font-bold uppercase ${
                                        item.direction === "call" || item.direction === "buy" ? "text-green-500" : "text-red-500"
                                    }`}>
                                        {item.direction}
                                    </td>
                                )}
                                {type === "deposits" && (
                                    <td className="px-4 py-3 text-right">
                                        {item.proof_url ? (
                                            <button
                                                type="button"
                                                onClick={() => setProofSrc(`/api${item.proof_url}`)}
                                                className="text-blue-400 hover:text-blue-300 underline text-xs"
                                            >
                                                {t('admin.view_proof')}
                                            </button>
                                        ) : (
                                            <span className="text-gray-600 text-xs">-</span>
                                        )}
                                    </td>
                                )}
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
        </div>

        {/* PAGINATION */}
        <div className="flex items-center justify-between mt-4 text-xs text-gray-400">
            <span>{t('admin.page_of', { 0: page, 1: totalPages })}</span>
            <div className="flex items-center gap-2">
                <button
                  disabled={page <= 1}
                  onClick={() => setPage(p => p - 1)}
                  className="p-1 rounded bg-[#1f2937] hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  disabled={page >= totalPages}
                  onClick={() => setPage(p => p + 1)}
                  className="p-1 rounded bg-[#1f2937] hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <ChevronRight className="w-4 h-4" />
                </button>
            </div>
        </div>

        {proofSrc && (
            <ProofLightbox src={proofSrc} onClose={() => setProofSrc(null)} />
        )}

    </div>
  );
}

function StatusBadge({ status, t }: { status: string; t: any }) {
    let color = "bg-gray-500";
    if (["win", "approved", "completed", "success"].includes(status)) color = "bg-green-500";
    else if (["lose", "rejected", "failed"].includes(status)) color = "bg-red-500";
    else if (["pending", "open", "running", "settling"].includes(status)) color = "bg-yellow-500";

    // Translate Status
    let label = status;
    if(status === 'pending') label = t?.('admin.pending') || 'Pending';
    if(status === 'approved' || status === 'completed' || status === 'success') label = t?.('admin.approved') || 'Approved';
    if(status === 'rejected' || status === 'failed') label = t?.('admin.rejected') || 'Rejected';

    return (
        <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold text-white ${color}`}>
            {label}
        </span>
    );
}
