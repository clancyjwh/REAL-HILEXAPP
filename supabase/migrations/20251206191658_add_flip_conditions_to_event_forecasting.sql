/*
  # Add flip conditions to event forecasting results

  1. Changes
    - Add `flip_conditions` column to `event_forecasting_results` table
      - Type: jsonb to store array of condition strings
      - Nullable to support existing records
  
  2. Notes
    - This field stores conditions that could change the event outcome
    - Stored as jsonb for flexible querying and indexing
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'event_forecasting_results' AND column_name = 'flip_conditions'
  ) THEN
    ALTER TABLE event_forecasting_results ADD COLUMN flip_conditions jsonb;
  END IF;
END $$;