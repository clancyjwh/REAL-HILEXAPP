/*
  # Allow All Users Access to Daily Insights and Top Movers

  ## Problem
  - RLS policies require premium tier to view daily_insights and top_picks tables
  - New users default to 'free' tier and see empty results
  - Users should see data regardless of subscription tier

  ## Solution
  - Update RLS policies to allow ALL authenticated users to read these tables
  - Remove premium tier requirement

  ## Changes
  - Daily insights: Allow all authenticated users to read
  - Top picks tables (stocks, crypto, forex, commodities): Allow all authenticated users to read
*/

-- Update daily_insights policy
DROP POLICY IF EXISTS "Premium users can read daily_insights" ON daily_insights;
CREATE POLICY "All authenticated users can read daily_insights"
  ON daily_insights
  FOR SELECT
  TO authenticated
  USING (true);

-- Update stocks_top_picks policy
DROP POLICY IF EXISTS "Premium users can read stocks_top_picks" ON stocks_top_picks;
CREATE POLICY "All authenticated users can read stocks_top_picks"
  ON stocks_top_picks
  FOR SELECT
  TO authenticated
  USING (true);

-- Update crypto_top_picks policy
DROP POLICY IF EXISTS "Premium users can read crypto_top_picks" ON crypto_top_picks;
CREATE POLICY "All authenticated users can read crypto_top_picks"
  ON crypto_top_picks
  FOR SELECT
  TO authenticated
  USING (true);

-- Update forex_top_picks policy
DROP POLICY IF EXISTS "Premium users can read forex_top_picks" ON forex_top_picks;
CREATE POLICY "All authenticated users can read forex_top_picks"
  ON forex_top_picks
  FOR SELECT
  TO authenticated
  USING (true);

-- Update commodities_top_picks policy
DROP POLICY IF EXISTS "Premium users can read commodities_top_picks" ON commodities_top_picks;
CREATE POLICY "All authenticated users can read commodities_top_picks"
  ON commodities_top_picks
  FOR SELECT
  TO authenticated
  USING (true);
