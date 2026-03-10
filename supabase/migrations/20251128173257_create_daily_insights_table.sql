/*
  # Create Daily Insights Table
  
  1. New Tables
    - `daily_insights`
      - `id` (bigint, primary key, auto-increment)
      - `run_date` (date, unique) - The date of the insight
      - `summary_text` (text) - The daily market summary
      - `created_at` (timestamptz) - When the insight was created
      - `updated_at` (timestamptz) - When the insight was last updated
  
  2. Security
    - Enable RLS on `daily_insights` table
    - Add policy for authenticated users to read all insights
    - Public read access for all users (insights are public information)
*/

CREATE TABLE IF NOT EXISTS daily_insights (
  id bigserial PRIMARY KEY,
  run_date date UNIQUE NOT NULL,
  summary_text text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE daily_insights ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read daily insights"
  ON daily_insights
  FOR SELECT
  USING (true);
