import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const webhookData = await req.json();
    console.log("Received webhook data:", webhookData);

    if (Array.isArray(webhookData) && webhookData.length > 0) {
      const updates = webhookData.map(item => ({
        date: item.date || null,
        source: item.source || null,
        quote: item.quote || null,
        topic: item.topic || null,
        aggression_score: item.aggression_score ?? null,
        followthrough_score: item.followthrough_score ?? null,
        summary: item.summary || null,
        historical_consistency: item.historical_consistency || null,
        chickened_out: item.chickened_out ?? false,
        verdict: item.verdict || null,
        reference_link: item.reference_link || null,
      }));

      const { data, error } = await supabase
        .from("taco_trade_updates")
        .insert(updates)
        .select();

      if (error) {
        console.error("Database error:", error);
        throw error;
      }

      console.log("Successfully inserted data:", data);

      return new Response(
        JSON.stringify({ success: true, data, count: data.length }),
        {
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      );
    } else {
      return new Response(
        JSON.stringify({ success: false, message: "Invalid data format" }),
        {
          status: 400,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      );
    }
  } catch (error) {
    console.error("Error processing webhook:", error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
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
