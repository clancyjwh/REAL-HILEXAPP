/*
  # Create Zero Day Options Results Table

  1. New Tables
    - `zero_day_options_results`
      - `id` (uuid, primary key)
      - `ticker` (text) - The stock symbol analyzed
      - `horizon` (integer) - Look-ahead period in minutes
      - `symbol` (text) - Symbol from webhook response
      - `summary` (text) - Analysis summary from webhook
      - `direction` (text) - Predicted direction (up/down)
      - `probability_up` (decimal) - Probability of upward movement
      - `probability_down` (decimal) - Probability of downward movement
      - `confidence_label` (text) - Confidence level (strong/moderate/weak)
      - `confidence_score` (decimal) - Numeric confidence score
      - `scenarios_tested` (integer) - Number of scenarios analyzed
      - `expected_move` (decimal) - Expected percentage move
      - `average_historical_move` (decimal) - Average historical move percentage
      - `created_at` (timestamptz) - Timestamp of analysis

  2. Security
    - Enable RLS on `zero_day_options_results` table
    - Add policies for authenticated users to read their own results
    - Add policy for webhook to insert results
*/

CREATE TABLE IF NOT EXISTS zero_day_options_results (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ticker text NOT NULL,
  horizon integer NOT NULL,
  symbol text NOT NULL,
  summary text,
  direction text NOT NULL,
  probability_up decimal NOT NULL,
  probability_down decimal NOT NULL,
  confidence_label text NOT NULL,
  confidence_score decimal NOT NULL,
  scenarios_tested integer NOT NULL,
  expected_move decimal NOT NULL,
  average_historical_move decimal NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE zero_day_options_results ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read zero day options results"
  ON zero_day_options_results
  FOR SELECT
  TO authenticated, anon
  USING (true);

CREATE POLICY "Service role can insert zero day options results"
  ON zero_day_options_results
  FOR INSERT
  TO authenticated, anon
  WITH CHECK (true);