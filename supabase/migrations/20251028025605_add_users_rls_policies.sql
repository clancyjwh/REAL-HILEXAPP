/*
  # Add RLS Policies for Users Table

  1. Security
    - Add policy for users to read their own subscription status
    - Add policy for users to update their own data
    - Ensures users can only access their own records
*/

-- Policy for users to read their own data
CREATE POLICY "Users can read own data"
  ON users
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

-- Policy for users to update their own data
CREATE POLICY "Users can update own data"
  ON users
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);
