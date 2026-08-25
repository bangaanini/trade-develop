"use client";

import { useEffect, useState } from "react";
import { useLanguage } from "@/context/LanguageContext";

export default function DepositHistory() {
  const { t } = useLanguage();
  const [rows, setRows] = useState<any[]>([]);

  async function load() {
    try {
        const authRes = await fetch("/api/auth/me");
        if (!authRes.ok) return; 
        const authData = await authRes.json();
        if (!authData.user) return;

        const res = await fetch(
        `/api/deposit/history?userId=${authData.user.id}`
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
    <div className="bg-[#111827] rounded p-4">
      <h2 className="text-lg font-semibold mb-3">{t('wallet.deposit_history')}</h2>
      <table className="w-full text-sm">
        <thead className="text-gray-400 border-b border-gray-700">
          <tr>
            <th className="py-2 text-left">{t('wallet.date')}</th>
            <th className="py-2">{t('wallet.coin')}</th>
            <th className="py-2">{t('wallet.network')}</th>
            <th className="py-2">{t('wallet.amount')}</th>
            <th className="py-2">{t('trade.status')}</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((d) => (
            <tr key={d.id} className="border-b border-gray-800">
              <td className="py-2">
                {d.created_at && new Date(d.created_at).getFullYear() > 1970
                  ? new Date(d.created_at).toLocaleString()
                  : "-"}
              </td>
              <td className="py-2 text-center">{d.coin}</td>
              <td className="py-2 text-center">{d.network}</td>
              <td className="py-2 text-center">{d.amount}</td>
              <td className="py-2 text-center">
                <span
                  className={`px-2 py-1 rounded text-xs ${
                    d.status === "approved"
                      ? "bg-green-600"
                      : d.status === "pending"
                      ? "bg-yellow-600"
                      : "bg-red-600"
                  }`}
                >
                  {d.status}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {rows.length === 0 && (
        <div className="text-gray-400 mt-4">
          {t('wallet.no_deposit_history')}
        </div>
      )}
    </div>
  );
}
