import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";
import crypto from "crypto";

export async function POST(req: Request) {
  try {
    /* 🔐 AUTH */
    const user = await getSession();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { orderId } = await req.json();

    if (!orderId) {
      return NextResponse.json({ error: "Order ID is required" }, { status: 400 });
    }

    /* 🔍 CHECK ORDER */
    // Note: orderId is stored as BigInt in DB but passed as number/string from frontend.
    // Postgres driver handles string->bigint conversion usually, but let's be safe.
    
    // Lock key row
    const { rows: orders } = await db.query(
      `SELECT * FROM spot_orders WHERE id = $1 AND user_id = $2 FOR UPDATE`,
      [orderId, user.id]
    );
    const order = orders[0];

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    if (order.status !== "open") {
      return NextResponse.json({ error: "Order is not open" }, { status: 400 });
    }

    /* 💸 REFUND */
    const base = order.symbol;
    const quote = "USDT";
    const amount = Number(order.amount);
    const price = Number(order.price);
    const cost = price * amount;

    // Default logging
    let logCoin = "";
    let logChange = 0;
    let refundAmount = 0;

    if (order.side === "buy") {
      // Refund USDT
      logCoin = quote;
      refundAmount = cost;
      logChange = cost;

      await db.query(
        `UPDATE wallets 
         SET balance = balance + $1, frozen_balance = frozen_balance - $1, updated_at = now()
         WHERE user_id = $2 AND coin = $3`,
        [cost, user.id, quote]
      );
    } else {
      // Refund Base Coin
      logCoin = base;
      refundAmount = amount;
      logChange = amount;

      await db.query(
        `UPDATE wallets 
         SET balance = balance + $1, frozen_balance = frozen_balance - $1, updated_at = now()
         WHERE user_id = $2 AND coin = $3`,
        [amount, user.id, base]
      );
    }

    /* ❌ CANCEL ORDER */
    await db.query(
      `UPDATE spot_orders SET status = 'cancelled' WHERE id = $1`,
      [orderId]
    );

    /* 📝 LOG */
    // Get current balance for accurate logging
    const { rows: wallets } = await db.query(
      `SELECT balance FROM wallets WHERE user_id = $1 AND coin = $2`,
      [user.id, logCoin]
    );
    const currentBalance = Number(wallets[0].balance);

    await db.query(
        `INSERT INTO wallet_logs (id, user_id, coin, change, balance_before, balance_after, type, reference_id, description, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, 'spot_cancel', $7, $8, now())`,
        [
            crypto.randomUUID(),
            user.id, 
            logCoin, 
            logChange, 
            currentBalance - refundAmount, // approx before
            currentBalance, 
            crypto.randomUUID(), 
            `Cancel Spot Order #${orderId}`
        ]
    );

    return NextResponse.json({ success: true, message: "Order cancelled" });

  } catch (err: any) {
    console.error("Cancel Order Error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
