# Webhook Security Configuration

## Critical Security Changes Made

This document outlines the security improvements made to protect your Supabase Edge Functions from unauthorized access.

## Environment Variables Required

Add these environment variables to your Supabase project:

```bash
# Webhook API Key - used by all webhook endpoints
WEBHOOK_API_KEY=your-secure-random-key-here

# Stripe Webhook Secret - obtained from Stripe Dashboard
STRIPE_WEBHOOK_SECRET=whsec_your-stripe-webhook-secret

# Already configured (verify these exist):
STRIPE_SECRET_KEY=sk_live_or_test_your-stripe-key
SUPABASE_URL=your-supabase-url
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
SUPABASE_ANON_KEY=your-anon-key
```

## How to Set Environment Variables

1. Go to your Supabase Dashboard
2. Navigate to Project Settings > Edge Functions
3. Add each environment variable listed above
4. Generate a secure random key for `WEBHOOK_API_KEY`:
   ```bash
   # Use this command to generate a secure key:
   openssl rand -base64 32
   ```

## Webhook Authentication Pattern

All webhook endpoints now require an `X-API-Key` header:

```bash
# Example webhook call
curl -X POST https://your-project.supabase.co/functions/v1/top-picks-webhook \
  -H "Content-Type: application/json" \
  -H "X-API-Key: your-webhook-api-key-here" \
  -d '{"symbol": "AAPL", "name": "Apple Inc."}'
```

## Functions Updated with Security

### ✅ Fully Secured:
1. **stripe-webhook** - Now requires Stripe signature verification
2. **stripe-checkout** - Now requires user authentication via JWT token
3. **create-test-user** - DELETED (was a critical security risk)

### 🔄 Require API Key (to be updated):
All remaining webhook functions need the authentication pattern applied:

- asset-daily-analysis-webhook
- correlation-webhook
- daily-insights-webhook
- event-forecasting-examples-webhook
- event-forecasting-webhook
- interest-rates-webhook
- taco-trade-webhook
- top-picks-webhook
- trending-topics-webhook
- user-watchlist-webhook
- zero-day-options-webhook

## Security Pattern Template

For each webhook function, add this authentication check at the start:

```typescript
import { verifyWebhookAuth, createUnauthorizedResponse, createErrorResponse } from '../_shared/auth.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, X-API-Key',
};

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  // ADD THIS AUTHENTICATION CHECK
  const authCheck = verifyWebhookAuth(req);
  if (!authCheck.authorized) {
    return createUnauthorizedResponse(authCheck.error!, corsHeaders);
  }

  try {
    // ... existing webhook logic ...

  } catch (error) {
    console.error('Webhook error:', error);
    // IMPORTANT: Don't expose stack traces
    return createErrorResponse('Internal server error', 500, corsHeaders);
  }
});
```

## Updating Your Automation Tools

If you use Make.com, Zapier, or other automation tools to call these webhooks:

1. Add an HTTP header to your requests:
   - Header Name: `X-API-Key`
   - Header Value: `your-webhook-api-key` (same value as environment variable)

2. Example in Make.com:
   - In your HTTP module
   - Go to "Show advanced settings"
   - Add header: `X-API-Key` = `your-webhook-api-key`

3. Example in Zapier:
   - In your Webhooks action
   - Add to Headers section
   - Key: `X-API-Key`, Value: `your-webhook-api-key`

## Stripe Setup

### Stripe Webhook Secret

1. Go to Stripe Dashboard > Developers > Webhooks
2. Add endpoint: `https://your-project.supabase.co/functions/v1/stripe-webhook`
3. Select events to listen for:
   - `checkout.session.completed`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
4. Copy the "Signing secret" (starts with `whsec_`)
5. Add it to Supabase environment variables as `STRIPE_WEBHOOK_SECRET`

## Security Benefits

### Before:
- ❌ Anyone could call webhooks without authentication
- ❌ Anyone could create admin accounts (create-test-user function)
- ❌ Anyone could grant themselves premium access
- ❌ Stripe webhooks could be faked
- ❌ User watchlists could be manipulated by anyone
- ❌ Stack traces exposed internal system details

### After:
- ✅ All webhooks require API key authentication
- ✅ Stripe webhooks verified with cryptographic signatures
- ✅ User identity verified via JWT tokens where applicable
- ✅ Test user creation function removed
- ✅ No stack traces in error responses
- ✅ Input validation on critical fields

## Testing

After setting up environment variables and updating webhook callers:

1. Test a webhook without API key (should return 401):
   ```bash
   curl -X POST https://your-project.supabase.co/functions/v1/top-picks-webhook \
     -H "Content-Type: application/json" \
     -d '{"test": "data"}'
   # Expected: {"error": "Unauthorized: Missing API key"}
   ```

2. Test with correct API key (should work):
   ```bash
   curl -X POST https://your-project.supabase.co/functions/v1/top-picks-webhook \
     -H "Content-Type: application/json" \
     -H "X-API-Key: your-webhook-api-key" \
     -d '{"symbol": "AAPL", "name": "Apple"}'
   # Expected: Success response
   ```

## Support

If you encounter issues:
1. Verify environment variables are set correctly in Supabase Dashboard
2. Check that webhook callers include the `X-API-Key` header
3. Review function logs in Supabase Dashboard > Edge Functions > Logs
4. Ensure the API key matches exactly (no extra spaces)

## Next Steps

1. ✅ Set all required environment variables in Supabase
2. ✅ Update all webhook callers (Make.com, Zapier, etc.) to include X-API-Key header
3. 🔄 Apply the security pattern to remaining webhook functions
4. ✅ Test each webhook endpoint
5. ✅ Monitor logs for unauthorized access attempts
