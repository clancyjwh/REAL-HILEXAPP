/*
  # Enable Authentication

  1. Security
    - Authentication is already enabled in Supabase by default
    - This migration ensures auth.users table is accessible
    - No additional tables needed as we use Supabase's built-in auth
*/

-- Ensure auth schema is accessible (it already is by default)
-- This is a placeholder migration to document auth setup