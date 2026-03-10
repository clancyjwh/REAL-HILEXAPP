/*
  # Fix User Signup Trigger to Populate Both Users and Profiles Tables

  1. Changes
    - Update handle_new_user() function to insert into BOTH users and profiles tables
    - Extract first_name, last_name, and business_name from raw_user_meta_data
    - Calculate full_name by concatenating first_name and last_name
    - Handle Google OAuth and email/password signup
    - Set default subscription_status to 'free' for both tables

  2. Fields Mapped
    - email: Directly from auth.users.email
    - first_name: From raw_user_meta_data->>'first_name'
    - last_name: From raw_user_meta_data->>'last_name'
    - full_name: Concatenated from first_name + ' ' + last_name
    - business_name: From raw_user_meta_data->>'business_name'
    - subscription_status: Default 'free'

  3. Important Notes
    - Inserts into users table with all fields
    - Inserts into profiles table with all fields
    - Uses ON CONFLICT to prevent duplicate inserts
    - Works for both new signups and existing auth users
*/

-- Drop existing trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Create updated trigger function
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
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
  
  -- Build full_name
  IF v_first_name != '' AND v_last_name != '' THEN
    v_full_name := v_first_name || ' ' || v_last_name;
  ELSIF v_first_name != '' THEN
    v_full_name := v_first_name;
  ELSIF v_last_name != '' THEN
    v_full_name := v_last_name;
  ELSE
    v_full_name := '';
  END IF;
  
  -- Extract avatar URL for Google OAuth
  v_avatar_url := COALESCE(
    NEW.raw_user_meta_data->>'avatar_url',
    NEW.raw_user_meta_data->>'picture',
    ''
  );

  -- Insert into users table
  INSERT INTO public.users (id, email, business_name, full_name, subscription_status)
  VALUES (
    NEW.id,
    NEW.email,
    NULLIF(v_business_name, ''),
    NULLIF(v_full_name, ''),
    'free'
  )
  ON CONFLICT (id) DO UPDATE
  SET
    business_name = COALESCE(EXCLUDED.business_name, users.business_name),
    full_name = COALESCE(EXCLUDED.full_name, users.full_name),
    email = COALESCE(EXCLUDED.email, users.email);

  -- Insert into profiles table
  INSERT INTO public.profiles (id, email, first_name, last_name, business_name, avatar_url, subscription_status)
  VALUES (
    NEW.id,
    NEW.email,
    NULLIF(v_first_name, ''),
    NULLIF(v_last_name, ''),
    NULLIF(v_business_name, ''),
    NULLIF(v_avatar_url, ''),
    'free'
  )
  ON CONFLICT (id) DO UPDATE
  SET
    first_name = COALESCE(EXCLUDED.first_name, profiles.first_name),
    last_name = COALESCE(EXCLUDED.last_name, profiles.last_name),
    business_name = COALESCE(EXCLUDED.business_name, profiles.business_name),
    avatar_url = COALESCE(EXCLUDED.avatar_url, profiles.avatar_url),
    email = COALESCE(EXCLUDED.email, profiles.email);

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recreate the trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();
