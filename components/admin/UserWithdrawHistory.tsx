"use client";

import { useEffect, useState } from "react";

export default function UserWithdrawHistory({ userId }: { userId: string }) {
  const [rows, setRows] = useState<any[]>([]);

  async function load() {
    const res = await fetch(
      `/api/admin/withdraws/user?userId=${userId}`
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
        Withdraw History
      </h3>

      <table className="w-full text-sm">
        <thead className="text-gray-400 border-b border-gray-700">
          <tr>
            <th>Date</th>
            <th>Coin</th>
            <th>Network</th>
            <th>Amount</th>
            <th>Status</th>
            <th>Address</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((w) => (
            <tr key={w.id} className="border-b border-gray-800">
              <td>
                {w.created_at && new Date(w.created_at).getFullYear() > 1970
                  ? new Date(w.created_at).toLocaleString()
                  : "-"}
              </td>
              <td>{w.coin}</td>
              <td>{w.network}</td>
              <td>{w.amount}</td>
              <td>{w.status}</td>
              <td className="truncate max-w-[160px]">{w.address}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {rows.length === 0 && (
        <div className="text-gray-400 mt-4">
          No withdraw history
        </div>
      )}
    </div>
  );
}
