/*
  # Create Interest Rates Analysis Table

  1. New Tables
    - `interest_rates_data`
      - `id` (uuid, primary key)
      - `country1_code` (text) - FRED series ID for first country
      - `country2_code` (text) - FRED series ID for second country
      - `country1_name` (text) - Display name for first country
      - `country2_name` (text) - Display name for second country
      - `interest_rate_1` (text) - Interest rate value for country 1
      - `interest_rate_2` (text) - Interest rate value for country 2
      - `spread` (text) - Spread between the two rates
      - `created_at` (timestamptz) - When the record was created
      - `updated_at` (timestamptz) - When the record was last updated

  2. Security
    - Enable RLS on `interest_rates_data` table
    - Add policy for authenticated users to read all data
    - Add policy for service role to insert/update data (for webhook)
*/

CREATE TABLE IF NOT EXISTS interest_rates_data (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  country1_code text NOT NULL,
  country2_code text NOT NULL,
  country1_name text NOT NULL,
  country2_name text NOT NULL,
  interest_rate_1 text NOT NULL,
  interest_rate_2 text NOT NULL,
  spread text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE interest_rates_data ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read interest rates data"
  ON interest_rates_data
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Service role can insert interest rates data"
  ON interest_rates_data
  FOR INSERT
  TO service_role
  WITH CHECK (true);

CREATE POLICY "Service role can update interest rates data"
  ON interest_rates_data
  FOR UPDATE
  TO service_role
  USING (true)
  WITH CHECK (true);
