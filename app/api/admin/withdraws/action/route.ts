import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { logWalletChange } from "@/lib/walletLogger";
import { getSession } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session || (session.role !== "admin" && session.role !== "superadmin")) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { withdrawId, action, txid } = await req.json();
    if (!withdrawId || !["approve","reject"].includes(action)) {
        return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }

    const { rows: ws } = await db.query(
        `SELECT * FROM withdraws WHERE id = $1`,
        [withdrawId]
    );
    const w = ws[0];

    if (!w || w.status !== "pending") {
        return NextResponse.json({ error: "Already processed" }, { status: 400 });
    }

    const { rows: wallets } = await db.query(
        `SELECT * FROM wallets WHERE user_id = $1 AND coin = $2 AND wallet_type = 'funding'`,
        [w.user_id, w.coin]
    );
    const wallet = wallets[0];

    if (!wallet) {
        return NextResponse.json({ error: "Wallet not found" }, { status: 404 });
    }

    if (action === "reject") {
        const balanceBefore = Number(wallet.balance);
        const amountVal = Number(w.amount);
        const balanceAfter = balanceBefore + amountVal;

        // return frozen → balance
        await db.query(
            `UPDATE wallets 
             SET balance = $1, frozen_balance = frozen_balance - $2, updated_at = now() 
             WHERE id = $3`,
            [balanceAfter, amountVal, wallet.id]
        );

        await db.query(
            `UPDATE withdraws SET status = 'rejected' WHERE id = $1`,
            [withdrawId]
        );

        // LOG WALLET CHANGE (REJECT)
        await logWalletChange({
            user_id: w.user_id,
            coin: w.coin,
            change: amountVal,
            balance_before: balanceBefore,
            balance_after: balanceAfter,
            type: "withdraw_reject",
            reference_id: w.id,
            description: "Withdraw rejected",
        });

        return NextResponse.json({ success: true });
    }

    // approve: burn frozen (already removed from balance at request time)
    await db.query(
        `UPDATE wallets 
         SET frozen_balance = frozen_balance - $1, updated_at = now() 
         WHERE id = $2`,
        [Number(w.amount), wallet.id]
    );

    await db.query(
        `UPDATE withdraws SET status = 'approved', txid = $1 WHERE id = $2`,
        [txid, withdrawId]
    );

    return NextResponse.json({ success: true });
  } catch (e: any) {
    console.error("Withdraw Action Error:", e);
    return NextResponse.json({ error: e.message || "Internal Error" }, { status: 500 });
  }
}
