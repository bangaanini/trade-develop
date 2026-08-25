-- Add min_amount to option_durations to allow per-duration minimum order

ALTER TABLE option_durations ADD COLUMN IF NOT EXISTS min_amount NUMERIC DEFAULT 10;

-- Grant permissions
GRANT ALL PRIVILEGES ON TABLE option_durations TO trader;

COMMENT ON COLUMN option_durations.min_amount IS 'Minimum order amount for this duration in USDT';

SELECT 'Added min_amount column to option_durations' as status;
