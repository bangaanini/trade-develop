"use client";

import { useEffect, useState, useRef } from "react";
import Image from "next/image";
import playSound from "@/lib/sounds";
// import { toast } from "react-hot-toast"; // Replaced by local toast
import OptionOrderModal from "./OptionOrderModal";
import OptionResultModal from "./OptionResultModal";
import { XCircle, CheckCircle } from "lucide-react";

// Local Toast Component
function CenterToast({ message, type, onClose }: { message: string, type: 'success' | 'error', onClose: () => void }) {
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  useEffect(() => {
    const timer = setTimeout(() => {
      onCloseRef.current();
    }, 2000);
    return () => clearTimeout(timer);
  }, [message, type]);

  return (
    <div className="fixed inset-0 z-9999 flex items-center justify-center pointer-events-none fade-in zoom-in duration-200">
      <div 
        onClick={onClose}
        className="bg-[#1f2937] border border-gray-700 text-white px-6 py-4 rounded-xl shadow-2xl flex items-center gap-3 min-w-[300px] max-w-[90vw] animate-in slide-in-from-bottom-5 duration-300 pointer-events-auto cursor-pointer"
      >
        {type === 'success' ? (
          <CheckCircle className="w-8 h-8 text-green-500 shrink-0" />
        ) : (
          <XCircle className="w-8 h-8 text-red-500 shrink-0" />
        )}
        <div className="flex-1">
           <p className="font-semibold text-lg">{type === 'success' ? 'Success' : 'Error'}</p>
           <p className="text-gray-300 text-sm whitespace-pre-line">{message}</p>
        </div>
      </div>
    </div>
  );
}

export default function OptionPanel({ symbol }: { symbol: string }) {
  const [balance, setBalance] = useState(0);
  const [amount, setAmount] = useState("");
  const [duration, setDuration] = useState<number>(60);
  const [loading, setLoading] = useState(false);
  const [activeOrder, setActiveOrder] = useState<any>(null);
  const [countdown, setCountdown] = useState(0);
  const [showQuickAmount, setShowQuickAmount] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  
  // Modal states
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [showResultModal, setShowResultModal] = useState(false);
  const [completedOrder, setCompletedOrder] = useState<any>(null);
  
  // Custom Center Toast State
  const [toastState, setToastState] = useState<{ message: string, type: 'success' | 'error' } | null>(null);

  const toast = {
    success: (message: string) => setToastState({ message, type: 'success' }),
    error: (message: string) => setToastState({ message, type: 'error' })
  };

  // Settings dari database
  const [settings, setSettings] = useState<any>(null);
  const [durations, setDurations] = useState<any[]>([]);
  const [loadingSettings, setLoadingSettings] = useState(true);


  /* 🔹 Load option settings */
  async function loadSettings() {
    try {
      const res = await fetch("/api/option/settings");
      const json = await res.json();

      if (json.success) {
        setSettings(json.settings);
        setDurations(json.durations || []);
        
        // Set default duration ke duration pertama yang aktif
        if (json.durations && json.durations.length > 0) {
          setDuration(json.durations[0].seconds);
        }
      }
    } catch (err) {
      console.error("Failed to load settings:", err);
    } finally {
      setLoadingSettings(false);
    }
  }

  /* 🔹 Load USDT wallet */
  async function loadWallet(uid: string) {
    if (!uid) return;
    try {
      const res = await fetch(`/api/wallets?userId=${uid}`, { cache: 'no-store' });
      const json = await res.json();
      // Filter specifically for TRADING wallet
      const usdt = json.data?.find((w: any) => w.coin === "USDT" && w.wallet_type === "trading");
      setBalance(usdt ? Number(usdt.balance) : 0);
    } catch (e) {
      console.error("Failed to load wallet", e);
    }
  }

  useEffect(() => {
    async function init() {
      await loadSettings();
      // Get User
      try {
        const res = await fetch("/api/auth/me");
        if (res.ok) {
           const data = await res.json();
           if (data.user) {
              setUserId(data.user.id);
              loadWallet(data.user.id);
           }
        }
      } catch (e) {
         console.error(e);
      }
    }
    init();
  }, []);

  useEffect(() => {
    if (!userId) return;
    // 🔄 Polling wallet balance setiap 5 detik - optimized for VPS
    const pollInterval = setInterval(() => {
      loadWallet(userId);
    }, 5000); // 5 detik - reduced from 2s to prevent VPS suspension

    return () => clearInterval(pollInterval);
  }, [userId]);

  /* 🔹 Place option */
  async function place(direction: "up" | "down") {
    if (!amount || Number(amount) <= 0) {
      toast.error("Invalid amount");
      return;
    }

    // Validasi per-duration min_amount
    const selectedDuration = durations.find(d => d.seconds === duration);
    if (selectedDuration && selectedDuration.min_amount) {
      if (Number(amount) < selectedDuration.min_amount) {
        toast.error(`Minimum order amount for ${duration}s is ${selectedDuration.min_amount} USDT`);
        return;
      }
    }

    // Validasi global settings
    if (settings) {
      if (Number(amount) < settings.min_amount) {
        toast.error(`Minimum order amount is ${settings.min_amount} USDT`);
        return;
      }
      // Maximum amount validation removed
    }

    // Validasi balance
    if (Number(amount) > balance) {
      toast.error(`Insufficient balance!\n\nYou need ${Number(amount).toFixed(2)} USDT\nYour balance: ${balance.toFixed(2)} USDT`);
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/option/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          symbol,
          direction,
          amount: Number(amount),
          duration,
        }),
      });

      const json = await res.json();
      setLoading(false);

      if (!res.ok) {
        // Handle 401
        if (res.status === 401) {
            toast.error("Please login first");
            return;
        }
        toast.error(json.error || "Failed");
        return;
      }

      setAmount("");
      if (userId) loadWallet(userId); // refresh balance
      
      // Set active order and show modal
      setActiveOrder(json.order);
      setCountdown(json.remaining);
      setShowOrderModal(true);
      
      // dispatch event agar history reload immediate
      window.dispatchEvent(new Event("option-created"));
      toast.success("Order placed successfully!");
    } catch (e: any) {
      setLoading(false);
      toast.error(e.message || "Error");
    }
  }

  // Synchronized countdown with OptionHistory logic
  useEffect(() => {
    if (!activeOrder) return;

    // Timer untuk countdown - sama dengan OptionHistory
    const timer = setInterval(() => {
      const timeLeft = Math.max(
        0,
        Math.floor((new Date(activeOrder.expires_at).getTime() - Date.now()) / 1000)
      );
      setCountdown(timeLeft);

      // Close modal jika sudah expired
      if (timeLeft <= 0) {
        clearInterval(timer);
        setShowOrderModal(false);
        // Check for order result
        checkOrderResult(activeOrder.id);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [activeOrder]);

  // Poll untuk check order result setelah expiry
async function checkOrderResult(orderId: string) {
  let attempts = 0;
  const maxAttempts = 5;

  const pollResult = async () => {
    try {
      const res = await fetch(`/api/option/orders?status=closed`);
      if (!res.ok) {
        if (attempts < maxAttempts) {
          attempts++;
          setTimeout(pollResult, 1500);
        }
        return;
      }
      
      const json = await res.json();
      const completed = json.data?.find((o: any) => o.id === orderId);
      
      if (completed) {
        console.log("✅ Order settled:", completed);
        setCompletedOrder(completed);
        setShowResultModal(true);
        setActiveOrder(null);
        if (userId) loadWallet(userId); // refreshing balance immediately
        playSound(completed.status === "win" ? "win" : "lose");
      } else if (attempts < maxAttempts) {
        console.log(`⏳ Attempt ${attempts + 1}: Retrying...`);
        attempts++;
        setTimeout(pollResult, 1500);
      }
    } catch (err) {
      console.error("Error:", err);
      if (attempts < maxAttempts) {
        attempts++;
        setTimeout(pollResult, 1500);
      }
    }
  };

  // Wait 2 detik untuk worker settle
  setTimeout(pollResult, 2000);
}



  return (
    <div className="bg-card p-2 rounded-lg text-foreground">
      {/* 🔥 REAL BALANCE */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
          <Image src="/coins/theter.png" alt="USDT" width={20} height={20} className="rounded-full" />
          Trading Account
        </div>
        <div className=" text-success">
          {balance.toFixed(2)} USDT
        </div>
      </div>


      {/* AMOUNT */}
      <label className="block mb-2">Transaction amount</label>
      <div className="relative mb-2">
        <input
          className="w-full p-2 pr-10 rounded border border-input bg-background text-foreground"
          placeholder="100"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          type="number"
          min="1"
          
        />
        <button
          onClick={() => setShowQuickAmount(!showQuickAmount)}
          className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
          </svg>
        </button>
      </div>
      
      {/* QUICK AMOUNT SELECTION */}
      {showQuickAmount && (
        <div className="grid grid-cols-4 gap-2 mb-4">
          {[100, 200, 500, 1000].map((preset) => (
            <button
              key={preset}
              onClick={() => {
                setAmount(preset.toString());
                setShowQuickAmount(false);
              }}
              className="py-1.5 text-xs rounded border-2 border-input bg-background text-foreground hover:border-primary hover:bg-muted transition-all"
            >
              {preset}
            </button>
          ))}
        </div>
      )}
      
      

      {/* DURATION */}
      <label className="block mb-2">Trading time</label>
      {loadingSettings ? (
        <div className="text-sm text-muted-foreground mb-6">Loading durations...</div>
      ) : durations.length === 0 ? (
        <div className="text-sm text-danger mb-6">No durations available</div>
      ) : (
        <div className="grid grid-cols-3 gap-2 mb-6">
          {durations.map((d) => (
            <button
              key={d.id}
              onClick={() => setDuration(d.seconds)}
              className={`border py-2 rounded transition-all ${
                duration === d.seconds
                  ? "bg-primary text-primary-foreground border-primary"
                  : "border-border hover:bg-muted"
              }`}
            >
              <div className="font-medium">{d.seconds} S</div>
            </button>
          ))}
        </div>
      )}

      {/* ACTION */}
      <div className="flex gap-4">
        <button
          disabled={loading}
          onClick={() => {
            place("up");
            playSound("click");
          }}
          className="flex-1 bg-success text-white py-2 rounded disabled:opacity-50 font-bold hover:brightness-110 active:scale-95 transition-all"
        >
          Buy
        </button>

        <button
          disabled={loading}
          onClick={() => {
            place("down");
            playSound("click");
          }}
          className="flex-1 bg-danger text-white py-2 rounded disabled:opacity-50 font-bold hover:brightness-110 active:scale-95 transition-all"
        >
          Sell
        </button>
        
      </div>

      {/* Order Modal */}
      <OptionOrderModal
        isOpen={showOrderModal}
        onClose={() => setShowOrderModal(false)}
        order={activeOrder}
        initialCountdown={countdown}
      />

      {/* Result Modal */}
      <OptionResultModal
        isOpen={showResultModal}
        onClose={() => {
          setShowResultModal(false);
          setCompletedOrder(null);
        }}
        result={completedOrder}
      />
      
      {/* Center Toast */}
      {toastState && (
        <CenterToast 
          message={toastState.message} 
          type={toastState.type} 
          onClose={() => setToastState(null)} 
        />
      )}
    </div>
  );
}
