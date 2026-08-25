-- Migration: Add referral system
-- This adds referral code tracking and referrals table

-- Step 1: Add referral_code column to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS referral_code VARCHAR(20) UNIQUE;

-- Step 2: Generate referral codes for existing users
-- Using first 8 characters of MD5 hash of random + user id
UPDATE users 
SET referral_code = UPPER(SUBSTRING(MD5(RANDOM()::text || id::text) FROM 1 FOR 8))
WHERE referral_code IS NULL;

-- Step 3: Create referrals tracking table
CREATE TABLE IF NOT EXISTS referrals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  referred_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(referred_id)
);

-- Step 4: Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_referrals_referrer ON referrals(referrer_id);
CREATE INDEX IF NOT EXISTS idx_referrals_referred ON referrals(referred_id);
CREATE INDEX IF NOT EXISTS idx_users_referral_code ON users(referral_code);

-- Step 5: Add comments
COMMENT ON COLUMN users.referral_code IS 'Unique referral code for inviting new users';
COMMENT ON TABLE referrals IS 'Tracks referral relationships between users';

-- Verification
SELECT 'Referral system migration completed!' as status;
SELECT COUNT(*) as users_with_codes FROM users WHERE referral_code IS NOT NULL;
SELECT COUNT(*) as total_referrals FROM referrals;
