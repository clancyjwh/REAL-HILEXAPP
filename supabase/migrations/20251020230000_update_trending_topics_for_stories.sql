/*
  # Update Trending Topics Table for News Stories

  1. Changes
    - Drop old trending_topics table
    - Create new top_stories table with full story data
      - `id` (bigint, primary key, auto-increment)
      - `headline` (text, the story headline)
      - `description` (text, the story description)
      - `link` (text, the story URL)
      - `last_checked_at` (timestamptz, when stories were last updated)
      - `created_at` (timestamptz, when the record was created)

  2. Security
    - Enable RLS on `top_stories` table
    - Add policy for authenticated users to read stories
    - Service role can insert/update/delete via webhook
*/

DROP TABLE IF EXISTS trending_topics;

CREATE TABLE IF NOT EXISTS top_stories (
  id bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  headline text NOT NULL,
  description text NOT NULL,
  link text NOT NULL,
  last_checked_at timestamptz NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE top_stories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read top stories"
  ON top_stories
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Service role can insert top stories"
  ON top_stories
  FOR INSERT
  TO service_role
  WITH CHECK (true);

CREATE POLICY "Service role can delete top stories"
  ON top_stories
  FOR DELETE
  TO service_role
  USING (true);
