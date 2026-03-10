/*
  # Rate Limiting and Security System

  1. New Tables
    - `tool_usage_logs`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `tool_name` (text) - name of the tool being used
      - `created_at` (timestamptz) - when the request was made
      - `ip_address` (text) - optional IP tracking
      - `user_agent` (text) - optional user agent tracking
    
    - `blocked_users`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `reason` (text) - why they were blocked
      - `blocked_until` (timestamptz) - when the block expires
      - `blocked_at` (timestamptz) - when they were blocked
      - `tool_name` (text) - which tool triggered the block
      - `request_count` (integer) - how many requests triggered the block

  2. Security
    - Enable RLS on both tables
    - Users can view their own usage logs
    - Users can view their own blocked status
    - Only system can insert/update blocked users
    
  3. Rate Limits
    - 10 requests per hour per tool (normal usage)
    - 20 requests per hour across all tools (suspicious)
    - 24 hour ban for violations
*/

-- Create tool_usage_logs table
CREATE TABLE IF NOT EXISTS tool_usage_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  tool_name text NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL,
  ip_address text,
  user_agent text
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_tool_usage_user_time ON tool_usage_logs(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_tool_usage_tool_time ON tool_usage_logs(user_id, tool_name, created_at DESC);

-- Create blocked_users table
CREATE TABLE IF NOT EXISTS blocked_users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  reason text NOT NULL,
  blocked_until timestamptz NOT NULL,
  blocked_at timestamptz DEFAULT now() NOT NULL,
  tool_name text,
  request_count integer DEFAULT 0,
  UNIQUE(user_id)
);

-- Create index for checking active blocks
CREATE INDEX IF NOT EXISTS idx_blocked_users_lookup ON blocked_users(user_id, blocked_until);

-- Enable RLS
ALTER TABLE tool_usage_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE blocked_users ENABLE ROW LEVEL SECURITY;

-- RLS Policies for tool_usage_logs
CREATE POLICY "Users can view their own usage logs"
  ON tool_usage_logs FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "System can insert usage logs"
  ON tool_usage_logs FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- RLS Policies for blocked_users
CREATE POLICY "Users can view their own blocked status"
  ON blocked_users FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Function to check if user is blocked
CREATE OR REPLACE FUNCTION is_user_blocked(check_user_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM blocked_users
    WHERE user_id = check_user_id
    AND blocked_until > now()
  );
END;
$$;

-- Function to check rate limit and log usage
CREATE OR REPLACE FUNCTION check_rate_limit_and_log(
  check_user_id uuid,
  check_tool_name text,
  check_ip_address text DEFAULT NULL,
  check_user_agent text DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  tool_count integer;
  total_count integer;
  is_blocked boolean;
  block_record record;
BEGIN
  -- Check if user is currently blocked
  SELECT * INTO block_record
  FROM blocked_users
  WHERE user_id = check_user_id
  AND blocked_until > now()
  LIMIT 1;
  
  IF FOUND THEN
    RETURN jsonb_build_object(
      'allowed', false,
      'blocked', true,
      'reason', block_record.reason,
      'blocked_until', block_record.blocked_until,
      'message', 'You have been temporarily blocked due to suspicious activity. Access will be restored at ' || block_record.blocked_until::text
    );
  END IF;
  
  -- Count requests in last hour for this specific tool
  SELECT COUNT(*) INTO tool_count
  FROM tool_usage_logs
  WHERE user_id = check_user_id
  AND tool_name = check_tool_name
  AND created_at > now() - interval '1 hour';
  
  -- Count total requests in last hour across all tools
  SELECT COUNT(*) INTO total_count
  FROM tool_usage_logs
  WHERE user_id = check_user_id
  AND created_at > now() - interval '1 hour';
  
  -- Check if limits exceeded
  IF tool_count >= 10 THEN
    -- Block user for 24 hours
    INSERT INTO blocked_users (user_id, reason, blocked_until, tool_name, request_count)
    VALUES (
      check_user_id,
      'Exceeded rate limit: ' || tool_count || ' requests to ' || check_tool_name || ' in 1 hour',
      now() + interval '24 hours',
      check_tool_name,
      tool_count
    )
    ON CONFLICT (user_id) DO UPDATE
    SET reason = EXCLUDED.reason,
        blocked_until = EXCLUDED.blocked_until,
        blocked_at = now(),
        tool_name = EXCLUDED.tool_name,
        request_count = EXCLUDED.request_count;
    
    RETURN jsonb_build_object(
      'allowed', false,
      'blocked', true,
      'reason', 'Rate limit exceeded',
      'message', 'You have made too many requests to this tool. Please try again in 24 hours.',
      'tool_count', tool_count,
      'limit', 10
    );
  END IF;
  
  IF total_count >= 20 THEN
    -- Block user for 24 hours
    INSERT INTO blocked_users (user_id, reason, blocked_until, tool_name, request_count)
    VALUES (
      check_user_id,
      'Suspicious activity: ' || total_count || ' total requests in 1 hour',
      now() + interval '24 hours',
      'all_tools',
      total_count
    )
    ON CONFLICT (user_id) DO UPDATE
    SET reason = EXCLUDED.reason,
        blocked_until = EXCLUDED.blocked_until,
        blocked_at = now(),
        tool_name = EXCLUDED.tool_name,
        request_count = EXCLUDED.request_count;
    
    RETURN jsonb_build_object(
      'allowed', false,
      'blocked', true,
      'reason', 'Suspicious activity detected',
      'message', 'Suspicious activity has been detected on your account. Access has been restricted for 24 hours.',
      'total_count', total_count,
      'limit', 20
    );
  END IF;
  
  -- Log the usage
  INSERT INTO tool_usage_logs (user_id, tool_name, ip_address, user_agent)
  VALUES (check_user_id, check_tool_name, check_ip_address, check_user_agent);
  
  -- Return success
  RETURN jsonb_build_object(
    'allowed', true,
    'blocked', false,
    'tool_count', tool_count + 1,
    'tool_limit', 10,
    'total_count', total_count + 1,
    'total_limit', 20,
    'message', 'Request allowed'
  );
END;
$$;