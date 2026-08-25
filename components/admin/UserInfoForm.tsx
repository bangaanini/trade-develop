import { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import { Save, UserPlus, Shield, Ban, Coins, Plus, Minus, FileText } from "lucide-react";

export default function UserInfoForm({ user, reload, currentUserRole }: { user: any; reload: () => void; currentUserRole: string }) {
  const [form, setForm] = useState(user);
  const [selectedCoin, setSelectedCoin] = useState("");
  const [adjustAmount, setAdjustAmount] = useState("");
  const [kycData, setKycData] = useState<any>(null);
  const [isEditingPassword, setIsEditingPassword] = useState(false);
  const [passwordInput, setPasswordInput] = useState(user.visible_password || "");

  async function updatePassword() {
    if (!passwordInput) return toast.error("Password cannot be empty");
    if (!confirm("Are you sure you want to change this user's password? This involves security risks.")) return;

    try {
        const res = await fetch("/api/admin/users/action", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                action: "update_password",
                userId: user.id,
                data: { password: passwordInput }
            })
        });
        const json = await res.json();
        if (!res.ok) throw new Error(json.error || "Failed");
        
        toast.success("Password updated successfully");
        setIsEditingPassword(false);
        reload();
    } catch (e: any) {
        toast.error(e.message);
    }
  }

  // Load KYC data on mount
  useEffect(() => {
    async function loadKYC() {
      try {
        const res = await fetch(`/api/admin/users/${user.id}/kyc`);
        if (res.ok) {
          const data = await res.json();
          if (data.kyc) {
            setKycData(data.kyc);
            // Auto-populate form with KYC data if fields are empty
            if (!form.first_name && data.kyc.full_name) {
              const names = data.kyc.full_name.split(' ');
              setForm((prev: any) => ({
                ...prev,
                first_name: names[0] || '',
                last_name: names.slice(1).join(' ') || '',
                phone: prev.phone || data.kyc.phone,
                address: prev.address || data.kyc.address
              }));
            }
          }
        }
      } catch (e) {
        console.error('Failed to load KYC', e);
      }
    }
    loadKYC();
  }, [user.id]);

  function updateField(key: string, value: string) {
    setForm({ ...form, [key]: value });
  }

  async function save() {
    await fetch("/api/admin/users/action", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            action: "update_info",
            userId: user.id,
            data: form
        })
    });
    reload();
  }

  async function promote(role: string) {
    if(!confirm(`Are you sure you want to promote this user to ${role}?`)) return;
    await fetch("/api/admin/users/action", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            action: "promote",
            userId: user.id,
            data: { role }
        })
    });
    reload();
  }

  async function ban() {
    const action = user.banned ? "unban" : "ban";
    if(!confirm(`Are you sure you want to ${action} this user?`)) return;
    
    await fetch("/api/admin/users/action", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            action: "ban",
            userId: user.id,
            data: { banned: !user.banned }
        })
    });
    reload();
  }

  async function adjustBalance(operation: "add" | "subtract") {
    if (!selectedCoin || !adjustAmount) {
      toast.error("Please select a coin and enter an amount");
      return;
    }

    const amount = parseFloat(adjustAmount);
    if (isNaN(amount) || amount <= 0) {
      toast.error("Please enter a valid positive amount");
      return;
    }

    try {
      const response = await fetch("/api/admin/wallets/adjust", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: user.id,
          coin: selectedCoin,
          amount: amount,
          operation: operation
        })
      });

      const result = await response.json();

      if (!response.ok) {
        toast.error("Error: " + (result.error || "Failed to adjust balance"));
        return;
      }

      toast.success("Success! Balance has been " + (operation === "add" ? "added" : "subtracted"));
      setSelectedCoin("");
      setAdjustAmount("");
      reload();
    } catch (error: any) {
      toast.error("Network error: " + error.message);
    }
  }

  const isSuperAdmin = currentUserRole === "superadmin";

  return (
    <div className="space-y-6">
      
      {/* KYC INFO BANNER */}
      {kycData && (
        <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3 mb-4">
          <div className="flex items-start gap-2">
            <FileText className="w-4 h-4 text-blue-400 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-medium text-blue-400 mb-1">KYC Data Available</p>
              <p className="text-xs text-gray-400">
                Full Name: <span className="text-white">{kycData.full_name}</span> |
                Phone: <span className="text-white">{kycData.phone}</span> |
                Status: <span className={kycData.status === 'approved' ? 'text-green-400' : 'text-orange-400'}>{kycData.status}</span>
              </p>
            </div>
          </div>
        </div>
      )}

      {/* FIELDS */}
      <div className="grid grid-cols-2 gap-4">
        <div>
            <label className="block text-xs text-gray-400 mb-1">First Name</label>
            <input
              className="w-full bg-[#1f2937] border border-gray-700 p-2 rounded text-sm text-white focus:border-yellow-500 outline-none"
              value={form.first_name || ""}
              onChange={(e) => updateField("first_name", e.target.value)}
              placeholder="First Name"
            />
        </div>

        <div>
            <label className="block text-xs text-gray-400 mb-1">Last Name</label>
            <input
              className="w-full bg-[#1f2937] border border-gray-700 p-2 rounded text-sm text-white focus:border-yellow-500 outline-none"
              value={form.last_name || ""}
              onChange={(e) => updateField("last_name", e.target.value)}
              placeholder="Last Name"
            />
        </div>

        <div>
            <label className="block text-xs text-gray-400 mb-1">Phone</label>
            <input
              className="w-full bg-[#1f2937] border border-gray-700 p-2 rounded text-sm text-white focus:border-yellow-500 outline-none"
              value={form.phone || ""}
              onChange={(e) => updateField("phone", e.target.value)}
              placeholder="Phone Number"
            />
        </div>

        <div>
            <label className="block text-xs text-gray-400 mb-1">Address</label>
            <input
              className="w-full bg-[#1f2937] border border-gray-700 p-2 rounded text-sm text-white focus:border-yellow-500 outline-none"
              value={form.address || ""}
              onChange={(e) => updateField("address", e.target.value)}
              placeholder="Address"
            />
        </div>

        {isSuperAdmin && (
            <div className="col-span-2 mt-2">
                <label className="block text-xs text-red-400/70 mb-1 font-semibold items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
                    User Password (Super Admin View)
                </label>
                {!isEditingPassword ? (
                    <div className="flex items-center gap-2">
                        <div className="flex-1 bg-[#1f2937] border border-red-500/20 p-2.5 rounded text-sm text-red-200 font-mono select-all">
                            {user.visible_password || <span className="text-gray-500 italic">Not available (old user)</span>}
                        </div>
                        <button 
                            className="p-2.5 rounded bg-red-900/30 text-red-400 border border-red-500/30 hover:bg-red-900/50 transition"
                            onClick={() => setIsEditingPassword(true)}
                            title="Edit Password"
                        >
                            <UserPlus className="w-4 h-4 rotate-90" />
                        </button>
                    </div>
                ) : (
                    <div className="flex items-center gap-2">
                        <input 
                            className="flex-1 bg-[#1f2937] border border-red-500/50 p-2.5 rounded text-sm text-white font-mono focus:border-red-400 outline-none"
                            value={passwordInput}
                            onChange={(e) => setPasswordInput(e.target.value)}
                            placeholder="Enter new password"
                        />
                        <button 
                            className="px-4 py-2.5 rounded bg-green-600 text-white font-medium hover:bg-green-500 transition text-xs"
                            onClick={updatePassword}
                        >
                            Save
                        </button>
                        <button 
                            className="px-4 py-2.5 rounded bg-gray-700 text-gray-300 font-medium hover:bg-gray-600 transition text-xs"
                            onClick={() => {
                                setIsEditingPassword(false);
                                setPasswordInput(user.visible_password || "");
                            }}
                        >
                            Cancel
                        </button>
                    </div>
                )}
            </div>
        )}
      </div>

      {/* ACTION BUTTONS */}
      <div className="flex flex-wrap gap-3 mt-4 pt-4 border-t border-gray-800">
        <button 
            className="flex items-center gap-2 bg-yellow-500 text-black px-3 py-1.5 rounded text-sm font-medium hover:bg-yellow-400 transition" 
            onClick={save}
        >
          <Save className="w-4 h-4" />
          Save Changes
        </button>

        {isSuperAdmin && (
            <>
            {user.role !== 'admin' && (
                <button
                className="flex items-center gap-2 bg-[#1f2937] text-gray-300 border border-gray-700 px-3 py-1.5 rounded text-sm font-medium hover:bg-gray-700 hover:text-white transition"
                onClick={() => promote("admin")}
                >
                <UserPlus className="w-4 h-4" />
                Make Admin
                </button>
            )}

            {user.role !== 'superadmin' && (
                <button
                className="flex items-center gap-2 bg-purple-900/30 text-purple-400 border border-purple-500/30 px-3 py-1.5 rounded text-sm font-medium hover:bg-purple-900/50 hover:text-purple-300 transition"
                onClick={() => promote("superadmin")}
                >
                <Shield className="w-4 h-4" />
                Make Superadmin
                </button>
            )}

            {(user.role === 'admin' || user.role === 'superadmin') && (
                 <button
                 className="flex items-center gap-2 bg-gray-800 text-gray-400 border border-gray-700 px-3 py-1.5 rounded text-sm font-medium hover:bg-gray-700 hover:text-white transition"
                 onClick={() => promote("user")}
                 >
                 <UserPlus className="w-4 h-4" />
                 Remove Admin Role
                 </button>
            )}
          </>
        )}

        <button
          className={`flex items-center gap-2 px-3 py-1.5 rounded text-sm font-medium border transition ${
              user.banned 
                ? "bg-green-900/30 text-green-400 border-green-500/30 hover:bg-green-900/50" 
                : "bg-red-900/30 text-red-400 border-red-500/30 hover:bg-red-900/50"
          }`}
          onClick={ban}
        >
          <Ban className="w-4 h-4" />
          {user.banned ? "Unban User" : "Ban User"}
        </button>
      </div>

      {/* Balance Adjustment Section */}
      <div className="mt-8 pt-6 border-t border-gray-800">
        <div className="flex items-center gap-2 text-yellow-500 mb-4">
            <Coins className="w-4 h-4" />
            <h3 className="text-sm font-semibold uppercase tracking-wide">Balance Adjustment</h3>
        </div>

        <div className="bg-[#0f172a] p-4 rounded-lg border border-gray-800">
            <div className="flex flex-col sm:flex-row gap-4 items-end">
            <div className="flex-1 w-full">
                <label className="block text-xs text-gray-500 mb-1.5">Select Coin</label>
                <select
                className="w-full bg-[#1f2937] border border-gray-700 p-2 rounded text-sm text-white focus:border-yellow-500 outline-none"
                value={selectedCoin}
                onChange={(e) => setSelectedCoin(e.target.value)}
                >
                <option value="">-- Select --</option>
                <option value="BTC">BTC</option>
                <option value="ETH">ETH</option>
                <option value="USDT">USDT</option>
                <option value="BNB">BNB</option>
                </select>
            </div>

            <div className="flex-1 w-full">
                <label className="block text-xs text-gray-500 mb-1.5">Amount</label>
                <input
                type="number"
                className="w-full bg-[#1f2937] border border-gray-700 p-2 rounded text-sm text-white focus:border-yellow-500 outline-none"
                value={adjustAmount}
                onChange={(e) => setAdjustAmount(e.target.value)}
                placeholder="0.00"
                min="0"
                step="0.00000001"
                />
            </div>

            <div className="flex gap-2 w-full sm:w-auto">
                <button
                    className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 bg-green-600 text-white px-3 py-2 rounded text-sm font-medium hover:bg-green-500 transition shadow-sm"
                    onClick={() => adjustBalance("add")}
                    title="Add Funds"
                >
                    <Plus className="w-4 h-4" />
                    Add
                </button>

                <button
                    className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 bg-red-600 text-white px-3 py-2 rounded text-sm font-medium hover:bg-red-500 transition shadow-sm"
                    onClick={() => adjustBalance("subtract")}
                    title="Subtract Funds"
                >
                    <Minus className="w-4 h-4" />
                    Subtract
                </button>
            </div>
            </div>
        </div>
      </div>
    </div>
  );
}
