import { db } from "@/lib/db";
import crypto from "crypto";

export async function logWalletChange(
  params: {
    user_id: string;
    coin: string;
    change: number;
    balance_before: number;
    balance_after: number;
    type: string;
    reference_id?: string;
    description?: string;
  }
) {
  const id = crypto.randomUUID();

  // CONFIRMED: Table is wallet_logs
  await db.query(
    `INSERT INTO wallet_logs (id, user_id, coin, change, balance_before, balance_after, type, reference_id, description, created_at)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, now())`,
    [
      id,
      params.user_id,
      params.coin,
      params.change,
      params.balance_before,
      params.balance_after,
      params.type,
      params.reference_id,
      params.description
    ]
  );
}
