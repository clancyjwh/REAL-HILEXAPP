/*
  # Create Live Prices Watchlist Table

  1. New Tables
    - `live_prices_watchlist`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to auth.users)
      - `ticker` (text, stock ticker symbol)
      - `company_name` (text, full company name)
      - `slot_position` (integer, 1-5 for slot ordering)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
  
  2. Security
    - Enable RLS on `live_prices_watchlist` table
    - Add policy for authenticated users to read their own data
    - Add policy for authenticated users to insert their own data
    - Add policy for authenticated users to update their own data
    - Add policy for authenticated users to delete their own data
  
  3. Constraints
    - Unique constraint on (user_id, slot_position)
    - Unique constraint on (user_id, ticker)
*/

CREATE TABLE IF NOT EXISTS live_prices_watchlist (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  ticker text NOT NULL,
  company_name text NOT NULL,
  slot_position integer NOT NULL CHECK (slot_position >= 1 AND slot_position <= 5),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, slot_position),
  UNIQUE(user_id, ticker)
);

ALTER TABLE live_prices_watchlist ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own live prices"
  ON live_prices_watchlist FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own live prices"
  ON live_prices_watchlist FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own live prices"
  ON live_prices_watchlist FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own live prices"
  ON live_prices_watchlist FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_live_prices_user_id ON live_prices_watchlist(user_id);
CREATE INDEX IF NOT EXISTS idx_live_prices_slot_position ON live_prices_watchlist(user_id, slot_position);