/*
  # Delete all users from auth.users table

  This migration removes all existing users from the authentication system
  to provide a completely fresh start with zero cached authentication data.

  IMPORTANT: This is a one-time cleanup migration for resetting the auth system.
*/

-- Delete all users from auth.users
-- This will cascade delete to profiles table due to foreign key constraint
DELETE FROM auth.users;