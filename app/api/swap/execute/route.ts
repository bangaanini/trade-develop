import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";
import crypto from "crypto";

export async function POST(req: Request) {
  try {
    const user = await getSession();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { fromCoin, toCoin, amount, quoteId } = await req.json(); // quoteId optional if we want to lock price, but for now we re-fetch

    if (!fromCoin || !toCoin || !amount || Number(amount) <= 0) {
      return NextResponse.json({ error: "Invalid parameters" }, { status: 400 });
    }

    // Determine symbol
    let symbol = "";
    let isBuy = false;

    if (fromCoin === "USDT") {
      symbol = `${toCoin}USDT`;
      isBuy = true;
    } else if (toCoin === "USDT") {
      symbol = `${fromCoin}USDT`;
      isBuy = false;
    } else {
      return NextResponse.json({ error: "Only USDT swaps supported" }, { status: 400 });
    }

    /* =====================================================
       1️⃣ FETCH LIVE PRICE & CALC
    ===================================================== */
    const res = await fetch(`https://api.binance.com/api/v3/ticker/price?symbol=${symbol}`);
    if (!res.ok) {
        return NextResponse.json({ error: "Price unavailable" }, { status: 500 });
    }
    const data = await res.json();
    const price = Number(data.price);
    const FEE_PERCENT = 0.005;

    /* =====================================================
       2️⃣ TRANSACTION
    ===================================================== */
    await db.query("BEGIN");

    try {
        let fee = 0;
        let amountOut = 0;
        let rate = 0;
        let inputAmount = Number(amount);

        // 1. CALCULATE & DEBIT
        if (isBuy) {
            // USDT -> COIN
            // Fee is EXTRA.
            fee = inputAmount * FEE_PERCENT; // Fee in USDT
            const totalDeduct = inputAmount + fee;
            
            rate = 1 / price;
            amountOut = inputAmount / price;

            // Debit USDT (Input + Fee)
            const { rows: fromWallets } = await db.query(
                `SELECT * FROM wallets WHERE user_id = $1 AND coin = $2`,
                [user.id, fromCoin]
            );
            const fromWallet = fromWallets[0];

            if (!fromWallet || Number(fromWallet.balance) < totalDeduct) {
                throw new Error(`Insufficient ${fromCoin} balance (Need ${totalDeduct})`);
            }

            // Deduct Full USDT Amount + Fee
            await db.query(
                `UPDATE wallets SET balance = balance - $1, updated_at = now() WHERE id = $2`,
                [totalDeduct, fromWallet.id]
            );

            // Log Debit (Swap Amount)
            await db.query(
                `INSERT INTO wallet_logs (id, user_id, coin, change, balance_before, balance_after, type, reference_id, description, created_at)
                 VALUES ($1, $2, $3, $4, $5, $6, 'swap_out', $7, $8, now())`,
                [
                    crypto.randomUUID(), 
                    user.id, 
                    fromCoin, 
                    inputAmount, 
                    Number(fromWallet.balance), 
                    Number(fromWallet.balance) - inputAmount, 
                    crypto.randomUUID(), 
                    `Swap to ${toCoin}`
                ]
            );

             // Log Debit (Fee)
             await db.query(
                `INSERT INTO wallet_logs (id, user_id, coin, change, balance_before, balance_after, type, reference_id, description, created_at)
                 VALUES ($1, $2, $3, $4, $5, $6, 'swap_fee', $7, $8, now())`,
                [
                    crypto.randomUUID(), 
                    user.id, 
                    fromCoin, 
                    fee, 
                    Number(fromWallet.balance) - inputAmount, 
                    Number(fromWallet.balance) - totalDeduct, 
                    crypto.randomUUID(), 
                    `Swap Fee (0.5%)`
                ]
            );

        } else {
             // COIN -> USDT
             // Fee deducted from USDT Output.
             rate = price;
             const grossOutput = inputAmount * price;
             fee = grossOutput * FEE_PERCENT; // Fee in USDT
             amountOut = grossOutput - fee;

             // Debit Coin (Input)
             const { rows: fromWallets } = await db.query(
                 `SELECT * FROM wallets WHERE user_id = $1 AND coin = $2`,
                 [user.id, fromCoin]
             );
             const fromWallet = fromWallets[0];

             if (!fromWallet || Number(fromWallet.balance) < inputAmount) {
                 throw new Error(`Insufficient ${fromCoin} balance`);
             }

             // Deduct Full Coin Amount
             await db.query(
                `UPDATE wallets SET balance = balance - $1, updated_at = now() WHERE id = $2`,
                [inputAmount, fromWallet.id]
             );
            
             // Log Debit
             await db.query(
                `INSERT INTO wallet_logs (id, user_id, coin, change, balance_before, balance_after, type, reference_id, description, created_at)
                 VALUES ($1, $2, $3, $4, $5, $6, 'swap_out', $7, $8, now())`,
                [
                    crypto.randomUUID(), 
                    user.id, 
                    fromCoin, 
                    inputAmount, 
                    Number(fromWallet.balance), 
                    Number(fromWallet.balance) - inputAmount, 
                    crypto.randomUUID(), 
                    `Swap to ${toCoin}`
                ]
            );
        }

        // 2. CREDIT OUTPUT
        let balBeforeTo = 0;
        const { rows: toWallets } = await db.query(
            `SELECT * FROM wallets WHERE user_id = $1 AND coin = $2`,
            [user.id, toCoin]
        );
        
        if (toWallets.length > 0) {
            balBeforeTo = Number(toWallets[0].balance);
            await db.query(
                `UPDATE wallets SET balance = balance + $1, updated_at = now() WHERE id = $2`,
                [amountOut, toWallets[0].id]
            );
        } else {
            const newId = crypto.randomUUID();
            await db.query(
                `INSERT INTO wallets (id, user_id, coin, balance, frozen_balance) VALUES ($1, $2, $3, $4, 0)`,
                [newId, user.id, toCoin, amountOut]
            );
        }
        
        // Log Credit
        const swapId = crypto.randomUUID();
        await db.query(
            `INSERT INTO wallet_logs (id, user_id, coin, change, balance_before, balance_after, type, reference_id, description, created_at)
             VALUES ($1, $2, $3, $4, $5, $6, 'swap_in', $7, $8, now())`,
            [
                crypto.randomUUID(), 
                user.id, 
                toCoin, 
                amountOut, 
                balBeforeTo, 
                balBeforeTo + amountOut, 
                swapId, 
                `Swap from ${fromCoin}`
            ]
        );


        // 3. RECORD SWAP
        await db.query(
            `INSERT INTO swaps (id, user_id, from_coin, to_coin, amount_in, amount_out, fee, rate, created_at)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, now())`,
             [swapId, user.id, fromCoin, toCoin, amount, amountOut, fee, rate]
        );

        await db.query("COMMIT");
        return NextResponse.json({ success: true, amountOut, fee });

    } catch (err) {
        await db.query("ROLLBACK");
        throw err;
    }

  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
