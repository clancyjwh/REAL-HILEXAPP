/*
  # Add Category and Source to Top Stories

  1. Changes
    - Add `category` column to store the market category (crypto, stocks, forex, commodities, general)
    - Add `source` column to store the news source (Coindesk, Reuters, CNBC, etc.)
    - Both columns are text type and nullable to support existing records

  2. Notes
    - Existing records will have NULL values for these columns
    - New incoming stories will have these fields populated by the webhook
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'top_stories' AND column_name = 'category'
  ) THEN
    ALTER TABLE top_stories ADD COLUMN category text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'top_stories' AND column_name = 'source'
  ) THEN
    ALTER TABLE top_stories ADD COLUMN source text;
  END IF;
END $$;
