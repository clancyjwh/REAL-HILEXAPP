/*
  # Add Relative Value Analysis to User Watchlist Table

  1. Changes
    - Add `relative_value_analysis` jsonb column to user_watchlist table
    - This matches the structure of stocks_top_picks table exactly
    - Column stores Result, Asset Return, Index Return, and Summary

  2. Important Notes
    - Column is nullable (optional data)
    - Uses JSONB for flexible structure
    - Allows user watchlist to display relative value data like top picks
*/

-- Add relative_value_analysis column to user_watchlist if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_watchlist' AND column_name = 'relative_value_analysis'
  ) THEN
    ALTER TABLE user_watchlist ADD COLUMN relative_value_analysis jsonb;
  END IF;
END $$;