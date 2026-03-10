/*
  # Create event forecasting results table

  1. New Tables
    - `event_forecasting_results`
      - `id` (uuid, primary key)
      - `query` (text) - The user's question
      - `summary` (text) - AI-generated summary
      - `event_score` (numeric) - Overall event score (-10 to 10)
      - `recent_momentum` (numeric) - Recent momentum score
      - `structural_edge` (numeric) - Structural edge score
      - `expert_consensus_score` (numeric) - Expert consensus score
      - `news_sentiment_score` (numeric) - News & sentiment score
      - `historical_pattern_match` (numeric) - Historical pattern match score
      - `time_pressure_effect` (numeric) - Time pressure/deadline effect score
      - `created_at` (timestamptz) - Timestamp of result

  2. Security
    - Enable RLS on `event_forecasting_results` table
    - Add policy for authenticated users to read all results
*/

CREATE TABLE IF NOT EXISTS event_forecasting_results (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  query text NOT NULL,
  summary text,
  event_score numeric DEFAULT 0,
  recent_momentum numeric DEFAULT 0,
  structural_edge numeric DEFAULT 0,
  expert_consensus_score numeric DEFAULT 0,
  news_sentiment_score numeric DEFAULT 0,
  historical_pattern_match numeric DEFAULT 0,
  time_pressure_effect numeric DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE event_forecasting_results ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read event forecasting results"
  ON event_forecasting_results
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert event forecasting results"
  ON event_forecasting_results
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Service role can insert event forecasting results"
  ON event_forecasting_results
  FOR INSERT
  TO service_role
  WITH CHECK (true);