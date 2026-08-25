"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import WithdrawHistory from "@/components/account/WithdrawHistory";
import { Lock } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { toast } from "react-hot-toast";

type DepositMethod = {
  id: string;
  coin: string;
  network: string;
  address: string;
  qr_code_url: string;
};

// Map deposit method network names → wallet_addresses network keys
// deposit_methods uses: BITCOIN, ETHEREUM, TRC20, ERC20
// wallet_addresses uses: BTC, ETH, TRC20, ERC20
const NETWORK_MAP: Record<string, string> = {
  BITCOIN: "BTC",
  ETHEREUM: "ETH",
  TRC20: "TRC20",
  ERC20: "ERC20",
};

function toBindKey(network: string): string {
  return NETWORK_MAP[network] ?? network;
}

// Minimum withdrawal amount and fee per coin (in coin units)
const COIN_MIN: Record<string, number> = {
  USDT: 5,
  BTC: 0.0001,
  ETH: 0.001,
  BNB: 0.01,
  TRX: 10,
  XRP: 5,
  SOL: 0.05,
};

const COIN_FEE: Record<string, number> = {
  USDT: 5,
  BTC: 0.0001,
  ETH: 0.001,
  BNB: 0.005,
  TRX: 5,
  XRP: 2,
  SOL: 0.02,
};

function getCoinMin(coin: string) { return COIN_MIN[coin] ?? 5; }
function getCoinFee(coin: string) { return COIN_FEE[coin] ?? 5; }

export default function WithdrawPage() {
  const { t } = useLanguage();
  const router = useRouter();
  const [methods, setMethods] = useState<DepositMethod[]>([]);
  const [selected, setSelected] = useState<DepositMethod | null>(null);
  const [amount, setAmount] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [availableBalance, setAvailableBalance] = useState<number | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [boundAddress, setBoundAddress] = useState<string | null>(null);

  async function loadMethods() {
    try {
      const res = await fetch("/api/deposit/methods");
      if (!res.ok) return;
      const json = await res.json();
      setMethods(json.data || []);
    } catch (err) {
      console.error("Fetch failed", err);
    }
  }

  async function loadUser() {
    try {
      const res = await fetch("/api/auth/me");
      if (res.ok) {
        const data = await res.json();
        if (data.user) setUserId(data.user.id);
      }
    } catch (e) {
      console.error(e);
    }
  }

  async function fetchBalance(coin: string) {
    if (!userId) return;

    try {
      const res = await fetch(`/api/wallets?userId=${userId}`);
      const json = await res.json();
      // Only count the funding wallet balance for withdrawals
      const fundingWallet = json.data?.find(
        (w: any) => w.coin === coin && w.wallet_type === 'funding'
      );
      // Fallback: if no wallet_type column, use first match
      const anyWallet = json.data?.find((w: any) => w.coin === coin);
      const wallet = fundingWallet ?? anyWallet;
      setAvailableBalance(wallet ? Number(wallet.balance) : 0);
    } catch (e) {
      console.error(e);
    }
  }

  async function fetchBoundAddress(network: string) {
    if (!userId) return;
    try {
      const res = await fetch("/api/account/bind-address");
      const json = await res.json();
      if (json.success && json.data) {
        // Map the deposit method network name to the key stored in wallet_addresses
        const bindKey = toBindKey(network);
        const found = json.data.find((x: any) => x.network === bindKey);
        if (found) {
          setBoundAddress(found.address);
        } else {
          setBoundAddress(null);
        }
      }
    } catch (e) {
      console.error(e);
    }
  }

  useEffect(() => {
    loadMethods();
    loadUser();
  }, []);

  useEffect(() => {
    if (selected) {
      fetchBalance(selected.coin);
      fetchBoundAddress(selected.network);
      setAmount("");
      setPassword("");
    }
  }, [selected, userId]);

  async function submit() {
    if (!selected) return;
    if (!amount || !boundAddress || !password) {
      toast.error(t('deposit.fill_fields')); // Reuse deposit key or add generic
      return;
    }

    const minAmount = getCoinMin(selected.coin);
    const feeAmount = getCoinFee(selected.coin);

    if (Number(amount) <= minAmount) {
      toast.error(`Minimum withdrawal is ${minAmount} ${selected.coin}`);
      return;
    }

    if (Number(amount) - feeAmount <= 0) {
      toast.error(`Amount must be greater than the fee (${feeAmount} ${selected.coin})`);
      return;
    }

    if (availableBalance !== null && Number(amount) > availableBalance) {
      toast.error(t('trade.insufficient_balance'));
      return;
    }

    setLoading(true);
    try {
      if (!userId) {
        toast.error(t('deposit.login_required')); // Reuse
        return;
      }

      const res = await fetch("/api/withdraw/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: userId,
          coin: selected.coin,
          network: selected.network,
          amount: Number(amount),
          address: boundAddress,
          password: password
        }),
      });

      const json = await res.json();

      if (!res.ok) {
      }

      toast.success(t('withdraw.submitted'));
      setAmount("");
      setPassword("");
      setSelected(null);
      router.push("/wallet");
    } catch (e: any) {
      console.error(e);
      toast.error(e.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-5xl mx-auto text-white p-6 pb-24">
      <h1 className="text-3xl font-bold mb-8 text-center bg-clip-text text-transparent bg-linear-to-r from-yellow-400 to-orange-400">
        {t('withdraw.title')}
      </h1>

      {/* STEP 1: SELECT ASSET */}
      <div className="mb-10">
        <h2 className="text-xl font-semibold mb-4 text-gray-300 flex items-center gap-2">
          <span className="bg-yellow-600 text-xs text-white px-2 py-1 rounded">1</span> {t('withdraw.select_asset')}
        </h2>

        {methods.length === 0 && (
          <div className="text-gray-500 text-center py-8 bg-[#111827] rounded-lg">
            {t('withdraw.loading_methods')}
          </div>
        )}

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {methods.map((m) => (
            <button
              key={m.id}
              onClick={() => setSelected(m)}
              className={`p-4 rounded-xl border transition-all duration-200 flex flex-col items-center justify-center gap-2 relative overflow-hidden group ${selected?.id === m.id
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

            {/* Balance & Network Info */}
            <div className="bg-[#111827] p-6 rounded-2xl border border-gray-800 shadow-xl space-y-6">
              <h3 className="text-xl font-bold border-b border-gray-800 pb-4 mb-2 text-gray-100 flex items-center gap-2">
                <span className="bg-yellow-600 text-xs text-white px-2 py-1 rounded">2</span> {t('withdraw.details')}
              </h3>

              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-2">{t('withdraw.network')}</label>
                <div className="inline-block px-3 py-1 bg-yellow-900/30 text-yellow-400 rounded-full border border-yellow-900/50 text-sm font-medium">
                  {selected.network}
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-2">{t('withdraw.avail_balance')}</label>
                <div className="text-2xl font-mono text-white">
                  {availableBalance !== null ? availableBalance : "..."} <span className="text-sm text-gray-500">{selected.coin}</span>
                </div>
              </div>

              <div className="bg-yellow-900/10 border border-yellow-900/30 p-4 rounded-lg">
                <p className="text-xs text-yellow-500">
                  ⚠ {t('withdraw.ensure_network')}
                </p>
              </div>
            </div>

            {/* Withdraw Form */}
            <div className="bg-[#111827] p-6 rounded-2xl border border-gray-800 shadow-xl h-fit">
              <h3 className="text-xl font-bold border-b border-gray-800 pb-4 mb-6 text-gray-100 flex items-center gap-2">
                <span className="bg-yellow-600 text-xs text-white px-2 py-1 rounded">3</span> {t('withdraw.destination')}
              </h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">{t('withdraw.amount')}</label>
                  <div className="relative">
                    <input
                      type="number"
                      placeholder="0.00"
                      className="w-full pl-4 pr-16 py-3 bg-[#1f2937] border border-gray-700 rounded-lg focus:ring-2 focus:ring-yellow-500 outline-none text-white transition placeholder-gray-600"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                    />
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
                      <button
                        className="text-xs text-yellow-500 font-bold hover:underline"
                        onClick={() => setAmount(availableBalance?.toString() || "")}
                      >
                        MAX
                      </button>
                      <span className="text-gray-500 text-sm font-bold border-l border-gray-600 pl-2">
                        {selected.coin}
                      </span>
                    </div>
                  </div>
                  {/* Fee Calculation */}
                  {amount && Number(amount) > 0 && (() => {
                    const fee = getCoinFee(selected.coin);
                    const receive = Number(amount) - fee;
                    return (
                      <div className="mt-2 text-xs text-gray-400 flex justify-between">
                        <span>{t('withdraw.fee')}: {fee} {selected.coin}</span>
                        <span className={`${receive <= 0 ? "text-red-500" : "text-green-500"}`}>
                          {t('withdraw.receive')}: {receive > 0 ? receive.toFixed(8).replace(/\.?0+$/, '') : "0.00"} {selected.coin}
                        </span>
                      </div>
                    );
                  })()}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">{t('withdraw.password')}</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 w-4 h-4 text-gray-500" />
                    <input
                      type="password"
                      placeholder="Enter account password"
                      className="w-full pl-10 pr-4 py-3 bg-[#1f2937] border border-gray-700 rounded-lg focus:ring-2 focus:ring-yellow-500 outline-none text-white transition placeholder-gray-600"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">{t('withdraw.dest_address')}</label>

                  {boundAddress ? (
                    <div className="w-full px-4 py-3 bg-[#1f2937] border border-green-800/50 rounded-lg text-green-400 font-mono text-sm break-all flex items-center justify-between">
                      <span>{boundAddress}</span>
                      <span className="text-xs bg-green-900/20 text-green-500 px-2 py-1 rounded uppercase">Bound</span>
                    </div>
                  ) : (
                    <div className="p-4 bg-red-900/10 border border-red-900/30 rounded-lg text-center">
                      <p className="text-sm text-red-400 mb-3">{t('withdraw.no_bound')} {selected.network}</p>
                      <Link href="/account/bind-address" className="text-sm font-bold bg-yellow-500 hover:bg-yellow-600 text-black px-4 py-2 rounded transition">
                        {t('withdraw.bind_now')}
                      </Link>
                    </div>
                  )}

                </div>

                <div className="pt-4">
                  <button
                    className="w-full bg-yellow-600 hover:bg-yellow-700 text-black font-bold py-3.5 rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    onClick={submit}
                    disabled={loading || !amount || !boundAddress || !password}
                  >
                    {loading ? t('wallet.processing') : t('withdraw.confirm')}
                  </button>
                </div>
              </div>
            </div>
          </div>

        </div>
      )}

      {/* HISTORY SECTION */}
      <div className="mt-12 border-t border-gray-800 pt-8">
        <WithdrawHistory />
      </div>

    </div>
  );
}
