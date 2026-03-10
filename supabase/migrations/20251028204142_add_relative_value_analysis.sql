/*
  # Add Relative Value Analysis to Top Picks Tables

  1. Changes
    - Add `relative_value_analysis` column to all top picks tables
    - Column stores JSONB data with Result, Asset Return, Index Return, and Summary

  2. Tables Updated
    - stocks_top_picks
    - crypto_top_picks
    - forex_top_picks
    - commodities_top_picks

  3. Data Format
    The relative_value_analysis JSONB will contain:
    - Result: numeric percentage of outperformance
    - Asset Return: numeric percentage return
    - Index Return: numeric percentage return
    - Summary: text description of the analysis

  4. Important Notes
    - Column is nullable (optional data)
    - Uses JSONB for flexible structure matching tools section format
*/

-- Add relative_value_analysis column to stocks_top_picks
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'stocks_top_picks' AND column_name = 'relative_value_analysis'
  ) THEN
    ALTER TABLE stocks_top_picks ADD COLUMN relative_value_analysis jsonb;
  END IF;
END $$;

-- Add relative_value_analysis column to crypto_top_picks
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'crypto_top_picks' AND column_name = 'relative_value_analysis'
  ) THEN
    ALTER TABLE crypto_top_picks ADD COLUMN relative_value_analysis jsonb;
  END IF;
END $$;

-- Add relative_value_analysis column to forex_top_picks
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'forex_top_picks' AND column_name = 'relative_value_analysis'
  ) THEN
    ALTER TABLE forex_top_picks ADD COLUMN relative_value_analysis jsonb;
  END IF;
END $$;

-- Add relative_value_analysis column to commodities_top_picks
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'commodities_top_picks' AND column_name = 'relative_value_analysis'
  ) THEN
    ALTER TABLE commodities_top_picks ADD COLUMN relative_value_analysis jsonb;
  END IF;
END $$;
