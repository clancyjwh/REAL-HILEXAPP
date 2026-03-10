/*
  # Add User Information to Analytics Tables

  1. Changes to `analytics_page_views`
    - Add `user_email` column to store user's email
    - Add `user_name` column to store user's display name or full name
  
  2. Changes to `analytics_events`
    - Add `user_email` column to store user's email
    - Add `user_name` column to store user's display name or full name
  
  3. Data Backfill
    - Update existing rows to populate the new columns from profiles table
*/

-- Add columns to analytics_page_views
ALTER TABLE analytics_page_views 
ADD COLUMN IF NOT EXISTS user_email text,
ADD COLUMN IF NOT EXISTS user_name text;

-- Add columns to analytics_events
ALTER TABLE analytics_events 
ADD COLUMN IF NOT EXISTS user_email text,
ADD COLUMN IF NOT EXISTS user_name text;

-- Backfill existing data in analytics_page_views
UPDATE analytics_page_views apv
SET 
  user_email = p.email,
  user_name = COALESCE(p.display_name, p.full_name)
FROM profiles p
WHERE apv.user_id = p.id
  AND apv.user_email IS NULL;

-- Backfill existing data in analytics_events
UPDATE analytics_events ae
SET 
  user_email = p.email,
  user_name = COALESCE(p.display_name, p.full_name)
FROM profiles p
WHERE ae.user_id = p.id
  AND ae.user_email IS NULL;

-- Add indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_analytics_page_views_user_email 
  ON analytics_page_views(user_email);

CREATE INDEX IF NOT EXISTS idx_analytics_events_user_email 
  ON analytics_events(user_email);
