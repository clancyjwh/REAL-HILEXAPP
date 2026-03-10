/*
  # Add Detailed Signal Data Storage

  1. Changes to Existing Tables
    - Add JSONB columns to store complete indicator data
    - Add columns for summary information
    - Add columns for historical performance data
    
  2. New Columns Added to Each Top Picks Table
    - `indicators` (jsonb) - Stores complete indicator analysis (SMA, MACD, Bollinger, etc.)
    - `rate_of_change` (jsonb) - Stores ROC analysis data
    - `summary` (jsonb) - Stores bullish/bearish indicators and overall sentiment
    - `historical_performance` (jsonb) - Stores backtest results by horizon
    - `date` (date) - Trading date for the signal
    - `raw_data` (jsonb) - Complete original payload for reference
    
  3. Important Notes
    - JSONB columns allow flexible storage of complex nested data
    - Existing data remains intact
    - New columns are optional (nullable) for backward compatibility
*/

-- Add detailed columns to crypto_top_picks
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'crypto_top_picks' AND column_name = 'indicators'
  ) THEN
    ALTER TABLE crypto_top_picks 
    ADD COLUMN indicators jsonb,
    ADD COLUMN rate_of_change jsonb,
    ADD COLUMN summary jsonb,
    ADD COLUMN historical_performance jsonb,
    ADD COLUMN date date,
    ADD COLUMN raw_data jsonb;
  END IF;
END $$;

-- Add detailed columns to forex_top_picks
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'forex_top_picks' AND column_name = 'indicators'
  ) THEN
    ALTER TABLE forex_top_picks 
    ADD COLUMN indicators jsonb,
    ADD COLUMN rate_of_change jsonb,
    ADD COLUMN summary jsonb,
    ADD COLUMN historical_performance jsonb,
    ADD COLUMN date date,
    ADD COLUMN raw_data jsonb;
  END IF;
END $$;

-- Add detailed columns to stocks_top_picks
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'stocks_top_picks' AND column_name = 'indicators'
  ) THEN
    ALTER TABLE stocks_top_picks 
    ADD COLUMN indicators jsonb,
    ADD COLUMN rate_of_change jsonb,
    ADD COLUMN summary jsonb,
    ADD COLUMN historical_performance jsonb,
    ADD COLUMN date date,
    ADD COLUMN raw_data jsonb;
  END IF;
END $$;

-- Add detailed columns to commodities_top_picks
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'commodities_top_picks' AND column_name = 'indicators'
  ) THEN
    ALTER TABLE commodities_top_picks 
    ADD COLUMN indicators jsonb,
    ADD COLUMN rate_of_change jsonb,
    ADD COLUMN summary jsonb,
    ADD COLUMN historical_performance jsonb,
    ADD COLUMN date date,
    ADD COLUMN raw_data jsonb;
  END IF;
END $$;
