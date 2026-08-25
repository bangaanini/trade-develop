"use client";

import { useEffect, useState } from "react";
import { useLanguage } from "@/context/LanguageContext";
import { Shield, ChevronRight } from "lucide-react";
import KYCModal from "@/components/modals/KYCModal";
import { toast } from "react-hot-toast";
import DepositHistory from "@/components/account/DepositHistory";

type DepositMethod = {
  id: string;
  coin: string;
  network: string;
  address: string;
  qr_code_url: string;
};

export default function DepositPage() {
  const { t } = useLanguage();
  const [methods, setMethods] = useState<DepositMethod[]>([]);
  const [selected, setSelected] = useState<DepositMethod | null>(null);
  const [amount, setAmount] = useState("");

  const [proof, setProof] = useState<File | null>(null);
  const [proofPreview, setProofPreview] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [kycVerified, setKycVerified] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [showKYCModal, setShowKYCModal] = useState(false);

  async function loadMethods() {
    try {
      const res = await fetch("/api/deposit/methods");
      if (!res.ok) {
        console.error("API Error:", res.status, res.statusText);
        return;
      }
      const json = await res.json();
      setMethods(json.data || []);
    } catch (err) {
      console.error("Fetch failed", err);
    }
  }

  async function loadUser() {
     try {
        const res = await fetch("/api/auth/me");
        if(res.ok) {
            const data = await res.json();
            if(data.user) {
                setUserId(data.user.id);
                setKycVerified(!!data.user.kyc_verified);
            }
        }
     } catch(e) {
        console.error(e);
     } finally {
        setCheckingAuth(false);
     }
  }

  async function submit() {
    if (!selected) return;

    if (!amount || !proof) {
      toast.error(t('deposit.fill_fields'));
      return;
    }

    setLoading(true);
    try {
      if (!userId) {
        toast.error(t('deposit.login_required'));
        return;
      }

      const formData = new FormData();
      formData.append("userId", userId);
      formData.append("depositMethodId", selected.id);
      formData.append("amount", amount);

      if (proof) {
        formData.append("proof", proof);
      }

      const res = await fetch("/api/deposit/create", {
        method: "POST",
        body: formData,
      });

      const json = await res.json();

      if (!res.ok) {
        throw new Error(json.error || "Submission failed");
      }

      toast.success(t('deposit.submitted'));
      setAmount("");

      setProof(null);
      setProofPreview("");
      setSelected(null); // Optional: go back to selection
    } catch (e: any) {
      console.error(e);
      toast.error(e.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadMethods();
    loadUser();
  }, []);

  if (checkingAuth) {
    return (
        <div className="flex items-center justify-center min-h-[50vh]">
            <div className="w-8 h-8 border-4 border-yellow-500 border-t-transparent rounded-full animate-spin" />
        </div>
    );
  }

  // Not logged in or Not KYC verified
  if (!kycVerified) {
    return (
        <div className="max-w-2xl mx-auto px-6 py-20 text-center space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
             <div className="w-24 h-24 bg-yellow-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <Shield className="w-12 h-12 text-yellow-500" />
            </div>
            
            <div className="space-y-4">
                <h1 className="text-3xl font-bold text-white">Verification Required</h1>
                <p className="text-gray-400 max-w-md mx-auto">
                    To ensure the security of your assets and comply with regulations, identity verification (KYC) is required before making deposits.
                </p>
            </div>

            <div className="pt-4">
                <button 
                    onClick={() => setShowKYCModal(true)}
                    className="inline-flex items-center gap-2 bg-yellow-500 text-black px-8 py-3 rounded-xl font-bold hover:bg-yellow-400 transition transform hover:scale-105"
                >
                    Complete Verification
                    <ChevronRight className="w-5 h-5" />
                </button>
            </div>

            <p className="text-sm text-gray-500">
                Verification usually takes less than 5 minutes.
            </p>

            <KYCModal 
                isOpen={showKYCModal} 
                onClose={() => setShowKYCModal(false)}
                onSuccess={() => {
                    // Optional: reload user or show pending state
                    loadUser();
                }}
            />
        </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto text-white p-6">
      <h1 className="text-3xl font-bold mt-15 mb-8 text-center bg-linear-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
        {t('deposit.title')}
      </h1>

      {/* STEP 1: SELECT ASSET */}
      <div className="mb-10">
        <h2 className="text-xl font-semibold mb-4 text-gray-300 flex items-center gap-2">
          <span className="bg-yellow-500 text-xs text-black px-2 py-1 rounded font-bold">1</span> {t('deposit.select_asset')}
        </h2>
        
        {methods.length === 0 && (
          <div className="text-gray-500 text-center py-8 bg-[#111827] rounded-lg">
            {t('deposit.loading_methods')}
          </div>
        )}

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {methods.map((m) => (
            <button
              key={m.id}
              onClick={() => setSelected(m)}
              className={`p-4 rounded-xl border transition-all duration-200 flex flex-col items-center justify-center gap-2 relative overflow-hidden group ${
                selected?.id === m.id
                  ? "bg-yellow-900/20 border-yellow-500 text-yellow-400 ring-1 ring-yellow-500"
                  : "bg-[#1f2937] border-gray-700 hover:border-gray-500 text-gray-300 hover:bg-[#374151]"
              }`}
            >
              <span className="font-bold text-lg tracking-wide">{m.coin}</span>
              <span className="text-xs text-gray-500 uppercase">{m.network}</span>
              
              {selected?.id === m.id && (
                <div className="absolute inset-0 bg-yellow-400/10 pointer-events-none" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* STEP 2: DETAILS & FORM */}
      {selected && (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-8">
          
          <div className="grid md:grid-cols-2 gap-8">
            {/* Wallet Information */}
            <div className="bg-[#111827] p-6 rounded-2xl border border-gray-800 shadow-xl">
              <h3 className="text-xl font-bold border-b border-gray-800 pb-4 mb-6 text-gray-100 flex items-center gap-2">
                 <span className="bg-yellow-500 text-xs text-black px-2 py-1 rounded font-bold">2</span> {t('deposit.transfer_details')}
              </h3>
              
              <div className="space-y-6">
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-2">{t('deposit.network')}</label>
                  <div className="inline-block px-3 py-1 bg-yellow-900/30 text-yellow-400 rounded-full border border-yellow-900/50 text-sm font-medium">
                    {selected.network}
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-2">
                    {t('deposit.copy_address')}
                  </label>
                  <div className="bg-black/40 p-4 rounded-lg border border-gray-700 font-mono text-sm break-all text-gray-300 select-all hover:border-gray-600 transition">
                    {selected.address}
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    {t('deposit.only_send')} <strong>{selected.coin} ({selected.network})</strong> 
                  </p>
                </div>

                {selected.qr_code_url && (
                  <div>
                     <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-2">
                        Scan QR Code
                     </label>
                    <div className="bg-white p-3 rounded-xl inline-block shadow-lg">
                        <img 
                            src={selected.qr_code_url} 
                            className="w-40 h-40 object-contain" 
                            alt="QR Code"
                        />
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Deposit Form */}
            <div className="bg-[#111827] p-6 rounded-2xl border border-gray-800 shadow-xl h-fit">
              <h3 className="text-xl font-bold border-b border-gray-800 pb-4 mb-6 text-gray-100 flex items-center gap-2">
                 <span className="bg-yellow-500 text-xs text-black px-2 py-1 rounded font-bold">3</span> {t('deposit.confirmation')}
              </h3>
              
              <div className="space-y-5">
                <div>
                   <label className="block text-sm font-medium text-gray-400 mb-2">{t('deposit.amount_sent')}</label>
                   <div className="relative">
                     <input
                       type="number"
                       placeholder="0.00"
                       className="w-full pl-4 pr-12 py-3 bg-[#1f2937] border border-gray-700 rounded-lg focus:ring-2 focus:ring-yellow-500 outline-none text-white transition placeholder-gray-600"
                       value={amount}
                       onChange={(e) => setAmount(e.target.value)}
                     />
                     <div className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 text-sm font-bold">
                       {selected.coin}
                     </div>
                   </div>
                </div>



                <div>
                   <label className="block text-sm font-medium text-gray-400 mb-2">{t('deposit.proof')}</label>
                   <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-700 border-dashed rounded-lg cursor-pointer hover:bg-[#1f2937] transition group">
                      <div className="flex flex-col items-center justify-center pt-5 pb-6 overflow-hidden w-full h-full relative">
                          {proofPreview ? (
                              <img src={proofPreview} alt="Preview" className="w-full h-full object-contain absolute inset-0 p-2" />
                          ) : (
                              <>
                                <p className="mb-2 text-sm text-gray-400 group-hover:text-gray-300">
                                   <span className="font-semibold">{t('deposit.upload_click')}</span> {t('deposit.upload_hint')}
                                </p>
                                <p className="text-xs text-gray-500">PNG, JPG (MAX. 5MB)</p>
                              </>
                          )}
                      </div>
                      <input 
                        type="file" 
                        className="hidden" 
                        accept="image/*"
                        onChange={(e) => {
                           const file = e.target.files?.[0];
                           if (file) {
                               setProof(file);
                               setProofPreview(URL.createObjectURL(file));
                           }
                        }}
                      />
                   </label>
                </div>

                <div className="pt-4">
                    <button
                      className="w-full bg-linear-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-black font-bold py-3.5 rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
                      onClick={submit}
                      disabled={loading}
                    >
                      {loading ? (
                        <>
                          <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          Processing...
                        </>
                      ) : (
                        t('deposit.confirm')
                      )}
                    </button>
                    <p className="text-center text-xs text-gray-500 mt-4">
                        {t('deposit.review_wait')}
                    </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* HISTORY */}
      <div className="mt-12">
        <DepositHistory />
      </div>
    </div>
  );
}
