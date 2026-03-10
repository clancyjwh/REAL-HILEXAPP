/*
  # Create All Top Picks Tables with Complete Schema

  1. New Tables
    - `crypto_top_picks` - Cryptocurrency trading signals
    - `forex_top_picks` - Forex pair trading signals
    - `stocks_top_picks` - Stock trading signals
    - `commodities_top_picks` - Commodity trading signals
    - `top_stories` - Trending news stories
    - `taco_trade_updates` - TACO trading updates
    - `correlation_webhooks` - Correlation data from webhooks

  2. Table Structure (for each top picks table)
    - Basic fields: id, name/symbol, signal, price
    - Technical indicators: indicators (jsonb), rate_of_change (jsonb)
    - Analysis: summary (jsonb), historical_performance (jsonb)
    - Metadata: date, raw_data (jsonb), news_summary (jsonb), optimized_parameters (jsonb)
    - Timestamps: created_at, updated_at

  3. Security
    - Enable RLS on all tables
    - Public read access (anon + authenticated)
    - Authenticated write access for updates

  4. Important Notes
    - All monetary/numeric values use numeric type for precision
    - Signal values constrained between -10 and +10
    - Indexes on signal columns for fast sorting
    - JSONB columns for flexible nested data storage
*/

-- Crypto Top Picks Table
CREATE TABLE IF NOT EXISTS crypto_top_picks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  crypto_name text NOT NULL,
  symbol text NOT NULL UNIQUE,
  signal numeric NOT NULL CHECK (signal >= -10 AND signal <= 10),
  price numeric,
  roc_signal numeric,
  roc_value numeric,
  indicators jsonb,
  rate_of_change jsonb,
  summary jsonb,
  historical_performance jsonb,
  date date,
  raw_data jsonb,
  news_summary jsonb,
  optimized_parameters jsonb,
  updated_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_crypto_signal ON crypto_top_picks(signal DESC);

ALTER TABLE crypto_top_picks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view crypto top picks"
  ON crypto_top_picks FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert crypto top picks"
  ON crypto_top_picks FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update crypto top picks"
  ON crypto_top_picks FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Forex Top Picks Table
CREATE TABLE IF NOT EXISTS forex_top_picks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  pair_name text NOT NULL,
  symbol text NOT NULL UNIQUE,
  signal numeric NOT NULL CHECK (signal >= -10 AND signal <= 10),
  price numeric,
  roc_signal numeric,
  roc_value numeric,
  indicators jsonb,
  rate_of_change jsonb,
  summary jsonb,
  historical_performance jsonb,
  date date,
  raw_data jsonb,
  news_summary jsonb,
  optimized_parameters jsonb,
  updated_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_forex_signal ON forex_top_picks(signal DESC);

ALTER TABLE forex_top_picks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view forex top picks"
  ON forex_top_picks FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert forex top picks"
  ON forex_top_picks FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update forex top picks"
  ON forex_top_picks FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Stocks Top Picks Table
CREATE TABLE IF NOT EXISTS stocks_top_picks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  stock_name text NOT NULL,
  symbol text NOT NULL UNIQUE,
  signal numeric NOT NULL CHECK (signal >= -10 AND signal <= 10),
  price numeric,
  roc_signal numeric,
  roc_value numeric,
  indicators jsonb,
  rate_of_change jsonb,
  summary jsonb,
  historical_performance jsonb,
  date date,
  raw_data jsonb,
  news_summary jsonb,
  optimized_parameters jsonb,
  updated_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_stocks_signal ON stocks_top_picks(signal DESC);

ALTER TABLE stocks_top_picks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view stocks top picks"
  ON stocks_top_picks FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert stocks top picks"
  ON stocks_top_picks FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update stocks top picks"
  ON stocks_top_picks FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Commodities Top Picks Table
CREATE TABLE IF NOT EXISTS commodities_top_picks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  commodity_name text NOT NULL,
  symbol text NOT NULL UNIQUE,
  signal numeric NOT NULL CHECK (signal >= -10 AND signal <= 10),
  price numeric,
  roc_signal numeric,
  roc_value numeric,
  indicators jsonb,
  rate_of_change jsonb,
  summary jsonb,
  historical_performance jsonb,
  date date,
  raw_data jsonb,
  news_summary jsonb,
  optimized_parameters jsonb,
  updated_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_commodities_signal ON commodities_top_picks(signal DESC);

ALTER TABLE commodities_top_picks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view commodities top picks"
  ON commodities_top_picks FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert commodities top picks"
  ON commodities_top_picks FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update commodities top picks"
  ON commodities_top_picks FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Top Stories Table
CREATE TABLE IF NOT EXISTS top_stories (
  id bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  headline text NOT NULL,
  description text NOT NULL,
  link text NOT NULL,
  last_checked_at timestamptz NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE top_stories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view top stories"
  ON top_stories FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert top stories"
  ON top_stories FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update top stories"
  ON top_stories FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- TACO Trade Updates Table
CREATE TABLE IF NOT EXISTS taco_trade_updates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  date text,
  source text,
  quote text,
  topic text,
  aggression_score integer,
  followthrough_score integer,
  summary text,
  historical_consistency text,
  chickened_out boolean DEFAULT false,
  verdict text,
  reference_link text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE taco_trade_updates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view taco trade updates"
  ON taco_trade_updates FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert taco trade updates"
  ON taco_trade_updates FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update taco trade updates"
  ON taco_trade_updates FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Correlation Webhooks Table
CREATE TABLE IF NOT EXISTS correlation_webhooks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  data jsonb NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE correlation_webhooks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view correlation webhooks"
  ON correlation_webhooks FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert correlation webhooks"
  ON correlation_webhooks FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update correlation webhooks"
  ON correlation_webhooks FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);