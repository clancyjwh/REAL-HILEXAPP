/*
  # Create Trending Topics Table

  1. New Tables
    - `trending_topics`
      - `id` (bigint, primary key, auto-increment)
      - `topic` (text, the trending topic text)
      - `created_at` (timestamptz, when the topic was added)

  2. Security
    - Enable RLS on `trending_topics` table
    - Add policy for authenticated users to read topics
    - Service role can insert/update/delete via webhook
*/

CREATE TABLE IF NOT EXISTS trending_topics (
  id bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  topic text NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE trending_topics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read trending topics"
  ON trending_topics
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Service role can insert trending topics"
  ON trending_topics
  FOR INSERT
  TO service_role
  WITH CHECK (true);

CREATE POLICY "Service role can delete trending topics"
  ON trending_topics
  FOR DELETE
  TO service_role
  USING (true);
