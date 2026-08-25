"use client";

import { useEffect, useState } from "react";
import { useLanguage } from "@/context/LanguageContext";

export default function WalletAuditLog() {
  const { t } = useLanguage();
  const [logs, setLogs] = useState<any[]>([]);

  async function load() {
    try {
        const authRes = await fetch("/api/auth/me");
        if (!authRes.ok) return;
        const authData = await authRes.json();
        if (!authData.user) return;

        const res = await fetch(
        `/api/wallets/logs?userId=${authData.user.id}`
        );
        const json = await res.json();
        setLogs(json.data || []);
    } catch (e) {
        console.error(e);
    }
  }

  useEffect(() => {
    load();
    // Poll every 5s
    const interval = setInterval(load, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-[#111827] p-4 rounded mt-6">
      <h2 className="text-lg font-semibold mb-3">
        {t('wallet.activity')}
      </h2>

      <table className="w-full text-sm">
        <thead className="text-gray-400 border-b border-gray-700">
          <tr>
            <th>{t('wallet.date')}</th>
            <th>{t('wallet.coin')}</th>
            <th>{t('wallet.change')}</th>
            <th>{t('wallet.balance')}</th>
            <th>{t('trade.type')}</th>
          </tr>
        </thead>
        <tbody>
          {logs.map(l => (
            <tr key={l.id} className="border-b border-gray-800">
              <td className="py-2">
                {l.created_at && new Date(l.created_at).getFullYear() > 1970
                  ? new Date(l.created_at).toLocaleString()
                  : "-"}
              </td>
              <td className="text-center">{l.coin}</td>
              <td className={`text-center ${
                  (l.change < 0 || ['swap_out', 'swap_fee'].includes(l.type)) 
                  ? "text-red-400" 
                  : "text-green-400"
              }`}>
                {(l.change < 0 || ['swap_out', 'swap_fee'].includes(l.type)) ? "-" : "+"}
                {Math.abs(Number(l.change)).toFixed(4)}
              </td>
              <td className="text-center">{Number(l.balance_after).toFixed(2)}</td>
              <td className="text-center">{l.type}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {logs.length === 0 && (
        <div className="text-gray-400 mt-4">
          {t('wallet.no_wallet_activity')}
        </div>
      )}
    </div>
  );
}
