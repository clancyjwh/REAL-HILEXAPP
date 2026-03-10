/*
  # Add User Insert Policy to Watchlist

  1. Changes
    - Add policy for authenticated users to insert their own watchlist items
    - This allows users to immediately create placeholder entries before webhook runs

  2. Security
    - Policy restricts users to only insert items with their own user_id
    - Maintains security while enabling instant loading states
*/

-- Add policy for users to insert their own watchlist items
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'user_watchlist' 
    AND policyname = 'Users can insert own watchlist items'
  ) THEN
    CREATE POLICY "Users can insert own watchlist items"
      ON user_watchlist
      FOR INSERT
      TO authenticated
      WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;