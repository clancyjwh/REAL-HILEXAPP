/*
  # Fix Trigger with Proper Error Handling

  ## Problem
  - Trigger errors can cause signup to fail completely
  - Need to handle errors gracefully without blocking user creation

  ## Solution
  - Add exception handling to prevent trigger from blocking signup
  - Log errors for debugging but continue with user creation
*/

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
  BEGIN
    raw_meta := COALESCE(NEW.raw_user_meta_data, '{}'::jsonb);

    -- Extract metadata
    first_name_val := raw_meta->>'first_name';
    last_name_val := raw_meta->>'last_name';
    business_name_val := raw_meta->>'business_name';
    avatar_val := raw_meta->>'avatar_url';

    -- Build full_name
    full_name_val := TRIM(CONCAT(COALESCE(first_name_val, ''), ' ', COALESCE(last_name_val, '')));
    
    IF full_name_val = '' OR full_name_val IS NULL THEN
      full_name_val := COALESCE(
        raw_meta->>'full_name',
        raw_meta->>'name',
        SPLIT_PART(NEW.email, '@', 1)
      );
    END IF;

    -- Insert into profiles table
    INSERT INTO public.profiles (
      id, 
      full_name, 
      email,
      business_name,
      avatar_url, 
      tier,
      notifications_enabled,
      notification_preferences,
      updated_at
    )
    VALUES (
      NEW.id,
      full_name_val,
      NEW.email,
      business_name_val,
      avatar_val,
      'premium',
      true,
      '{"email": true, "push": true}'::jsonb,
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
      full_name = COALESCE(EXCLUDED.full_name, users.full_name),
      business_name = COALESCE(EXCLUDED.business_name, users.business_name),
      subscription_status = COALESCE(EXCLUDED.subscription_status, users.subscription_status);

  EXCEPTION WHEN OTHERS THEN
    -- Log error but don't fail the signup
    RAISE WARNING 'Error in sync_user_profile for user %: %', NEW.id, SQLERRM;
  END;

  RETURN NEW;
END;
$$;

-- Recreate trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.sync_user_profile();
