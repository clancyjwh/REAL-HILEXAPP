/*
  # Create custom_projects table for Bespoke Projects feature

  1. New Tables
    - `custom_projects`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to auth.users)
      - `name` (text)
      - `email` (text)
      - `company` (text, optional)
      - `industry_sector` (text)
      - `project_focus` (text)
      - `data_type` (text)
      - `goal` (text)
      - `additional_notes` (text, optional)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on `custom_projects` table
    - Add policy for authenticated users to insert their own projects
    - Add policy for authenticated users to read their own projects
*/

CREATE TABLE IF NOT EXISTS custom_projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  email text NOT NULL,
  company text,
  industry_sector text NOT NULL,
  project_focus text NOT NULL,
  data_type text NOT NULL,
  goal text NOT NULL,
  additional_notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE custom_projects ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can insert own projects"
  ON custom_projects
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own projects"
  ON custom_projects
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_custom_projects_user_id ON custom_projects(user_id);
CREATE INDEX IF NOT EXISTS idx_custom_projects_created_at ON custom_projects(created_at DESC);