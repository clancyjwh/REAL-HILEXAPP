/*
  # Remove Per-User Webhook Limits (Webhooks are External)
  
  1. Changes
    - Drop user_webhook_limits table (webhooks are external, not user-triggered)
    - Drop related functions that check per-user webhook limits
    - Keep IP-based rate limiting for webhooks (prevents spam)
    - Keep webhook authentication (prevents unauthorized access)
    - Keep webhook_call_logs for audit trail
    
  2. What Remains for Webhook Security
    - IP-based rate limiting: 100 calls/hour per IP
    - Webhook secret authentication
    - Comprehensive audit logging via webhook_call_logs
    - Suspicious activity detection via webhook_call_logs
    
  3. Tool Rate Limiting (User-Facing)
    - tool_usage_logs tracks user tool usage
    - blocked_users enforces 24-hour bans
    - 10 requests per tool per hour
    - 20 total requests per hour across all tools
    - Applies to: Price forecasting, event forecasting, interest rates, etc.
    
  4. Watchlist Rate Limiting
    - Same tool rate limiting applies to watchlist operations
    - Users get 10 watchlist adds/deletes per hour
    - 20 total operations per hour
*/

-- Drop the user webhook limits table (not needed for external webhooks)
DROP TABLE IF EXISTS user_webhook_limits CASCADE;

-- Drop related functions
DROP FUNCTION IF EXISTS check_user_webhook_limit(uuid, text);

-- Update the webhook security stats function to remove user webhook limit references
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
    ),
    'calls_by_webhook_type', (
      SELECT jsonb_object_agg(webhook_type, call_count)
      FROM (
        SELECT webhook_type, COUNT(*) as call_count
        FROM webhook_call_logs
        WHERE created_at > now() - (p_hours || ' hours')::interval
        GROUP BY webhook_type
      ) by_type
    )
  );
END;
$$;

-- Add helper function to get tool usage stats
CREATE OR REPLACE FUNCTION get_tool_usage_stats(p_hours integer DEFAULT 24)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN jsonb_build_object(
    'timeframe_hours', p_hours,
    'total_tool_requests', (
      SELECT COUNT(*) FROM tool_usage_logs 
      WHERE created_at > now() - (p_hours || ' hours')::interval
    ),
    'unique_users', (
      SELECT COUNT(DISTINCT user_id) FROM tool_usage_logs 
      WHERE created_at > now() - (p_hours || ' hours')::interval
    ),
    'currently_blocked', (
      SELECT COUNT(*) FROM blocked_users WHERE blocked_until > now()
    ),
    'most_used_tools', (
      SELECT jsonb_agg(jsonb_build_object('tool', tool_name, 'requests', request_count))
      FROM (
        SELECT tool_name, COUNT(*) as request_count
        FROM tool_usage_logs
        WHERE created_at > now() - (p_hours || ' hours')::interval
        GROUP BY tool_name
        ORDER BY request_count DESC
        LIMIT 10
      ) top_tools
    ),
    'top_users_by_requests', (
      SELECT jsonb_agg(jsonb_build_object('user_id', user_id, 'requests', request_count))
      FROM (
        SELECT user_id, COUNT(*) as request_count
        FROM tool_usage_logs
        WHERE created_at > now() - (p_hours || ' hours')::interval
        GROUP BY user_id
        ORDER BY request_count DESC
        LIMIT 10
      ) top_users
    )
  );
END;
$$;

-- Comment documenting the rate limit strategy
COMMENT ON TABLE tool_usage_logs IS 'Tracks user-facing tool usage (price forecasting, event forecasting, interest rates, watchlist operations, etc.). Rate limits: 10 per tool per hour, 20 total per hour.';
COMMENT ON TABLE blocked_users IS 'Users blocked for 24 hours due to rate limit violations on user-facing tools.';
COMMENT ON TABLE webhook_call_logs IS 'Audit log for external webhook calls from Make.com and other services. IP-based rate limiting only (100/hour per IP).';
COMMENT ON TABLE webhook_secrets IS 'Authentication secrets for external webhook endpoints. Required for all webhook calls.';