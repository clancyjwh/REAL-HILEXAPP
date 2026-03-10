/*
  # Create User Watchlist Table

  1. New Tables
    - `user_watchlist`
      - `id` (uuid, primary key) - Unique identifier for each watchlist entry
      - `user_id` (uuid, foreign key) - Reference to auth.users
      - `symbol` (text) - Stock ticker symbol (e.g., AAPL, TSLA)
      - `name` (text) - Full name of the asset
      - `category` (text) - Asset category (default: 'stocks')
      - `score` (numeric) - Trading signal score
      - `sentiment` (text) - Market sentiment (e.g., Bullish, Bearish, Neutral)
      - `last_updated` (timestamptz) - Last update timestamp
      - `detailed_signal_data` (jsonb) - Additional signal details
      - `created_at` (timestamptz) - Timestamp when asset was added to watchlist

  2. Security
    - Enable RLS on `user_watchlist` table
    - Add policy for authenticated users to read their own watchlist
    - Add policy for webhook to insert/update watchlist data
    - Add unique constraint on user_id + symbol combination
*/

CREATE TABLE IF NOT EXISTS user_watchlist (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  symbol text NOT NULL,
  name text NOT NULL,
  category text DEFAULT 'stocks',
  score numeric,
  sentiment text,
  last_updated timestamptz DEFAULT now(),
  detailed_signal_data jsonb,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, symbol)
);

ALTER TABLE user_watchlist ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own watchlist"
  ON user_watchlist
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own watchlist items"
  ON user_watchlist
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Allow anon inserts for webhooks"
  ON user_watchlist
  FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Allow anon updates for webhooks"
  ON user_watchlist
  FOR UPDATE
  TO anon
  USING (true)
  WITH CHECK (true);

CREATE INDEX IF NOT EXISTS idx_user_watchlist_user_id ON user_watchlist(user_id);
CREATE INDEX IF NOT EXISTS idx_user_watchlist_symbol ON user_watchlist(symbol);
