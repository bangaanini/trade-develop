import { NextResponse } from 'next/server';
import { otpStore } from '@/lib/otpStore';

export const dynamic = 'force-dynamic';

/**
 * POST /api/auth/forgot-password/verify-otp
 * Verify OTP code
 */
export async function POST(req: Request) {
  try {
    const { email, otpCode } = await req.json();

    if (!email || !otpCode) {
      return NextResponse.json(
        { error: 'Email and OTP code are required' },
        { status: 400 }
      );
    }

    const stored = otpStore.get(email);

    if (!stored) {
      return NextResponse.json(
        { error: 'No OTP found. Please request a new one.' },
        { status: 400 }
      );
    }

    if (!otpStore.verify(email, otpCode)) {
      return NextResponse.json(
        { error: 'Invalid OTP code' },
        { status: 400 }
      );
    }

    // OTP is valid - keep it for password reset step
    return NextResponse.json({
      success: true,
      message: 'OTP verified successfully',
    });
  } catch (error: any) {
    console.error('Error verifying OTP:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to verify OTP' },
      { status: 500 }
    );
  }
}
