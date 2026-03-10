/*
  # Fix trigger function to bypass RLS

  This migration adds SECURITY DEFINER to the handle_new_user function,
  allowing it to bypass RLS policies and successfully insert into users and profiles tables.
*/

-- Drop and recreate the function with SECURITY DEFINER
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
SECURITY DEFINER -- This allows the function to bypass RLS
SET search_path = public
LANGUAGE plpgsql
AS $$
DECLARE
  v_full_name text;
  v_first_name text;
  v_last_name text;
  v_business_name text;
  v_avatar_url text;
BEGIN
  -- Extract metadata fields
  v_first_name := COALESCE(NEW.raw_user_meta_data->>'first_name', '');
  v_last_name := COALESCE(NEW.raw_user_meta_data->>'last_name', '');
  v_business_name := COALESCE(NEW.raw_user_meta_data->>'business_name', '');
  
  -- Build full_name from first_name and last_name
  IF v_first_name != '' AND v_last_name != '' THEN
    v_full_name := v_first_name || ' ' || v_last_name;
  ELSIF v_first_name != '' THEN
    v_full_name := v_first_name;
  ELSIF v_last_name != '' THEN
    v_full_name := v_last_name;
  ELSE
    -- Try to get full_name directly from metadata (for Google OAuth)
    v_full_name := COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', '');
  END IF;
  
  -- Extract avatar URL for Google OAuth
  v_avatar_url := COALESCE(
    NEW.raw_user_meta_data->>'avatar_url',
    NEW.raw_user_meta_data->>'picture',
    ''
  );

  -- Insert into users table with 'active' subscription status (premium)
  INSERT INTO public.users (id, email, business_name, full_name, subscription_status)
  VALUES (
    NEW.id,
    NEW.email,
    NULLIF(v_business_name, ''),
    NULLIF(v_full_name, ''),
    'active'
  )
  ON CONFLICT (id) DO UPDATE
  SET
    business_name = COALESCE(EXCLUDED.business_name, users.business_name),
    full_name = COALESCE(EXCLUDED.full_name, users.full_name),
    email = COALESCE(EXCLUDED.email, users.email);

  -- Insert into profiles table with 'premium' tier
  INSERT INTO public.profiles (id, email, business_name, full_name, avatar_url, tier)
  VALUES (
    NEW.id,
    NEW.email,
    NULLIF(v_business_name, ''),
    NULLIF(v_full_name, ''),
    NULLIF(v_avatar_url, ''),
    'premium'
  )
  ON CONFLICT (id) DO UPDATE
  SET
    business_name = COALESCE(EXCLUDED.business_name, profiles.business_name),
    full_name = COALESCE(EXCLUDED.full_name, profiles.full_name),
    avatar_url = COALESCE(EXCLUDED.avatar_url, profiles.avatar_url),
    email = COALESCE(EXCLUDED.email, profiles.email);

  RETURN NEW;
END;
$$;

-- Recreate the trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();
