/*
  # Add price data columns to live_prices_watchlist

  1. Changes
    - Add `current_price` column to store the fetched price
    - Add `price_change` column to store the price change value
    - Add `price_change_percent` column to store the percentage change
  
  2. Notes
    - These columns store the price data fetched once when the asset is added
    - No automatic refreshing - prices are only fetched when user adds the asset
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'live_prices_watchlist' AND column_name = 'current_price'
  ) THEN
    ALTER TABLE live_prices_watchlist ADD COLUMN current_price numeric;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'live_prices_watchlist' AND column_name = 'price_change'
  ) THEN
    ALTER TABLE live_prices_watchlist ADD COLUMN price_change numeric DEFAULT 0;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'live_prices_watchlist' AND column_name = 'price_change_percent'
  ) THEN
    ALTER TABLE live_prices_watchlist ADD COLUMN price_change_percent numeric DEFAULT 0;
  END IF;
END $$;
