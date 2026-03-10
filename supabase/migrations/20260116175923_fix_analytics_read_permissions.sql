/*
  # Fix Analytics Read Permissions

  1. Changes
    - Update RLS policies to allow authenticated users to read analytics data
    - Remove overly restrictive policies that blocked all reads
    - Add new policies that allow all authenticated users to view analytics

  2. Security
    - Maintains insert permissions for everyone (for tracking)
    - Allows authenticated users to read analytics data
    - Data remains protected from unauthenticated access for reading
*/

-- Drop the old restrictive policies
DROP POLICY IF EXISTS "Only service role can read page views" ON analytics_page_views;
DROP POLICY IF EXISTS "Only service role can read events" ON analytics_events;

-- Create new policies that allow authenticated users to read analytics
CREATE POLICY "Authenticated users can read page views"
  ON analytics_page_views
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can read events"
  ON analytics_events
  FOR SELECT
  TO authenticated
  USING (true);