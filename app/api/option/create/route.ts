import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { v4 as uuidv4 } from "uuid";

export async function POST(req: Request) {
  try {
    /* 🔐 AUTH */
    const user = await getSession();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    /* 📦 PAYLOAD */
    const { symbol, direction, amount, duration } = await req.json();

    if (!symbol || !direction || !amount || !duration) {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }

    // 2️⃣ Get settings & validate
    const { rows: settingsRows } = await db.query(
      "SELECT * FROM option_settings WHERE is_enabled = true LIMIT 1"
    );
    if (settingsRows.length === 0) {
      return NextResponse.json(
        { error: "Option trading is currently disabled" },
        { status: 400 }
      );
    }
    const settings = settingsRows[0];

    // 3️⃣ Get duration info and validate
    const { rows: durationRows } = await db.query(
      "SELECT * FROM option_durations WHERE seconds = $1 AND is_active = true",
      [duration]
    );
    
    if (durationRows.length === 0) {
      return NextResponse.json(
        { error: "Invalid or inactive duration" },
        { status: 400 }
      );
    }
    
    const durationInfo = durationRows[0];
    
    // Determine minimum: per-duration min takes priority over global min
    const effectiveMinAmount = durationInfo.min_amount || settings.min_amount;
    
    // Validate minimum amount
    if (amount < effectiveMinAmount) {
      return NextResponse.json(
        { error: `Minimum amount is ${effectiveMinAmount} USDT` },
        { status: 400 }
      );
    }

    // Validate maximum amount (global max always applies)
    // if (amount > settings.max_amount) {
    //   return NextResponse.json(
    //     { error: `Maximum amount is ${settings.max_amount} USDT` },
    //     { status: 400 }
    //   );
    // }

    const payoutPercent = durationInfo.payout_percent || settings.payout_percent || 85;
    
    /* 💰 WALLET (Trading only) */
    const walletRes = await db.query(
      `SELECT * FROM wallets WHERE user_id = $1 AND coin = 'USDT' AND wallet_type = 'trading'`,
      [user.id]
    );
    const wallet = walletRes.rows[0];

    if (!wallet || Number(wallet.balance) < amount) {
      return NextResponse.json(
        { error: "Insufficient balance in trading wallet" },
        { status: 400 }
      );
    }

    /* 🔒 FREEZE BALANCE */
    await db.query(
      `UPDATE wallets
       SET balance = balance - $1,
           frozen_balance = frozen_balance + $1,
           updated_at = now()
       WHERE id = $2`,
      [amount, wallet.id]
    );

    /* 📈 ENTRY PRICE (price_cache) */
    const priceRes = await db.query(
      `SELECT price FROM price_cache WHERE symbol = $1`,
      [symbol]
    );

    let entryPrice: number;
    
    if (priceRes.rowCount === 0) {
        // Fallback: Fetch directly from Binance
        try {
            const res = await fetch(`https://api.binance.com/api/v3/ticker/price?symbol=${symbol}USDT`);
            if (!res.ok) throw new Error("Binance API error");
            const data = await res.json();
            entryPrice = Number(data.price);
            
            // Cache it for next time
            await db.query(`
                INSERT INTO price_cache (symbol, price, updated_at) 
                VALUES ($1, $2, now())
                ON CONFLICT (symbol) DO UPDATE SET price = $2, updated_at = now()
            `, [symbol, entryPrice]);
        } catch (e) {
             return NextResponse.json(
                { error: "Price unavailable from source" },
                { status: 500 }
             );
        }
    } else {
        entryPrice = Number(priceRes.rows[0].price);
    }

    /* 📝 INSERT OPTION */
    const expiresAt = new Date(Date.now() + duration * 1000);

    const insert = await db.query(
      `INSERT INTO options
       (id, user_id, symbol, direction, amount, entry_price, duration, expires_at, payout_percent, status)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,'open')
       RETURNING *`,
      [
        uuidv4(),
        user.id,
        symbol,
        direction,
        amount,
        entryPrice,
        duration,
        expiresAt,
        payoutPercent,
      ]
    );

    return NextResponse.json({
      success: true,
      order: insert.rows[0],
      remaining: duration,
    });

  } catch (err) {
    console.error("OPTION CREATE ERROR:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
