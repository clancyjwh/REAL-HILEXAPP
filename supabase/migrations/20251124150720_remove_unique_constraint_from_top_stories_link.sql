/*
  # Remove Unique Constraint from top_stories Link Column

  1. Changes
    - Drop the unique constraint on the `link` column in `top_stories` table
    - This allows the same story link to be reinserted when updating the news feed

  2. Notes
    - The webhook deletes all existing stories before inserting new ones
    - No duplicate links will exist at any given time due to the delete operation
*/

ALTER TABLE top_stories DROP CONSTRAINT IF EXISTS top_stories_link_key;
