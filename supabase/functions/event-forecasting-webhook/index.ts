import { createClient } from 'npm:@supabase/supabase-js@2.57.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Info, Apikey',
};

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const payload = await req.json();

    console.log('Received event forecasting webhook payload:', JSON.stringify(payload, null, 2));

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    let flipConditions = null;
    if (payload['Flip Conditions']) {
      try {
        const parsedFlipConditions = JSON.parse(payload['Flip Conditions']);
        flipConditions = parsedFlipConditions;
      } catch (e) {
        console.error('Error parsing flip conditions:', e);
      }
    }

    const { data, error } = await supabase
      .from('event_forecasting_results')
      .insert({
        query: payload.query || 'Event Forecasting Query',
        summary: payload.Summary || '',
        event_score: parseFloat(payload['Event Score']) || 0,
        recent_momentum: parseFloat(payload['Recent Momentum']) || 0,
        structural_edge: parseFloat(payload['Structural Edge']) || 0,
        expert_consensus_score: parseFloat(payload['Expert Consensus Score']) || 0,
        news_sentiment_score: parseFloat(payload['News & Sentiment score']) || 0,
        historical_pattern_match: parseFloat(payload['Historical Pattern Match']) || 0,
        time_pressure_effect: parseFloat(payload['Time Pressure/Deadline Effect']) || 0,
        flip_conditions: flipConditions,
      })
      .select()
      .single();

    if (error) {
      console.error('Error inserting event forecasting result:', error);
      throw error;
    }

    console.log('Successfully inserted event forecasting result:', data);

    return new Response(
      JSON.stringify({ success: true, data }),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  } catch (error) {
    console.error('Error processing webhook:', error);
    return new Response(
      JSON.stringify({
        error: 'Internal server error',
        message: error.message
      }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  }
});