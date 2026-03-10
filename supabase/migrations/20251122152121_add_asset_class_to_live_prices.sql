/*
  # Add asset_class column to live_prices_watchlist

  1. Changes
    - Add `asset_class` column to `live_prices_watchlist` table
      - Type: text
      - Default: 'stocks'
      - Not null

  2. Purpose
    - Track the asset class (stocks, crypto, forex, commodities) for each watchlist item
    - Allows proper filtering and categorization of live price data
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'live_prices_watchlist' AND column_name = 'asset_class'
  ) THEN
    ALTER TABLE live_prices_watchlist ADD COLUMN asset_class text NOT NULL DEFAULT 'stocks';
  END IF;
END $$;