"use client";

import { useEffect, useState } from "react";

export default function UserDepositHistory({ userId }: { userId: string }) {
  const [rows, setRows] = useState<any[]>([]);

  async function load() {
    const res = await fetch(
      `/api/admin/deposits/user?userId=${userId}`
    );
    const json = await res.json();
    setRows(json.data || []);
  }

  useEffect(() => {
    load();
  }, [userId]);

  return (
    <div className="mt-8 bg-[#111827] rounded p-4">
      <h3 className="text-lg font-semibold mb-3">
        Deposit History
      </h3>

      <table className="w-full text-sm">
        <thead className="text-gray-400 border-b border-gray-700">
          <tr>
            <th>Date</th>
            <th>Coin</th>
            <th>Network</th>
            <th>Amount</th>
            <th>Status</th>
            <th>TXID</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((d) => (
            <tr key={d.id} className="border-b border-gray-800">
              <td>
                {d.created_at && new Date(d.created_at).getFullYear() > 1970
                  ? new Date(d.created_at).toLocaleString()
                  : "-"}
              </td>
              <td>{d.coin}</td>
              <td>{d.network}</td>
              <td>{d.amount}</td>
              <td>{d.status}</td>
              <td className="truncate max-w-[120px]">{d.txid}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {rows.length === 0 && (
        <div className="text-gray-400 mt-4">
          No deposit history
        </div>
      )}
    </div>
  );
}
