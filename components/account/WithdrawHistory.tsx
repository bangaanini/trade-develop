"use client";

import { useEffect, useState } from "react";
import { useLanguage } from "@/context/LanguageContext";

export default function WithdrawHistory() {
  const { t } = useLanguage();
  const [rows, setRows] = useState<any[]>([]);

  async function load() {
    try {
        const authRes = await fetch("/api/auth/me");
        if (!authRes.ok) return; 
        const authData = await authRes.json();
        if (!authData.user) return;

        const res = await fetch(
        `/api/withdraw/history?userId=${authData.user.id}`
        );
        const json = await res.json();
        setRows(json.data || []);
    } catch (e) {
        console.error(e);
    }
  }

  useEffect(() => {
    load();
  }, []);

  return (
    <div className="bg-[#111827] rounded p-4 mt-6">
      <h2 className="text-lg font-semibold mb-3">{t('wallet.withdraw_history')}</h2>

      <table className="w-full text-sm">
        <thead className="text-gray-400 border-b border-gray-700">
          <tr>
            <th className="py-2 text-left">{t('wallet.date')}</th>
            <th>{t('wallet.coin')}</th>
            <th>{t('wallet.network')}</th>
            <th>{t('trade.amount')}</th>
            <th>{t('trade.status')}</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((w) => (
            <tr key={w.id} className="border-b border-gray-800">
              <td className="py-2">
                {w.created_at && new Date(w.created_at).getFullYear() > 1970
                  ? new Date(w.created_at).toLocaleString()
                  : "-"}
              </td>
              <td className="text-center">{w.coin}</td>
              <td className="text-center">{w.network}</td>
              <td className="text-center">{w.amount}</td>
              <td className="text-center">
                <span
                  className={`px-2 py-1 rounded text-xs ${
                    w.status === "approved"
                      ? "bg-green-600"
                      : w.status === "pending"
                      ? "bg-yellow-600"
                      : "bg-red-600"
                  }`}
                >
                  {w.status}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {rows.length === 0 && (
        <div className="text-gray-400 mt-4">
          {t('wallet.no_withdraw_history')}
        </div>
      )}
    </div>
  );
}
