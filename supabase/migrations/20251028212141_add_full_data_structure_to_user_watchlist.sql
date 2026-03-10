/*
  # Add Full Data Structure to User Watchlist Table

  ## Overview
  This migration adds all necessary columns to the user_watchlist table to match the 
  data structure of stocks_top_picks table, enabling proper display of watchlist assets.

  ## Changes Made

  1. New Columns Added
    - `price` (numeric) - Current asset price
    - `roc_signal` (numeric) - Rate of Change signal value
    - `roc_value` (numeric) - Current Rate of Change value
    - `indicators` (jsonb) - Parsed indicator signals (SMA, RSI, MACD, CCI, BOLL)
    - `rate_of_change` (jsonb) - Rate of change historical data
    - `summary` (jsonb) - Asset summary information
    - `historical_performance` (jsonb) - Historical performance metrics
    - `date` (date) - Date of the data
    - `raw_data` (jsonb) - Raw webhook data for reference
    - `news_summary` (jsonb) - News and sentiment analysis
    - `optimized_parameters` (jsonb) - Optimized indicator parameters

  2. Column Modifications
    - Rename `score` to `signal` for consistency with top_picks tables
    - Update `detailed_signal_data` usage to store horizon data

  3. Notes
    - All new columns are nullable to support gradual data population
    - Existing data remains intact
    - RLS policies remain unchanged
    - Compatible with existing webhook structure
*/

-- Add new columns to user_watchlist table
DO $$ 
BEGIN
  -- Add price column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'user_watchlist' AND column_name = 'price'
  ) THEN
    ALTER TABLE user_watchlist ADD COLUMN price numeric;
  END IF;

  -- Add roc_signal column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'user_watchlist' AND column_name = 'roc_signal'
  ) THEN
    ALTER TABLE user_watchlist ADD COLUMN roc_signal numeric;
  END IF;

  -- Add roc_value column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'user_watchlist' AND column_name = 'roc_value'
  ) THEN
    ALTER TABLE user_watchlist ADD COLUMN roc_value numeric;
  END IF;

  -- Add indicators column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'user_watchlist' AND column_name = 'indicators'
  ) THEN
    ALTER TABLE user_watchlist ADD COLUMN indicators jsonb;
  END IF;

  -- Add rate_of_change column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'user_watchlist' AND column_name = 'rate_of_change'
  ) THEN
    ALTER TABLE user_watchlist ADD COLUMN rate_of_change jsonb;
  END IF;

  -- Add summary column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'user_watchlist' AND column_name = 'summary'
  ) THEN
    ALTER TABLE user_watchlist ADD COLUMN summary jsonb;
  END IF;

  -- Add historical_performance column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'user_watchlist' AND column_name = 'historical_performance'
  ) THEN
    ALTER TABLE user_watchlist ADD COLUMN historical_performance jsonb;
  END IF;

  -- Add date column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'user_watchlist' AND column_name = 'date'
  ) THEN
    ALTER TABLE user_watchlist ADD COLUMN date date;
  END IF;

  -- Add raw_data column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'user_watchlist' AND column_name = 'raw_data'
  ) THEN
    ALTER TABLE user_watchlist ADD COLUMN raw_data jsonb;
  END IF;

  -- Add news_summary column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'user_watchlist' AND column_name = 'news_summary'
  ) THEN
    ALTER TABLE user_watchlist ADD COLUMN news_summary jsonb;
  END IF;

  -- Add optimized_parameters column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'user_watchlist' AND column_name = 'optimized_parameters'
  ) THEN
    ALTER TABLE user_watchlist ADD COLUMN optimized_parameters jsonb;
  END IF;

  -- Rename score to signal if score exists and signal doesn't
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'user_watchlist' AND column_name = 'score'
  ) AND NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'user_watchlist' AND column_name = 'signal'
  ) THEN
    ALTER TABLE user_watchlist RENAME COLUMN score TO signal;
  END IF;
END $$;

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_user_watchlist_signal ON user_watchlist(signal DESC);
CREATE INDEX IF NOT EXISTS idx_user_watchlist_updated ON user_watchlist(last_updated DESC);