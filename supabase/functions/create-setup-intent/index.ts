import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2.57.4";

function getCorsHeaders(): HeadersInit {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Info, Apikey',
    'Access-Control-Max-Age': '86400',
  };
}

function handleCorsPrelight(req: Request): Response | null {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: getCorsHeaders(),
    });
  }
  return null;
}

Deno.serve(async (req: Request) => {
  const corsPreflightResponse = handleCorsPrelight(req);
  if (corsPreflightResponse) {
    return corsPreflightResponse;
  }

  const corsHeaders = getCorsHeaders();

  try {
    const { email } = await req.json();

    if (!email) {
      return new Response(
        JSON.stringify({ error: "Email is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const stripeRestrictedKey = Deno.env.get("STRIPE_RESTRICTED_KEY");
    if (!stripeRestrictedKey) {
      throw new Error("STRIPE_RESTRICTED_KEY not configured");
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    console.log('Creating Stripe customer for email:', email);
    const customerResponse = await fetch("https://api.stripe.com/v1/customers", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${stripeRestrictedKey}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({ email }),
    });

    const customer = await customerResponse.json();
    console.log('Stripe customer response:', customer);

    if (!customerResponse.ok || customer.error) {
      throw new Error(customer.error?.message || 'Failed to create Stripe customer');
    }

    const customerId = customer.id;

    console.log('Creating SetupIntent for customer:', customerId);
    const setupIntentResponse = await fetch("https://api.stripe.com/v1/setup_intents", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${stripeRestrictedKey}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        customer: customerId,
        "payment_method_types[]": "card",
      }),
    });

    const setupIntent = await setupIntentResponse.json();
    console.log('SetupIntent response:', setupIntent);

    if (!setupIntentResponse.ok || setupIntent.error) {
      throw new Error(setupIntent.error?.message || 'Failed to create SetupIntent');
    }

    if (!setupIntent.client_secret) {
      throw new Error('No client_secret in SetupIntent response');
    }

    return new Response(
      JSON.stringify({
        clientSecret: setupIntent.client_secret,
        customerId: customerId,
      }),
      {
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error) {
    console.error("Setup intent error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Failed to create setup intent" }),
      {
        status: 400,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  }
});