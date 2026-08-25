"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, Wallet } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { toast } from "react-hot-toast";

export default function BindAddressPage() {
  const { t } = useLanguage();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [network, setNetwork] = useState("TRC20");
  const [address, setAddress] = useState("");
  const [savedAddresses, setSavedAddresses] = useState<any>({});

  // Load existing
  useEffect(() => {
      async function load() {
          try {
              const res = await fetch("/api/account/bind-address");
              const json = await res.json();
              if(json.success && json.data) {
                  const map: any = {};
                  json.data.forEach((item: any) => {
                      map[item.network] = item.address;
                  });
                  setSavedAddresses(map);
                  // Pre-fill if exists for default network
                  if(map["TRC20"]) setAddress(map["TRC20"]);
              }
          } catch(e) {
              console.error(e);
          }
      }
      load();
  }, []);

  // Update input when network changes
  useEffect(() => {
      if(savedAddresses[network]) {
          setAddress(savedAddresses[network]);
      } else {
          setAddress("");
      }
  }, [network, savedAddresses]);

  const handleSave = async (e: React.FormEvent) => {
      e.preventDefault();
      setLoading(true);
      try {
          const res = await fetch("/api/account/bind-address", {
              method: "POST",
              body: JSON.stringify({ network, address })
          });
          const json = await res.json();
          
          if(json.success) {
              toast.success(t('bind_address.success'));
              // Update local state
              setSavedAddresses((prev: any) => ({
                  ...prev,
                  [network]: address
              }));
          } else {
              toast.error(json.error || "Failed to bind address");
          }
      } catch(e) {
         toast.error("Error binding address");
      } finally {
          setLoading(false);
      }
  };

  return (
    <div className="max-w-md mx-auto text-foreground mt-4 px-4 pb-20">
       <div className="flex items-center gap-2 mb-6">
           <button onClick={() => router.back()} className="p-2 hover:bg-muted rounded-full">
               <ChevronLeft className="w-5 h-5" />
           </button>
           <h1 className="text-xl font-bold">{t('bind_address.title')}</h1>
       </div>

       <div className="bg-yellow-500/10 border border-yellow-500/20 p-4 rounded-lg mb-6 text-sm text-yellow-500">
           {t('bind_address.supported_networks')}
       </div>

       <form onSubmit={handleSave} className="space-y-6">
           
           {/* Network Selector */}
           <div className="space-y-2">
               <label className="text-sm text-gray-400">{t('bind_address.network')}</label>
               <div className="grid grid-cols-2 gap-4">
                   <button 
                     type="button"
                     onClick={() => setNetwork("TRC20")}
                     className={`p-4 rounded-xl border flex flex-col items-center gap-2 transition ${network === "TRC20" ? "border-yellow-400 bg-yellow-400/10 text-yellow-400" : "border-border hover:bg-muted/10 text-gray-400"}`}
                   >
                       <span className="font-bold">USDT-TRC20</span>
                   </button>
                   <button 
                     type="button"
                     onClick={() => setNetwork("ERC20")}
                     className={`p-4 rounded-xl border flex flex-col items-center gap-2 transition ${network === "ERC20" ? "border-yellow-400 bg-yellow-400/10 text-yellow-400" : "border-border hover:bg-muted/10 text-gray-400"}`}
                   >
                       <span className="font-bold">USDT-ERC20</span>
                   </button>
                   <button 
                     type="button"
                     onClick={() => setNetwork("BTC")}
                     className={`p-4 rounded-xl border flex flex-col items-center gap-2 transition ${network === "BTC" ? "border-yellow-400 bg-yellow-400/10 text-yellow-400" : "border-border hover:bg-muted/10 text-gray-400"}`}
                   >
                       <span className="font-bold">BITCOIN</span>
                   </button>
                   <button 
                     type="button"
                     onClick={() => setNetwork("ETH")}
                     className={`p-4 rounded-xl border flex flex-col items-center gap-2 transition ${network === "ETH" ? "border-yellow-400 bg-yellow-400/10 text-yellow-400" : "border-border hover:bg-muted/10 text-gray-400"}`}
                   >
                       <span className="font-bold">ETHEREUM</span>
                   </button>
               </div>
           </div>

           {/* Address Input */}
           <div className="space-y-2">
               <label className="text-sm text-gray-400">{t('bind_address.wallet_address')}</label>
               <div className="relative">
                   <Wallet className="absolute left-3 top-3 w-5 h-5 text-gray-500" />
                   <input 
                     type="text"
                     required
                     className="w-full bg-card border border-border rounded-lg p-3 pl-10 outline-none focus:border-yellow-400 transition font-mono text-sm"
                     placeholder={`${t('bind_address.enter_address')} ${network}`}
                     value={address}
                     onChange={e => setAddress(e.target.value)}
                   />
               </div>
           </div>

           <button 
             type="submit"
             disabled={loading}
             className="w-full bg-yellow-400 hover:bg-yellow-500 text-black font-bold py-3 rounded-lg shadow-lg transition disabled:opacity-50"
           >
               {loading ? t('common.processing') : t('bind_address.bind_button')}
           </button>

       </form>
    </div>
  );
}
