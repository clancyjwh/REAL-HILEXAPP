/*
  # Add fields to notifications table for daily insights
  
  1. Changes
    - Add `type` column (text) - Type of notification (chatroom_message, daily_insights, etc.)
    - Add `title` column (text) - Title for the notification
    - Add `message` column (text) - Message content
    - Add `link` column (text) - Link to navigate to
    - Make existing columns nullable to support different notification types
  
  2. Notes
    - Existing chatroom notifications will have type 'chatroom_message'
    - Daily insights will have type 'daily_insights'
    - user_id can be null for broadcast notifications (all users)
*/

ALTER TABLE notifications ADD COLUMN IF NOT EXISTS type text DEFAULT 'chatroom_message';
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS title text;
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS message text;
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS link text;

ALTER TABLE notifications ALTER COLUMN user_id DROP NOT NULL;
ALTER TABLE notifications ALTER COLUMN message_id DROP NOT NULL;
ALTER TABLE notifications ALTER COLUMN room_id DROP NOT NULL;
ALTER TABLE notifications ALTER COLUMN room_name DROP NOT NULL;
ALTER TABLE notifications ALTER COLUMN message_text DROP NOT NULL;
