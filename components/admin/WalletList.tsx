"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

interface WalletBreakdown {
  type: string;
  balance: number;
  frozen: number;
}

interface Wallet {
  coin: string;
  balance: number | string;
  frozen_balance: number | string;
  breakdown?: WalletBreakdown[];
}

interface DepositNetwork {
  coin: string;
  network: string;
}

interface WalletListProps {
  wallets: Wallet[];
  userId: string;
  depositNetworks?: DepositNetwork[];
  reload: () => Promise<void>;
}

// Coin icons / colors
const COIN_COLORS: Record<string, string> = {
  USDT: "text-green-400",
  BTC: "text-orange-400",
  ETH: "text-blue-400",
  BNB: "text-yellow-400",
};

export default function WalletList({ wallets, userId, depositNetworks = [], reload }: WalletListProps) {
  const [expandedCoin, setExpandedCoin] = useState<string | null>(null);

  if (!wallets || wallets.length === 0) {
    return (
      <div className="py-6 text-center text-gray-500 text-sm">
        No wallets found for this user.
      </div>
    );
  }

  function getNetworkLabels(coin: string): string[] {
    return depositNetworks
      .filter((d) => d.coin === coin)
      .map((d) => d.network);
  }

  function fmt(v: number | string): string {
    const n = Number(v);
    if (isNaN(n)) return "0";
    return n.toLocaleString(undefined, { maximumFractionDigits: 8 });
  }

  return (
    <div>
      <table className="w-full text-sm">
        <thead>
          <tr className="text-xs text-gray-500 uppercase border-b border-gray-800">
            <th className="py-2 text-left font-medium">Coin</th>
            <th className="py-2 text-right font-medium">Balance</th>
            <th className="py-2 text-right font-medium">Frozen</th>
            <th className="py-2 w-6"></th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-800/60">
          {wallets.map((w) => {
            const networks = getNetworkLabels(w.coin);
            const hasBreakdown = w.breakdown && w.breakdown.length > 1;
            const isExpanded = expandedCoin === w.coin;

            return (
              <>
                <tr
                  key={w.coin}
                  className={`group ${hasBreakdown ? "cursor-pointer hover:bg-[#1f2937]/40" : ""}`}
                  onClick={() => hasBreakdown && setExpandedCoin(isExpanded ? null : w.coin)}
                >
                  <td className="py-3 pr-2">
                    <div className="flex items-center gap-2">
                      <span className={`font-bold ${COIN_COLORS[w.coin] || "text-gray-200"}`}>
                        {w.coin}
                      </span>
                      {networks.length > 0 && (
                        <div className="flex gap-1 flex-wrap">
                          {networks.map((net) => (
                            <span
                              key={net}
                              className="text-[9px] px-1.5 py-0.5 rounded bg-gray-800 text-gray-400 border border-gray-700 font-mono uppercase"
                            >
                              {net}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="py-3 text-right text-white font-mono">{fmt(w.balance)}</td>
                  <td className={`py-3 text-right font-mono ${Number(w.frozen_balance) > 0 ? "text-yellow-400" : "text-gray-600"}`}>
                    {fmt(w.frozen_balance)}
                  </td>
                  <td className="py-3 text-center text-gray-600">
                    {hasBreakdown && (
                      isExpanded ? <ChevronUp className="w-3.5 h-3.5 inline" /> : <ChevronDown className="w-3.5 h-3.5 inline" />
                    )}
                  </td>
                </tr>

                {/* Breakdown rows (funding / trading) */}
                {isExpanded && w.breakdown && w.breakdown.map((b) => (
                  <tr key={`${w.coin}-${b.type}`} className="bg-[#0d1420]">
                    <td className="py-1.5 pl-6 text-xs text-gray-500 capitalize">{b.type}</td>
                    <td className="py-1.5 text-right text-xs text-gray-400 font-mono">{fmt(b.balance)}</td>
                    <td className={`py-1.5 text-right text-xs font-mono ${Number(b.frozen) > 0 ? "text-yellow-500/70" : "text-gray-700"}`}>
                      {fmt(b.frozen)}
                    </td>
                    <td></td>
                  </tr>
                ))}
              </>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
