/*
  # Create Notifications System

  1. New Tables
    - `notifications`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to auth.users)
      - `message_id` (uuid, foreign key to messages)
      - `room_id` (uuid, foreign key to chatrooms)
      - `room_name` (text) - cached for display
      - `message_text` (text) - cached for preview
      - `is_read` (boolean) - default false
      - `created_at` (timestamptz)

  2. Changes to Existing Tables
    - Add `notifications_enabled` column to profiles table (default true)

  3. Security
    - Enable RLS on notifications table
    - Add policy for users to read their own notifications
    - Add policy for users to update their own notifications (mark as read)

  4. Triggers
    - Auto-create notifications when Hilex Bot posts messages
*/

-- Create notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  message_id uuid REFERENCES messages(id) ON DELETE CASCADE NOT NULL,
  room_id uuid REFERENCES chatrooms(id) ON DELETE CASCADE NOT NULL,
  room_name text NOT NULL,
  message_text text NOT NULL,
  is_read boolean DEFAULT false NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL
);

-- Add index for faster queries
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_read ON notifications(user_id, is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at DESC);

-- Enable RLS
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own notifications"
  ON notifications FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own notifications"
  ON notifications FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Add notifications_enabled to profiles
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'notifications_enabled'
  ) THEN
    ALTER TABLE profiles ADD COLUMN notifications_enabled boolean DEFAULT true NOT NULL;
  END IF;
END $$;

-- Function to create notifications for Hilex Bot messages
CREATE OR REPLACE FUNCTION create_hylex_bot_notification()
RETURNS TRIGGER AS $$
DECLARE
  hylex_bot_id uuid := '090f181b-66ef-4831-9641-a1d2e8621c31';
  chatroom_name text;
BEGIN
  -- Only create notifications if the message is from Hilex Bot
  IF NEW.user_id = hylex_bot_id THEN
    -- Get the chatroom name
    SELECT name INTO chatroom_name
    FROM chatrooms
    WHERE id = NEW.room_id;

    -- Create notification for all users with notifications enabled
    INSERT INTO notifications (user_id, message_id, room_id, room_name, message_text, is_read)
    SELECT 
      p.id,
      NEW.id,
      NEW.room_id,
      chatroom_name,
      NEW.message_text,
      false
    FROM profiles p
    WHERE p.id != hylex_bot_id; -- Don't notify the bot itself
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger
DROP TRIGGER IF EXISTS trigger_create_hylex_bot_notification ON messages;
CREATE TRIGGER trigger_create_hylex_bot_notification
  AFTER INSERT ON messages
  FOR EACH ROW
  EXECUTE FUNCTION create_hylex_bot_notification();