/*
  # Update Profile Trigger to Handle Google OAuth Data
  
  1. Changes
    - Update handle_new_user() function to properly extract Google OAuth metadata
    - Handle both email/password signup and Google OAuth signup
    - Extract name from Google's 'full_name' or 'name' fields
    - Extract avatar_url from Google's 'avatar_url' or 'picture' fields
    - Ensure profiles are created for all authentication methods
  
  2. Google OAuth Fields
    - full_name or name: User's full name from Google
    - avatar_url or picture: User's profile picture URL from Google
    - email: User's email address
    - email_verified: Boolean indicating if email is verified
  
  3. Important Notes
    - Handles both standard signup and Google OAuth
    - Gracefully handles missing metadata fields
    - Uses COALESCE to provide fallback values
*/

-- Drop existing trigger first
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Update the trigger function to handle Google OAuth metadata
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  v_full_name text;
  v_first_name text;
  v_last_name text;
  v_avatar_url text;
BEGIN
  -- Extract full name from various possible metadata fields
  v_full_name := COALESCE(
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'name',
    ''
  );
  
  -- Split full name into first and last name
  IF v_full_name != '' THEN
    v_first_name := split_part(v_full_name, ' ', 1);
    v_last_name := trim(substring(v_full_name from length(split_part(v_full_name, ' ', 1)) + 2));
  ELSE
    v_first_name := COALESCE(NEW.raw_user_meta_data->>'first_name', '');
    v_last_name := COALESCE(NEW.raw_user_meta_data->>'last_name', '');
  END IF;
  
  -- Extract avatar URL (Google OAuth uses 'picture', others might use 'avatar_url')
  v_avatar_url := COALESCE(
    NEW.raw_user_meta_data->>'avatar_url',
    NEW.raw_user_meta_data->>'picture',
    ''
  );

  -- Insert profile record
  INSERT INTO public.profiles (id, email, first_name, last_name, avatar_url, business_name, subscription_status)
  VALUES (
    NEW.id,
    NEW.email,
    v_first_name,
    v_last_name,
    NULLIF(v_avatar_url, ''),
    COALESCE(NEW.raw_user_meta_data->>'business_name', ''),
    'free'
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recreate the trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();
