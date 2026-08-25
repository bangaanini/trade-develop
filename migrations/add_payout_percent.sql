-- Migration: Add payout_percent to option_durations and options tables
-- Date: 2025-12-14

-- 1. Add payout_percent column to option_durations
ALTER TABLE option_durations 
ADD COLUMN IF NOT EXISTS payout_percent DECIMAL(5,2) DEFAULT 85.00;

-- 2. Update existing durations with default payout from option_settings
UPDATE option_durations 
SET payout_percent = (
  SELECT payout_percent 
  FROM option_settings 
  LIMIT 1
)
WHERE payout_percent = 85.00 OR payout_percent IS NULL;

-- 3. Add payout_percent column to options table (for historical tracking)
ALTER TABLE options 
ADD COLUMN IF NOT EXISTS payout_percent DECIMAL(5,2) DEFAULT 85.00;

-- 4. Update existing options with payout from settings
UPDATE options 
SET payout_percent = (
  SELECT payout_percent 
  FROM option_settings 
  LIMIT 1
)
WHERE payout_percent = 85.00 OR payout_percent IS NULL;

-- Verify migration
SELECT 
  'option_durations' as table_name,
  COUNT(*) as row_count,
  AVG(payout_percent) as avg_payout
FROM option_durations
UNION ALL
SELECT 
  'options' as table_name,
  COUNT(*) as row_count,
  AVG(payout_percent) as avg_payout
FROM options;
