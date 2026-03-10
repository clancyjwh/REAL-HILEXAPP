/*
  # Add INSERT policy for users table
  
  1. Changes
    - Add policy to allow authenticated users to insert their own data
    - This enables upsert operations in the streak tracker
  
  2. Security
    - Users can only insert data for their own user ID
    - Prevents users from creating records for other users
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'users' 
    AND policyname = 'Users can insert own data'
  ) THEN
    CREATE POLICY "Users can insert own data"
      ON users
      FOR INSERT
      TO authenticated
      WITH CHECK (auth.uid() = id);
  END IF;
END $$;
