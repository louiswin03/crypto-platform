-- Migration: Add sources column to portfolios table
-- Date: 2025-10-14
-- Description: Add JSONB column to store which sources (manual, binance, coinbase, kraken) are included in each portfolio

-- Add sources column as JSONB with default value
ALTER TABLE portfolios
ADD COLUMN IF NOT EXISTS sources JSONB DEFAULT '{"manual": true, "binance": false, "coinbase": false, "kraken": false}'::jsonb;

-- Update existing portfolios to have the default sources configuration
UPDATE portfolios
SET sources = '{"manual": true, "binance": false, "coinbase": false, "kraken": false}'::jsonb
WHERE sources IS NULL;

-- Add a comment to the column for documentation
COMMENT ON COLUMN portfolios.sources IS 'JSONB object indicating which sources are included in this portfolio (manual, binance, coinbase, kraken)';
