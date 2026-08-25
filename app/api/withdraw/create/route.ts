import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { logWalletChange } from "@/lib/walletLogger";
import { getSession, comparePassword } from "@/lib/auth";
import crypto from "crypto";

// Minimum withdrawal amount per coin (in coin units)
const COIN_MIN: Record<string, number> = {
  USDT: 5,
  BTC: 0.0001,
  ETH: 0.001,
  BNB: 0.01,
  TRX: 10,
  XRP: 5,
  SOL: 0.05,
};

// Fee per coin (in coin units)
const COIN_FEE: Record<string, number> = {
  USDT: 5,
  BTC: 0.0001,
  ETH: 0.001,
  BNB: 0.005,
  TRX: 5,
  XRP: 2,
  SOL: 0.02,
};

export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { coin, network, amount, address, password } = await req.json();
    const userId = session.id;

    if (!coin || !network || !amount || !address || !password) {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }

    const minAmount = COIN_MIN[coin] ?? 5;
    if (Number(amount) <= minAmount) {
      return NextResponse.json({ error: `Minimum withdrawal is ${minAmount} ${coin}` }, { status: 400 });
    }

    // 1. Verify Password
    const { rows: users } = await db.query("SELECT password_hash FROM users WHERE id = $1", [userId]);
    const user = users[0];
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    const isPasswordValid = await comparePassword(password, user.password_hash);
    if (!isPasswordValid) {
      return NextResponse.json({ error: "Invalid password" }, { status: 403 });
    }

    // 2. Get Wallet (Funding only)
    const { rows: wallets } = await db.query(
      `SELECT * FROM wallets WHERE user_id = $1 AND coin = $2 AND wallet_type = 'funding'`,
      [userId, coin]
    );

    const wallet = wallets[0];

    if (!wallet) {
      return NextResponse.json({ error: "Funding wallet not found. Please transfer funds to funding wallet first." }, { status: 404 });
    }

    const currentBalance = Number(wallet.balance || 0);
    const withdrawAmount = Number(amount);

    if (currentBalance < withdrawAmount) {
      return NextResponse.json({ error: "Insufficient balance in funding wallet" }, { status: 400 });
    }

    // 3. Freeze Balance (Reduce Balance, Increase Frozen)
    const currentFrozen = Number(wallet.frozen_balance || 0);

    await db.query(
      `UPDATE wallets 
       SET balance = $1, frozen_balance = $2, updated_at = now() 
       WHERE id = $3`,
      [currentBalance - withdrawAmount, currentFrozen + withdrawAmount, wallet.id]
    );

    // 4. Create Withdraw Record
    const newId = crypto.randomUUID();
    const { rows: withdraws } = await db.query(
      `INSERT INTO withdraws (id, user_id, coin, network, amount, address, status, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, 'pending', NOW())
       RETURNING *`,
      [newId, userId, coin, network, withdrawAmount, address]
    );

    const withdrawData = withdraws[0];

    if (!withdrawData) {
      // Rollback
      await db.query(
        `UPDATE wallets 
         SET balance = $1, frozen_balance = $2 
         WHERE id = $3`,
        [currentBalance, currentFrozen, wallet.id]
      );
      return NextResponse.json({ error: "Insert failed" }, { status: 500 });
    }

    const feeAmount = COIN_FEE[coin] ?? 5;
    // LOG: Withdraw Request (Total amount blocked)
    await logWalletChange({
      user_id: userId,
      coin,
      change: -withdrawAmount,
      balance_before: currentBalance,
      balance_after: currentBalance - withdrawAmount,
      type: "withdraw_request",
      reference_id: withdrawData.id,
      description: `Withdraw request (Amount: ${withdrawAmount}, Fee: ${feeAmount} ${coin})`,
    });

    return NextResponse.json({ success: true });
  } catch (e: any) {
    console.error("Withdraw Error:", e);
    return NextResponse.json({ error: e.message || "Internal Error" }, { status: 500 });
  }
}
