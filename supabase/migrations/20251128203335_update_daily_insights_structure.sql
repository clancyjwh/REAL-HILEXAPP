/*
  # Update Daily Insights Table Structure

  1. Changes
    - Drop old `summary_text` column
    - Add new columns for structured data:
      - `top_mover` (text) - The top performing asset
      - `strongest_signals` (jsonb) - Array of strongest signals
      - `assets_to_watch` (jsonb) - Array of assets to watch
      - `weekly_winners` (jsonb) - Array of weekly winners
      - `weekly_laggers` (jsonb) - Array of weekly laggards
      - `consensus_signals` (jsonb) - Array of consensus signals
      - `rare_events` (jsonb) - Array of rare events (nullable)
      - `raw_payload` (jsonb) - Full raw data (for reference, not displayed)

  2. Notes
    - Preserves existing RLS policies
    - All JSONB columns store arrays of strings
    - rare_events may be null or empty array
*/

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'daily_insights' AND column_name = 'summary_text'
  ) THEN
    ALTER TABLE daily_insights DROP COLUMN summary_text;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'daily_insights' AND column_name = 'top_mover'
  ) THEN
    ALTER TABLE daily_insights ADD COLUMN top_mover text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'daily_insights' AND column_name = 'strongest_signals'
  ) THEN
    ALTER TABLE daily_insights ADD COLUMN strongest_signals jsonb DEFAULT '[]'::jsonb;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'daily_insights' AND column_name = 'assets_to_watch'
  ) THEN
    ALTER TABLE daily_insights ADD COLUMN assets_to_watch jsonb DEFAULT '[]'::jsonb;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'daily_insights' AND column_name = 'weekly_winners'
  ) THEN
    ALTER TABLE daily_insights ADD COLUMN weekly_winners jsonb DEFAULT '[]'::jsonb;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'daily_insights' AND column_name = 'weekly_laggers'
  ) THEN
    ALTER TABLE daily_insights ADD COLUMN weekly_laggers jsonb DEFAULT '[]'::jsonb;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'daily_insights' AND column_name = 'consensus_signals'
  ) THEN
    ALTER TABLE daily_insights ADD COLUMN consensus_signals jsonb DEFAULT '[]'::jsonb;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'daily_insights' AND column_name = 'rare_events'
  ) THEN
    ALTER TABLE daily_insights ADD COLUMN rare_events jsonb DEFAULT '[]'::jsonb;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'daily_insights' AND column_name = 'raw_payload'
  ) THEN
    ALTER TABLE daily_insights ADD COLUMN raw_payload jsonb;
  END IF;
END $$;
