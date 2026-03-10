/*
  # Add RLS policies for profiles table

  1. Security
    - Enable RLS on profiles table (if not already enabled)
    - Add policy for authenticated users to read all profiles (needed for chatroom usernames)
    - Add policy for users to update their own profile
    - Add policy for users to insert their own profile (for signup)

  2. Notes
    - Read access is public to authenticated users so chatrooms can display usernames
    - Users can only modify their own profile data
*/

-- Enable RLS if not already enabled
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Allow authenticated users to read all profiles" ON profiles;
DROP POLICY IF EXISTS "Allow users to insert own profile" ON profiles;
DROP POLICY IF EXISTS "Allow users to update own profile" ON profiles;

-- Allow authenticated users to read all profiles (for displaying usernames in chat)
CREATE POLICY "Allow authenticated users to read all profiles"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (true);

-- Allow users to insert their own profile during signup
CREATE POLICY "Allow users to insert own profile"
  ON profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Allow users to update their own profile
CREATE POLICY "Allow users to update own profile"
  ON profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);
