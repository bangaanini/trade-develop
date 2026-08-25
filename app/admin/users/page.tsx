"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { format } from "date-fns";
import { Search, RefreshCw, Eye, Shield, ShieldAlert, User as UserIcon, Trash2, Settings, X, Wallet } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { toast } from "react-hot-toast";

type User = {
  id: string;
  uid?: string;
  email: string;
  role: string;
  banned: boolean | null;
  created_at: string;
  win_rate: number;
};

import { useAdmin } from "@/components/admin/AdminContext";

export default function UserList() {
  const { t } = useLanguage();
  const { role: currentUserRole } = useAdmin();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");

  async function loadUsers() {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/users");
      const { data, error } = await res.json();

      if (error) {
        console.error("Error fetching users:", error);
        return;
      }

      setUsers(data || []);
    } catch (err) {
      console.error("Network error fetching users:", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadUsers();
  }, []);

  const [editingWinRateUser, setEditingWinRateUser] = useState<User | null>(null);
  const [newWinRate, setNewWinRate] = useState(0);

  // Address Modal State
  const [addressModalUser, setAddressModalUser] = useState<User | null>(null);
  const [userAddresses, setUserAddresses] = useState<any[]>([]);
  const [loadingAddresses, setLoadingAddresses] = useState(false);
  const [savingAddress, setSavingAddress] = useState(false);
  const [addressForm, setAddressForm] = useState<any>({ network: "TRC20", address: "", id: null });

  async function openAddressModal(u: User) {
    setAddressModalUser(u);
    setAddressForm({ network: "TRC20", address: "", id: null });
    loadUserAddresses(u.id);
  }

  async function loadUserAddresses(userId: string) {
    setLoadingAddresses(true);
    try {
      const res = await fetch(`/api/admin/users/address?userId=${userId}`);
      const json = await res.json();
      if (json.success) {
        setUserAddresses(json.data || []);
      }
    } catch (e) {
      toast.error("Failed to load addresses");
    } finally {
      setLoadingAddresses(false);
    }
  }

  async function saveUserAddress(e: React.FormEvent) {
    e.preventDefault();
    if (!addressModalUser) return;
    setSavingAddress(true);
    try {
      const res = await fetch("/api/admin/users/address", {
         method: "POST",
         headers: {"Content-Type": "application/json"},
         body: JSON.stringify({
            userId: addressModalUser.id,
            network: addressForm.network,
            address: addressForm.address,
            id: addressForm.id
         })
      });
      const json = await res.json();
      if (json.success) {
         toast.success("Address saved");
         setAddressForm({ network: "TRC20", address: "", id: null });
         loadUserAddresses(addressModalUser.id);
      } else {
         toast.error(json.error || "Failed to save address");
      }
    } catch (e) {
      toast.error("Error saving address");
    } finally {
      setSavingAddress(false);
    }
  }

  async function deleteUser(userId: string) {
    if (!confirm(t('admin.delete_confirm'))) {
      return;
    }

    try {
      const res = await fetch("/api/admin/users/action", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "delete", userId }),
      });
      const json = await res.json();
      if (json.success) {
        toast.success("User deleted successfully");
        loadUsers();
      } else {
        toast.error(json.error || "Failed to delete user");
      }
    } catch (err) {
      console.error(err);
      toast.error("Error deleting user");
    }
  }

  async function saveWinRate() {
    if (!editingWinRateUser) return;
    
    try {
        const res = await fetch("/api/admin/users/winrate", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ userId: editingWinRateUser.id, winRate: Number(newWinRate) }),
        });
        const json = await res.json();
        
        if (json.success) {
            toast.success("Win rate updated");
            setEditingWinRateUser(null);
            loadUsers();
        } else {
            toast.error(json.error || "Failed");
        }
    } catch (e) {
        toast.error("Error saving win rate");
    }
  }

  const filteredUsers = users.filter(u => 
      u.email.toLowerCase().includes(search.toLowerCase()) ||
      u.id.toLowerCase().includes(search.toLowerCase()) ||
      (u.uid && u.uid.toString().includes(search)) ||
      u.role.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-linear-to-r from-yellow-400 to-orange-400">
          {t('admin.user_management')}
        </h1>
        <div className="text-gray-400 text-sm">
            {t('admin.total_users_count')} <span className="text-white font-bold ml-1">{users.length}</span>
        </div>
      </div>

      {/* TOOLBAR */}
      <div className="flex items-center justify-between gap-4 bg-[#111827] p-4 rounded-t-lg border border-gray-800 border-b-0">
          <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-500" />
              <input 
                type="text" 
                placeholder={t('admin.search_placeholder')} 
                className="w-full bg-[#1f2937] border border-gray-700 rounded-lg pl-9 pr-4 py-2 text-sm text-white focus:border-yellow-500 outline-none"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
          </div>
          <button 
            onClick={loadUsers} 
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
              <th className="px-4 py-3">{t('admin.users')}</th>
              <th className="px-4 py-3 text-center">UID</th>
              <th className="px-4 py-3 text-center">Win Rate</th>
              <th className="px-4 py-3">{t('admin.role')}</th>
              <th className="px-4 py-3">{t('admin.created')}</th>
              <th className="px-4 py-3 text-center">{t('admin.status')}</th>
              <th className="px-4 py-3 text-right">{t('admin.action')}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800">
             {loading && users.length === 0 ? (
                 <tr><td colSpan={5} className="text-center py-8 text-gray-500">Loading users...</td></tr>
             ) : filteredUsers.length === 0 ? (
                 <tr><td colSpan={5} className="text-center py-8 text-gray-500">No users found</td></tr>
             ) : (
                 filteredUsers.map((u) => (
                    <tr key={u.id} className="hover:bg-[#1f2937]/50 transition border-b border-gray-800 last:border-0 group">
                        <td className="px-4 py-3">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center text-gray-400 group-hover:bg-yellow-500 group-hover:text-black transition-colors">
                                    <UserIcon className="w-4 h-4" />
                                </div>
                                <div className="flex flex-col">
                                    <span className="font-medium text-white">{u.email}</span>
                                    <span className="text-[10px] text-gray-500 font-mono">ID: {u.id.slice(0, 8)}...</span>
                                </div>
                            </div>
                        </td>
                        <td className="px-4 py-3 text-center font-mono text-yellow-500 font-bold">
                            {u.uid || '-'}
                        </td>
                        <td className="px-4 py-3 text-center">
                            <button 
                                onClick={() => {
                                    setEditingWinRateUser(u);
                                    setNewWinRate(u.win_rate || 0);
                                }}
                                className="px-2 py-1 rounded bg-blue-500/10 text-blue-400 hover:bg-blue-500 hover:text-white transition text-xs font-bold flex items-center gap-1 mx-auto"
                            >
                                {u.win_rate || 0}% <Settings className="w-3 h-3" />
                            </button>
                        </td>
                        <td className="px-4 py-3">
                            <div className="flex items-center gap-1.5 capitalize text-gray-300">
                                {u.role === 'admin' || u.role === 'superadmin' ? (
                                    <ShieldAlert className="w-3.5 h-3.5 text-yellow-500" />
                                ) : (
                                    <Shield className="w-3.5 h-3.5 text-gray-500" />
                                )}
                                {u.role}
                            </div>
                        </td>
                        <td className="px-4 py-3 text-gray-400 whitespace-nowrap text-xs">
                             {u.created_at ? format(new Date(u.created_at), "yyyy-MM-dd HH:mm") : "-"}
                        </td>
                        <td className="px-4 py-3 text-center">
                            {u.banned ? (
                                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-red-500/10 text-red-500 border border-red-500/20">
                                    BANNED
                                </span>
                            ) : (
                                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-green-500/10 text-green-500 border border-green-500/20">
                                    ACTIVE
                                </span>
                            )}
                        </td>
                        <td className="px-4 py-3 text-right">
                             <Link
                               href={`/admin/users/${u.id}`}
                               className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded bg-[#1f2937] text-gray-300 hover:text-white hover:bg-gray-700 transition text-xs font-medium border border-gray-700"
                             >
                                <Eye className="w-3.5 h-3.5" />
                                {t('admin.view')}
                             </Link>
                             
                             {/* Only Superadmin can delete or edit addresses */}
                             {(currentUserRole === 'superadmin') && (
                                <>
                                  <button
                                    onClick={() => openAddressModal(u)}
                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded bg-blue-500/10 text-blue-400 hover:bg-blue-500 hover:text-white transition text-xs font-medium border border-blue-500/20 ml-2"
                                    title="Edit Addresses"
                                  >
                                      <Wallet className="w-3.5 h-3.5" />
                                      Addresses
                                  </button>
                                  <button
                                    onClick={() => deleteUser(u.id)}
                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white transition text-xs font-medium border border-red-500/20 ml-2"
                                    title="Delete User"
                                  >
                                      <Trash2 className="w-3.5 h-3.5" />
                                      {t('admin.delete')}
                                  </button>
                                </>
                             )}
                        </td>
                    </tr>
                 ))
             )}
          </tbody>
        </table>
      </div>


      {/* WIN RATE MODAL */}
      {editingWinRateUser && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
            <div className="bg-[#1f2937] p-6 rounded-xl w-full max-w-sm border border-gray-700 shadow-2xl animate-in zoom-in duration-200">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-bold text-white">Set User Win Rate</h3>
                    <button onClick={() => setEditingWinRateUser(null)} className="text-gray-400 hover:text-white">
                        <X className="w-5 h-5" />
                    </button>
                </div>
                
                <div className="mb-6">
                    <p className="text-gray-400 text-sm mb-2">User: <span className="text-white font-medium">{editingWinRateUser.email}</span></p>
                    <label className="block text-sm font-bold text-yellow-500 mb-2">Target Win Rate (%)</label>
                    <input 
                        type="number" 
                        min="0" 
                        max="100" 
                        value={newWinRate}
                        onChange={(e) => setNewWinRate(Number(e.target.value))}
                        className="w-full bg-[#111827] border border-gray-600 rounded-lg p-3 text-white focus:border-yellow-500 outline-none text-lg font-bold text-center"
                    />
                    <p className="text-xs text-gray-500 mt-2">
                        If set above 0%, the system will attempt to force a win with this probability.
                        <br/>
                        Set to 0 to disable forced wins.
                    </p>
                </div>

                <div className="flex gap-3">
                    <button 
                        onClick={() => setEditingWinRateUser(null)}
                        className="flex-1 py-3 rounded-lg bg-gray-700 text-gray-300 hover:bg-gray-600 font-medium transition"
                    >
                        Cancel
                    </button>
                    <button 
                        onClick={saveWinRate}
                        className="flex-1 py-3 rounded-lg bg-yellow-500 text-black hover:bg-yellow-400 font-bold transition"
                    >
                        Save
                    </button>
                </div>
            </div>
        </div>
      )}

      {/* ADDRESS MODAL */}
      {addressModalUser && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
            <div className="bg-[#1f2937] p-6 rounded-xl w-full max-w-2xl border border-gray-700 shadow-2xl animate-in zoom-in duration-200 flex flex-col max-h-[90vh]">
                <div className="flex justify-between items-center mb-6 shrink-0">
                    <h3 className="text-xl font-bold text-white flex items-center gap-2">
                        <Wallet className="w-5 h-5 text-yellow-500" />
                        Manage Addresses
                    </h3>
                    <button onClick={() => setAddressModalUser(null)} className="text-gray-400 hover:text-white">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="mb-4 shrink-0">
                    <p className="text-gray-400 text-sm">User: <span className="text-white font-medium">{addressModalUser.email}</span></p>
                </div>

                {/* Address Form */}
                <form onSubmit={saveUserAddress} className="bg-[#111827] p-4 rounded-lg border border-gray-800 mb-6 shrink-0">
                    <h4 className="text-sm font-bold text-gray-300 mb-4 uppercase">
                        {addressForm.id ? "Edit Address" : "Add New Address"}
                    </h4>
                    <div className="flex flex-col md:flex-row gap-4 mb-4">
                        <div className="w-full md:w-1/3">
                            <label className="block text-xs font-bold text-gray-400 mb-1">Network</label>
                            <select 
                                value={addressForm.network}
                                onChange={(e) => setAddressForm({...addressForm, network: e.target.value})}
                                className="w-full bg-[#1f2937] border border-gray-700 rounded-lg py-2 px-3 text-white focus:border-yellow-500 outline-none text-sm"
                                required
                            >
                                <option value="TRC20">TRC20</option>
                                <option value="ERC20">ERC20</option>
                                <option value="BTC">BTC</option>
                                <option value="ETH">ETH</option>
                            </select>
                        </div>
                        <div className="flex-1">
                            <label className="block text-xs font-bold text-gray-400 mb-1">Wallet Address</label>
                            <input 
                                type="text"
                                value={addressForm.address}
                                onChange={(e) => setAddressForm({...addressForm, address: e.target.value})}
                                className="w-full bg-[#1f2937] border border-gray-700 rounded-lg py-2 px-3 text-white focus:border-yellow-500 outline-none text-sm font-mono"
                                placeholder="Enter wallet address"
                                required
                            />
                        </div>
                    </div>
                    <div className="flex gap-2 justify-end">
                        {addressForm.id && (
                            <button
                                type="button"
                                onClick={() => setAddressForm({ network: "TRC20", address: "", id: null })}
                                className="px-4 py-2 rounded-lg bg-gray-700 text-gray-300 hover:bg-gray-600 font-medium transition text-sm"
                            >
                                Cancel Edit
                            </button>
                        )}
                        <button 
                            type="submit"
                            disabled={savingAddress}
                            className={`px-4 py-2 rounded-lg bg-yellow-500 text-black font-bold transition text-sm ${savingAddress ? 'opacity-50' : 'hover:bg-yellow-400'}`}
                        >
                            {savingAddress ? 'Saving...' : 'Save Address'}
                        </button>
                    </div>
                </form>

                {/* Address List */}
                <div className="overflow-y-auto flex-1 min-h-[200px]">
                    <h4 className="text-sm font-bold text-gray-300 mb-3 sticky top-0 bg-[#1f2937] py-2 z-10">Saved Addresses</h4>
                    {loadingAddresses ? (
                        <p className="text-gray-500 text-sm text-center py-4">Loading...</p>
                    ) : userAddresses.length === 0 ? (
                        <p className="text-gray-500 text-sm text-center py-4 bg-[#111827] rounded-lg border border-gray-800">No addresses binded yet</p>
                    ) : (
                        <div className="space-y-2">
                            {userAddresses.map((addr) => (
                                <div key={addr.id} className="bg-[#111827] p-3 rounded-lg border border-gray-800 flex items-center gap-4 group">
                                    <div className="bg-[#1f2937] px-2 py-1 rounded text-xs font-bold text-yellow-500 min-w-[60px] text-center border border-gray-700">
                                        {addr.network}
                                    </div>
                                    <div className="flex-1 overflow-hidden">
                                        <p className="text-sm font-mono text-gray-300 truncate">{addr.address}</p>
                                    </div>
                                    <button
                                        onClick={() => setAddressForm({ network: addr.network, address: addr.address, id: addr.id })}
                                        className="p-1.5 rounded bg-[#1f2937] text-blue-400 hover:bg-blue-500 hover:text-white transition opacity-0 group-hover:opacity-100"
                                        title="Edit"
                                        type="button"
                                    >
                                        <Settings className="w-4 h-4" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
      )}
    </div>
  );
}
