/*
  # Create Profiles Table for User Management

  1. New Tables
    - `profiles`
      - `id` (uuid, primary key, references auth.users)
      - `email` (text)
      - `first_name` (text) - User's first name
      - `last_name` (text) - User's last name
      - `business_name` (text) - User's business name
      - `subscription_status` (text, default 'free') - Current subscription tier
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
  
  2. Security
    - Enable RLS on `profiles` table
    - Add policy for users to read their own profile
    - Add policy for users to insert their own profile (needed for signup)
    - Add policy for users to update their own profile

  3. Trigger Function
    - Create trigger function to automatically create profile on user signup
    - Extracts user metadata from auth.users.raw_user_meta_data
    - Sets default subscription_status to 'free'
    - Ensures every new user has a corresponding profile record

  4. Important Notes
    - This replaces any existing profiles table structure
    - Uses subscription_status instead of tier for consistency
    - Profiles are automatically created via database trigger
    - All existing users in auth.users will need profile records created
*/

-- Drop existing profiles table if it exists (fresh start for new instance)
DROP TABLE IF EXISTS profiles CASCADE;

-- Create profiles table with updated schema
CREATE TABLE profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text,
  first_name text,
  last_name text,
  business_name text,
  subscription_status text DEFAULT 'free' NOT NULL CHECK (subscription_status IN ('free', 'active', 'canceled', 'past_due')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Policy: Users can read their own profile
CREATE POLICY "Users can read own profile"
  ON profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

-- Policy: Users can insert their own profile (needed during signup)
CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Policy: Users can update their own profile
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Create trigger function to automatically create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, first_name, last_name, business_name, subscription_status)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'first_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'last_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'business_name', ''),
    'free'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to call the function on user creation
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS profiles_email_idx ON profiles(email);
CREATE INDEX IF NOT EXISTS profiles_subscription_status_idx ON profiles(subscription_status);