/*
  # Add Missing Columns to Profiles Table

  ## Problem
  - Client code expects notification_preferences and updated_at columns
  - These columns don't exist in the profiles table

  ## Solution
  - Add notification_preferences (jsonb) column
  - Add updated_at (timestamp) column with default and auto-update trigger
*/

-- Add missing columns to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS notification_preferences jsonb DEFAULT '{"email": true, "push": true}'::jsonb;

ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now();

-- Create or replace function to auto-update updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to auto-update updated_at on profiles
DROP TRIGGER IF EXISTS update_profiles_updated_at ON public.profiles;
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
