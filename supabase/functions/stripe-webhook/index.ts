import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2.57.4";
import Stripe from "npm:stripe@17.5.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey, Stripe-Signature",
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const stripeRestrictedKey = Deno.env.get("STRIPE_RESTRICTED_KEY");
    const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");

    if (!stripeRestrictedKey) {
      console.error("STRIPE_RESTRICTED_KEY not configured");
      return new Response(
        JSON.stringify({ error: "Server configuration error" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!webhookSecret) {
      console.error("STRIPE_WEBHOOK_SECRET not configured");
      return new Response(
        JSON.stringify({ error: "Server configuration error" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const stripe = new Stripe(stripeRestrictedKey, {
      apiVersion: "2024-11-20.acacia",
    });

    const signature = req.headers.get("stripe-signature");
    if (!signature) {
      console.error("Missing stripe-signature header");
      return new Response(
        JSON.stringify({ error: "Unauthorized: Missing signature" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const body = await req.text();

    let event: Stripe.Event;
    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err) {
      console.error("Webhook signature verification failed:", err.message);
      return new Response(
        JSON.stringify({ error: "Webhook signature verification failed" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("Verified webhook event:", event.type);

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;
      const customerId = session.customer as string;
      const subscriptionId = session.subscription as string;
      const customerEmail = session.customer_details?.email || session.customer_email;
      const metadataUserId = session.metadata?.supabase_user_id;
      const clientReferenceId = session.client_reference_id;

      console.log("Processing checkout.session.completed:", {
        sessionId: session.id,
        customerId,
        subscriptionId,
        customerEmail,
        metadataUserId,
        clientReferenceId
      });

      let userId: string;

      // Try to get user ID from client_reference_id first (for payment links)
      if (clientReferenceId) {
        userId = clientReferenceId;
        console.log("Using user ID from client_reference_id:", userId);

        // If we have both userId and customerId, save the mapping
        if (customerId) {
          const { error: insertCustomerError } = await supabase
            .from("stripe_customers")
            .upsert({
              user_id: userId,
              customer_id: customerId,
              updated_at: new Date().toISOString(),
            }, { onConflict: "customer_id" });

          if (insertCustomerError) {
            console.error("Failed to upsert customer record:", insertCustomerError);
          } else {
            console.log("Saved stripe_customers mapping");
          }
        }
      } else if (metadataUserId) {
        userId = metadataUserId;
        console.log("Using user ID from metadata:", userId);

        // If we have both userId and customerId, save the mapping
        if (customerId) {
          const { error: insertCustomerError } = await supabase
            .from("stripe_customers")
            .upsert({
              user_id: userId,
              customer_id: customerId,
              updated_at: new Date().toISOString(),
            }, { onConflict: "customer_id" });

          if (insertCustomerError) {
            console.error("Failed to upsert customer record:", insertCustomerError);
          } else {
            console.log("Saved stripe_customers mapping");
          }
        }
      } else if (customerId) {
        // Fallback: Check if customer already exists in our database
        const { data: existingCustomer } = await supabase
          .from("stripe_customers")
          .select("user_id")
          .eq("customer_id", customerId)
          .maybeSingle();

        if (existingCustomer) {
          userId = existingCustomer.user_id;
          console.log("Found existing customer:", userId);
        } else {
          throw new Error("Customer ID present but no mapping found");
        }
      } else {
        // Last resort: find by email
        if (!customerEmail) {
          console.error("checkout.session.completed missing customer id", {
            sessionId: session.id,
            subscriptionId,
            customerEmail
          });
          throw new Error("No customer ID or email found");
        }

        const { data: authUser, error: authError } = await supabase.auth.admin.listUsers();

        if (authError) {
          console.error("Failed to list users:", authError);
          throw authError;
        }

        const user = authUser.users.find(u => u.email === customerEmail);

        if (!user) {
          console.error("User not found with email:", customerEmail);
          throw new Error("User not found");
        }

        userId = user.id;
        console.log("Found user by email:", userId);

        if (customerId) {
          const { error: insertCustomerError } = await supabase
            .from("stripe_customers")
            .upsert({
              user_id: userId,
              customer_id: customerId,
              updated_at: new Date().toISOString(),
            }, { onConflict: "customer_id" });

          if (insertCustomerError) {
            console.error("Failed to create customer record:", insertCustomerError);
          }
        }
      }

      // Update user subscription status to premium
      const { error: userError } = await supabase
        .from("users")
        .update({
          subscription_status: "premium",
        })
        .eq("id", userId);

      if (userError) {
        console.error("Failed to update user subscription:", userError);
        throw userError;
      }

      console.log("Successfully updated user subscription to premium:", userId);

      // Create or update subscription record
      const { error: subscriptionError } = await supabase
        .from("stripe_subscriptions")
        .upsert({
          customer_id: customerId,
          subscription_id: subscriptionId,
          status: "active",
          updated_at: new Date().toISOString(),
        }, { onConflict: "customer_id" });

      if (subscriptionError) {
        console.error("Failed to update subscription:", subscriptionError);
      }
    }

    if (event.type === "customer.subscription.updated" || event.type === "customer.subscription.deleted") {
      const subscription = event.data.object as Stripe.Subscription;
      const customerId = subscription.customer as string;
      const status = subscription.status;

      console.log("Processing subscription update:", { customerId, status });

      const { data: customer, error: customerError } = await supabase
        .from("stripe_customers")
        .select("user_id")
        .eq("customer_id", customerId)
        .maybeSingle();

      if (customerError || !customer) {
        console.error("Customer not found:", customerError);
        throw new Error("Customer not found in database");
      }

      const userId = customer.user_id;
      const newStatus = (status === "active" || status === "trialing") ? "premium" : "free";

      const { error: userError } = await supabase
        .from("users")
        .update({
          subscription_status: newStatus,
        })
        .eq("id", userId);

      if (userError) {
        console.error("Failed to update user subscription:", userError);
        throw userError;
      }

      console.log(`Successfully updated user subscription to ${newStatus}:`, userId);

      const { error: subscriptionError } = await supabase
        .from("stripe_subscriptions")
        .update({
          status: status,
          updated_at: new Date().toISOString(),
        })
        .eq("customer_id", customerId);

      if (subscriptionError) {
        console.error("Failed to update subscription:", subscriptionError);
      }
    }

    return new Response(
      JSON.stringify({ received: true }),
      {
        status: 200,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error) {
    console.error("Webhook error:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  }
});