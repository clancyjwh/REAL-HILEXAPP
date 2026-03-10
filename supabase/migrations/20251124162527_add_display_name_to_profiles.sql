/*
  # Add display_name to profiles table

  1. Changes
    - Add `display_name` column to profiles table
    - Default value is NULL (will be set on first login)
  
  2. Notes
    - Existing users will have NULL display_name until they log in
    - New users will get a random anonymous name assigned automatically
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'display_name'
  ) THEN
    ALTER TABLE profiles ADD COLUMN display_name text;
  END IF;
END $$;