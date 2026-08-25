-- Migration: Add index to price_cache table
-- Purpose: Optimize price lookups and prevent duplicate symbols
-- Date: 2025-12-16

-- Add unique index on symbol column
CREATE UNIQUE INDEX IF NOT EXISTS idx_price_cache_symbol 
ON price_cache(symbol);

-- Verify the index was created
-- You can run: \d price_cache to see the index

COMMENT ON INDEX idx_price_cache_symbol IS 'Optimizes price_cache queries by symbol for VPS performance';
