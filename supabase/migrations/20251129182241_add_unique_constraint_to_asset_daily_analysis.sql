/*
  # Add Unique Constraint to Asset Daily Analysis

  1. Changes
    - Add unique constraint on (asset, run_date) combination
    - This ensures only one analysis per asset per day
    - Enables upsert functionality in the webhook

  2. Notes
    - Required for the asset-daily-analysis-webhook to work correctly
    - Prevents duplicate entries for the same asset on the same date
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'asset_daily_analysis_asset_run_date_key'
  ) THEN
    ALTER TABLE asset_daily_analysis 
    ADD CONSTRAINT asset_daily_analysis_asset_run_date_key 
    UNIQUE (asset, run_date);
  END IF;
END $$;
