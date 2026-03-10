/*
  # Add Payment Method to Stripe Customers

  1. Changes
    - Add `payment_method_id` column to `stripe_customers` table
    - This column stores the Stripe payment method ID for future billing
    - Column is optional (null) for existing customers without payment methods

  2. Security
    - Maintains existing RLS policies (service role only access)
    - No user-facing access to this sensitive data
*/

-- Add payment_method_id column to stripe_customers
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'stripe_customers' AND column_name = 'payment_method_id'
  ) THEN
    ALTER TABLE stripe_customers ADD COLUMN payment_method_id text;
  END IF;
END $$;

-- Create index for payment method lookups
CREATE INDEX IF NOT EXISTS stripe_customers_payment_method_id_idx ON stripe_customers(payment_method_id);