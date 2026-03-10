/*
  # Update Taco Trade Updates Table Structure

  1. Changes
    - Drop the old simple `update_text` column
    - Add structured columns for webhook response data:
      - `date` (text) - Date of the update
      - `source` (text) - Source of the information
      - `quote` (text) - The actual quote
      - `topic` (text) - Topic of the quote
      - `aggression_score` (integer) - Aggression score
      - `followthrough_score` (integer) - Follow-through score
      - `summary` (text) - Summary of the update
      - `historical_consistency` (text) - Historical consistency information
      - `chickened_out` (boolean) - Whether they chickened out
      - `verdict` (text) - The verdict
      - `reference_link` (text) - Reference link
  
  2. Notes
    - Preserves existing RLS policies
    - All fields are nullable to handle partial data
*/

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'taco_trade_updates' AND column_name = 'update_text'
  ) THEN
    ALTER TABLE taco_trade_updates DROP COLUMN update_text;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'taco_trade_updates' AND column_name = 'date'
  ) THEN
    ALTER TABLE taco_trade_updates ADD COLUMN date text;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'taco_trade_updates' AND column_name = 'source'
  ) THEN
    ALTER TABLE taco_trade_updates ADD COLUMN source text;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'taco_trade_updates' AND column_name = 'quote'
  ) THEN
    ALTER TABLE taco_trade_updates ADD COLUMN quote text;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'taco_trade_updates' AND column_name = 'topic'
  ) THEN
    ALTER TABLE taco_trade_updates ADD COLUMN topic text;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'taco_trade_updates' AND column_name = 'aggression_score'
  ) THEN
    ALTER TABLE taco_trade_updates ADD COLUMN aggression_score integer;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'taco_trade_updates' AND column_name = 'followthrough_score'
  ) THEN
    ALTER TABLE taco_trade_updates ADD COLUMN followthrough_score integer;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'taco_trade_updates' AND column_name = 'summary'
  ) THEN
    ALTER TABLE taco_trade_updates ADD COLUMN summary text;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'taco_trade_updates' AND column_name = 'historical_consistency'
  ) THEN
    ALTER TABLE taco_trade_updates ADD COLUMN historical_consistency text;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'taco_trade_updates' AND column_name = 'chickened_out'
  ) THEN
    ALTER TABLE taco_trade_updates ADD COLUMN chickened_out boolean DEFAULT false;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'taco_trade_updates' AND column_name = 'verdict'
  ) THEN
    ALTER TABLE taco_trade_updates ADD COLUMN verdict text;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'taco_trade_updates' AND column_name = 'reference_link'
  ) THEN
    ALTER TABLE taco_trade_updates ADD COLUMN reference_link text;
  END IF;
END $$;
