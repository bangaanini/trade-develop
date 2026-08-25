import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyAuth } from '@/lib/auth';
import crypto from 'crypto';

export async function GET(req: Request) {
  try {
    const user = await verifyAuth(req);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user's referral code
    const { rows: userRows } = await db.query(
      'SELECT referral_code FROM users WHERE id = $1',
      [user.id]
    );

    if (userRows.length === 0) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const referralCode = userRows[0].referral_code;
    
    // If user doesn't have referral code yet, generate one
    if (!referralCode) {
      const newCode = crypto.randomBytes(4).toString('hex').toUpperCase();
      
      await db.query(
        'UPDATE users SET referral_code = $1 WHERE id = $2',
        [newCode, user.id]
      );
      
      return NextResponse.json({
        referralCode: newCode,
        referralUrl: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/register?ref=${newCode}`,
        totalReferrals: 0
      });
    }

    // Count total referrals
    const { rows: countRows } = await db.query(
      'SELECT COUNT(*) as count FROM referrals WHERE referrer_id = $1',
      [user.id]
    );

    const totalReferrals = parseInt(countRows[0].count);

    // Get referral URL
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    const referralUrl = `${baseUrl}/register?ref=${referralCode}`;

    return NextResponse.json({
      referralCode,
      referralUrl,
      totalReferrals
    });

  } catch (err: any) {
    console.error('Get Referral Info Error:', err);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
