/*
  # Fix User Signup Trigger - Remove Non-Existent Users Table

  1. Changes
    - Update handle_new_user() trigger function to only insert into profiles table
    - Remove references to non-existent public.users table
    - Keep all user data in profiles table only
    
  2. Fields in Profiles Table
    - id: User UUID from auth.users
    - email: User email
    - first_name: From metadata
    - last_name: From metadata  
    - business_name: From metadata
    - subscription_status: Set to 'active' (premium)
    - avatar_url: For OAuth providers
    
  3. Important Notes
    - This fixes the "table does not exist" error
    - All new users get premium status automatically
    - Works with both email/password and OAuth signups
*/

-- Drop existing trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Update trigger function to only use profiles table
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  v_first_name text;
  v_last_name text;
  v_business_name text;
  v_avatar_url text;
BEGIN
  -- Extract metadata fields
  v_first_name := COALESCE(NEW.raw_user_meta_data->>'first_name', '');
  v_last_name := COALESCE(NEW.raw_user_meta_data->>'last_name', '');
  v_business_name := COALESCE(NEW.raw_user_meta_data->>'business_name', '');
  
  -- Extract avatar URL for OAuth providers (Google, etc.)
  v_avatar_url := COALESCE(
    NEW.raw_user_meta_data->>'avatar_url',
    NEW.raw_user_meta_data->>'picture',
    ''
  );

  -- Insert into profiles table with premium status
  INSERT INTO public.profiles (id, email, first_name, last_name, business_name, subscription_status)
  VALUES (
    NEW.id,
    NEW.email,
    NULLIF(v_first_name, ''),
    NULLIF(v_last_name, ''),
    NULLIF(v_business_name, ''),
    'active'
  )
  ON CONFLICT (id) DO UPDATE
  SET
    email = COALESCE(EXCLUDED.email, profiles.email),
    first_name = COALESCE(EXCLUDED.first_name, profiles.first_name),
    last_name = COALESCE(EXCLUDED.last_name, profiles.last_name),
    business_name = COALESCE(EXCLUDED.business_name, profiles.business_name);

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recreate the trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();
