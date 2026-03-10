/*
  # Fix RLS Performance and Security Issues

  ## Changes Made

  1. **RLS Performance Optimization**
     - Updated all RLS policies to use `(select auth.uid())` instead of `auth.uid()`
     - This prevents re-evaluation of auth functions for each row
     - Affects: user_watchlist, custom_projects, bespoke_updates, live_prices_watchlist, messages, notifications, tool_usage_logs, blocked_users

  2. **Remove Unused Indexes**
     - Dropped indexes that are not being used to improve write performance
     - Removed: idx_bespoke_updates_user_id, idx_notifications_message_id, idx_notifications_room_id
     - Removed: idx_suspicious_activity_*, idx_webhook_notifications_*, idx_tool_usage_user_time
     - Removed: idx_blocked_users_lookup, idx_webhook_call_logs_*

  3. **Remove Duplicate Policies**
     - Dropped duplicate permissive policies that create confusion and potential security issues
     - Cleaned up policies on: asset_daily_analysis, bespoke_updates, chatrooms, commodity/crypto/forex/stocks top picks
     - Cleaned up policies on: custom_projects, daily_insights, event_forecasting_*, interest_rates_data
     - Cleaned up policies on: live_prices_watchlist, messages, notifications, user_watchlist, zero_day_options_results

  4. **Fix Function Search Paths**
     - Set explicit search_path for all security-sensitive functions
     - Prevents search_path injection attacks
     - Affects all public functions used in RLS policies

  ## Security Impact
  - Improved query performance at scale
  - Reduced attack surface by removing duplicate policies
  - Protected against search_path injection attacks
  - Maintained all existing access control rules
*/

-- =====================================================
-- 1. FIX RLS PERFORMANCE ISSUES
-- =====================================================

-- user_watchlist policies
DROP POLICY IF EXISTS "Users can view their own watchlist" ON public.user_watchlist;
CREATE POLICY "Users can view their own watchlist"
  ON public.user_watchlist
  FOR SELECT
  TO authenticated
  USING (user_id = (select auth.uid()));

DROP POLICY IF EXISTS "Users can insert their own watchlist items" ON public.user_watchlist;
CREATE POLICY "Users can insert their own watchlist items"
  ON public.user_watchlist
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = (select auth.uid()));

DROP POLICY IF EXISTS "Users can update their own watchlist items" ON public.user_watchlist;
CREATE POLICY "Users can update their own watchlist items"
  ON public.user_watchlist
  FOR UPDATE
  TO authenticated
  USING (user_id = (select auth.uid()))
  WITH CHECK (user_id = (select auth.uid()));

DROP POLICY IF EXISTS "Users can delete their own watchlist items" ON public.user_watchlist;
CREATE POLICY "Users can delete their own watchlist items"
  ON public.user_watchlist
  FOR DELETE
  TO authenticated
  USING (user_id = (select auth.uid()));

-- custom_projects policies
DROP POLICY IF EXISTS "Users can view their own custom projects" ON public.custom_projects;
CREATE POLICY "Users can view their own custom projects"
  ON public.custom_projects
  FOR SELECT
  TO authenticated
  USING (user_id = (select auth.uid()));

DROP POLICY IF EXISTS "Users can insert their own custom projects" ON public.custom_projects;
CREATE POLICY "Users can insert their own custom projects"
  ON public.custom_projects
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = (select auth.uid()));

DROP POLICY IF EXISTS "Users can update their own custom projects" ON public.custom_projects;
CREATE POLICY "Users can update their own custom projects"
  ON public.custom_projects
  FOR UPDATE
  TO authenticated
  USING (user_id = (select auth.uid()))
  WITH CHECK (user_id = (select auth.uid()));

DROP POLICY IF EXISTS "Users can delete their own custom projects" ON public.custom_projects;
CREATE POLICY "Users can delete their own custom projects"
  ON public.custom_projects
  FOR DELETE
  TO authenticated
  USING (user_id = (select auth.uid()));

-- bespoke_updates policies
DROP POLICY IF EXISTS "Users can view their own bespoke updates" ON public.bespoke_updates;
CREATE POLICY "Users can view their own bespoke updates"
  ON public.bespoke_updates
  FOR SELECT
  TO authenticated
  USING (user_id = (select auth.uid()));

DROP POLICY IF EXISTS "Users can insert their own bespoke updates" ON public.bespoke_updates;
CREATE POLICY "Users can insert their own bespoke updates"
  ON public.bespoke_updates
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = (select auth.uid()));

DROP POLICY IF EXISTS "Users can update their own bespoke updates" ON public.bespoke_updates;
CREATE POLICY "Users can update their own bespoke updates"
  ON public.bespoke_updates
  FOR UPDATE
  TO authenticated
  USING (user_id = (select auth.uid()))
  WITH CHECK (user_id = (select auth.uid()));

DROP POLICY IF EXISTS "Users can delete their own bespoke updates" ON public.bespoke_updates;
CREATE POLICY "Users can delete their own bespoke updates"
  ON public.bespoke_updates
  FOR DELETE
  TO authenticated
  USING (user_id = (select auth.uid()));

-- live_prices_watchlist policies
DROP POLICY IF EXISTS "Users can view their own live prices watchlist" ON public.live_prices_watchlist;
CREATE POLICY "Users can view their own live prices watchlist"
  ON public.live_prices_watchlist
  FOR SELECT
  TO authenticated
  USING (user_id = (select auth.uid()));

DROP POLICY IF EXISTS "Users can insert their own live prices watchlist items" ON public.live_prices_watchlist;
CREATE POLICY "Users can insert their own live prices watchlist items"
  ON public.live_prices_watchlist
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = (select auth.uid()));

DROP POLICY IF EXISTS "Users can update their own live prices watchlist items" ON public.live_prices_watchlist;
CREATE POLICY "Users can update their own live prices watchlist items"
  ON public.live_prices_watchlist
  FOR UPDATE
  TO authenticated
  USING (user_id = (select auth.uid()))
  WITH CHECK (user_id = (select auth.uid()));

DROP POLICY IF EXISTS "Users can delete their own live prices watchlist items" ON public.live_prices_watchlist;
CREATE POLICY "Users can delete their own live prices watchlist items"
  ON public.live_prices_watchlist
  FOR DELETE
  TO authenticated
  USING (user_id = (select auth.uid()));

-- messages policies
DROP POLICY IF EXISTS "Users can insert their own messages" ON public.messages;
CREATE POLICY "Users can insert their own messages"
  ON public.messages
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = (select auth.uid()));

-- notifications policies
DROP POLICY IF EXISTS "Users can view their own notifications" ON public.notifications;
CREATE POLICY "Users can view their own notifications"
  ON public.notifications
  FOR SELECT
  TO authenticated
  USING (user_id = (select auth.uid()));

DROP POLICY IF EXISTS "Users can update their own notifications" ON public.notifications;
CREATE POLICY "Users can update their own notifications"
  ON public.notifications
  FOR UPDATE
  TO authenticated
  USING (user_id = (select auth.uid()))
  WITH CHECK (user_id = (select auth.uid()));

DROP POLICY IF EXISTS "Users can delete their own notifications" ON public.notifications;
CREATE POLICY "Users can delete their own notifications"
  ON public.notifications
  FOR DELETE
  TO authenticated
  USING (user_id = (select auth.uid()));

-- tool_usage_logs policies
DROP POLICY IF EXISTS "System can insert usage logs" ON public.tool_usage_logs;
CREATE POLICY "System can insert usage logs"
  ON public.tool_usage_logs
  FOR INSERT
  TO authenticated
  WITH CHECK ((select auth.uid()) IS NOT NULL);

DROP POLICY IF EXISTS "Users can view their own usage logs" ON public.tool_usage_logs;
CREATE POLICY "Users can view their own usage logs"
  ON public.tool_usage_logs
  FOR SELECT
  TO authenticated
  USING (user_id = (select auth.uid()));

-- blocked_users policies
DROP POLICY IF EXISTS "Users can view their own blocked status" ON public.blocked_users;
CREATE POLICY "Users can view their own blocked status"
  ON public.blocked_users
  FOR SELECT
  TO authenticated
  USING (user_id = (select auth.uid()));

-- =====================================================
-- 2. REMOVE UNUSED INDEXES
-- =====================================================

DROP INDEX IF EXISTS public.idx_bespoke_updates_user_id;
DROP INDEX IF EXISTS public.idx_notifications_message_id;
DROP INDEX IF EXISTS public.idx_notifications_room_id;
DROP INDEX IF EXISTS public.idx_suspicious_activity_user_id;
DROP INDEX IF EXISTS public.idx_suspicious_activity_created_at;
DROP INDEX IF EXISTS public.idx_suspicious_activity_severity;
DROP INDEX IF EXISTS public.idx_webhook_notifications_user_id;
DROP INDEX IF EXISTS public.idx_webhook_notifications_cooldown;
DROP INDEX IF EXISTS public.idx_webhook_notifications_status;
DROP INDEX IF EXISTS public.idx_tool_usage_user_time;
DROP INDEX IF EXISTS public.idx_blocked_users_lookup;
DROP INDEX IF EXISTS public.idx_webhook_call_logs_type;
DROP INDEX IF EXISTS public.idx_webhook_call_logs_user;

-- =====================================================
-- 3. REMOVE DUPLICATE POLICIES
-- =====================================================

-- asset_daily_analysis
DROP POLICY IF EXISTS "Authenticated users can read asset daily analysis" ON public.asset_daily_analysis;

-- bespoke_updates
DROP POLICY IF EXISTS "Users can delete own updates" ON public.bespoke_updates;
DROP POLICY IF EXISTS "Users can insert own bespoke updates" ON public.bespoke_updates;
DROP POLICY IF EXISTS "Users can read own bespoke updates" ON public.bespoke_updates;

-- chatrooms
DROP POLICY IF EXISTS "Allow read chatrooms" ON public.chatrooms;

-- commodities_top_picks
DROP POLICY IF EXISTS "Anyone can view commodities top picks" ON public.commodities_top_picks;

-- crypto_top_picks
DROP POLICY IF EXISTS "Anyone can view crypto top picks" ON public.crypto_top_picks;

-- custom_projects
DROP POLICY IF EXISTS "Users can delete own projects" ON public.custom_projects;
DROP POLICY IF EXISTS "Users can insert own projects" ON public.custom_projects;
DROP POLICY IF EXISTS "Users can view own projects" ON public.custom_projects;

-- daily_insights
DROP POLICY IF EXISTS "Anyone can read daily insights" ON public.daily_insights;

-- event_forecasting_examples
DROP POLICY IF EXISTS "Anyone can view active examples" ON public.event_forecasting_examples;

-- event_forecasting_results
DROP POLICY IF EXISTS "Anyone can read event forecasting results" ON public.event_forecasting_results;

-- forex_top_picks
DROP POLICY IF EXISTS "Anyone can view forex top picks" ON public.forex_top_picks;

-- interest_rates_data
DROP POLICY IF EXISTS "Authenticated users can read interest rates data" ON public.interest_rates_data;

-- live_prices_watchlist
DROP POLICY IF EXISTS "Users can delete own live prices" ON public.live_prices_watchlist;
DROP POLICY IF EXISTS "Users can insert own live prices" ON public.live_prices_watchlist;
DROP POLICY IF EXISTS "Users can read own live prices" ON public.live_prices_watchlist;
DROP POLICY IF EXISTS "Users can update own live prices" ON public.live_prices_watchlist;

-- messages
DROP POLICY IF EXISTS "Authenticated users can insert own messages" ON public.messages;
DROP POLICY IF EXISTS "Authenticated users can read all messages" ON public.messages;

-- notifications
DROP POLICY IF EXISTS "Users can view own notifications" ON public.notifications;
DROP POLICY IF EXISTS "Users can update own notifications" ON public.notifications;

-- stocks_top_picks
DROP POLICY IF EXISTS "Anyone can view stocks top picks" ON public.stocks_top_picks;

-- top_stories
DROP POLICY IF EXISTS "Anyone can read top stories" ON public.top_stories;

-- user_watchlist
DROP POLICY IF EXISTS "Users can delete own watchlist items" ON public.user_watchlist;
DROP POLICY IF EXISTS "Users can insert own watchlist items" ON public.user_watchlist;
DROP POLICY IF EXISTS "Users can view own watchlist" ON public.user_watchlist;

-- zero_day_options_results
DROP POLICY IF EXISTS "Anyone can read zero day options results" ON public.zero_day_options_results;

-- =====================================================
-- 4. FIX FUNCTION SEARCH PATHS
-- =====================================================

ALTER FUNCTION public.user_has_premium_access(uuid) SET search_path = public, pg_temp;
ALTER FUNCTION public.current_user_is_premium() SET search_path = public, pg_temp;
ALTER FUNCTION public.get_tool_usage_stats(integer) SET search_path = public, pg_temp;
ALTER FUNCTION public.is_user_blocked(uuid) SET search_path = public, pg_temp;
ALTER FUNCTION public.check_rate_limit_and_log(uuid, text, text, text) SET search_path = public, pg_temp;
ALTER FUNCTION public.is_in_notification_cooldown(uuid, text) SET search_path = public, pg_temp;
ALTER FUNCTION public.detect_suspicious_patterns(uuid) SET search_path = public, pg_temp;
ALTER FUNCTION public.analyze_user_behavior_after_request() SET search_path = public, pg_temp;
ALTER FUNCTION public.check_user_for_suspicious_activity(uuid) SET search_path = public, pg_temp;
ALTER FUNCTION public.get_pending_webhook_count() SET search_path = public, pg_temp;
ALTER FUNCTION public.get_webhook_stats() SET search_path = public, pg_temp;
ALTER FUNCTION public.log_suspicious_activity(uuid, text, text, text, integer, text, jsonb) SET search_path = public, pg_temp;
ALTER FUNCTION public.verify_webhook_auth(text, text) SET search_path = public, pg_temp;
ALTER FUNCTION public.log_webhook_call(text, text, boolean, boolean, text, integer, integer, uuid) SET search_path = public, pg_temp;
ALTER FUNCTION public.check_ip_rate_limit(text, interval, integer) SET search_path = public, pg_temp;
ALTER FUNCTION public.get_webhook_security_stats(integer) SET search_path = public, pg_temp;
