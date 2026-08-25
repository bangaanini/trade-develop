"use client";

import { useEffect, useState } from "react";
import { format } from "date-fns";
import { Search, RefreshCw, Check, X, ArrowUpRight, Edit, Copy } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { toast } from "react-hot-toast";
import { useAdmin } from "@/components/admin/AdminContext";

export default function AdminWithdraws() {
  const { t } = useLanguage();
  const { role: currentUserRole } = useAdmin();
  const [rows, setRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"pending" | "all">("pending");
  const [search, setSearch] = useState("");

  const [editingAddressId, setEditingAddressId] = useState<string | null>(null);
  const [newWithdrawAddress, setNewWithdrawAddress] = useState("");
  const [savingAddress, setSavingAddress] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  async function copyAddress(address: string, id: string) {
    try {
      await navigator.clipboard.writeText(address);
      setCopiedId(id);
      toast.success("Address copied!");
      setTimeout(() => setCopiedId(null), 2000);
    } catch {
      toast.error("Copy failed");
    }
  }

  async function saveWithdrawAddress(e: React.FormEvent) {
      e.preventDefault();
      if (!editingAddressId) return;
      setSavingAddress(true);
      try {
          const res = await fetch("/api/admin/withdraws/address", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ withdrawId: editingAddressId, newAddress: newWithdrawAddress })
          });
          const json = await res.json();
          if (json.success) {
              toast.success("Address updated");
              setEditingAddressId(null);
              load();
          } else {
              toast.error(json.error || "Failed");
          }
      } catch (e) {
          toast.error("Error updating address");
      } finally {
          setSavingAddress(false);
      }
  }

  async function load() {
    setLoading(true);
    try {
      const statusParam = activeTab === "pending" ? "pending" : "all";
      const r = await fetch(`/api/admin/withdraws?status=${statusParam}`);
      if(r.ok) {
        const j = await r.json(); 
        setRows(j.data || []);
      }
    } catch(e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  async function action(id: string, action: "approve" | "reject") {
    if(!confirm(`Are you sure you want to ${action} this withdrawal?`)) return;

    try {
      await fetch("/api/admin/withdraws/action", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ withdrawId: id, action })
      });
      load();
    } catch(e) {
      toast.error("Action failed");
    }
  }

  useEffect(() => { load(); }, [activeTab]);

  const filteredRows = rows.filter(w => 
    w.user_id?.toLowerCase().includes(search.toLowerCase()) ||
    w.address?.toLowerCase().includes(search.toLowerCase()) ||
    w.email?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-linear-to-r from-yellow-400 to-orange-400">
          {t('admin.withdraw_requests')}
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
                placeholder="Search by Email or Address..." 
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
              <th className="px-4 py-3">{t('auth.email')}</th>
              <th className="px-4 py-3">{t('admin.coin_net')}</th>
              <th className="px-4 py-3 text-right">{t('admin.amount')}</th>
              <th className="px-4 py-3">{t('admin.address')}</th>
              <th className="px-4 py-3 text-center">{t('admin.status')}</th>
              <th className="px-4 py-3 text-right">{t('admin.action')}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800">
            {loading && rows.length === 0 ? (
               <tr><td colSpan={7} className="text-center py-8 text-gray-500">Loading withdrawals...</td></tr>
            ) : filteredRows.length === 0 ? (
               <tr><td colSpan={7} className="text-center py-8 text-gray-500">No withdrawals found</td></tr>
            ) : (
                filteredRows.map((w) => (
                    <tr key={w.id} className="hover:bg-[#1f2937]/50 transition group">
                        <td className="px-4 py-3 text-gray-400 whitespace-nowrap">
                            {w.created_at ? format(new Date(w.created_at), "yyyy-MM-dd HH:mm") : "-"}
                        </td>
                        <td className="px-4 py-3 font-mono text-xs text-gray-300">
                            {w.email}
                        </td>
                        <td className="px-4 py-3">
                             <div className="flex flex-col">
                                <span className="font-bold text-white text-xs">{w.coin}</span>
                                <span className="text-[10px] text-gray-500 uppercase">{w.network}</span>
                            </div>
                        </td>
                        <td className="px-4 py-3 text-right font-medium text-white">
                            {Number(w.amount).toLocaleString()}
                        </td>
                        <td className="px-4 py-3 font-mono text-xs text-gray-400 group relative">
                            <div className="flex items-center gap-2">
                                <span className="truncate max-w-[150px]" title={w.address}>{w.address}</span>
                                {/* Copy button — always visible for all roles */}
                                <button
                                  onClick={() => copyAddress(w.address, w.id + "_copy")}
                                  className="p-1 rounded bg-[#1f2937] text-gray-400 hover:text-white transition flex-shrink-0"
                                  title="Copy Address"
                                >
                                  {copiedId === w.id + "_copy" ? (
                                    <Check className="w-3.5 h-3.5 text-green-400" />
                                  ) : (
                                    <Copy className="w-3.5 h-3.5" />
                                  )}
                                </button>
                                {/* Edit button — only superadmin, any status */}
                                {currentUserRole === 'superadmin' && (
                                    <button 
                                        onClick={() => {
                                            setEditingAddressId(w.id);
                                            setNewWithdrawAddress(w.address);
                                        }}
                                        className="p-1 rounded bg-[#1f2937] text-blue-400 hover:bg-blue-500 hover:text-white transition flex-shrink-0"
                                        title="Edit Address"
                                    >
                                        <Edit className="w-3.5 h-3.5" />
                                    </button>
                                )}
                            </div>
                        </td>
                        <td className="px-4 py-3 text-center">
                            <StatusBadge status={w.status} t={t} />
                        </td>
                        <td className="px-4 py-3 text-right">
                             {w.status === 'pending' && (
                                <div className="flex items-center justify-end gap-2">
                                    <button 
                                      onClick={()=>action(w.id,"approve")} 
                                      className="p-1.5 rounded bg-green-500/10 text-green-500 hover:bg-green-500 hover:text-white transition"
                                      title={t('admin.approve')}
                                    >
                                        <Check className="w-4 h-4" />
                                    </button>
                                    <button 
                                      onClick={()=>action(w.id,"reject")} 
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

      {/* EDIT ADDRESS MODAL */}
      {editingAddressId && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
              <div className="bg-[#1f2937] p-6 rounded-xl w-full max-w-md border border-gray-700 shadow-2xl animate-in zoom-in duration-200">
                  <div className="flex justify-between items-center mb-6">
                      <h3 className="text-xl font-bold text-white flex items-center gap-2">
                          <Edit className="w-5 h-5 text-yellow-500" />
                          Edit Withdraw Address
                      </h3>
                      <button onClick={() => setEditingAddressId(null)} className="text-gray-400 hover:text-white">
                          <X className="w-5 h-5" />
                      </button>
                  </div>
                  <form onSubmit={saveWithdrawAddress}>
                      <div className="mb-6">
                          <label className="block text-sm font-bold text-gray-400 mb-2">New Address</label>
                          <input 
                              type="text" 
                              value={newWithdrawAddress}
                              onChange={(e) => setNewWithdrawAddress(e.target.value)}
                              className="w-full bg-[#111827] border border-gray-600 rounded-lg p-3 text-white focus:border-yellow-500 outline-none font-mono"
                              required
                          />
                      </div>
                      <div className="flex gap-3">
                          <button 
                              type="button"
                              onClick={() => setEditingAddressId(null)}
                              className="flex-1 py-3 rounded-lg bg-gray-700 text-gray-300 hover:bg-gray-600 font-medium transition"
                          >
                              Cancel
                          </button>
                          <button 
                              type="submit"
                              disabled={savingAddress}
                              className={`flex-1 py-3 rounded-lg bg-yellow-500 text-black font-bold transition ${savingAddress ? 'opacity-50' : 'hover:bg-yellow-400'}`}
                          >
                              {savingAddress ? 'Saving...' : 'Save'}
                          </button>
                      </div>
                  </form>
              </div>
          </div>
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
