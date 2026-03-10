/*
  # Create Correlation Index Webhooks Table

  1. New Tables
    - `correlation_webhooks`
      - `id` (uuid, primary key)
      - `data` (jsonb) - stores the complete webhook JSON payload
      - `created_at` (timestamptz) - when the webhook was received
      - `updated_at` (timestamptz) - when the webhook was last updated
  
  2. Security
    - Enable RLS on `correlation_webhooks` table
    - Add policy for authenticated users to read all webhook data
    - Add policy for service role to insert webhook data (for edge function)

  3. Notes
    - All webhook data is stored as JSONB for flexibility
    - Indexes added for efficient querying by timestamp
*/

CREATE TABLE IF NOT EXISTS correlation_webhooks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  data jsonb NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE correlation_webhooks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read all correlation webhooks"
  ON correlation_webhooks
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Service role can insert correlation webhooks"
  ON correlation_webhooks
  FOR INSERT
  TO service_role
  WITH CHECK (true);

CREATE INDEX IF NOT EXISTS idx_correlation_webhooks_created_at 
  ON correlation_webhooks(created_at DESC);