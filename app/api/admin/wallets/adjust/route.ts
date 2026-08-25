import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { logWalletChange } from "@/lib/walletLogger";
import { getSession } from "@/lib/auth";
import crypto from "crypto";

export async function POST(request: Request) {
  try {
    const session = await getSession();
    // Assuming only admin can adjust. Checking role.
    if (!session || (session.role !== "admin" && session.role !== "superadmin")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { userId, coin, amount, operation } = await request.json();

    if (!userId || !coin || !amount || !operation) {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }

    // 1️⃣ Ambil wallet per coin (prefer FUNDING wallet for deposits/admin adds)
    const { rows: wallets } = await db.query(
      `SELECT * FROM wallets WHERE user_id = $1 AND coin = $2 AND wallet_type = 'funding'`,
      [userId, coin]
    );
    const wallet = wallets[0];

    // 2️⃣ Wallet BELUM ADA → CREATE
    if (!wallet) {
      if (operation === "subtract") {
        return NextResponse.json(
          { error: "Wallet not found" },
          { status: 400 }
        );
      }

      const newId = crypto.randomUUID();
      await db.query(
        `INSERT INTO wallets (id, user_id, coin, balance, frozen_balance, wallet_type, created_at, updated_at) 
         VALUES ($1, $2, $3, $4, 0, 'funding', NOW(), NOW())`,
        [newId, userId, coin, amount]
      );

      // LOG CREATE
      await logWalletChange({
        user_id: userId,
        coin,
        change: amount,
        balance_before: 0,
        balance_after: amount,
        type: "admin_adjust",
        description: "Admin balance adjustment (Wallet Created)",
      });

      return NextResponse.json({ success: true, created: true });
    }

    // 3️⃣ Wallet ADA → UPDATE
    const currentBalance = Number(wallet.balance);
    const newBalance =
      operation === "add"
        ? currentBalance + amount
        : currentBalance - amount;

    if (newBalance < 0) {
      return NextResponse.json(
        { error: "Insufficient balance" },
        { status: 400 }
      );
    }

    await db.query(
      `UPDATE wallets 
       SET balance = $1, updated_at = now() 
       WHERE id = $2`,
      [newBalance, wallet.id]
    );

    // LOG UPDATE
    await logWalletChange({
      user_id: userId,
      coin,
      change: operation === "add" ? amount : -amount,
      balance_before: currentBalance,
      balance_after: newBalance,
      type: "admin_adjust",
      description: "Admin balance adjustment",
    });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("API error:", err);
    return NextResponse.json(
      { error: err.message || "Internal server error" },
      { status: 500 }
    );
  }
}
