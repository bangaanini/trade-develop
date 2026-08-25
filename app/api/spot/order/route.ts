import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";
import crypto from "crypto";

export async function POST(req: Request) {
  try {
    /* =====================================================
       1️⃣ AUTH TOKEN
    ===================================================== */
    const user = await getSession();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    /* =====================================================
       2️⃣ PAYLOAD
    ===================================================== */
    const { symbol, side, type, price, amount } = await req.json();

    if (!symbol || !side || !type || !amount) {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }

    if (!["buy", "sell"].includes(side)) {
      return NextResponse.json({ error: "Invalid side" }, { status: 400 });
    }

    if (!["limit", "market"].includes(type)) {
      return NextResponse.json({ error: "Invalid order type" }, { status: 400 });
    }

    /* =====================================================
       3️⃣ AMBIL HARGA MARKET (JIKA MARKET ORDER)
    ===================================================== */
    let finalPrice = Number(price);

    if (type === "market") {
      const { rows: priceRows } = await db.query(
        `SELECT price FROM price_cache WHERE symbol = $1`,
        [symbol]
      );
      
      const priceRow = priceRows[0];

      if (!priceRow) {
        return NextResponse.json(
          { error: "Market price unavailable" },
          { status: 500 }
        );
      }

      finalPrice = Number(priceRow.price);
    }

    if (!finalPrice || finalPrice <= 0) {
      return NextResponse.json({ error: "Invalid price" }, { status: 400 });
    }

    /* =====================================================
       5️⃣ TRANSACTION START
    ===================================================== */
    await db.query("BEGIN");

    try {
        let logBalanceBefore = 0;
        let logBalanceAfter = 0;
        let logCoin = "";
        let logChange = 0;
        let logType = "";
        let logRefId = crypto.randomUUID();

        /* =====================================================
           6️⃣ WALLET FREEZE (DEDUCTION)
        ===================================================== */
        const baseCoin = symbol; // BTC
        const quoteCoin = "USDT";

        if (side === "buy") {
          // BUY → cek USDT
          const cost = finalPrice * amount;

          const { rows: wallets } = await db.query(
            `SELECT * FROM wallets WHERE user_id = $1 AND coin = $2`,
            [user.id, quoteCoin]
          );
          const wallet = wallets[0];

          if (!wallet || Number(wallet.balance) < cost) {
            throw new Error("Insufficient USDT balance");
          }

          // freeze USDT
          await db.query(
            `UPDATE wallets 
             SET balance = balance - $1, frozen_balance = frozen_balance + $1, updated_at = now()
             WHERE id = $2`,
            [cost, wallet.id]
          );
        } else {
          // SELL → cek BASE COIN
          const { rows: wallets } = await db.query(
            `SELECT * FROM wallets WHERE user_id = $1 AND coin = $2`,
            [user.id, baseCoin]
          );
          const wallet = wallets[0];

          if (!wallet || Number(wallet.balance) < amount) {
            throw new Error(`Insufficient ${baseCoin} balance`);
          }

          // freeze BASE COIN
          await db.query(
            `UPDATE wallets 
             SET balance = balance - $1, frozen_balance = frozen_balance + $1, updated_at = now()
             WHERE id = $2`,
            [amount, wallet.id]
          );
        }

        /* =====================================================
           7️⃣ INSERT SPOT ORDER
        ===================================================== */
        // Generate BigInt compatible ID (timestamp + random)
        const orderId = Date.now() + Math.floor(Math.random() * 1000);
        
        const { rows: orders } = await db.query(
          `INSERT INTO spot_orders (id, user_id, symbol, side, type, price, amount, status, filled_amount, created_at)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, now())
           RETURNING *`,
          [
            orderId,
            user.id,
            symbol,
            side,
            type,
            finalPrice,
            amount,
            type === "market" ? "filled" : "open", // LIMIT stays open, MARKET fills immediately
            type === "market" ? amount : 0,
          ]
        );
        const order = orders[0];

        /* =====================================================
           8️⃣ IMMEDIATE SETTLEMENT (MARKET ONLY)
        ===================================================== */
        if (type === "market") {
            const cost = finalPrice * amount;
            
            if (side === "buy") {
                // BUY MARKET: Were frozen USDT. Now release USDT and Credit BASE.
                
                // 1. Burn Frozen USDT
                await db.query(
                    `UPDATE wallets SET frozen_balance = frozen_balance - $1 WHERE user_id = $2 AND coin = $3`,
                    [cost, user.id, quoteCoin]
                );

                // 2. Credit BASE
                const { rows: baseWallets } = await db.query(
                    `SELECT * FROM wallets WHERE user_id = $1 AND coin = $2`,
                    [user.id, baseCoin]
                );
                
                if (baseWallets.length > 0) {
                    logBalanceBefore = Number(baseWallets[0].balance);
                    await db.query(
                        `UPDATE wallets SET balance = balance + $1 WHERE id = $2`,
                        [amount, baseWallets[0].id]
                    );
                    logBalanceAfter = logBalanceBefore + amount;
                } else {
                    const newId = crypto.randomUUID();
                    await db.query(
                        `INSERT INTO wallets (id, user_id, coin, balance, frozen_balance) VALUES ($1, $2, $3, $4, 0)`,
                        [newId, user.id, baseCoin, amount]
                    );
                    logBalanceAfter = amount;
                }

                logCoin = baseCoin;
                logChange = amount;
                logType = "spot_buy";

            } else {
                // SELL MARKET: Were frozen BASE. Now release BASE and Credit USDT.
                
                // 1. Burn Frozen BASE
                await db.query(
                    `UPDATE wallets SET frozen_balance = frozen_balance - $1 WHERE user_id = $2 AND coin = $3`,
                    [amount, user.id, baseCoin]
                );

                // 2. Credit USDT
                const { rows: usdtWallets } = await db.query(
                    `SELECT * FROM wallets WHERE user_id = $1 AND coin = $2`,
                    [user.id, quoteCoin]
                );

                if (usdtWallets.length > 0) {
                    logBalanceBefore = Number(usdtWallets[0].balance);
                    await db.query(
                        `UPDATE wallets SET balance = balance + $1 WHERE id = $2`,
                        [cost, usdtWallets[0].id]
                    );
                    logBalanceAfter = logBalanceBefore + cost;
                } else {
                     const newId = crypto.randomUUID();
                     await db.query(
                        `INSERT INTO wallets (id, user_id, coin, balance, frozen_balance) VALUES ($1, $2, $3, $4, 0)`,
                        [newId, user.id, quoteCoin, cost]
                    );
                    logBalanceAfter = cost;
                }

                logCoin = quoteCoin;
                logChange = cost;
                logType = "spot_sell";
            }

            // 3. Log
            await db.query(
                `INSERT INTO wallet_logs (id, user_id, coin, change, balance_before, balance_after, type, reference_id, description, created_at)
                 VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, now())`,
                [
                    crypto.randomUUID(),
                    user.id,
                    logCoin,
                    logChange,
                    logBalanceBefore,
                    logBalanceAfter,
                    logType,
                    logRefId,
                    `Spot Market Order #${orderId}`
                ]
            );
        }

        await db.query("COMMIT");

        return NextResponse.json({
          success: true,
          order,
        });

    } catch (err: any) {
        await db.query("ROLLBACK");
        console.error("SPOT ORDER ERROR:", err);
        return NextResponse.json(
          { error: err.message || "Failed to create order" },
          { status: 500 }
        );
    }
  } catch (err: any) {
    console.error("SPOT ORDER API CRITICAL ERROR:", err);
    return NextResponse.json(
      { error: err.message || "Unknown error occurred" },
      { status: 500 }
    );
  }
}

