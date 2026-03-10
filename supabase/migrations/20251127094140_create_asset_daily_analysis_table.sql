/*
  # Create Asset Daily Analysis Table

  1. New Tables
    - `asset_daily_analysis`
      - `id` (uuid, primary key)
      - `asset` (text) - Asset symbol/identifier
      - `run_date` (date) - Date of analysis run
      - `symbol` (text) - Asset trading symbol
      - `price` (numeric) - Current asset price
      - `cumulative_score` (numeric) - Cumulative signal score
      - `dominant_indicator` (text) - Most influential indicator
      - `strongest_signal` (text) - Strongest signal type
      - `volatility` (numeric) - Volatility measure
      - `trend` (text) - Trend direction
      - `indicator_json` (jsonb) - Full indicator analysis data
      - `news_json` (jsonb) - News analysis data
      - `horizon_json` (jsonb) - Horizon analysis data
      - `relative_value_json` (jsonb) - Relative value analysis data
      - `created_at` (timestamptz) - Record creation timestamp
      - `updated_at` (timestamptz) - Record update timestamp

  2. Indexes
    - Index on `asset` for fast lookups
    - Index on `run_date` for date-based queries
    - Composite index on `asset` and `run_date` for combined queries

  3. Security
    - Enable RLS on `asset_daily_analysis` table
    - Add policy for authenticated users to read all data
    - Only service role can insert/update data
*/

CREATE TABLE IF NOT EXISTS asset_daily_analysis (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  asset text NOT NULL,
  run_date date NOT NULL DEFAULT CURRENT_DATE,
  symbol text,
  price numeric,
  cumulative_score numeric,
  dominant_indicator text,
  strongest_signal text,
  volatility numeric,
  trend text,
  indicator_json jsonb,
  news_json jsonb,
  horizon_json jsonb,
  relative_value_json jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_asset_daily_analysis_asset 
  ON asset_daily_analysis(asset);

CREATE INDEX IF NOT EXISTS idx_asset_daily_analysis_run_date 
  ON asset_daily_analysis(run_date);

CREATE INDEX IF NOT EXISTS idx_asset_daily_analysis_asset_date 
  ON asset_daily_analysis(asset, run_date);

-- Enable Row Level Security
ALTER TABLE asset_daily_analysis ENABLE ROW LEVEL SECURITY;

-- Policy: Authenticated users can read all data
CREATE POLICY "Authenticated users can read asset daily analysis"
  ON asset_daily_analysis
  FOR SELECT
  TO authenticated
  USING (true);

-- Policy: Only service role can insert data (webhooks use service role)
CREATE POLICY "Service role can insert asset daily analysis"
  ON asset_daily_analysis
  FOR INSERT
  TO service_role
  WITH CHECK (true);

-- Policy: Only service role can update data
CREATE POLICY "Service role can update asset daily analysis"
  ON asset_daily_analysis
  FOR UPDATE
  TO service_role
  USING (true)
  WITH CHECK (true);
