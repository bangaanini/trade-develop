import { db } from "@/lib/db";
import crypto from "crypto";

export async function settleSpotLimitOrders() {
  /* ============================================
     1️⃣ AMBIL SEMUA LIMIT ORDER YANG OPEN
  ============================================ */
  const { rows: orders } = await db.query(
    `SELECT * FROM spot_orders WHERE status = 'open' AND type = 'limit'`
  );

  if (!orders.length) return;

  for (const o of orders) {
    try {
      /* ============================================
         2️⃣ AMBIL HARGA MARKET
      ============================================ */
      const { rows: priceRows } = await db.query(
        `SELECT price FROM price_cache WHERE symbol = $1`,
        [o.symbol]
      );

      if (!priceRows.length) continue;

      const marketPrice = Number(priceRows[0].price);

      /* ============================================
         3️⃣ CEK APAKAH ORDER BISA DIEKSEKUSI
      ============================================ */
      let shouldFill = false;

      if (o.side === "buy" && marketPrice <= o.price) {
        shouldFill = true;
      }

      if (o.side === "sell" && marketPrice >= o.price) {
        shouldFill = true;
      }

      if (!shouldFill) continue;

      /* ============================================
         4️⃣ LOCK ORDER (ANTI DOUBLE FILL)
      ============================================ */
      /* ============================================
         4️⃣ LOCK ORDER (ANTI DOUBLE FILL)
      ============================================ */
      const { rowCount } = await db.query(
        `UPDATE spot_orders 
         SET status = 'settling' 
         WHERE id = $1 AND status = 'open'`,
        [o.id]
      );

      if (rowCount === 0) continue;

      try {
        await db.query("BEGIN");

        /* ============================================
           5️⃣ UPDATE WALLET
        ============================================ */
        const base = o.symbol;     // BTC
        const quote = "USDT";      // USDT
        const total = o.price * o.amount;

        // Variables for logging
        let logCoin = "";
        let logChange = 0;
        let logBalanceAfter = 0;
        let logBalanceBefore = 0; 

        if (o.side === "buy") {
          // 🔹 BUY → dapat BASE
          const { rows: baseWallets } = await db.query(
            `SELECT * FROM wallets WHERE user_id = $1 AND coin = $2`,
            [o.user_id, base]
          );

          if (baseWallets.length > 0) {
            logBalanceBefore = Number(baseWallets[0].balance);
            await db.query(
              `UPDATE wallets 
               SET balance = balance + $1, updated_at = now() 
               WHERE id = $2`,
              [o.amount, baseWallets[0].id]
            );
            logBalanceAfter = logBalanceBefore + Number(o.amount);
          } else {
            const newWalletId = crypto.randomUUID();
            await db.query(
              `INSERT INTO wallets (id, user_id, coin, balance, frozen_balance) VALUES ($1, $2, $3, $4, 0)`,
              [newWalletId, o.user_id, base, o.amount]
            );
            logBalanceAfter = Number(o.amount);
          }

          // Log for receiving Base Coin
          await db.query(
              `INSERT INTO wallet_logs (id, user_id, coin, change, balance_before, balance_after, type, reference_id, description, created_at)
               VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, 'spot_buy', $6, $7, now())`,
              [o.user_id, base, o.amount, logBalanceBefore, logBalanceAfter, crypto.randomUUID(), `Spot Buy Order #${o.id}`]
          );

          // release frozen USDT
          await db.query(
            `UPDATE wallets 
             SET frozen_balance = frozen_balance - $1, updated_at = now() 
             WHERE user_id = $2 AND coin = $3`,
            [total, o.user_id, quote]
          );
        }

        if (o.side === "sell") {
          // 🔹 SELL → dapat USDT
          const { rows: usdtWallets } = await db.query(
            `SELECT * FROM wallets WHERE user_id = $1 AND coin = $2`,
            [o.user_id, quote]
          );

          if (usdtWallets.length > 0) {
            logBalanceBefore = Number(usdtWallets[0].balance);
            await db.query(
              `UPDATE wallets 
               SET balance = balance + $1, updated_at = now() 
               WHERE id = $2`,
              [total, usdtWallets[0].id]
            );
            logBalanceAfter = logBalanceBefore + total;
          } else {
               const newWalletId = crypto.randomUUID();
               await db.query(
              `INSERT INTO wallets (id, user_id, coin, balance, frozen_balance) VALUES ($1, $2, $3, $4, 0)`,
               [newWalletId, o.user_id, quote, total]
              );
              logBalanceAfter = total;
          }

          // Log for receiving USDT
          await db.query(
              `INSERT INTO wallet_logs (id, user_id, coin, change, balance_before, balance_after, type, reference_id, description, created_at)
               VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, 'spot_sell', $6, $7, now())`,
              [o.user_id, quote, total, logBalanceBefore, logBalanceAfter, crypto.randomUUID(), `Spot Sell Order #${o.id}`]
          );

          // release frozen BASE
          await db.query(
            `UPDATE wallets 
             SET frozen_balance = frozen_balance - $1, updated_at = now() 
             WHERE user_id = $2 AND coin = $3`,
            [o.amount, o.user_id, base]
          );
        }

        /* ============================================
           6️⃣ FINALIZE ORDER
        ============================================ */
        await db.query(
          `UPDATE spot_orders 
           SET status = 'filled', filled_amount = $1 
           WHERE id = $2`,
          [o.amount, o.id]
        );

        await db.query("COMMIT");
        console.log("✅ Spot order filled:", o.id);

      } catch (err) {
        await db.query("ROLLBACK");
        throw err; // Re-throw to hit the outer catch block which reverts status
      }


    } catch (err) {
      console.error("❌ Spot settle error:", o.id, err);
      // Revert status so it can be retried or cancelled
      await db.query(`UPDATE spot_orders SET status = 'open' WHERE id = $1`, [o.id]);
    }
  }
}
