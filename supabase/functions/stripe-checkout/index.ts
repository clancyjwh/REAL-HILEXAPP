import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2.57.4";
import { getCorsHeaders, handleCorsPrelight } from "../_shared/cors.ts";

Deno.serve(async (req: Request) => {
  const corsPreflightResponse = handleCorsPrelight(req);
  if (corsPreflightResponse) {
    return corsPreflightResponse;
  }

  const origin = req.headers.get('origin');
  const corsHeaders = getCorsHeaders(origin);

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Unauthorized: Missing authorization" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY") ?? "";
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";

    const supabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: {
        headers: { Authorization: authHeader },
      },
    });

    const { data: { user }, error: userError } = await supabaseClient.auth.getUser();

    if (userError || !user) {
      console.error("Authentication failed:", userError);
      return new Response(
        JSON.stringify({ error: "Unauthorized: Invalid token" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const userId = user.id;
    const email = user.email;

    if (!email) {
      return new Response(
        JSON.stringify({ error: "User email not found" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const stripeRestrictedKey = Deno.env.get("STRIPE_RESTRICTED_KEY");
    if (!stripeRestrictedKey) {
      throw new Error("STRIPE_RESTRICTED_KEY not configured");
    }

    const { priceId } = await req.json();
    console.log('Received request:', { priceId, userId, email });

    if (!priceId) {
      throw new Error("Missing priceId");
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    let customerId: string;
    const { data: existingCustomer } = await supabase
      .from("stripe_customers")
      .select("customer_id")
      .eq("user_id", userId)
      .maybeSingle();

    if (existingCustomer?.customer_id) {
      customerId = existingCustomer.customer_id;
      console.log('Found existing customer:', customerId);
    } else {
      console.log('Creating new customer...');
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

      customerId = customer.id;

      await supabase.from("stripe_customers").insert({
        user_id: userId,
        customer_id: customerId,
      });
    }

    console.log('Creating checkout session...');
    const sessionResponse = await fetch("https://api.stripe.com/v1/checkout/sessions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${stripeRestrictedKey}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        customer: customerId,
        customer_email: email,
        mode: "subscription",
        "line_items[0][price]": priceId,
        "line_items[0][quantity]": "1",
        success_url: `${req.headers.get("origin")}/billing?success=true`,
        cancel_url: `${req.headers.get("origin")}/billing?canceled=true`,
        "metadata[supabase_user_id]": userId,
      }),
    });

    const session = await sessionResponse.json();
    console.log('Stripe session response:', session);

    if (!sessionResponse.ok || session.error) {
      throw new Error(session.error?.message || 'Failed to create checkout session');
    }

    if (!session.url) {
      throw new Error('No session URL in response');
    }

    return new Response(
      JSON.stringify({ url: session.url }),
      {
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error) {
    console.error("Checkout error:", error);
    return new Response(
      JSON.stringify({ error: "Failed to create checkout session" }),
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