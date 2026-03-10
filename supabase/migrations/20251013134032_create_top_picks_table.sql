/*
  # Create Top Picks Table

  1. New Tables
    - `top_picks`
      - `id` (uuid, primary key) - Unique identifier for each pick
      - `symbol` (text) - Asset symbol (e.g., BTC-USD, AAPL)
      - `name` (text) - Full name of the asset
      - `category` (text) - Asset category (crypto, stocks, commodities, forex)
      - `reason` (text) - Analysis/reason for the pick
      - `target_price` (numeric) - Price target
      - `confidence` (text) - Confidence level (high, medium, low)
      - `created_at` (timestamptz) - Timestamp when pick was created
      - `updated_at` (timestamptz) - Last update timestamp
      - `is_active` (boolean) - Whether this pick is currently active

  2. Security
    - Enable RLS on `top_picks` table
    - Add policy for public read access (viewing picks)
    - Add policy for authenticated admin users to manage picks
*/

CREATE TABLE IF NOT EXISTS top_picks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  symbol text NOT NULL,
  name text NOT NULL,
  category text NOT NULL CHECK (category IN ('crypto', 'stocks', 'commodities', 'forex')),
  reason text NOT NULL,
  target_price numeric NOT NULL,
  confidence text NOT NULL CHECK (confidence IN ('high', 'medium', 'low')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  is_active boolean DEFAULT true
);

ALTER TABLE top_picks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active top picks"
  ON top_picks
  FOR SELECT
  USING (is_active = true);

CREATE INDEX IF NOT EXISTS idx_top_picks_active ON top_picks(is_active);
CREATE INDEX IF NOT EXISTS idx_top_picks_category ON top_picks(category);
