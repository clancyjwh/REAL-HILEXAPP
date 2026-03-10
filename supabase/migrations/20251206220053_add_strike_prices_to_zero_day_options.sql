/*
  # Add Strike Price Data to Zero Day Options Results

  1. New Columns
    - `bias` (text) - Market bias indicator (e.g., upside_tilt, downside_tilt)
    - `spot_price` (decimal) - Current spot price of the asset
    - `top_strikes` (jsonb) - JSON array of top strike prices with volume and popularity data
    - `put_wall_strike` (decimal) - Strike price of the put wall
    - `call_wall_strike` (decimal) - Strike price of the call wall
    - `put_wall_distance` (decimal) - Distance to put wall in percentage
    - `call_wall_distance` (decimal) - Distance to call wall in percentage

  2. Changes
    - Add new columns to zero_day_options_results table to support options strike price analysis
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'zero_day_options_results' AND column_name = 'bias'
  ) THEN
    ALTER TABLE zero_day_options_results ADD COLUMN bias text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'zero_day_options_results' AND column_name = 'spot_price'
  ) THEN
    ALTER TABLE zero_day_options_results ADD COLUMN spot_price decimal;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'zero_day_options_results' AND column_name = 'top_strikes'
  ) THEN
    ALTER TABLE zero_day_options_results ADD COLUMN top_strikes jsonb;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'zero_day_options_results' AND column_name = 'put_wall_strike'
  ) THEN
    ALTER TABLE zero_day_options_results ADD COLUMN put_wall_strike decimal;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'zero_day_options_results' AND column_name = 'call_wall_strike'
  ) THEN
    ALTER TABLE zero_day_options_results ADD COLUMN call_wall_strike decimal;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'zero_day_options_results' AND column_name = 'put_wall_distance'
  ) THEN
    ALTER TABLE zero_day_options_results ADD COLUMN put_wall_distance decimal;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'zero_day_options_results' AND column_name = 'call_wall_distance'
  ) THEN
    ALTER TABLE zero_day_options_results ADD COLUMN call_wall_distance decimal;
  END IF;
END $$;