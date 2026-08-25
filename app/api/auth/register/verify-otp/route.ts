import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { sendWelcomeEmail } from '@/lib/email';
import crypto from 'crypto';

export async function POST(req: Request) {
  try {
    const { email, otpCode } = await req.json();
    
    if (!email || !otpCode) {
      return NextResponse.json(
        { error: 'Email and OTP code are required' }, 
        { status: 400 }
      );
    }
    
    const lowerEmail = email.toLowerCase().trim();
    
    // Get the most recent OTP record for this email
    const { rows } = await db.query(
      `SELECT * FROM email_verifications 
       WHERE email = $1 AND verified = false 
       ORDER BY created_at DESC 
       LIMIT 1`,
      [lowerEmail]
    );
    
    if (rows.length === 0) {
      return NextResponse.json(
        { error: 'No OTP found. Please request a new one.' }, 
        { status: 400 }
      );
    }
    
    const record = rows[0];
    
    // Check if OTP expired
    if (new Date() > new Date(record.expires_at)) {
      return NextResponse.json(
        { error: 'OTP has expired. Please request a new one.' }, 
        { status: 400 }
      );
    }
    
    // Check max attempts (prevent brute force)
    if (record.attempts >= 3) {
      return NextResponse.json(
        { error: 'Too many failed attempts. Please request a new OTP.' }, 
        { status: 400 }
      );
    }
    
    // Verify OTP code
    if (record.otp_code !== otpCode.trim()) {
      // Increment failed attempts
      await db.query(
        'UPDATE email_verifications SET attempts = attempts + 1 WHERE id = $1',
        [record.id]
      );
      
      const remainingAttempts = 3 - (record.attempts + 1);
      return NextResponse.json(
        { 
          error: `Invalid OTP code. ${remainingAttempts} attempt${remainingAttempts !== 1 ? 's' : ''} remaining.` 
        }, 
        { status: 400 }
      );
    }
    
    // OTP is correct! Create user account
    const userId = crypto.randomUUID();
    
    try {
      await db.query(
        `INSERT INTO users (
          id, email, password_hash, role, created_at, 
          email_verified, phone_verified, kyc_verified, twofa_enabled, banned
        ) VALUES ($1, $2, $3, 'user', NOW(), true, false, false, false, false)`,
        [userId, lowerEmail, record.password_hash]
      );
      
      // Mark OTP as verified
      await db.query(
        'UPDATE email_verifications SET verified = true WHERE id = $1',
        [record.id]
      );
      
      // Send welcome email (non-blocking)
      sendWelcomeEmail(lowerEmail).catch(err => 
        console.error('Welcome email failed:', err)
      );
      
      return NextResponse.json({ 
        success: true, 
        message: 'Registration successful! You can now login.' 
      });
      
    } catch (dbError: any) {
      // Handle duplicate user error (race condition)
      if (dbError.code === '23505') { // Unique violation
        return NextResponse.json(
          { error: 'Email already registered' }, 
          { status: 400 }
        );
      }
      throw dbError;
    }
    
  } catch (err: any) {
    console.error('Verify OTP Error:', err);
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    );
  }
}
