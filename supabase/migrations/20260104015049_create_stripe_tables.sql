/*
  # Create Stripe Integration Tables

  1. New Tables
    - `stripe_customers`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to auth.users)
      - `customer_id` (text, Stripe customer ID, unique)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
    
    - `stripe_subscriptions`
      - `id` (uuid, primary key)
      - `customer_id` (text, Stripe customer ID)
      - `subscription_id` (text, Stripe subscription ID, unique)
      - `status` (text, subscription status)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on both tables
    - Only service role can access these tables (no public access)
    - These tables are managed exclusively by the Stripe webhook
*/

-- Create stripe_customers table
CREATE TABLE IF NOT EXISTS stripe_customers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  customer_id text NOT NULL UNIQUE,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create stripe_subscriptions table
CREATE TABLE IF NOT EXISTS stripe_subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id text NOT NULL UNIQUE,
  subscription_id text NOT NULL UNIQUE,
  status text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS stripe_customers_user_id_idx ON stripe_customers(user_id);
CREATE INDEX IF NOT EXISTS stripe_customers_customer_id_idx ON stripe_customers(customer_id);
CREATE INDEX IF NOT EXISTS stripe_subscriptions_customer_id_idx ON stripe_subscriptions(customer_id);
CREATE INDEX IF NOT EXISTS stripe_subscriptions_subscription_id_idx ON stripe_subscriptions(subscription_id);

-- Enable RLS
ALTER TABLE stripe_customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE stripe_subscriptions ENABLE ROW LEVEL SECURITY;

-- No policies needed - only service role (webhook) can access these tables
-- This ensures users cannot manipulate their subscription status