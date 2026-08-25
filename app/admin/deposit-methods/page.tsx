"use client";

import { useEffect, useState } from "react";
import { useAdmin } from "@/components/admin/AdminContext";
import { Plus, Wallet, QrCode, Edit, Trash, Check, X } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { toast } from "react-hot-toast";

type DepositMethod = {
  id: string;
  coin: string;
  network: string;
  address: string;
  qr_code_url: string;
  is_active: boolean;
};

export default function DepositMethodsPage() {
  const { role } = useAdmin();
  const { t } = useLanguage();

  const [methods, setMethods] = useState<DepositMethod[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form states
  const [coin, setCoin] = useState("");
  const [network, setNetwork] = useState("");
  const [address, setAddress] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [currentQrUrl, setCurrentQrUrl] = useState("");
  const [qrFile, setQrFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  // Function to load deposit methods
  async function load() {
    try {
      const res = await fetch("/api/admin/deposit-methods");
      const json = await res.json();
      setMethods(json.data || []);
    } catch (error) {
      console.error("Failed to load methods", error);
    }
  }

  useEffect(() => {
    load();
  }, []);

  function handleEdit(method: DepositMethod) {
    setEditingId(method.id);
    setCoin(method.coin);
    setNetwork(method.network);
    setAddress(method.address);
    setIsActive(method.is_active);
    setCurrentQrUrl(method.qr_code_url);
    setQrFile(null);
    setIsModalOpen(true);
  }

  function handleCreate() {
    setEditingId(null);
    setCoin("");
    setNetwork("");
    setAddress("");
    setIsActive(true);
    setCurrentQrUrl("");
    setQrFile(null);
    setIsModalOpen(true);
  }

  async function save() {
    if (!coin || !network || !address) {
      toast.error("Please fill all required fields (Coin, Network, Address)");
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      if (editingId) formData.append("id", editingId);
      formData.append("coin", coin);
      formData.append("network", network);
      formData.append("address", address);
      formData.append("is_active", String(isActive));
      
      if (currentQrUrl) formData.append("qr_code_url", currentQrUrl);
      
      if (qrFile) formData.append("qrcode", qrFile);

      const res = await fetch("/api/admin/deposit-methods/save", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const json = await res.json();
        throw new Error(json.error || "Failed to save");
      }

      setIsModalOpen(false);
      load();
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setLoading(false);
    }
  }

  if (role !== "superadmin") {
    return <div className="text-red-400 p-6">Access denied</div>;
  }

  return (
    <div className="space-y-6">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-linear-to-r from-yellow-400 to-orange-400">
            {t('admin.deposit_methods_title')}
          </h1>
          <p className="text-gray-400 text-sm mt-1">{t('admin.deposit_methods_desc')}</p>
        </div>
        <button
          onClick={handleCreate}
          className="flex items-center gap-2 bg-yellow-500 hover:bg-yellow-400 text-black px-4 py-2 rounded-lg transition font-medium text-sm"
        >
          <Plus className="w-4 h-4" />
          {t('admin.add_method')}
        </button>
      </div>

      {/* TABLE CARD */}
      <div className="bg-[#111827] rounded-lg border border-gray-800 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left bg-transparent">
            <thead>
              <tr className="bg-[#1f2937] text-gray-400 text-xs uppercase tracking-wider border-b border-gray-800">
                <th className="p-4 font-semibold">{t('admin.coin_net')}</th>
                <th className="p-4 font-semibold">{t('admin.network')}</th>
                <th className="p-4 font-semibold">{t('admin.address')}</th>
                <th className="p-4 font-semibold">QR</th>
                <th className="p-4 font-semibold">{t('admin.status')}</th>
                <th className="p-4 font-semibold text-right">{t('admin.action')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {methods.map((m) => (
                <tr key={m.id} className="hover:bg-gray-800/30 transition-colors">
                  <td className="p-4 font-medium text-white flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-yellow-500/10 flex items-center justify-center text-yellow-500">
                        <Wallet className="w-4 h-4" />
                    </div>
                    {m.coin}
                  </td>
                  <td className="p-4 text-gray-300">
                    <span className="px-2 py-1 bg-gray-800 rounded text-xs text-gray-400 border border-gray-700">
                        {m.network}
                    </span>
                  </td>
                  <td className="p-4 font-mono text-sm text-gray-400 truncate max-w-[200px]" title={m.address}>
                    {m.address}
                  </td>
                  <td className="p-4">
                    {m.qr_code_url ? (
                        <div className="group relative">
                             <QrCode className="w-5 h-5 text-gray-400 group-hover:text-yellow-500 transition cursor-pointer" />
                             {/* Hover Preview could go here */}
                             <div className="hidden group-hover:block absolute bottom-full left-1/2 -translate-x-1/2 mb-2 p-1 bg-white rounded shadow-xl z-10 w-24">
                                <img src={m.qr_code_url} alt="QR" className="w-full h-auto" />
                             </div>
                        </div>
                    ) : (
                      <span className="text-gray-600 text-xs">-</span>
                    )}
                  </td>
                  <td className="p-4">
                    {m.is_active ? (
                        <span className="flex items-center gap-1 text-green-400 bg-green-900/20 px-2 py-1 rounded text-xs w-fit">
                            <Check className="w-3 h-3" /> Active
                        </span>
                    ) : (
                        <span className="flex items-center gap-1 text-red-400 bg-red-900/20 px-2 py-1 rounded text-xs w-fit">
                            <X className="w-3 h-3" /> Disabled
                        </span>
                    )}
                  </td>
                  <td className="p-4 text-right">
                    <button
                      onClick={() => handleEdit(m)}
                      className="p-2 hover:bg-gray-800 rounded-lg text-gray-400 hover:text-white transition"
                      title="Edit"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
              {methods.length === 0 && (
                <tr>
                  <td colSpan={6} className="p-12 text-center text-gray-500">
                    <div className="flex flex-col items-center gap-2">
                        <Wallet className="w-10 h-10 text-gray-700" />
                        <p>No deposit methods found.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-[#1f2937] p-6 rounded-xl w-full max-w-md shadow-2xl border border-gray-700 animate-in fade-in zoom-in duration-200">
            <h2 className="text-xl font-bold mb-6 text-white flex items-center gap-2">
              {editingId ? <Edit className="w-5 h-5 text-yellow-500" /> : <Plus className="w-5 h-5 text-yellow-500" />}
              {editingId ? t('admin.edit_method') : t('admin.add_method')}
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-xs text-gray-400 mb-1.5 uppercase font-medium">{t('admin.coin_symbol')}</label>
                <input
                  value={coin}
                  onChange={(e) => setCoin(e.target.value)}
                  className="w-full bg-[#111827] border border-gray-700 rounded-lg p-2.5 focus:border-yellow-500 outline-none text-white text-sm"
                  placeholder="e.g. USDT"
                />
              </div>

              <div>
                <label className="block text-xs text-gray-400 mb-1.5 uppercase font-medium">{t('admin.network')}</label>
                <input
                  value={network}
                  onChange={(e) => setNetwork(e.target.value)}
                  className="w-full bg-[#111827] border border-gray-700 rounded-lg p-2.5 focus:border-yellow-500 outline-none text-white text-sm"
                  placeholder="e.g. TRC20"
                />
              </div>

              <div>
                <label className="block text-xs text-gray-400 mb-1.5 uppercase font-medium">{t('admin.wallet_address')}</label>
                <input
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full bg-[#111827] border border-gray-700 rounded-lg p-2.5 focus:border-yellow-500 outline-none text-white text-sm font-mono"
                  placeholder="0x..."
                />
              </div>

              <div>
                <label className="block text-xs text-gray-400 mb-1.5 uppercase font-medium">{t('admin.qr_image')}</label>
                <div className="border border-dashed border-gray-700 rounded-lg p-4 bg-[#111827/50] text-center hover:bg-[#111827] transition">
                    <input
                    type="file"
                    accept="image/*"
                    id="qr-upload"
                    onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                        setQrFile(e.target.files[0]);
                        }
                    }}
                    className="hidden"
                    />
                    <label htmlFor="qr-upload" className="cursor-pointer flex flex-col items-center gap-2">
                        <QrCode className="w-8 h-8 text-gray-500" />
                        <span className="text-sm text-blue-400 hover:text-blue-300">
                            {qrFile ? qrFile.name : "Click to upload QR image"}
                        </span>
                    </label>
                </div>
                {(currentQrUrl && !qrFile) && (
                  <div className="mt-2 text-xs text-gray-500 flex items-center gap-1">
                    <Check className="w-3 h-3 text-green-500" /> {t('admin.current_image')}
                  </div>
                )}
              </div>

              <div className="flex items-center gap-3 pt-2">
                <div className={`w-10 h-6 rounded-full p-1 cursor-pointer transition-colors duration-200 ease-in-out ${isActive ? 'bg-yellow-500' : 'bg-gray-700'}`} onClick={() => setIsActive(!isActive)}>
                     <div className={`w-4 h-4 bg-white rounded-full shadow-sm transform transition-transform duration-200 ease-in-out ${isActive ? 'translate-x-4' : 'translate-x-0'}`} />
                </div>
                <span className="text-sm text-gray-300 select-none cursor-pointer" onClick={() => setIsActive(!isActive)}>
                  {isActive ? t('admin.active_visible') : t('admin.disabled_hidden')}
                </span>
              </div>

            </div>

            <div className="flex justify-end gap-3 mt-8 pt-4 border-t border-gray-700">
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition text-sm"
              >
                Cancel
              </button>
              <button
                onClick={save}
                disabled={loading}
                className="bg-yellow-500 hover:bg-yellow-400 text-black px-4 py-2 rounded-lg flex items-center gap-2 transition disabled:opacity-50 disabled:cursor-not-allowed font-medium text-sm"
              >
                {loading ? "Saving..." : t('admin.save_method')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
