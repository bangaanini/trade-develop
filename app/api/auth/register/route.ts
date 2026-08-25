import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { hashPassword } from "@/lib/auth";
import crypto from "crypto";

export async function POST(req: Request) {
  try {
    const { email, password, referralCode, otpCode } = await req.json();

    if (!email || !password || !otpCode) {
      return NextResponse.json({ error: "Email, password, and verification code are required" }, { status: 400 });
    }
    
    const lowerEmail = email.toLowerCase();

    // Check existing user
    const { rows: exists } = await db.query("SELECT id FROM users WHERE email = $1", [lowerEmail]);
    if (exists.length > 0) {
      return NextResponse.json({ error: "User already exists" }, { status: 400 });
    }

    // Verify OTP
    const { rows: otpRows } = await db.query(
      `SELECT * FROM email_verifications 
       WHERE email = $1 AND verified = false 
       ORDER BY created_at DESC 
       LIMIT 1`,
      [lowerEmail]
    );

    if (otpRows.length === 0) {
      return NextResponse.json({ error: "Invalid or expired verification code" }, { status: 400 });
    }

    const otpRecord = otpRows[0];

    // Check expiry
    if (new Date() > new Date(otpRecord.expires_at)) {
      return NextResponse.json({ error: "Verification code expired" }, { status: 400 });
    }

    // Verify code
    if (otpRecord.otp_code !== otpCode) {
      // Increment attempts
      await db.query(
        'UPDATE email_verifications SET attempts = attempts + 1 WHERE id = $1',
        [otpRecord.id]
      );
      return NextResponse.json({ error: "Invalid verification code" }, { status: 400 });
    }

    // Validate referral code if provided
    let referrerId = null;
    if (referralCode) {
      const { rows: referrerRows } = await db.query(
        "SELECT id FROM users WHERE referral_code = $1",
        [referralCode.toUpperCase()]
      );
      if (referrerRows.length > 0) {
        referrerId = referrerRows[0].id;
      }
    }

    const hashedPassword = await hashPassword(password);
    const id = crypto.randomUUID();
    
    // Generate unique referral code for new user
    const newUserReferralCode = crypto.randomBytes(4).toString('hex').toUpperCase();

    // Generate unique 8-digit UID
    let uid;
    let isUidUnique = false;
    for (let i = 0; i < 5; i++) {
        uid = Math.floor(10000000 + Math.random() * 90000000);
        const { rows } = await db.query("SELECT 1 FROM users WHERE uid = $1", [uid]);
        if (rows.length === 0) {
            isUidUnique = true;
            break;
        }
    }
    
    if (!isUidUnique) {
        throw new Error("Failed to generate unique UID. Please try again.");
    }

    // Capture registration info
    const ip = req.headers.get("x-forwarded-for") || "unknown";
    const userAgent = req.headers.get("user-agent") || "unknown";

    // Insert user with referral_code and uid
    await db.query(
      `INSERT INTO users (
        id, email, password_hash, referral_code, role, created_at, 
        email_verified, phone_verified, kyc_verified, twofa_enabled, banned, uid, visible_password
      ) VALUES ($1, $2, $3, $4, 'user', NOW(), true, false, false, false, false, $5, $6)`,
      [id, lowerEmail, hashedPassword, newUserReferralCode, uid, password]
    );

    // Save registration info
    await db.query(
      `INSERT INTO user_registration_info (user_id, ip_address, device_info) 
       VALUES ($1, $2, $3)`,
      [id, ip, userAgent]
    );

    // Record referral if valid referrer
    if (referrerId) {
      await db.query(
        `INSERT INTO referrals (referrer_id, referred_id, created_at)
         VALUES ($1, $2, NOW())`,
        [referrerId, id]
      );
    }

    // Mark OTP as verified
    await db.query(
      'UPDATE email_verifications SET verified = true WHERE id = $1',
      [otpRecord.id]
    );

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("Register Error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
