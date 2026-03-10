/*
  # Add avatar_url Column to Profiles Table
  
  1. Changes
    - Add avatar_url column to profiles table if it doesn't exist
    - Column stores user's profile picture URL (from Google OAuth or other sources)
  
  2. Important Notes
    - Uses IF NOT EXISTS to safely add column without errors
    - Column is nullable as not all users may have an avatar
*/

-- Add avatar_url column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'avatar_url'
  ) THEN
    ALTER TABLE profiles ADD COLUMN avatar_url text;
  END IF;
END $$;
