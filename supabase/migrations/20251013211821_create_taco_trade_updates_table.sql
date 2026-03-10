/*
  # Create Taco Trade Updates Table

  1. New Tables
    - `taco_trade_updates`
      - `id` (uuid, primary key)
      - `update_text` (text) - The content of the update
      - `created_at` (timestamptz) - Timestamp when the update was created
      - `updated_at` (timestamptz) - Timestamp when the update was last modified
  
  2. Security
    - Enable RLS on `taco_trade_updates` table
    - Add policy for public read access (anyone can view updates)
    - Add policy for authenticated insert access (for adding new updates via webhook/admin)
*/

CREATE TABLE IF NOT EXISTS taco_trade_updates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  update_text text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE taco_trade_updates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read taco trade updates"
  ON taco_trade_updates
  FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can insert taco trade updates"
  ON taco_trade_updates
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update taco trade updates"
  ON taco_trade_updates
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);
