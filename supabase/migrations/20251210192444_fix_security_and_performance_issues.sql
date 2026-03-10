/*
  # Fix Security and Performance Issues

  ## 1. Add Missing Foreign Key Indexes
    - Add index on bespoke_updates(user_id)
    - Add index on messages(room_id)
    - Add index on notifications(message_id)
    - Add index on notifications(room_id)

  ## 2. Optimize RLS Policies
    - Update all RLS policies to use (select auth.uid()) instead of auth.uid()
    - This prevents re-evaluation for each row and improves query performance at scale
    - Tables affected: users, profiles, user_watchlist, custom_projects, bespoke_updates, 
      live_prices_watchlist, notifications, messages

  ## 3. Remove Duplicate Policies
    - Remove duplicate SELECT policy on asset_daily_analysis

  ## 4. Remove Duplicate Indexes
    - Drop duplicate index idx_asset_daily_analysis_date (keeping idx_asset_daily_analysis_run_date)

  ## 5. Fix Function Security
    - Update function search_path to be immutable for create_hylex_bot_notification and sync_user_profile
*/

-- =====================================================
-- 1. ADD MISSING FOREIGN KEY INDEXES
-- =====================================================

-- Add index for bespoke_updates.user_id foreign key
CREATE INDEX IF NOT EXISTS idx_bespoke_updates_user_id ON public.bespoke_updates(user_id);

-- Add index for messages.room_id foreign key
CREATE INDEX IF NOT EXISTS idx_messages_room_id ON public.messages(room_id);

-- Add index for notifications.message_id foreign key
CREATE INDEX IF NOT EXISTS idx_notifications_message_id ON public.notifications(message_id);

-- Add index for notifications.room_id foreign key
CREATE INDEX IF NOT EXISTS idx_notifications_room_id ON public.notifications(room_id);

-- =====================================================
-- 2. OPTIMIZE RLS POLICIES - DROP OLD POLICIES
-- =====================================================

-- Users table
DROP POLICY IF EXISTS "Users can read own data" ON public.users;
DROP POLICY IF EXISTS "Users can update own data" ON public.users;
DROP POLICY IF EXISTS "Users can insert own data" ON public.users;

-- Profiles table
DROP POLICY IF EXISTS "Allow users to insert own profile" ON public.profiles;
DROP POLICY IF EXISTS "Allow users to update own profile" ON public.profiles;

-- User watchlist table
DROP POLICY IF EXISTS "Users can view own watchlist" ON public.user_watchlist;
DROP POLICY IF EXISTS "Users can delete own watchlist items" ON public.user_watchlist;
DROP POLICY IF EXISTS "Users can insert own watchlist items" ON public.user_watchlist;

-- Custom projects table
DROP POLICY IF EXISTS "Users can insert own projects" ON public.custom_projects;
DROP POLICY IF EXISTS "Users can view own projects" ON public.custom_projects;
DROP POLICY IF EXISTS "Users can delete own projects" ON public.custom_projects;

-- Bespoke updates table
DROP POLICY IF EXISTS "Users can insert own bespoke updates" ON public.bespoke_updates;
DROP POLICY IF EXISTS "Users can read own bespoke updates" ON public.bespoke_updates;
DROP POLICY IF EXISTS "Users can delete own updates" ON public.bespoke_updates;

-- Live prices watchlist table
DROP POLICY IF EXISTS "Users can read own live prices" ON public.live_prices_watchlist;
DROP POLICY IF EXISTS "Users can insert own live prices" ON public.live_prices_watchlist;
DROP POLICY IF EXISTS "Users can update own live prices" ON public.live_prices_watchlist;
DROP POLICY IF EXISTS "Users can delete own live prices" ON public.live_prices_watchlist;

-- Notifications table
DROP POLICY IF EXISTS "Users can view own notifications" ON public.notifications;
DROP POLICY IF EXISTS "Users can update own notifications" ON public.notifications;

-- Messages table
DROP POLICY IF EXISTS "Authenticated users can insert own messages" ON public.messages;
DROP POLICY IF EXISTS "Users can update own messages" ON public.messages;
DROP POLICY IF EXISTS "Users can delete own messages" ON public.messages;

-- =====================================================
-- 3. CREATE OPTIMIZED RLS POLICIES
-- =====================================================

-- Users table (optimized)
CREATE POLICY "Users can read own data"
  ON public.users
  FOR SELECT
  TO authenticated
  USING ((select auth.uid()) = id);

CREATE POLICY "Users can update own data"
  ON public.users
  FOR UPDATE
  TO authenticated
  USING ((select auth.uid()) = id)
  WITH CHECK ((select auth.uid()) = id);

CREATE POLICY "Users can insert own data"
  ON public.users
  FOR INSERT
  TO authenticated
  WITH CHECK ((select auth.uid()) = id);

-- Profiles table (optimized)
CREATE POLICY "Allow users to insert own profile"
  ON public.profiles
  FOR INSERT
  TO authenticated
  WITH CHECK ((select auth.uid()) = id);

CREATE POLICY "Allow users to update own profile"
  ON public.profiles
  FOR UPDATE
  TO authenticated
  USING ((select auth.uid()) = id)
  WITH CHECK ((select auth.uid()) = id);

-- User watchlist table (optimized)
CREATE POLICY "Users can view own watchlist"
  ON public.user_watchlist
  FOR SELECT
  TO authenticated
  USING ((select auth.uid()) = user_id);

CREATE POLICY "Users can insert own watchlist items"
  ON public.user_watchlist
  FOR INSERT
  TO authenticated
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can delete own watchlist items"
  ON public.user_watchlist
  FOR DELETE
  TO authenticated
  USING ((select auth.uid()) = user_id);

-- Custom projects table (optimized)
CREATE POLICY "Users can view own projects"
  ON public.custom_projects
  FOR SELECT
  TO authenticated
  USING ((select auth.uid()) = user_id);

CREATE POLICY "Users can insert own projects"
  ON public.custom_projects
  FOR INSERT
  TO authenticated
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can delete own projects"
  ON public.custom_projects
  FOR DELETE
  TO authenticated
  USING ((select auth.uid()) = user_id);

-- Bespoke updates table (optimized)
CREATE POLICY "Users can read own bespoke updates"
  ON public.bespoke_updates
  FOR SELECT
  TO authenticated
  USING ((select auth.uid()) = user_id);

CREATE POLICY "Users can insert own bespoke updates"
  ON public.bespoke_updates
  FOR INSERT
  TO authenticated
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can delete own updates"
  ON public.bespoke_updates
  FOR DELETE
  TO authenticated
  USING ((select auth.uid()) = user_id);

-- Live prices watchlist table (optimized)
CREATE POLICY "Users can read own live prices"
  ON public.live_prices_watchlist
  FOR SELECT
  TO authenticated
  USING ((select auth.uid()) = user_id);

CREATE POLICY "Users can insert own live prices"
  ON public.live_prices_watchlist
  FOR INSERT
  TO authenticated
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can update own live prices"
  ON public.live_prices_watchlist
  FOR UPDATE
  TO authenticated
  USING ((select auth.uid()) = user_id)
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can delete own live prices"
  ON public.live_prices_watchlist
  FOR DELETE
  TO authenticated
  USING ((select auth.uid()) = user_id);

-- Notifications table (optimized)
CREATE POLICY "Users can view own notifications"
  ON public.notifications
  FOR SELECT
  TO authenticated
  USING ((select auth.uid()) = user_id);

CREATE POLICY "Users can update own notifications"
  ON public.notifications
  FOR UPDATE
  TO authenticated
  USING ((select auth.uid()) = user_id)
  WITH CHECK ((select auth.uid()) = user_id);

-- Messages table (optimized)
CREATE POLICY "Authenticated users can insert own messages"
  ON public.messages
  FOR INSERT
  TO authenticated
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can update own messages"
  ON public.messages
  FOR UPDATE
  TO authenticated
  USING ((select auth.uid()) = user_id)
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can delete own messages"
  ON public.messages
  FOR DELETE
  TO authenticated
  USING ((select auth.uid()) = user_id);

-- =====================================================
-- 4. REMOVE DUPLICATE POLICIES
-- =====================================================

-- Remove duplicate SELECT policy on asset_daily_analysis
DROP POLICY IF EXISTS "allow authenticated read" ON public.asset_daily_analysis;

-- Keep only "Authenticated users can read asset daily analysis" policy

-- =====================================================
-- 5. REMOVE DUPLICATE INDEXES
-- =====================================================

-- Drop duplicate index (keeping idx_asset_daily_analysis_run_date)
DROP INDEX IF EXISTS public.idx_asset_daily_analysis_date;

-- =====================================================
-- 6. FIX FUNCTION SECURITY (Search Path)
-- =====================================================

-- Recreate create_hylex_bot_notification with stable search_path
CREATE OR REPLACE FUNCTION public.create_hylex_bot_notification(
  p_user_id uuid,
  p_title text,
  p_message text,
  p_type text DEFAULT 'info'
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  notification_id uuid;
BEGIN
  INSERT INTO public.notifications (user_id, title, message, type, is_read)
  VALUES (p_user_id, p_title, p_message, p_type, false)
  RETURNING id INTO notification_id;
  
  RETURN notification_id;
END;
$$;

-- Recreate sync_user_profile with stable search_path
CREATE OR REPLACE FUNCTION public.sync_user_profile()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO public.profiles (id, email, display_name, avatar_url, is_premium, created_at, updated_at)
    VALUES (
      NEW.id,
      NEW.email,
      COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1)),
      NEW.raw_user_meta_data->>'avatar_url',
      COALESCE((NEW.raw_app_meta_data->>'is_premium')::boolean, true),
      NOW(),
      NOW()
    )
    ON CONFLICT (id) DO UPDATE
    SET
      email = EXCLUDED.email,
      display_name = COALESCE(EXCLUDED.display_name, profiles.display_name),
      avatar_url = COALESCE(EXCLUDED.avatar_url, profiles.avatar_url),
      is_premium = COALESCE(EXCLUDED.is_premium, profiles.is_premium),
      updated_at = NOW();
  ELSIF TG_OP = 'UPDATE' THEN
    UPDATE public.profiles
    SET
      email = NEW.email,
      display_name = COALESCE(NEW.raw_user_meta_data->>'display_name', profiles.display_name),
      avatar_url = COALESCE(NEW.raw_user_meta_data->>'avatar_url', profiles.avatar_url),
      is_premium = COALESCE((NEW.raw_app_meta_data->>'is_premium')::boolean, profiles.is_premium),
      updated_at = NOW()
    WHERE id = NEW.id;
  END IF;
  
  RETURN NEW;
END;
$$;