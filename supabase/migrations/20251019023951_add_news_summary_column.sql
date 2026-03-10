/*
  # Add News Summary Column

  1. Changes to Existing Tables
    - Add `news_summary` column to store news rundown data
    
  2. New Columns Added to Each Top Picks Table
    - `news_summary` (text) - Stores news analysis and summary for the asset
    
  3. Important Notes
    - Column is nullable for backward compatibility
    - Will be populated from JSON 8 in webhook payload
*/

-- Add news_summary to crypto_top_picks
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'crypto_top_picks' AND column_name = 'news_summary'
  ) THEN
    ALTER TABLE crypto_top_picks ADD COLUMN news_summary text;
  END IF;
END $$;

-- Add news_summary to forex_top_picks
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'forex_top_picks' AND column_name = 'news_summary'
  ) THEN
    ALTER TABLE forex_top_picks ADD COLUMN news_summary text;
  END IF;
END $$;

-- Add news_summary to stocks_top_picks
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'stocks_top_picks' AND column_name = 'news_summary'
  ) THEN
    ALTER TABLE stocks_top_picks ADD COLUMN news_summary text;
  END IF;
END $$;

-- Add news_summary to commodities_top_picks
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'commodities_top_picks' AND column_name = 'news_summary'
  ) THEN
    ALTER TABLE commodities_top_picks ADD COLUMN news_summary text;
  END IF;
END $$;