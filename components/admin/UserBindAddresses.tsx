"use client";

import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import { Plus, Edit, Trash2, Copy, Check, Loader2 } from "lucide-react";

const NETWORKS = ["TRC20", "ERC20", "BTC", "ETH"];

type WalletAddr = {
  id: string;
  network: string;
  address: string;
  updated_at: string;
};

type Props = {
  userId: string;
  currentUserRole: string;
};

export default function UserBindAddresses({ userId, currentUserRole }: Props) {
  const [addresses, setAddresses] = useState<WalletAddr[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // form state
  const [editingId, setEditingId] = useState<string | null>(null); // null = adding new
  const [showForm, setShowForm] = useState(false);
  const [formNetwork, setFormNetwork] = useState("TRC20");
  const [formAddress, setFormAddress] = useState("");

  const isSuperAdmin = currentUserRole === "superadmin";

  async function loadAddresses() {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/users/address?userId=${userId}`);
      const json = await res.json();
      if (json.success) setAddresses(json.data || []);
    } catch {
      toast.error("Failed to load addresses");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadAddresses(); }, [userId]);

  function startAdd() {
    setEditingId(null);
    setFormNetwork("TRC20");
    setFormAddress("");
    setShowForm(true);
  }

  function startEdit(addr: WalletAddr) {
    setEditingId(addr.id);
    setFormNetwork(addr.network);
    setFormAddress(addr.address);
    setShowForm(true);
  }

  function cancelForm() {
    setShowForm(false);
    setEditingId(null);
    setFormAddress("");
  }

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

  async function saveAddress(e: React.FormEvent) {
    e.preventDefault();
    if (!formAddress.trim()) return;
    setSaving(true);
    try {
      const res = await fetch("/api/admin/users/address", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          network: formNetwork,
          address: formAddress.trim(),
          id: editingId || undefined,
        }),
      });
      const json = await res.json();
      if (json.success) {
        toast.success(editingId ? "Address updated" : "Address added");
        cancelForm();
        loadAddresses();
      } else {
        toast.error(json.error || "Failed");
      }
    } catch {
      toast.error("Error saving");
    } finally {
      setSaving(false);
    }
  }

  async function deleteAddress(addr: WalletAddr) {
    if (!confirm(`Delete ${addr.network} address?`)) return;
    try {
      const res = await fetch("/api/admin/users/address", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, id: addr.id }),
      });
      const json = await res.json();
      if (json.success) {
        toast.success("Address deleted");
        loadAddresses();
      } else {
        toast.error(json.error || "Failed");
      }
    } catch {
      toast.error("Error deleting");
    }
  }

  return (
    <div className="bg-[#111827] border border-gray-800 rounded-lg p-6 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-bold text-gray-300 uppercase tracking-wider">
          Bind / Withdraw Addresses
        </h3>
        {isSuperAdmin && (
          <button
            onClick={startAdd}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-yellow-500/10 text-yellow-400 hover:bg-yellow-500 hover:text-black transition text-xs font-bold border border-yellow-500/20"
          >
            <Plus className="w-3.5 h-3.5" /> Add Address
          </button>
        )}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-8 text-gray-500 gap-2">
          <Loader2 className="w-4 h-4 animate-spin" /> Loading...
        </div>
      ) : addresses.length === 0 && !showForm ? (
        <p className="text-center py-8 text-gray-600 text-sm">No bind addresses set</p>
      ) : (
        <div className="space-y-2 mb-4">
          {addresses.map((addr) => (
            <div
              key={addr.id}
              className="flex items-center gap-3 bg-[#1f2937] border border-gray-700 rounded-lg p-3 group"
            >
              <span className="bg-[#111827] px-2 py-1 rounded text-xs font-bold text-yellow-500 border border-gray-700 min-w-[55px] text-center">
                {addr.network}
              </span>
              <span className="flex-1 font-mono text-sm text-gray-300 truncate" title={addr.address}>
                {addr.address}
              </span>
              <div className="flex items-center gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => copyAddress(addr.address, addr.id)}
                  className="p-1.5 rounded text-gray-400 hover:text-white hover:bg-gray-600 transition"
                  title="Copy"
                >
                  {copiedId === addr.id ? (
                    <Check className="w-3.5 h-3.5 text-green-400" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                </button>
                {isSuperAdmin && (
                  <>
                    <button
                      onClick={() => startEdit(addr)}
                      className="p-1.5 rounded text-blue-400 hover:bg-blue-500 hover:text-white transition"
                      title="Edit"
                    >
                      <Edit className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => deleteAddress(addr)}
                      className="p-1.5 rounded text-red-400 hover:bg-red-500 hover:text-white transition"
                      title="Delete"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Inline Form */}
      {showForm && (
        <form
          onSubmit={saveAddress}
          className="bg-[#1f2937] border border-gray-700 rounded-lg p-4 space-y-3 mt-2"
        >
          <h4 className="text-xs font-bold text-gray-400 uppercase">
            {editingId ? "Edit Address" : "New Address"}
          </h4>
          <div className="flex gap-3">
            <select
              value={formNetwork}
              onChange={(e) => setFormNetwork(e.target.value)}
              className="w-28 bg-[#111827] border border-gray-600 rounded-lg py-2 px-3 text-white text-sm focus:border-yellow-500 outline-none"
            >
              {NETWORKS.map((n) => (
                <option key={n} value={n}>{n}</option>
              ))}
            </select>
            <input
              type="text"
              value={formAddress}
              onChange={(e) => setFormAddress(e.target.value)}
              placeholder="Wallet address"
              required
              className="flex-1 bg-[#111827] border border-gray-600 rounded-lg py-2 px-3 text-white text-sm font-mono focus:border-yellow-500 outline-none"
            />
          </div>
          <div className="flex gap-2 justify-end">
            <button
              type="button"
              onClick={cancelForm}
              className="px-4 py-2 rounded-lg bg-gray-700 text-gray-300 hover:bg-gray-600 text-sm font-medium transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className={`px-4 py-2 rounded-lg bg-yellow-500 text-black font-bold text-sm transition ${
                saving ? "opacity-50" : "hover:bg-yellow-400"
              }`}
            >
              {saving ? "Saving..." : editingId ? "Update" : "Add"}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
