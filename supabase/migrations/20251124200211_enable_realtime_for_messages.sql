/*
  # Enable Realtime for messages table

  1. Changes
    - Enable realtime replication for messages table
    - This allows real-time subscriptions to work for chat messages

  2. Notes
    - Required for chat messages to appear instantly in all connected clients
*/

-- Enable realtime for messages table
ALTER PUBLICATION supabase_realtime ADD TABLE messages;
