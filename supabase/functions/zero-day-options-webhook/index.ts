import { createClient } from 'npm:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Info, Apikey',
};

import { verifyWebhookAuth } from '../_shared/auth.ts';

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  const auth = verifyWebhookAuth(req);
  if (!auth.authorized) {
    return new Response(
      JSON.stringify({ success: false, error: auth.error }),
      {
        status: 401,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const payload = await req.json();

    console.log('Received webhook payload:', JSON.stringify(payload, null, 2));

    const url = new URL(req.url);
    const horizonParam = url.searchParams.get('horizon');
    const horizon = horizonParam ? parseInt(horizonParam) : parseInt(payload.horizon || '5');

    console.log('Horizon from URL:', horizonParam, 'Parsed horizon:', horizon);

    let expectedMove = 0;
    if (payload['expected move next 5 minutes']) {
      expectedMove = parseFloat(payload['expected move next 5 minutes']);
    } else {
      const expectedMoveKey = `expected move next ${horizon} minute${horizon === 1 ? '' : 's'}`;
      if (payload[expectedMoveKey]) {
        expectedMove = parseFloat(payload[expectedMoveKey]);
      } else if (payload.expected_move) {
        expectedMove = parseFloat(payload.expected_move);
      } else if (payload['expected move']) {
        expectedMove = parseFloat(payload['expected move']);
      }
    }

    let topStrikes = null;
    if (payload['top strikes']) {
      try {
        const topStrikesStr = payload['top strikes'];
        if (typeof topStrikesStr === 'string') {
          const parsed = JSON.parse(`[${topStrikesStr}]`);
          topStrikes = parsed;
        } else {
          topStrikes = topStrikesStr;
        }
      } catch (e) {
        console.error('Error parsing top strikes:', e);
      }
    }

    const insertData = {
      ticker: payload.ticker || payload.symbol,
      horizon: horizon,
      symbol: payload.symbol || payload.ticker,
      summary: payload.Summary || payload.summary || null,
      direction: (payload.direction || 'up').toLowerCase(),
      probability_up: parseFloat(payload['probability up'] || payload.probability_up || '0'),
      probability_down: parseFloat(payload['probability down'] || payload.probability_down || '0'),
      confidence_label: (payload['confidence label'] || payload.confidence_label || 'moderate').toLowerCase(),
      confidence_score: parseFloat(payload['confidence score'] || payload.confidence_score || '0'),
      scenarios_tested: parseInt(payload['scenarios tested'] || payload.scenarios_tested || '0'),
      expected_move: expectedMove,
      average_historical_move: parseFloat(payload['average historical move percent'] || payload.average_historical_move || payload['average historical move'] || '0'),
      bias: payload.bias || null,
      spot_price: payload['spot price'] ? parseFloat(payload['spot price']) : null,
      top_strikes: topStrikes,
      put_wall_strike: payload['put wall strike'] ? parseFloat(payload['put wall strike']) : null,
      call_wall_strike: payload['call wall strike'] ? parseFloat(payload['call wall strike']) : null,
      put_wall_distance: payload['put wall distance'] ? parseFloat(payload['put wall distance']) : null,
      call_wall_distance: payload['call wall distance'] ? parseFloat(payload['call wall distance']) : null,
    };

    console.log('Inserting data:', JSON.stringify(insertData, null, 2));

    const { data, error } = await supabase
      .from('zero_day_options_results')
      .insert(insertData)
      .select()
      .single();

    if (error) {
      console.error('Database insert error:', JSON.stringify(error, null, 2));
      return new Response(
        JSON.stringify({ 
          error: 'Database insert failed', 
          details: error.message,
          code: error.code,
          hint: error.hint 
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

    console.log('Successfully inserted result:', data);

    return new Response(
      JSON.stringify({ success: true, id: data.id }),
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
        message: error.message,
        stack: error.stack 
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