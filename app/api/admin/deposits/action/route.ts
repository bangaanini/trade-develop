import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { logWalletChange } from "@/lib/walletLogger";
import { getSession } from "@/lib/auth";
import crypto from "crypto";

export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session || (session.role !== "admin" && session.role !== "superadmin")) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { depositId, action } = await req.json();

    if (!depositId || !["approve", "reject"].includes(action)) {
        return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }

    // 1️⃣ Ambil data deposit
    const { rows: deposits } = await db.query(
        `SELECT * FROM deposits WHERE id = $1`,
        [depositId]
    );
    const deposit = deposits[0];

    if (!deposit) {
        return NextResponse.json({ error: "Deposit not found" }, { status: 404 });
    }

    if (deposit.status !== "pending") {
        return NextResponse.json(
        { error: "Deposit already processed" },
        { status: 400 }
        );
    }

    // 2️⃣ Reject → hanya update status
    if (action === "reject") {
        await db.query(
            `UPDATE deposits SET status = 'rejected' WHERE id = $1`,
            [depositId]
        );
        return NextResponse.json({ success: true });
    }

    // 3️⃣ APPROVE → update wallet + deposit
    const { rows: wallets } = await db.query(
        `SELECT * FROM wallets WHERE user_id = $1 AND coin = $2 AND wallet_type = 'funding'`,
        [deposit.user_id, deposit.coin]
    );
    const wallet = wallets[0];

    let balanceBefore = wallet ? Number(wallet.balance) : 0;
    let balanceAfter = balanceBefore + Number(deposit.amount);

    if (!wallet) {
        const newWalletId = crypto.randomUUID();
        await db.query(
            `INSERT INTO wallets (id, user_id, coin, balance, frozen_balance, wallet_type, created_at, updated_at)
             VALUES ($1, $2, $3, $4, 0, 'funding', now(), now())`,
            [newWalletId, deposit.user_id, deposit.coin, balanceAfter]
        );
    } else {
        await db.query(
            `UPDATE wallets SET balance = $1, updated_at = now() WHERE id = $2`,
            [balanceAfter, wallet.id]
        );
    }

    /* 🔐 WALLET AUDIT LOG */
    await logWalletChange({
        user_id: deposit.user_id,
        coin: deposit.coin,
        change: Number(deposit.amount),
        balance_before: balanceBefore,
        balance_after: balanceAfter,
        type: "deposit",
        reference_id: deposit.id,
        description: "Deposit approved",
    });

    // 4️⃣ Update deposit status
    await db.query(
        `UPDATE deposits SET status = 'approved' WHERE id = $1`,
        [depositId]
    );

    return NextResponse.json({ success: true });
  } catch (e: any) {
    console.error("Deposit Action Error:", e);
    return NextResponse.json({ error: e.message || "Internal Error" }, { status: 500 });
  }
}
