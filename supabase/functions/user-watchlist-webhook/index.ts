import { createClient } from 'npm:@supabase/supabase-js@2.57.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Info, Apikey',
};

interface WebhookPayload {
  name: string;
  symbol: string;
  user_id: string;
  'JSON 1'?: string;
  'JSON 2'?: string;
  'JSON 8'?: string;
  'JSON 9'?: string;
  'Relative Value'?: string;
}

function parseJSON1Indicators(json1String: string) {
  try {
    const json1 = typeof json1String === 'string' ? JSON.parse(json1String) : json1String;

    const indicators = {
      SMA: {
        signal: parseFloat(json1['SMA Signal'] || '0'),
        fast_period: json1['SMA Fast Period'],
        slow_period: json1['Sma Slow Period'],
        horizon: json1['SMA Horizon'],
        win_rate: json1['SMA Win Rate'],
        explanation: json1['SMA Explanation'],
      },
      CCI: {
        signal: parseFloat(json1['CCI Signal'] || '0'),
        period: json1['CCI Period'],
        horizon: json1['CCI Horizon'],
        current_cci: json1['Current CCI'],
        win_rate: json1['CCI Win Rate'],
        analysis: json1['CCI analysis'],
      },
      RSI: {
        signal: parseFloat(json1['RSI Signal'] || '0'),
        period: json1['RSI Period'],
        oversold: json1['RSI Oversold'],
        overbought: json1['RSI Overbought'],
        horizon: json1['RSI Horizon'],
        current_rsi: json1['Current RSI'],
        win_rate: json1['RSI Win Rate'],
        analysis: json1['RSI analysis'],
      },
      BOLL: {
        signal: parseFloat(json1['Boll Signal'] || '0'),
        period: json1['Boll Period'],
        multiplier: json1['Boll Multiplier'],
        horizon: json1['Boll Horizon'],
        win_rate: json1['Boll Win Rate'],
        analysis: json1['Boll Analysis'],
      },
      MACD: {
        signal: parseFloat(json1['MACD Signal'] || '0'),
        fast_ema: json1['MACD Fast EMA'],
        slow_ema: json1['MACD Slow EMA'],
        signal_ema: json1['MACD Signal EMA'],
        win_rate: json1['MACD Win Rate'],
        analysis: json1['MACD Analysis'],
      },
      Rate_of_Change: {
        signal: parseFloat(json1['ROC Signal'] || '0'),
        period: json1['ROC Period'],
        current_roc: json1['Current ROC'],
        win_rate: json1['ROC Win Rate'],
        analysis: json1['ROC Analysis'],
      },
    };

    return indicators;
  } catch (error) {
    console.error('Error parsing JSON 1 indicators:', error);
    return null;
  }
}

function parseJSON2HorizonData(json2String: string) {
  try {
    const json2 = typeof json2String === 'string' ? JSON.parse(json2String) : json2String;

    const horizonData: any = {};

    const horizonKeys = ['30', '60', '90', '120', '150', '180'];

    horizonKeys.forEach((key) => {
      if (json2[key]) {
        const horizonJson = typeof json2[key] === 'string' ? JSON.parse(json2[key]) : json2[key];

        horizonData[`${key}d`] = {
          result: horizonJson['Result'],
          signal: horizonJson['Signal'],
          prediction: horizonJson['Prediction'],
          correct: horizonJson['Correct'],
          daysback: horizonJson['Daysback'],
          sma_fast: horizonJson['SMA Fast'],
          sma_slow: horizonJson['SMA Slow'],
          cci_period: horizonJson['CCI Period'],
          cci_signal: horizonJson['CCI Signal'],
          rsi_period: horizonJson['RSI Period'],
          rsi_signal: horizonJson['RSI Signal'],
          rsi_oversold: horizonJson['RSI Oversold'],
          rsi_overbought: horizonJson['RSI Overbought'],
          sma_signal: horizonJson['SMA Signal'],
          bollinger_period: horizonJson['Bollinger Period'],
          bollinger_signal: horizonJson['Bollinger Signal'],
          bollinger_multiplier: horizonJson['Bollinger Multiplier'],
          total_combinations_tested: horizonJson['Total Combinations Tested'],
        };
      }
    });

    return Object.keys(horizonData).length > 0 ? horizonData : null;
  } catch (error) {
    console.error('Error parsing JSON 2 horizon data:', error);
    return null;
  }
}

function parseJSON8News(json8String: string) {
  try {
    const json8 = typeof json8String === 'string' ? JSON.parse(json8String) : json8String;

    return {
      rundown: json8['Rundown'] || null,
      sources: json8['Sources'] || null,
    };
  } catch (error) {
    console.error('Error parsing JSON 8 news:', error);
    return null;
  }
}

function parseJSON9OptimizedParams(json9String: string) {
  try {
    const json9 = typeof json9String === 'string' ? JSON.parse(json9String) : json9String;
    return json9;
  } catch (error) {
    console.error('Error parsing JSON 9 optimized params:', error);
    return null;
  }
}

function parseRelativeValue(relativeValueString: string) {
  try {
    const rv = typeof relativeValueString === 'string' ? JSON.parse(relativeValueString) : relativeValueString;

    return {
      result: rv['Result'] || null,
      asset_return: rv['Asset Return'] || null,
      index_return: rv['Index Return'] || null,
      summary: rv['summary'] || null,
      exchange: rv['Exchange'] || null,
    };
  } catch (error) {
    console.error('Error parsing Relative Value:', error);
    return null;
  }
}

function extractCumulativeSignal(json1String: string): number {
  try {
    const json1 = typeof json1String === 'string' ? JSON.parse(json1String) : json1String;

    if (json1['Cumulative Signal']) {
      return parseFloat(json1['Cumulative Signal']);
    }

    const signals = [
      parseFloat(json1['SMA Signal'] || '0'),
      parseFloat(json1['CCI Signal'] || '0'),
      parseFloat(json1['RSI Signal'] || '0'),
      parseFloat(json1['Boll Signal'] || '0'),
      parseFloat(json1['MACD Signal'] || '0'),
      parseFloat(json1['ROC Signal'] || '0'),
    ];

    const sum = signals.reduce((acc, val) => acc + val, 0);
    return sum / signals.length;
  } catch (error) {
    console.error('Error extracting cumulative signal:', error);
    return 0;
  }
}

function extractPrice(json1String: string): number | null {
  try {
    const json1 = typeof json1String === 'string' ? JSON.parse(json1String) : json1String;
    return json1['Price'] ? parseFloat(json1['Price']) : null;
  } catch (error) {
    return null;
  }
}

function extractDate(json1String: string): string | null {
  try {
    const json1 = typeof json1String === 'string' ? JSON.parse(json1String) : json1String;
    if (json1['Date']) {
      const dateObj = new Date(json1['Date']);
      return dateObj.toISOString().split('T')[0];
    }
    return null;
  } catch (error) {
    return null;
  }
}

function extractROCData(json1String: string) {
  try {
    const json1 = typeof json1String === 'string' ? JSON.parse(json1String) : json1String;

    return {
      signal: parseFloat(json1['ROC Signal'] || '0'),
      current_roc: json1['Current ROC'] || null,
      best_bullish_roc: json1['Best Bullish ROC'] || null,
      most_bearish_zone: json1['Most Bearish Zone'] || null,
    };
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

    if (req.method === 'POST') {
      const payload: WebhookPayload = await req.json();

      const { name, symbol, user_id } = payload;

      if (!user_id || !symbol || !name) {
        return new Response(
          JSON.stringify({
            success: false,
            error: 'Missing required fields: user_id, symbol, and name are required',
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

      let cumulativeSignal = 0;
      let price = null;
      let date = null;
      let indicators = null;
      let historicalPerformance = null;
      let newsSummary = null;
      let optimizedParameters = null;
      let relativeValueAnalysis = null;
      let rocSignal = null;
      let rocValue = null;
      let rateOfChange = null;
      let aiWeights = null;
      let aiWinRates = null;

      if (payload['JSON 1']) {
        cumulativeSignal = extractCumulativeSignal(payload['JSON 1']);
        price = extractPrice(payload['JSON 1']);
        date = extractDate(payload['JSON 1']);
        indicators = parseJSON1Indicators(payload['JSON 1']);
        const rocData = extractROCData(payload['JSON 1']);
        if (rocData) {
          rocSignal = rocData.signal;
          rocValue = rocData.current_roc;
          rateOfChange = rocData;
        }
      }

      if (payload['JSON 2']) {
        const json2 = typeof payload['JSON 2'] === 'string' ? JSON.parse(payload['JSON 2']) : payload['JSON 2'];

        // Check if JSON 2 contains AI weights (from watchlist) or horizon data (from other sources)
        if (json2['cci weight output'] || json2['cci_weight_output']) {
          // This is AI weights data
          aiWeights = {
            CCI: json2['cci weight output'] || json2['cci_weight_output'] || null,
            RSI: json2['rsi weight output'] || json2['rsi_weight_output'] || null,
            SMA: json2['sma weight output'] || json2['sma_weight_output'] || null,
            BOLL: json2['boll weight output'] || json2['boll_weight_output'] || null,
          };

          aiWinRates = {
            CCI: json2['cci win_rate'] || json2['cci_win_rate'] || null,
            RSI: json2['rsi win_rate'] || json2['rsi_win_rate'] || null,
            SMA: json2['sma win_rate'] || json2['sma_win_rate'] || null,
            BOLL: json2['boll win_rate'] || json2['boll_win_rate'] || null,
          };
        } else {
          // This is horizon data
          historicalPerformance = parseJSON2HorizonData(payload['JSON 2']);
        }
      }

      if (payload['JSON 8']) {
        newsSummary = parseJSON8News(payload['JSON 8']);
      }

      if (payload['JSON 9']) {
        optimizedParameters = parseJSON9OptimizedParams(payload['JSON 9']);
      }

      if (payload['Relative Value']) {
        relativeValueAnalysis = parseRelativeValue(payload['Relative Value']);
      }

      const watchlistData = {
        user_id,
        symbol: symbol.toUpperCase(),
        name,
        category: 'stocks',
        signal: cumulativeSignal,
        price,
        date,
        roc_signal: rocSignal,
        roc_value: rocValue,
        indicators,
        rate_of_change: rateOfChange,
        summary: null,
        historical_performance: historicalPerformance,
        news_summary: newsSummary,
        optimized_parameters: optimizedParameters,
        relative_value_analysis: relativeValueAnalysis,
        detailed_signal_data: payload,
        raw_data: payload,
        last_updated: new Date().toISOString(),
      };

      const { data: result, error } = await supabase
        .from('user_watchlist')
        .upsert(watchlistData, {
          onConflict: 'user_id,symbol',
        })
        .select();

      if (error) {
        return new Response(
          JSON.stringify({
            success: false,
            error: error.message,
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

      // Forward to asset_daily_analysis table
      const assetDailyRow = {
        asset: symbol.toUpperCase(),
        run_date: new Date().toISOString().slice(0, 10),
        symbol: symbol.toUpperCase(),
        price,
        cumulative_score: cumulativeSignal,
        dominant_indicator: optimizedParameters && optimizedParameters['Analysis'] ? optimizedParameters['Analysis'] : null,
        strongest_signal: null,
        volatility: null,
        trend: null,
        indicator_json: indicators,
        news_json: newsSummary,
        horizon_json: optimizedParameters,
        relative_value_json: relativeValueAnalysis,
        ai_weights: aiWeights,
        ai_win_rates: aiWinRates,
        inserted_at: new Date().toISOString(),
      };

      await supabase
        .from('asset_daily_analysis')
        .upsert(assetDailyRow, {
          onConflict: 'asset,run_date',
        });

      return new Response(
        JSON.stringify({
          success: true,
          data: result[0],
          message: 'Watchlist asset updated successfully',
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

    if (req.method === 'GET') {
      return new Response(
        JSON.stringify({
          message: 'User Watchlist Webhook',
          version: '2.0 - Complete Rewrite',
          description: 'Parses full webhook data including JSON 1, 2, 8, 9, and Relative Value',
          usage: {
            endpoint: 'POST /user-watchlist-webhook',
            required_fields: {
              user_id: 'User UUID',
              symbol: 'Stock ticker symbol',
              name: 'Full asset name',
            },
            optional_fields: {
              'JSON 1': 'Indicator data (SMA, CCI, RSI, BOLL, MACD, ROC)',
              'JSON 2': 'Horizon forecast data (30d, 60d, 90d, 120d, 150d, 180d) OR AI weights',
              'JSON 8': 'News rundown and sources',
              'JSON 9': 'Optimized parameters and win rate',
              'Relative Value': 'Relative value analysis vs index',
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
