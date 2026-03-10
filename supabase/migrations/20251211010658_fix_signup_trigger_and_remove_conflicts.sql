/*
  # Fix Signup Trigger and Remove Conflicts

  ## Problem
  - User signup is failing with "Database error saving new user"
  - The trigger `sync_user_profile()` creates profile records automatically
  - Client-side code was also trying to insert/update user records, causing conflicts

  ## Solution
  1. Update the trigger function to properly handle all user metadata
  2. Create users table record automatically via trigger
  3. Remove the need for client-side inserts/updates

  ## Changes
  - Updated sync_user_profile() to handle first_name, last_name, business_name
  - Updated trigger to insert into both profiles and users tables
  - Set tier to 'premium' by default for new users
*/

-- Drop existing trigger and function
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.sync_user_profile();

-- Create improved trigger function
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
    updated_at
  )
  VALUES (
    NEW.id,
    full_name_val,
    NEW.email,
    business_name_val,
    avatar_val,
    'premium',
    NOW()
  )
  ON CONFLICT (id) DO UPDATE
  SET
    full_name = COALESCE(EXCLUDED.full_name, profiles.full_name),
    email = COALESCE(EXCLUDED.email, profiles.email),
    business_name = COALESCE(EXCLUDED.business_name, profiles.business_name),
    avatar_url = COALESCE(EXCLUDED.avatar_url, profiles.avatar_url),
    tier = COALESCE(EXCLUDED.tier, profiles.tier),
    updated_at = NOW();

  -- Insert into users table
  INSERT INTO public.users (
    id,
    email,
    full_name,
    business_name,
    subscription_status,
    created_at
  )
  VALUES (
    NEW.id,
    NEW.email,
    full_name_val,
    business_name_val,
    'premium',
    NOW()
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
