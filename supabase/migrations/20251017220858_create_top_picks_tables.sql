/*
  # Create Top Picks Tables

  1. New Tables
    - `crypto_top_picks`
      - `id` (uuid, primary key)
      - `crypto_name` (text) - Full name (e.g., "Bitcoin")
      - `symbol` (text) - Short symbol (e.g., "BTC")
      - `signal` (numeric) - Signal strength from -10 to +10
      - `price` (numeric, optional) - Current price
      - `roc_signal` (numeric, optional) - ROC signal score
      - `roc_value` (numeric, optional) - Current ROC percentage
      - `updated_at` (timestamptz) - Last update timestamp
      - `created_at` (timestamptz) - Creation timestamp
    
    - `forex_top_picks`
      - `id` (uuid, primary key)
      - `pair_name` (text) - Full name (e.g., "Euro/US Dollar")
      - `symbol` (text) - Pair symbol (e.g., "EUR/USD")
      - `signal` (numeric) - Signal strength from -10 to +10
      - `price` (numeric, optional) - Current exchange rate
      - `roc_signal` (numeric, optional) - ROC signal score
      - `roc_value` (numeric, optional) - Current ROC percentage
      - `updated_at` (timestamptz) - Last update timestamp
      - `created_at` (timestamptz) - Creation timestamp
    
    - `stocks_top_picks`
      - `id` (uuid, primary key)
      - `stock_name` (text) - Full name (e.g., "Apple Inc.")
      - `symbol` (text) - Ticker symbol (e.g., "AAPL")
      - `signal` (numeric) - Signal strength from -10 to +10
      - `price` (numeric, optional) - Current stock price
      - `roc_signal` (numeric, optional) - ROC signal score
      - `roc_value` (numeric, optional) - Current ROC percentage
      - `updated_at` (timestamptz) - Last update timestamp
      - `created_at` (timestamptz) - Creation timestamp
    
    - `commodities_top_picks`
      - `id` (uuid, primary key)
      - `commodity_name` (text) - Full name (e.g., "Gold")
      - `symbol` (text) - Symbol (e.g., "XAU")
      - `signal` (numeric) - Signal strength from -10 to +10
      - `price` (numeric, optional) - Current price
      - `roc_signal` (numeric, optional) - ROC signal score
      - `roc_value` (numeric, optional) - Current ROC percentage
      - `updated_at` (timestamptz) - Last update timestamp
      - `created_at` (timestamptz) - Creation timestamp

  2. Security
    - Enable RLS on all tables
    - Add policies for public read access (anyone can view top picks)
    - Authenticated users only for write operations (for admin updates)

  3. Important Notes
    - Signal values constrained between -10 and +10
    - Indexes added on signal for fast sorting
    - All tables follow same structure for consistency
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
