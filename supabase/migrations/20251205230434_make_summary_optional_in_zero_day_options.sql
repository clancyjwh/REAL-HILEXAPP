/*
  # Make Summary Field Optional

  1. Changes
    - Allow NULL values for summary field in zero_day_options_results table
*/

ALTER TABLE zero_day_options_results 
ALTER COLUMN summary DROP NOT NULL;