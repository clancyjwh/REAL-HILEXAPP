/*
  # Add optimized_parameters column to top picks tables

  1. Changes
    - Add `optimized_parameters` JSONB column to all top picks tables
    - This will store the optimized parameter data from JSON 9 in the webhook
    - Contains analysis type and parameter values for backtesting

  2. Tables Modified
    - crypto_top_picks
    - forex_top_picks
    - stocks_top_picks
    - commodities_top_picks
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'crypto_top_picks' AND column_name = 'optimized_parameters'
  ) THEN
    ALTER TABLE crypto_top_picks ADD COLUMN optimized_parameters JSONB;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'forex_top_picks' AND column_name = 'optimized_parameters'
  ) THEN
    ALTER TABLE forex_top_picks ADD COLUMN optimized_parameters JSONB;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'stocks_top_picks' AND column_name = 'optimized_parameters'
  ) THEN
    ALTER TABLE stocks_top_picks ADD COLUMN optimized_parameters JSONB;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'commodities_top_picks' AND column_name = 'optimized_parameters'
  ) THEN
    ALTER TABLE commodities_top_picks ADD COLUMN optimized_parameters JSONB;
  END IF;
END $$;