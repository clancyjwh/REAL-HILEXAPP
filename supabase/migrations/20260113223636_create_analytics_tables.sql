/*
  # Create Analytics Tables

  1. New Tables
    - `analytics_page_views`
      - `id` (uuid, primary key)
      - `user_id` (uuid, nullable) - Links to auth.users
      - `session_id` (text) - Tracks anonymous sessions
      - `page_path` (text) - URL path visited
      - `page_title` (text, nullable) - Page title
      - `referrer` (text, nullable) - Referring page
      - `user_agent` (text, nullable) - Browser info
      - `created_at` (timestamptz) - Visit timestamp
    
    - `analytics_events`
      - `id` (uuid, primary key)
      - `user_id` (uuid, nullable) - Links to auth.users
      - `session_id` (text) - Tracks anonymous sessions
      - `event_name` (text) - Event type (e.g., 'button_click', 'search')
      - `event_data` (jsonb, nullable) - Additional event metadata
      - `page_path` (text) - Where the event occurred
      - `created_at` (timestamptz) - Event timestamp

  2. Indexes
    - Index on user_id for fast user queries
    - Index on session_id for session tracking
    - Index on created_at for time-based queries
    - Index on event_name for event filtering

  3. Security
    - Enable RLS on both tables
    - Allow authenticated service role to insert/read
    - Allow authenticated users to insert their own events
    - Public can insert anonymous events
*/

-- Create analytics_page_views table
CREATE TABLE IF NOT EXISTS analytics_page_views (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  session_id text NOT NULL,
  page_path text NOT NULL,
  page_title text,
  referrer text,
  user_agent text,
  created_at timestamptz DEFAULT now()
);

-- Create analytics_events table
CREATE TABLE IF NOT EXISTS analytics_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  session_id text NOT NULL,
  event_name text NOT NULL,
  event_data jsonb,
  page_path text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_page_views_user_id ON analytics_page_views(user_id);
CREATE INDEX IF NOT EXISTS idx_page_views_session_id ON analytics_page_views(session_id);
CREATE INDEX IF NOT EXISTS idx_page_views_created_at ON analytics_page_views(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_page_views_page_path ON analytics_page_views(page_path);

CREATE INDEX IF NOT EXISTS idx_events_user_id ON analytics_events(user_id);
CREATE INDEX IF NOT EXISTS idx_events_session_id ON analytics_events(session_id);
CREATE INDEX IF NOT EXISTS idx_events_created_at ON analytics_events(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_events_event_name ON analytics_events(event_name);
CREATE INDEX IF NOT EXISTS idx_events_page_path ON analytics_events(page_path);

-- Enable RLS
ALTER TABLE analytics_page_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;

-- Allow anyone to insert analytics data (both authenticated and anonymous)
CREATE POLICY "Anyone can insert page views"
  ON analytics_page_views
  FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Anyone can insert events"
  ON analytics_events
  FOR INSERT
  TO public
  WITH CHECK (true);

-- Only authenticated users with proper permissions can read analytics
-- For now, we'll create a policy that allows no regular user access
-- You can later add specific admin role checking
CREATE POLICY "Only service role can read page views"
  ON analytics_page_views
  FOR SELECT
  TO authenticated
  USING (false);

CREATE POLICY "Only service role can read events"
  ON analytics_events
  FOR SELECT
  TO authenticated
  USING (false);