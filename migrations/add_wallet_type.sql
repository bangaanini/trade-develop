-- Migration: Add wallet_type to separate funding and trading wallets
-- Run as: psql -h localhost -U mymac -d trading -f migrations/add_wallet_type.sql

-- Step 1: Add wallet_type column with default value
ALTER TABLE wallets ADD COLUMN IF NOT EXISTS wallet_type VARCHAR(20) DEFAULT 'trading';

-- Step 2: Set all existing wallets to 'trading' type (backward compatible)
UPDATE wallets SET wallet_type = 'trading' WHERE wallet_type IS NULL OR wallet_type = '';

-- Step 3: Make wallet_type NOT NULL and add constraint
ALTER TABLE wallets 
  ALTER COLUMN wallet_type SET NOT NULL;

ALTER TABLE wallets 
  ADD CONSTRAINT wallets_type_check CHECK (wallet_type IN ('funding', 'trading'));

-- Step 4: Drop old unique constraint if exists and create new one
DO $$ 
BEGIN
    -- Try to drop the constraint if it exists
    ALTER TABLE wallets DROP CONSTRAINT IF EXISTS wallets_user_coin_unique;
    ALTER TABLE wallets DROP CONSTRAINT IF EXISTS wallets_user_id_coin_key;
EXCEPTION
    WHEN undefined_object THEN NULL;
END $$;

-- Step 5: Add new unique constraint including wallet_type
-- This allows users to have both funding and trading wallet for the same coin
ALTER TABLE wallets 
  ADD CONSTRAINT wallets_user_coin_type_unique UNIQUE (user_id, coin, wallet_type);

-- Step 6: Add index for better query performance
CREATE INDEX IF NOT EXISTS idx_wallets_user_coin_type ON wallets(user_id, coin, wallet_type);

-- Step 7: Add comments
COMMENT ON COLUMN wallets.wallet_type IS 'Type of wallet: funding (for deposits/withdrawals) or trading (for trading activities)';

-- Verification queries
SELECT 'Migration completed successfully!' as status;
SELECT coin, wallet_type, COUNT(*) as count FROM wallets GROUP BY coin, wallet_type ORDER BY coin, wallet_type;
