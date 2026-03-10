/*
  # Create bespoke_updates table

  1. New Tables
    - `bespoke_updates`
      - `id` (uuid, primary key) - Unique identifier for each update request
      - `user_id` (uuid, foreign key) - References auth.users
      - `name` (text) - User's name
      - `email` (text) - Email for update delivery
      - `project_name` (text) - Name of the project
      - `project_rundown` (text) - Detailed description of the project
      - `website` (text, nullable) - Optional project website URL
      - `relevant_sources` (text, nullable) - Optional list of URLs or data sources
      - `focus_areas` (text[]) - Array of selected focus areas
      - `update_frequency` (text) - How often to receive updates
      - `number_of_sources` (integer) - Number of sources to monitor
      - `additional_notes` (text, nullable) - Optional additional information
      - `created_at` (timestamptz) - Timestamp of submission

  2. Security
    - Enable RLS on `bespoke_updates` table
    - Add policy for authenticated users to insert their own data
    - Add policy for authenticated users to read their own data
*/

CREATE TABLE IF NOT EXISTS bespoke_updates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  email text NOT NULL,
  project_name text NOT NULL,
  project_rundown text NOT NULL,
  website text,
  relevant_sources text,
  focus_areas text[] NOT NULL DEFAULT '{}',
  update_frequency text NOT NULL,
  number_of_sources integer NOT NULL,
  additional_notes text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE bespoke_updates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can insert own bespoke updates"
  ON bespoke_updates
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can read own bespoke updates"
  ON bespoke_updates
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);