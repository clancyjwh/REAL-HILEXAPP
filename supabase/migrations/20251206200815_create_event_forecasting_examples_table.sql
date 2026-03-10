/*
  # Create Event Forecasting Examples Table

  1. New Tables
    - `event_forecasting_examples`
      - `id` (uuid, primary key)
      - `question` (text) - The example question
      - `active` (boolean) - Whether this question is currently active
      - `batch_id` (uuid) - Groups questions that were created together
      - `created_at` (timestamptz) - When this question was created

  2. Security
    - Enable RLS on `event_forecasting_examples` table
    - Add policy for public read access to active examples
    - Add policy for service role to insert/update examples

  3. Initial Data
    - Insert the current 5 example questions
*/

CREATE TABLE IF NOT EXISTS event_forecasting_examples (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  question text NOT NULL,
  active boolean DEFAULT true,
  batch_id uuid NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE event_forecasting_examples ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active examples"
  ON event_forecasting_examples
  FOR SELECT
  USING (active = true);

CREATE POLICY "Service role can insert examples"
  ON event_forecasting_examples
  FOR INSERT
  TO service_role
  WITH CHECK (true);

CREATE POLICY "Service role can update examples"
  ON event_forecasting_examples
  FOR UPDATE
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Insert initial examples with the same batch_id
DO $$
DECLARE
  initial_batch_id uuid := gen_random_uuid();
BEGIN
  INSERT INTO event_forecasting_examples (question, active, batch_id) VALUES
    ('Will Apple release Vision Pro 2 in 2025?', true, initial_batch_id),
    ('Will Bitcoin close above $100k this year?', true, initial_batch_id),
    ('Will the NDP win BC?', true, initial_batch_id),
    ('Will ETH ETF be approved by March?', true, initial_batch_id),
    ('Will the Leafs win tonight?', true, initial_batch_id);
END $$;