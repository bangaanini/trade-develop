import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyAuth } from '@/lib/auth';

// Transfer between funding and trading wallets
export async function POST(req: Request) {
  try {
    const user = await verifyAuth(req);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { amount, direction } = await req.json();

    // Validate inputs
    if (!amount || !direction) {
      return NextResponse.json(
        { error: 'Amount and direction are required' },
        { status: 400 }
      );
    }

    if (direction !== 'funding-to-trading' && direction !== 'trading-to-funding') {
      return NextResponse.json(
        { error: 'Invalid direction. Use "funding-to-trading" or "trading-to-funding"' },
        { status: 400 }
      );
    }

    const transferAmount = parseFloat(amount);
    if (isNaN(transferAmount) || transferAmount <= 0) {
      return NextResponse.json(
        { error: 'Invalid amount' },
        { status: 400 }
      );
    }

    // Determine source and destination wallet types
    const sourceType = direction === 'funding-to-trading' ? 'funding' : 'trading';
    const destType = direction === 'funding-to-trading' ? 'trading' : 'funding';

    // Start transaction
    await db.query('BEGIN');

    try {
      // Get source wallet (USDT only for now)
      const { rows: sourceWallets } = await db.query(
        `SELECT id, balance FROM wallets 
         WHERE user_id = $1 AND coin = 'USDT' AND wallet_type = $2`,
        [user.id, sourceType]
      );

      if (sourceWallets.length === 0) {
        await db.query('ROLLBACK');
        return NextResponse.json(
          { error: `No ${sourceType} wallet found` },
          { status: 400 }
        );
      }

      const sourceWallet = sourceWallets[0];
      const sourceBalance = parseFloat(sourceWallet.balance);

      // Check sufficient balance
      if (sourceBalance < transferAmount) {
        await db.query('ROLLBACK');
        return NextResponse.json(
          { error: 'Insufficient balance' },
          { status: 400 }
        );
      }

      // Deduct from source wallet
      await db.query(
        `UPDATE wallets 
         SET balance = balance - $1, updated_at = NOW() 
         WHERE id = $2`,
        [transferAmount, sourceWallet.id]
      );

      // Get or create destination wallet
      const { rows: destWallets } = await db.query(
        `SELECT id, balance FROM wallets 
         WHERE user_id = $1 AND coin = 'USDT' AND wallet_type = $2`,
        [user.id, destType]
      );

      let destWalletId;

      if (destWallets.length === 0) {
        // Create destination wallet if it doesn't exist
        const { rows: newWallet } = await db.query(
          `INSERT INTO wallets (id, user_id, coin, balance, frozen_balance, wallet_type, created_at, updated_at)
           VALUES (gen_random_uuid(), $1, 'USDT', $2, 0, $3, NOW(), NOW())
           RETURNING id`,
          [user.id, transferAmount, destType]
        );
        destWalletId = newWallet[0].id;
      } else {
        // Add to existing destination wallet
        destWalletId = destWallets[0].id;
        await db.query(
          `UPDATE wallets 
           SET balance = balance + $1, updated_at = NOW() 
           WHERE id = $2`,
          [transferAmount, destWalletId]
        );
      }

      // Create wallet logs for both wallets
      await db.query(
        `INSERT INTO wallet_logs (id, user_id, coin, change, balance_before, balance_after, type, description, created_at)
         VALUES (gen_random_uuid(), $1, 'USDT', $2, $3, $4, 'transfer_out', $5, NOW())`,
        [
          user.id,
          -transferAmount,
          sourceBalance,
          sourceBalance - transferAmount,
          `Transfer to ${destType} wallet`
        ]
      );

      const destBalanceBefore = destWallets.length > 0 ? parseFloat(destWallets[0].balance) : 0;
      await db.query(
        `INSERT INTO wallet_logs (id, user_id, coin, change, balance_before, balance_after, type, description, created_at)
         VALUES (gen_random_uuid(), $1, 'USDT', $2, $3, $4, 'transfer_in', $5, NOW())`,
        [
          user.id,
          transferAmount,
          destBalanceBefore,
          destBalanceBefore + transferAmount,
          `Transfer from ${sourceType} wallet`
        ]
      );

      await db.query('COMMIT');

      return NextResponse.json({
        success: true,
        message: 'Transfer completed successfully',
        amount: transferAmount,
        from: sourceType,
        to: destType
      });

    } catch (error) {
      await db.query('ROLLBACK');
      throw error;
    }

  } catch (err: any) {
    console.error('Transfer Error:', err);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Get wallet balances
export async function GET(req: Request) {
  try {
    const user = await verifyAuth(req);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get both funding and trading wallet balances
    const { rows } = await db.query(
      `SELECT wallet_type, balance 
       FROM wallets 
       WHERE user_id = $1 AND coin = 'USDT'
       ORDER BY wallet_type`,
      [user.id]
    );

    const balances = {
      funding: 0,
      trading: 0
    };

    rows.forEach((row: any) => {
      balances[row.wallet_type as 'funding' | 'trading'] = parseFloat(row.balance || 0);
    });

    return NextResponse.json({ balances });

  } catch (err: any) {
    console.error('Get Balances Error:', err);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
