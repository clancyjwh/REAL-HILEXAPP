/*
  # Add Missing Columns to Top Picks Tables

  1. Changes
    - Add `news_summary` column (jsonb) to all 4 top picks tables
    - Add `optimized_parameters` column (jsonb) to all 4 top picks tables
  
  2. Purpose
    - Support JSON 8 (news rundown) and JSON 9 (optimized parameters) from webhook
    - Enable proper storage of all incoming webhook data
*/

-- Add columns to crypto_top_picks
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'crypto_top_picks' AND column_name = 'news_summary'
  ) THEN
    ALTER TABLE crypto_top_picks ADD COLUMN news_summary jsonb;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'crypto_top_picks' AND column_name = 'optimized_parameters'
  ) THEN
    ALTER TABLE crypto_top_picks ADD COLUMN optimized_parameters jsonb;
  END IF;
END $$;

-- Add columns to forex_top_picks
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'forex_top_picks' AND column_name = 'news_summary'
  ) THEN
    ALTER TABLE forex_top_picks ADD COLUMN news_summary jsonb;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'forex_top_picks' AND column_name = 'optimized_parameters'
  ) THEN
    ALTER TABLE forex_top_picks ADD COLUMN optimized_parameters jsonb;
  END IF;
END $$;

-- Add columns to stocks_top_picks
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'stocks_top_picks' AND column_name = 'news_summary'
  ) THEN
    ALTER TABLE stocks_top_picks ADD COLUMN news_summary jsonb;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'stocks_top_picks' AND column_name = 'optimized_parameters'
  ) THEN
    ALTER TABLE stocks_top_picks ADD COLUMN optimized_parameters jsonb;
  END IF;
END $$;

-- Add columns to commodities_top_picks
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'commodities_top_picks' AND column_name = 'news_summary'
  ) THEN
    ALTER TABLE commodities_top_picks ADD COLUMN news_summary jsonb;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'commodities_top_picks' AND column_name = 'optimized_parameters'
  ) THEN
    ALTER TABLE commodities_top_picks ADD COLUMN optimized_parameters jsonb;
  END IF;
END $$;