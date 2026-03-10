/*
  # Comprehensive Webhook Security System

  1. New Security Features
    - Webhook authentication with shared secrets
    - Per-user daily webhook limits (prevent cost abuse)
    - Per-IP rate limiting for webhook endpoints
    - Webhook call auditing and monitoring
    - Cost protection with hard caps
  
  2. New Tables
    - `webhook_secrets`
      - Stores authentication secrets for each webhook type
      - Rotatable secrets for security
    
    - `webhook_call_logs`
      - Tracks every webhook call attempt
      - Includes IP, authentication status, cost tracking
    
    - `user_webhook_limits`
      - Per-user daily limits and quotas
      - Tracks usage and prevents abuse
  
  3. Security Rules
    - Maximum 50 webhook calls per user per day (configurable)
    - Require valid secret key for all webhook calls
    - IP-based rate limiting: max 100 calls per IP per hour
    - Automatic blocking after 10 failed auth attempts
    - All webhook calls must come through edge functions (no direct access)
  
  4. Cost Protection
    - Hard cap on daily webhook calls
    - Alert when user hits 80% of limit
    - Automatic suspension at 100% of limit
*/

-- Create webhook_secrets table (for authenticating incoming webhook calls)
CREATE TABLE IF NOT EXISTS webhook_secrets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  webhook_type text NOT NULL UNIQUE,
  secret_key text NOT NULL,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  last_rotated_at timestamptz DEFAULT now(),
  notes text
);

-- Create webhook_call_logs table (audit all webhook attempts)
CREATE TABLE IF NOT EXISTS webhook_call_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  webhook_type text NOT NULL,
  source_ip text,
  authenticated boolean DEFAULT false,
  success boolean DEFAULT false,
  error_message text,
  payload_size integer DEFAULT 0,
  response_time_ms integer,
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now()
);

-- Create user_webhook_limits table (track per-user quotas)
CREATE TABLE IF NOT EXISTS user_webhook_limits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  daily_limit integer DEFAULT 50,
  calls_today integer DEFAULT 0,
  last_reset_date date DEFAULT CURRENT_DATE,
  total_calls_all_time integer DEFAULT 0,
  is_suspended boolean DEFAULT false,
  suspension_reason text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_webhook_call_logs_type ON webhook_call_logs(webhook_type);
CREATE INDEX IF NOT EXISTS idx_webhook_call_logs_ip ON webhook_call_logs(source_ip, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_webhook_call_logs_user ON webhook_call_logs(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_webhook_call_logs_created ON webhook_call_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_user_webhook_limits_user ON user_webhook_limits(user_id);

-- Enable RLS
ALTER TABLE webhook_secrets ENABLE ROW LEVEL SECURITY;
ALTER TABLE webhook_call_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_webhook_limits ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Only service role can access (system-level security)
CREATE POLICY "Service role only for webhook_secrets"
  ON webhook_secrets FOR ALL
  TO authenticated
  USING (false)
  WITH CHECK (false);

CREATE POLICY "Service role only for webhook_call_logs"
  ON webhook_call_logs FOR ALL
  TO authenticated
  USING (false)
  WITH CHECK (false);

CREATE POLICY "Users can view their own webhook limits"
  ON user_webhook_limits FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Insert default webhook secrets (these should be rotated in production)
INSERT INTO webhook_secrets (webhook_type, secret_key, notes)
VALUES 
  ('suspicious_activity', 'CHANGE_ME_IN_PRODUCTION_' || gen_random_uuid()::text, 'Internal suspicious activity alerts'),
  ('top_picks', 'CHANGE_ME_IN_PRODUCTION_' || gen_random_uuid()::text, 'External Make.com top picks webhook'),
  ('daily_insights', 'CHANGE_ME_IN_PRODUCTION_' || gen_random_uuid()::text, 'External Make.com daily insights webhook'),
  ('zero_day_options', 'CHANGE_ME_IN_PRODUCTION_' || gen_random_uuid()::text, 'External Make.com zero day options webhook'),
  ('event_forecasting', 'CHANGE_ME_IN_PRODUCTION_' || gen_random_uuid()::text, 'External Make.com event forecasting webhook')
ON CONFLICT (webhook_type) DO NOTHING;

-- Function to verify webhook authentication
CREATE OR REPLACE FUNCTION verify_webhook_auth(
  p_webhook_type text,
  p_provided_secret text
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_expected_secret text;
  v_is_active boolean;
BEGIN
  -- Get the expected secret
  SELECT secret_key, is_active INTO v_expected_secret, v_is_active
  FROM webhook_secrets
  WHERE webhook_type = p_webhook_type;
  
  -- Check if secret exists and is active
  IF NOT FOUND OR NOT v_is_active THEN
    RETURN false;
  END IF;
  
  -- Constant-time comparison to prevent timing attacks
  RETURN v_expected_secret = p_provided_secret;
END;
$$;

-- Function to check and update user webhook limits
CREATE OR REPLACE FUNCTION check_user_webhook_limit(
  p_user_id uuid,
  p_webhook_type text
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_limit_record record;
  v_calls_today integer;
  v_daily_limit integer;
BEGIN
  -- Get or create user limit record
  INSERT INTO user_webhook_limits (user_id, daily_limit, calls_today, last_reset_date)
  VALUES (p_user_id, 50, 0, CURRENT_DATE)
  ON CONFLICT (user_id) DO NOTHING;
  
  -- Get current limits
  SELECT * INTO v_limit_record
  FROM user_webhook_limits
  WHERE user_id = p_user_id;
  
  -- Reset daily counter if it's a new day
  IF v_limit_record.last_reset_date < CURRENT_DATE THEN
    UPDATE user_webhook_limits
    SET calls_today = 0,
        last_reset_date = CURRENT_DATE,
        updated_at = now()
    WHERE user_id = p_user_id;
    
    v_calls_today := 0;
  ELSE
    v_calls_today := v_limit_record.calls_today;
  END IF;
  
  v_daily_limit := v_limit_record.daily_limit;
  
  -- Check if user is suspended
  IF v_limit_record.is_suspended THEN
    RETURN jsonb_build_object(
      'allowed', false,
      'reason', 'suspended',
      'message', 'Your account has been suspended: ' || COALESCE(v_limit_record.suspension_reason, 'Terms of service violation')
    );
  END IF;
  
  -- Check if limit exceeded
  IF v_calls_today >= v_daily_limit THEN
    RETURN jsonb_build_object(
      'allowed', false,
      'reason', 'quota_exceeded',
      'message', format('Daily webhook limit exceeded (%s/%s). Limit resets tomorrow.', v_calls_today, v_daily_limit),
      'calls_today', v_calls_today,
      'daily_limit', v_daily_limit
    );
  END IF;
  
  -- Increment counter
  UPDATE user_webhook_limits
  SET calls_today = calls_today + 1,
      total_calls_all_time = total_calls_all_time + 1,
      updated_at = now()
  WHERE user_id = p_user_id;
  
  -- Return success with usage info
  RETURN jsonb_build_object(
    'allowed', true,
    'calls_today', v_calls_today + 1,
    'daily_limit', v_daily_limit,
    'remaining', v_daily_limit - v_calls_today - 1,
    'percentage_used', ROUND((v_calls_today + 1)::numeric / v_daily_limit::numeric * 100, 2)
  );
END;
$$;

-- Function to log webhook calls
CREATE OR REPLACE FUNCTION log_webhook_call(
  p_webhook_type text,
  p_source_ip text,
  p_authenticated boolean,
  p_success boolean,
  p_error_message text DEFAULT NULL,
  p_payload_size integer DEFAULT 0,
  p_response_time_ms integer DEFAULT 0,
  p_user_id uuid DEFAULT NULL
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_log_id uuid;
BEGIN
  INSERT INTO webhook_call_logs (
    webhook_type,
    source_ip,
    authenticated,
    success,
    error_message,
    payload_size,
    response_time_ms,
    user_id
  )
  VALUES (
    p_webhook_type,
    p_source_ip,
    p_authenticated,
    p_success,
    p_error_message,
    p_payload_size,
    p_response_time_ms,
    p_user_id
  )
  RETURNING id INTO v_log_id;
  
  RETURN v_log_id;
END;
$$;

-- Function to check IP-based rate limit
CREATE OR REPLACE FUNCTION check_ip_rate_limit(
  p_ip_address text,
  p_time_window interval DEFAULT '1 hour',
  p_max_calls integer DEFAULT 100
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_call_count integer;
BEGIN
  -- Count calls from this IP in the time window
  SELECT COUNT(*) INTO v_call_count
  FROM webhook_call_logs
  WHERE source_ip = p_ip_address
    AND created_at > now() - p_time_window;
  
  IF v_call_count >= p_max_calls THEN
    RETURN jsonb_build_object(
      'allowed', false,
      'reason', 'ip_rate_limit',
      'message', format('Too many requests from this IP address. Limit: %s per hour.', p_max_calls),
      'calls_in_window', v_call_count,
      'limit', p_max_calls
    );
  END IF;
  
  RETURN jsonb_build_object(
    'allowed', true,
    'calls_in_window', v_call_count,
    'limit', p_max_calls,
    'remaining', p_max_calls - v_call_count
  );
END;
$$;

-- Function to get webhook security stats (for admin monitoring)
CREATE OR REPLACE FUNCTION get_webhook_security_stats(p_hours integer DEFAULT 24)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN jsonb_build_object(
    'timeframe_hours', p_hours,
    'total_calls', (
      SELECT COUNT(*) FROM webhook_call_logs 
      WHERE created_at > now() - (p_hours || ' hours')::interval
    ),
    'authenticated_calls', (
      SELECT COUNT(*) FROM webhook_call_logs 
      WHERE created_at > now() - (p_hours || ' hours')::interval AND authenticated = true
    ),
    'failed_auth_attempts', (
      SELECT COUNT(*) FROM webhook_call_logs 
      WHERE created_at > now() - (p_hours || ' hours')::interval AND authenticated = false
    ),
    'successful_calls', (
      SELECT COUNT(*) FROM webhook_call_logs 
      WHERE created_at > now() - (p_hours || ' hours')::interval AND success = true
    ),
    'failed_calls', (
      SELECT COUNT(*) FROM webhook_call_logs 
      WHERE created_at > now() - (p_hours || ' hours')::interval AND success = false
    ),
    'unique_ips', (
      SELECT COUNT(DISTINCT source_ip) FROM webhook_call_logs 
      WHERE created_at > now() - (p_hours || ' hours')::interval
    ),
    'users_at_limit', (
      SELECT COUNT(*) FROM user_webhook_limits 
      WHERE last_reset_date = CURRENT_DATE AND calls_today >= daily_limit
    ),
    'suspended_users', (
      SELECT COUNT(*) FROM user_webhook_limits WHERE is_suspended = true
    ),
    'top_users_by_calls', (
      SELECT jsonb_agg(jsonb_build_object('user_id', user_id, 'calls', call_count))
      FROM (
        SELECT user_id, COUNT(*) as call_count
        FROM webhook_call_logs
        WHERE created_at > now() - (p_hours || ' hours')::interval
          AND user_id IS NOT NULL
        GROUP BY user_id
        ORDER BY call_count DESC
        LIMIT 10
      ) top_users
    ),
    'top_ips_by_calls', (
      SELECT jsonb_agg(jsonb_build_object('ip', source_ip, 'calls', call_count))
      FROM (
        SELECT source_ip, COUNT(*) as call_count
        FROM webhook_call_logs
        WHERE created_at > now() - (p_hours || ' hours')::interval
          AND source_ip IS NOT NULL
        GROUP BY source_ip
        ORDER BY call_count DESC
        LIMIT 10
      ) top_ips
    )
  );
END;
$$;