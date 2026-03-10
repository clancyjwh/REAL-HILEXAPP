# Security & Cost Protection Guide

## Overview

This application implements comprehensive security measures to protect against unauthorized access, abuse, and cost overruns.

---

## 🔐 Security Features Implemented

### 1. **Webhook Authentication (External Webhooks from Make.com)**
- All external webhooks require a shared secret key
- Secrets stored in `webhook_secrets` table
- Easy secret rotation without code changes
- Header: `X-Webhook-Secret: your_secret_key`
- **Purpose**: Prevents unauthorized external services from calling your webhooks

### 2. **IP-Based Rate Limiting (Webhook Protection)**
- **Limit**: 100 webhook requests per IP per hour
- Automatic blocking of excessive requests
- Audit logging of all webhook attempts
- Protection against DDoS and spam from external sources
- **Purpose**: Protects Make.com credits from being drained by webhook spam

### 3. **Tool Rate Limiting (User-Facing Tools)**
- **Per-Tool Limit**: 10 requests per tool per hour
- **Total Limit**: 20 requests across all tools per hour
- **Penalty**: 24-hour automatic ban for violations
- **Applies to**:
  - Price Forecasting Tool
  - Event Forecasting Tool
  - Interest Rates Tool
  - Zero Day Options Tool
  - Watchlist Add/Remove operations
  - Any other user-triggered tool
- **Purpose**: Prevents users from abusing premium tools and running up costs

### 4. **Suspicious Activity Detection**
- Automatic monitoring of user behavior patterns
- Detection rules:
  - 5+ requests in 10 seconds = MEDIUM severity
  - 15+ requests in 1 minute = HIGH severity
  - 30+ requests in 5 minutes = MEDIUM severity
  - Same tool 10+ times in 30 seconds = HIGH severity
- Automatic webhook notifications to Make.com

### 5. **RLS (Row Level Security) - Paywall Enforcement**
- **ALL tables have RLS enabled**
- Premium content requires paid tier (pro/premium/enterprise)
- Users can only access their own data
- No anonymous access to sensitive data
- Database-level enforcement (can't be bypassed via API)

### 6. **Comprehensive Audit Logging**
- **Webhook calls**: IP, authentication status, success/failure, payload size, response time
- **Tool usage**: User, tool name, timestamp, IP, user agent
- **Suspicious activity**: Full context with severity levels

---

## 💎 Paywall Enforcement

### Premium Content Tables (Require Paid Subscription):
- `crypto_top_picks`, `forex_top_picks`, `stocks_top_picks`, `commodities_top_picks`
- `daily_insights`
- `zero_day_options_results`
- `event_forecasting_results`
- `event_forecasting_examples`
- `asset_daily_analysis`
- `interest_rates_data`

### User-Specific Tables (Users can only access their own data):
- `user_watchlist`
- `live_prices_watchlist`
- `custom_projects`
- `bespoke_updates`
- `notifications`

### Free Access:
- `top_stories` (public news)
- `chatrooms` and `messages` (for authenticated users)

---

## 🚦 Rate Limiting Explained

### A. Tool Rate Limits (User-Facing)

**What**: User clicks a button to run a tool (price forecasting, event forecasting, etc.)

**Limits**:
- 10 requests per specific tool per hour
- 20 total requests across all tools per hour

**Penalty**: 24-hour automatic ban

**Example**:
- User runs price forecasting 10 times in 1 hour → Blocked for 24 hours
- User runs 5 different tools 4 times each (20 total) → Blocked for 24 hours

**Applies to**:
- Price Forecasting
- Event Forecasting
- Interest Rates Tool
- Zero Day Options
- Watchlist operations (add/remove)
- Any user-triggered premium tool

### B. Webhook Rate Limits (External Services)

**What**: External service (Make.com) calls your webhook endpoint

**Limits**:
- 100 requests per IP address per hour
- Requires valid webhook secret

**Penalty**: 429 Rate Limit response (not user-specific, IP-based)

**Example**:
- Make.com sends 100 webhook calls in 1 hour → Next call gets 429 error
- Different IP addresses each get their own 100/hour limit

**Applies to**:
- `top-picks-webhook`
- `daily-insights-webhook`
- `zero-day-options-webhook`
- `event-forecasting-webhook`
- All external webhooks

### Why This Distinction Matters

**Users** trigger tools intentionally → Need tight limits to prevent abuse
**External services** (Make.com) trigger webhooks automatically → Need looser limits but IP-based protection

---

## 📊 Monitoring Dashboard

### View Real-Time Security Stats:
```bash
node security_monitor.mjs
```

### View Webhook Secrets (Admin Only):
```bash
node security_monitor.mjs secrets
```

### Dashboard Shows:
- Webhook call statistics (24h)
  - Total calls, authentication status, success/failure
  - Unique IPs calling webhooks
  - Calls by webhook type
- Tool usage statistics (24h)
  - Total tool requests
  - Most used tools
  - Most active users
  - Currently blocked users
- Suspicious activity summary
- Currently blocked users
- Premium access statistics
- Security recommendations

---

## 🔑 Webhook Secret Management

### Current Webhook Types:
1. `suspicious_activity` - Internal alerts
2. `top_picks` - External Make.com webhook
3. `daily_insights` - External Make.com webhook
4. `zero_day_options` - External Make.com webhook
5. `event_forecasting` - External Make.com webhook

### View Secrets:

```bash
node security_monitor.mjs secrets
```

### Rotating Secrets:

```sql
-- View current secrets
SELECT webhook_type, secret_key, last_rotated_at
FROM webhook_secrets
WHERE is_active = true;

-- Rotate a secret
UPDATE webhook_secrets
SET secret_key = 'NEW_SECRET_HERE',
    last_rotated_at = now()
WHERE webhook_type = 'top_picks';
```

### Using Webhook Secrets in Make.com:

In your Make.com scenario, add a custom header to the HTTP module:

```
Header Name: X-Webhook-Secret
Header Value: your_secret_key_here
```

Example curl (for testing):
```bash
curl -X POST https://your-project.supabase.co/functions/v1/top-picks-webhook \
  -H "Content-Type: application/json" \
  -H "X-Webhook-Secret: YOUR_SECRET_KEY" \
  -d '{"symbol": "AAPL", "name": "Apple Inc."}'
```

---

## 🛡️ Protection Against Common Attacks

### 1. **Webhook Spam (Cost Protection)**
- **Problem**: Someone spams your webhook endpoint, racking up Make.com costs
- **Solution**:
  - IP-based rate limiting (100/hour)
  - Authentication required (webhook secret)
  - Audit logging of all attempts
  - Failed auth attempts logged and monitored

### 2. **Tool Abuse (Free Users Hammering Premium Tools)**
- **Problem**: Users try to scrape data by hammering premium tools
- **Solution**:
  - 10 requests per tool per hour
  - 20 total requests per hour
  - 24-hour auto-ban for violations
  - Can't bypass via API (enforced at database level)

### 3. **Paywall Bypass**
- **Problem**: Users try to access premium content without paying
- **Solution**:
  - RLS policies check `profiles.tier`
  - Database-level enforcement (can't bypass via API)
  - Helper function `current_user_is_premium()` checks on every query

### 4. **Watchlist Spam**
- **Problem**: Users spam watchlist add/remove to cause database load
- **Solution**:
  - Same tool rate limiting applies (10/hour)
  - Logged as tool usage
  - 24-hour ban for violations

### 5. **Account Sharing**
- **Problem**: Users share accounts to avoid paying
- **Solution**:
  - Tool usage limits per account
  - Automatic blocking on suspicious patterns
  - IP tracking and monitoring

### 6. **API Abuse**
- **Problem**: Automated bots hammering your endpoints
- **Solution**:
  - Rate limiting on all tool endpoints
  - Automatic detection of bot-like behavior
  - 24-hour auto-bans for violations
  - IP-based blocking

### 7. **Data Scraping**
- **Problem**: Users trying to scrape all your premium data
- **Solution**:
  - Detection of repeated requests to same endpoints
  - RLS prevents bulk data access
  - Automatic suspicious activity alerts

---

## ⚙️ Configuration

### View Currently Blocked Users:

```sql
SELECT
  bu.user_id,
  p.email,
  bu.reason,
  bu.blocked_until,
  bu.tool_name,
  bu.request_count
FROM blocked_users bu
JOIN profiles p ON p.id = bu.user_id
WHERE bu.blocked_until > now()
ORDER BY bu.blocked_at DESC;
```

### Unblock a User Early:

```sql
-- Unblock specific user
DELETE FROM blocked_users WHERE user_id = 'user_uuid_here';

-- Or update block time
UPDATE blocked_users
SET blocked_until = now()
WHERE user_id = 'user_uuid_here';
```

### Block a User Manually:

```sql
-- Block for 24 hours
INSERT INTO blocked_users (user_id, reason, blocked_until, tool_name)
VALUES (
  'user_uuid_here',
  'Terms of service violation',
  now() + interval '24 hours',
  'all_tools'
)
ON CONFLICT (user_id) DO UPDATE
SET reason = EXCLUDED.reason,
    blocked_until = EXCLUDED.blocked_until,
    blocked_at = now();
```

### Adjust Tool Rate Limits:

The limits are hardcoded in the database function. To adjust:

```sql
-- View current function
SELECT pg_get_functiondef('check_rate_limit_and_log'::regproc);

-- To change limits, modify the function:
-- tool_count >= 10  → Change 10 to your desired per-tool limit
-- total_count >= 20 → Change 20 to your desired total limit
```

---

## 🚨 Responding to Security Incidents

### High Number of Failed Webhook Auth Attempts:
1. Check `webhook_call_logs` for the source IP
2. Review if it's a legitimate service with wrong credentials
3. Rotate webhook secrets if compromised
4. Update Make.com scenarios with new secrets
5. Block the IP if malicious

### User Hitting Tool Limits Repeatedly:
1. Check `tool_usage_logs` for the user
2. Review their usage pattern
3. Check `profiles.tier` - are they on free tier trying to abuse?
4. Determine if it's legitimate high usage or abuse
5. Contact user if needed or extend block

### Suspicious Activity Alerts:
1. Review the alert in `suspicious_activity_logs`
2. Check user's full activity history in `tool_usage_logs`
3. Look for patterns (same tool repeatedly, short timeframes)
4. Verify user's premium status
5. Contact user if needed
6. Suspend account if clear abuse

### Webhook Cost Spike:
1. Check `webhook_call_logs` for unusual patterns
2. Identify which webhook is being called most
3. Check if IP rate limiting is working (100/hour)
4. Verify authentication is required and working
5. Temporarily disable webhook if under attack
6. Rotate secrets if compromised

---

## 📈 Cost Protection Guarantees

### Tool Usage Costs:
- **Per User**: Maximum 20 tool calls per hour (enforced at database level)
- **Automatic**: 24-hour ban after violation
- **Can't bypass**: Even if user manipulates frontend, backend enforces limits

### Webhook Costs:
- **Per IP**: Maximum 100 webhook calls per hour
- **Authentication**: All calls require valid secret
- **Audit**: Every call logged with IP, auth status, success/failure

### Automatic Protections:
1. User hits 10 tool calls for same tool → Blocked for 24 hours
2. User hits 20 total tool calls → Blocked for 24 hours
3. IP hits 100 webhook calls/hour → Rate limited (429 response)
4. Failed webhook auth attempts → Logged and monitored
5. Suspicious patterns → Auto-detected and alerted

---

## 🔍 Debugging

### Check if User is Blocked:
```sql
SELECT is_user_blocked('user_uuid_here');
```

### View Recent Tool Activity for User:
```sql
SELECT tool_name, COUNT(*), MAX(created_at)
FROM tool_usage_logs
WHERE user_id = 'user_uuid_here'
  AND created_at > now() - interval '1 hour'
GROUP BY tool_name;
```

### View Recent Webhook Activity:
```sql
SELECT
  webhook_type,
  source_ip,
  authenticated,
  success,
  created_at
FROM webhook_call_logs
WHERE created_at > now() - interval '1 hour'
ORDER BY created_at DESC;
```

### View Suspicious Activity for User:
```sql
SELECT * FROM suspicious_activity_logs
WHERE user_id = 'user_uuid_here'
ORDER BY created_at DESC;
```

### Get Security Stats:
```sql
-- Webhook stats
SELECT get_webhook_security_stats(24);

-- Tool usage stats
SELECT get_tool_usage_stats(24);
```

---

## 📝 Best Practices

1. **Monitor the dashboard daily** - Run `node security_monitor.mjs`
2. **Rotate webhook secrets monthly** - Or after any suspected breach
3. **Review suspicious activity logs** - Investigate HIGH and CRITICAL alerts
4. **Set up Make.com alerts** - Create scenarios to alert you on CRITICAL issues
5. **Regular audits** - Review blocked users and adjust limits as needed
6. **Document incidents** - Keep track of security events
7. **Test your webhooks** - Verify authentication is working after secret rotation
8. **Monitor blocked users** - Check if legitimate users are being blocked
9. **Adjust limits if needed** - Based on actual usage patterns

---

## 🆘 Emergency Procedures

### Site Under Attack (Tool Spam):
```sql
-- Lower all tool limits temporarily (in function code)
-- Block specific users
INSERT INTO blocked_users (user_id, reason, blocked_until, tool_name)
SELECT id, 'Emergency block during attack', now() + interval '24 hours', 'all_tools'
FROM auth.users
WHERE id IN (/* list of suspicious user IDs */);

-- Review tool_usage_logs for patterns
SELECT user_id, COUNT(*), MIN(created_at), MAX(created_at)
FROM tool_usage_logs
WHERE created_at > now() - interval '1 hour'
GROUP BY user_id
HAVING COUNT(*) > 15
ORDER BY COUNT(*) DESC;
```

### Webhook Under Attack:
```sql
-- Review webhook_call_logs
SELECT source_ip, COUNT(*) as calls
FROM webhook_call_logs
WHERE created_at > now() - interval '1 hour'
GROUP BY source_ip
ORDER BY calls DESC;

-- IP rate limiting should handle this automatically (100/hour per IP)
-- If needed, temporarily lower the limit in the function

-- Rotate all webhook secrets if compromised
UPDATE webhook_secrets
SET secret_key = gen_random_uuid()::text,
    last_rotated_at = now()
WHERE is_active = true;

-- Update Make.com scenarios with new secrets immediately
```

### Database Compromised:
```sql
-- Rotate all webhook secrets immediately
UPDATE webhook_secrets
SET secret_key = gen_random_uuid()::text,
    last_rotated_at = now();

-- Force all users to re-authenticate
-- Review audit logs for unauthorized access
SELECT * FROM webhook_call_logs
WHERE authenticated = false
  AND created_at > now() - interval '24 hours'
ORDER BY created_at DESC;

SELECT * FROM tool_usage_logs
WHERE created_at > now() - interval '24 hours'
ORDER BY created_at DESC;
```

---

## 📚 Additional Resources

- [Supabase RLS Documentation](https://supabase.com/docs/guides/auth/row-level-security)
- [Supabase Edge Functions](https://supabase.com/docs/guides/functions)
- [PostgreSQL Security Best Practices](https://www.postgresql.org/docs/current/security.html)

---

## Summary of Protection Layers

| Attack Type | Protection | Limit | Penalty |
|------------|-----------|-------|---------|
| Tool Abuse (Users) | Rate limiting | 10/tool/hour, 20 total/hour | 24h ban |
| Watchlist Spam | Rate limiting | 10/hour | 24h ban |
| Webhook Spam | IP rate limiting | 100/hour per IP | 429 response |
| Unauthorized Webhooks | Secret authentication | N/A | 401 response |
| Paywall Bypass | RLS policies | N/A | Query rejection |
| Data Scraping | Suspicious activity detection | Pattern-based | Investigation + ban |
| Account Sharing | Usage monitoring | Pattern-based | Investigation + ban |

**Remember**: Security is an ongoing process. Regularly review logs, update policies, and stay informed about new threats.
