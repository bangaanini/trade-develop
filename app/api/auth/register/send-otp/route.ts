import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { hashPassword } from '@/lib/auth';
import { sendOTPEmail } from '@/lib/email';

export async function POST(req: Request) {
  try {
    const { email } = await req.json();
    
    // Validate input
    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' }, 
        { status: 400 }
      );
    }
    
    // Validate password length - REMOVED as password is not sent here anymore
    
    const lowerEmail = email.toLowerCase().trim();
    
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(lowerEmail)) {
      return NextResponse.json(
        { error: 'Invalid email format' }, 
        { status: 400 }
      );
    }
    
    // Check if user already exists
    const { rows: existingUsers } = await db.query(
      'SELECT id FROM users WHERE email = $1', 
      [lowerEmail]
    );
    
    if (existingUsers.length > 0) {
      return NextResponse.json(
        { error: 'Email already registered' }, 
        { status: 400 }
      );
    }
    
    // Check rate limiting: max 3 OTP requests per email per hour
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    const { rows: recentOTPs } = await db.query(
      'SELECT COUNT(*) as count FROM email_verifications WHERE email = $1 AND created_at > $2',
      [lowerEmail, oneHourAgo]
    );
    
    if (parseInt(recentOTPs[0].count) >= 3) {
      return NextResponse.json(
        { error: 'Too many OTP requests. Please try again later.' }, 
        { status: 429 }
      );
    }
    
    // Generate 6-digit OTP
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Placeholder for password hash since we set it later in final registration
    const hashedPassword = "PENDING_REGISTRATION";
    
    // Delete old unverified OTPs for this email
    await db.query(
      'DELETE FROM email_verifications WHERE email = $1 AND verified = false',
      [lowerEmail]
    );
    
    // Store OTP (expires in 5 minutes)
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);
    await db.query(
      `INSERT INTO email_verifications (email, otp_code, password_hash, expires_at)
       VALUES ($1, $2, $3, $4)`,
      [lowerEmail, otpCode, hashedPassword, expiresAt]
    );
    
    // Send email
    const emailResult = await sendOTPEmail(lowerEmail, otpCode);
    
    if (!emailResult.success) {
      return NextResponse.json(
        { error: 'Failed to send OTP email. Please try again.' }, 
        { status: 500 }
      );
    }
    
    return NextResponse.json({ 
      success: true, 
      message: 'OTP sent to your email. Check your inbox!' 
    });
    
  } catch (err: any) {
    console.error('Send OTP Error:', err);
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    );
  }
}
