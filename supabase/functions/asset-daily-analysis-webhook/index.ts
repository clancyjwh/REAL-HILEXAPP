import { createClient } from 'npm:@supabase/supabase-js@2.57.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Info, Apikey',
};

interface WebhookPayload {
  name?: string;
  symbol: string;
  user_id?: string | null;
  'JSON 1'?: string;
  'JSON 2'?: string;
  'JSON 8'?: string;
  'JSON 9'?: string;
  'Relative Value'?: string;
  indicator?: string;
  win_rate?: string;
  parameters?: string;
  ai_weights?: string;
  horizon_data?: string;
}

function parseJSON1Indicators(json1String: string) {
  try {
    const json1 = typeof json1String === 'string' ? JSON.parse(json1String) : json1String;
    return json1;
  } catch (error) {
    console.error('Error parsing JSON 1:', error);
    return null;
  }
}

function parseJSON2Weighting(json2String: string) {
  try {
    const json2 = typeof json2String === 'string' ? JSON.parse(json2String) : json2String;
    return json2;
  } catch (error) {
    console.error('Error parsing JSON 2:', error);
    return null;
  }
}

function parseJSON8News(json8String: string) {
  try {
    const json8 = typeof json8String === 'string' ? JSON.parse(json8String) : json8String;
    return json8;
  } catch (error) {
    console.error('Error parsing JSON 8:', error);
    return null;
  }
}

function parseJSON9Horizon(json9String: string) {
  try {
    const json9 = typeof json9String === 'string' ? JSON.parse(json9String) : json9String;
    return json9;
  } catch (error) {
    console.error('Error parsing JSON 9:', error);
    return null;
  }
}

function parseRelativeValue(relativeValueString: string) {
  try {
    const rv = typeof relativeValueString === 'string' ? JSON.parse(relativeValueString) : relativeValueString;
    return rv;
  } catch (error) {
    console.error('Error parsing Relative Value:', error);
    return null;
  }
}

function extractPrice(json1: any): number | null {
  try {
    return json1 && json1['Price'] ? parseFloat(json1['Price']) : null;
  } catch (error) {
    return null;
  }
}

function extractCumulativeSignal(json1: any): number | null {
  try {
    return json1 && json1['Cumulative Signal'] ? parseFloat(json1['Cumulative Signal']) : null;
  } catch (error) {
    return null;
  }
}

function extractDominantIndicator(json9: any): string | null {
  try {
    return json9 && json9['Analysis'] ? json9['Analysis'] : null;
  } catch (error) {
    return null;
  }
}

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
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    if (req.method === 'GET') {
      return new Response(
        JSON.stringify({
          message: 'Asset Daily Analysis Webhook',
          version: '2.0',
          description: 'Stores comprehensive daily asset analysis data in standardized format',
          usage: {
            endpoint: 'POST /asset-daily-analysis-webhook',
            required_fields: {
              name: 'Asset name',
              symbol: 'Asset trading symbol',
            },
            optional_fields: {
              'JSON 1': 'Indicator analysis data',
              'JSON 2': 'Weighting data',
              'JSON 8': 'News analysis data',
              'JSON 9': 'Horizon analysis data',
              'Relative Value': 'Relative value analysis',
              user_id: 'User ID (can be null)',
            },
          },
        }),
        {
          status: 200,
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json',
          },
        }
      );
    }

    if (req.method === 'POST') {
      const payload: WebhookPayload = await req.json();

      const { symbol } = payload;

      if (!symbol) {
        return new Response(
          JSON.stringify({
            success: false,
            error: 'Missing required field: symbol is required',
          }),
          {
            status: 400,
            headers: {
              ...corsHeaders,
              'Content-Type': 'application/json',
            },
          }
        );
      }

      // Check if this is a backtest format (simpler format from HorizonOptimizer)
      if (payload.ai_weights && payload.horizon_data) {
        const aiWeightsData = typeof payload.ai_weights === 'string' ? JSON.parse(payload.ai_weights) : payload.ai_weights;
        const horizonDataParsed = typeof payload.horizon_data === 'string' ? JSON.parse(payload.horizon_data) : payload.horizon_data;

        const aiWeights = {
          CCI: aiWeightsData['cci weight output'] || null,
          RSI: aiWeightsData['rsi weight output'] || null,
          SMA: aiWeightsData['sma weight output'] || null,
          BOLL: aiWeightsData['boll weight output'] || null,
        };

        const aiWinRates = {
          CCI: aiWeightsData['cci win_rate'] || null,
          RSI: aiWeightsData['rsi win_rate'] || null,
          SMA: aiWeightsData['sma win_rate'] || null,
          BOLL: aiWeightsData['boll win_rate'] || null,
        };

        const row = {
          asset: symbol.toUpperCase(),
          run_date: new Date().toISOString().slice(0, 10),
          symbol: symbol.toUpperCase(),
          price: null,
          cumulative_score: null,
          dominant_indicator: payload.indicator || null,
          strongest_signal: null,
          volatility: null,
          trend: null,
          indicator_json: null,
          news_json: null,
          horizon_json: horizonDataParsed,
          relative_value_json: null,
          ai_weights: aiWeights,
          ai_win_rates: aiWinRates,
          inserted_at: new Date().toISOString(),
        };

        const { data, error } = await supabase
          .from('asset_daily_analysis')
          .upsert(row, {
            onConflict: 'asset,run_date',
          })
          .select();

        if (error) {
          return new Response(
            JSON.stringify({
              success: false,
              error: 'Database operation failed: ' + error.message,
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

        return new Response(
          JSON.stringify({
            success: true,
            data: data[0],
            message: 'Backtest analysis stored successfully',
          }),
          {
            status: 200,
            headers: {
              ...corsHeaders,
              'Content-Type': 'application/json',
            },
          }
        );
      }

      const indicatorJson = payload['JSON 1'] ? parseJSON1Indicators(payload['JSON 1']) : null;
      const weightingJson = payload['JSON 2'] ? parseJSON2Weighting(payload['JSON 2']) : null;
      const newsJson = payload['JSON 8'] ? parseJSON8News(payload['JSON 8']) : null;
      const horizonJson = payload['JSON 9'] ? parseJSON9Horizon(payload['JSON 9']) : null;
      const relativeValueJson = payload['Relative Value'] ? parseRelativeValue(payload['Relative Value']) : null;

      const price = extractPrice(indicatorJson);
      const cumulativeScore = extractCumulativeSignal(indicatorJson);
      const dominantIndicator = extractDominantIndicator(horizonJson);

      let aiWeights = null;
      let aiWinRates = null;

      if (weightingJson) {
        aiWeights = {
          CCI: weightingJson['cci weight output'] || null,
          RSI: weightingJson['rsi weight output'] || null,
          SMA: weightingJson['sma weight output'] || null,
          BOLL: weightingJson['boll weight output'] || null,
        };

        aiWinRates = {
          CCI: weightingJson['cci win_rate'] || null,
          RSI: weightingJson['rsi win_rate'] || null,
          SMA: weightingJson['sma win_rate'] || null,
          BOLL: weightingJson['boll win_rate'] || null,
        };
      }

      const row = {
        asset: symbol.toUpperCase(),
        run_date: new Date().toISOString().slice(0, 10),
        symbol: symbol.toUpperCase(),
        price,
        cumulative_score: cumulativeScore,
        dominant_indicator: dominantIndicator,
        strongest_signal: null,
        volatility: null,
        trend: null,
        indicator_json: indicatorJson,
        news_json: newsJson,
        horizon_json: horizonJson,
        relative_value_json: relativeValueJson,
        ai_weights: aiWeights,
        ai_win_rates: aiWinRates,
        inserted_at: new Date().toISOString(),
      };

      const { data, error } = await supabase
        .from('asset_daily_analysis')
        .upsert(row, {
          onConflict: 'asset,run_date',
        })
        .select();

      if (error) {
        return new Response(
          JSON.stringify({
            success: false,
            error: 'Database operation failed: ' + error.message,
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

      return new Response(
        JSON.stringify({
          success: true,
          data: data[0],
          message: 'Asset daily analysis stored successfully',
        }),
        {
          status: 200,
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json',
          },
        }
      );
    }

    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      {
        status: 405,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
        stack: error.stack,
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
