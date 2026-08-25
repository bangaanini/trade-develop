import { NextResponse } from 'next/server';
import { Pool } from 'pg';
import bcrypt from 'bcryptjs';
import { otpStore } from '@/lib/otpStore';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export const dynamic = 'force-dynamic';

/**
 * POST /api/auth/forgot-password/reset
 * Reset password with verified OTP
 */
export async function POST(req: Request) {
  try {
    const { email, otpCode, newPassword } = await req.json();

    if (!email || !otpCode || !newPassword) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      );
    }

    if (newPassword.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters' },
        { status: 400 }
      );
    }

    // Verify OTP one more time
    const stored = otpStore.get(email);

    if (!stored) {
      return NextResponse.json(
        { error: 'No OTP found. Please start over.' },
        { status: 400 }
      );
    }

    if (!otpStore.verify(email, otpCode)) {
      return NextResponse.json(
        { error: 'Invalid OTP code' },
        { status: 400 }
      );
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password in database
    const client = await pool.connect();
    try {
      const result = await client.query(
        'UPDATE users SET password_hash = $1 WHERE email = $2 RETURNING id',
        [hashedPassword, email]
      );

      if (result.rowCount === 0) {
        return NextResponse.json(
          { error: 'User not found' },
          { status: 404 }
        );
      }

      // Delete OTP after successful reset
      otpStore.delete(email);

      return NextResponse.json({
        success: true,
        message: 'Password reset successfully',
      });
    } finally {
      client.release();
    }
  } catch (error: any) {
    console.error('Error resetting password:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to reset password' },
      { status: 500 }
    );
  }
}
