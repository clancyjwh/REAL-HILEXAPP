/*
  # Add Bespoke Updates columns to custom_projects

  This migration adds optional Bespoke Updates fields to the custom_projects table,
  allowing users to add Bespoke Updates as an optional add-on to their projects.

  1. Changes
    - Add `website` column (text, optional) for company website
    - Add `relevant_sources` column (text, optional) for monitoring URLs/sources
    - Add `focus_areas` column (text array, optional) for update focus areas
    - Add `update_frequency` column (text, optional) for delivery frequency
    - Add `number_of_sources` column (integer, optional) for source count
    - Add `updates_additional_notes` column (text, optional) for extra notes
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'custom_projects' AND column_name = 'website'
  ) THEN
    ALTER TABLE custom_projects ADD COLUMN website text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'custom_projects' AND column_name = 'relevant_sources'
  ) THEN
    ALTER TABLE custom_projects ADD COLUMN relevant_sources text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'custom_projects' AND column_name = 'focus_areas'
  ) THEN
    ALTER TABLE custom_projects ADD COLUMN focus_areas text[];
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'custom_projects' AND column_name = 'update_frequency'
  ) THEN
    ALTER TABLE custom_projects ADD COLUMN update_frequency text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'custom_projects' AND column_name = 'number_of_sources'
  ) THEN
    ALTER TABLE custom_projects ADD COLUMN number_of_sources integer;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'custom_projects' AND column_name = 'updates_additional_notes'
  ) THEN
    ALTER TABLE custom_projects ADD COLUMN updates_additional_notes text;
  END IF;
END $$;
