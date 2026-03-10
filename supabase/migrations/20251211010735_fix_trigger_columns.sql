/*
  # Fix Trigger Function to Match Table Structure

  ## Problem
  - Previous trigger referenced columns that don't exist (updated_at, notification_preferences)

  ## Solution
  - Update trigger to only use columns that actually exist in the tables
*/

-- Drop and recreate the trigger function with correct columns
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.sync_user_profile();

CREATE OR REPLACE FUNCTION public.sync_user_profile()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public', 'pg_temp'
AS $$
DECLARE
  raw_meta jsonb;
  first_name_val text;
  last_name_val text;
  full_name_val text;
  business_name_val text;
  avatar_val text;
BEGIN
  raw_meta := NEW.raw_user_meta_data;

  -- Extract metadata
  first_name_val := raw_meta->>'first_name';
  last_name_val := raw_meta->>'last_name';
  business_name_val := raw_meta->>'business_name';
  avatar_val := raw_meta->>'avatar_url';

  -- Build full_name
  full_name_val := COALESCE(
    TRIM(CONCAT(first_name_val, ' ', last_name_val)),
    raw_meta->>'full_name',
    raw_meta->>'name',
    SPLIT_PART(NEW.email, '@', 1)
  );

  -- Ensure full_name is not empty
  IF full_name_val = '' THEN
    full_name_val := SPLIT_PART(NEW.email, '@', 1);
  END IF;

  -- Insert into profiles table
  INSERT INTO public.profiles (
    id, 
    full_name, 
    email,
    business_name,
    avatar_url, 
    tier,
    notifications_enabled
  )
  VALUES (
    NEW.id,
    full_name_val,
    NEW.email,
    business_name_val,
    avatar_val,
    'premium',
    true
  )
  ON CONFLICT (id) DO UPDATE
  SET
    full_name = COALESCE(EXCLUDED.full_name, profiles.full_name),
    email = COALESCE(EXCLUDED.email, profiles.email),
    business_name = COALESCE(EXCLUDED.business_name, profiles.business_name),
    avatar_url = COALESCE(EXCLUDED.avatar_url, profiles.avatar_url),
    tier = COALESCE(EXCLUDED.tier, profiles.tier);

  -- Insert into users table
  INSERT INTO public.users (
    id,
    email,
    full_name,
    business_name,
    subscription_status
  )
  VALUES (
    NEW.id,
    NEW.email,
    full_name_val,
    business_name_val,
    'premium'
  )
  ON CONFLICT (id) DO UPDATE
  SET
    email = EXCLUDED.email,
    full_name = EXCLUDED.full_name,
    business_name = EXCLUDED.business_name,
    subscription_status = EXCLUDED.subscription_status;

  RETURN NEW;
END;
$$;

-- Recreate trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.sync_user_profile();
