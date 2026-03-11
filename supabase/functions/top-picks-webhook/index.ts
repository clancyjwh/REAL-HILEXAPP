import { createClient } from 'npm:@supabase/supabase-js@2.57.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Info, Apikey, X-Webhook-Secret',
};

interface WebhookPayload {
  name: string;
  symbol: string;
  'JSON 1'?: string;
  'JSON 2'?: string;
  'JSON 8'?: string;
  'JSON 9'?: string;
  'Relative Value'?: string;
}

const tableMap = {
  crypto: 'crypto_top_picks',
  forex: 'forex_top_picks',
  stocks: 'stocks_top_picks',
  commodities: 'commodities_top_picks',
};

const nameFieldMap = {
  crypto: 'crypto_name',
  forex: 'pair_name',
  stocks: 'stock_name',
  commodities: 'commodity_name',
};

function detectAssetClass(symbol: string): 'crypto' | 'forex' | 'stocks' | 'commodities' | null {
  const cleanSymbol = symbol.replace(/\s*\(.*?\)\s*/g, '').trim();

  const cryptoSymbols = [
    'BTC', 'ETH', 'SOL', 'XRP', 'ADA', 'DOGE', 'DOT', 'MATIC', 'LINK', 'UNI',
    'AVAX', 'ATOM', 'LTC', 'BCH', 'XLM', 'ALGO', 'VET', 'ICP', 'FIL', 'TRX',
    'ETC', 'NEAR', 'HBAR', 'APT', 'ARB', 'OP', 'SUI', 'INJ', 'STX', 'TIA',
    'USDT', 'USDC', 'BUSD', 'DAI', 'TUSD', 'USDP', 'GUSD', 'USDD',
    'BNB', 'AXS', 'SAND', 'MANA', 'ENJ', 'GALA', 'CHZ', 'APE', 'SHIB',
    'PEPE', 'FLOKI', 'BONK'
  ];
  const commoditySymbols = ['XAU', 'XAG', 'OIL', 'GAS', 'GOLD', 'SILVER', 'COPPER', 'PLATINUM', 'PALLADIUM', 'CRUDE', 'WTI', 'BRENT', 'NG', 'HG1', 'W_1!'];

  // Extract base symbol (before '/' if it exists)
  const baseSymbol = cleanSymbol.split('/')[0].toUpperCase();

  // Check crypto first
  if (cryptoSymbols.includes(baseSymbol)) return 'crypto';

  // Check commodities before checking for '/'
  if (commoditySymbols.includes(baseSymbol)) return 'commodities';

  // If it has '/' and isn't crypto or commodity, it's forex
  if (cleanSymbol.includes('/')) return 'forex';

  return 'stocks';
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

function parseJSON2AIData(json2String: string) {
  try {
    const json2 = typeof json2String === 'string' ? JSON.parse(json2String) : json2String;

    const aiWinRates = {
      CCI: json2['cci win_rate'] || null,
      RSI: json2['rsi win_rate'] || null,
      SMA: json2['sma win_rate'] || null,
      BOLL: json2['boll win_rate'] || null,
    };

    const aiWeights = {
      CCI: json2['cci weight output'] || null,
      RSI: json2['rsi weight output'] || null,
      SMA: json2['sma weight output'] || null,
      BOLL: json2['boll weight output'] || null,
    };

    return {
      ai_win_rates: aiWinRates,
      ai_weights: aiWeights,
      correct_predictions: json2['correct predictions'] || null,
    };
  } catch (error) {
    console.error('Error parsing JSON 2 AI data:', error);
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

function determineDominantIndicator(indicators: any): string | null {
  if (!indicators) return null;

  const indicatorNames = ['SMA', 'CCI', 'RSI', 'BOLL', 'MACD', 'Rate_of_Change'];
  let maxSignal = -Infinity;
  let dominant = null;

  for (const name of indicatorNames) {
    if (indicators[name] && typeof indicators[name].signal === 'number') {
      const absSignal = Math.abs(indicators[name].signal);
      if (absSignal > maxSignal) {
        maxSignal = absSignal;
        dominant = name;
      }
    }
  }

  return dominant;
}

function determineStrongestSignal(indicators: any, dominantIndicator: string | null): string | null {
  if (!indicators || !dominantIndicator) return null;

  const signal = indicators[dominantIndicator]?.signal;
  if (typeof signal !== 'number') return null;

  if (signal > 5) return 'Strong Buy';
  if (signal > 0) return 'Buy';
  if (signal < -5) return 'Strong Sell';
  if (signal < 0) return 'Sell';
  return 'Neutral';
}

import { verifyWebhookAuth } from '../_shared/auth.ts';

Deno.serve(async (req: Request) => {
  const startTime = Date.now();
  
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

    // Get source IP and user agent for security logging
    const sourceIp = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown';
    const authenticated = true; // Since verifyWebhookAuth passed

    if (req.method === 'POST') {
      const rawBody = await req.text();
      const payloadSize = rawBody.length;
      const payload: WebhookPayload = JSON.parse(rawBody);

      const { name, symbol } = payload;

      if (!symbol || !name) {
        await supabase.rpc('log_webhook_call', {
          p_webhook_type: 'top_picks',
          p_source_ip: sourceIp,
          p_authenticated: authenticated,
          p_success: false,
          p_error_message: 'Missing required fields',
          p_payload_size: payloadSize,
          p_response_time_ms: Date.now() - startTime
        });

        return new Response(
          JSON.stringify({
            success: false,
            error: 'Missing required fields: symbol and name are required',
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
      let aiData = null;

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
        aiData = parseJSON2AIData(payload['JSON 2']);
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

      const assetClass = detectAssetClass(symbol);

      if (!assetClass) {
        await supabase.rpc('log_webhook_call', {
          p_webhook_type: 'top_picks',
          p_source_ip: sourceIp,
          p_authenticated: authenticated,
          p_success: false,
          p_error_message: 'Could not determine asset class',
          p_payload_size: payloadSize,
          p_response_time_ms: Date.now() - startTime
        });

        return new Response(
          JSON.stringify({
            success: false,
            error: 'Could not determine asset class',
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

      const tableName = tableMap[assetClass];
      const nameField = nameFieldMap[assetClass];

      const topPicksData = {
        symbol: symbol.toUpperCase(),
        [nameField]: name,
        signal: cumulativeSignal,
        price,
        date,
        roc_signal: rocSignal,
        roc_value: rocValue,
        indicators,
        rate_of_change: rateOfChange,
        summary: null,
        news_summary: newsSummary,
        optimized_parameters: optimizedParameters,
        relative_value_analysis: relativeValueAnalysis,
        raw_data: payload,
        updated_at: new Date().toISOString(),
      };

      const { data: result, error } = await supabase
        .from(tableName)
        .upsert(topPicksData, {
          onConflict: 'symbol',
        })
        .select();

      if (error) {
        await supabase.rpc('log_webhook_call', {
          p_webhook_type: 'top_picks',
          p_source_ip: sourceIp,
          p_authenticated: authenticated,
          p_success: false,
          p_error_message: error.message,
          p_payload_size: payloadSize,
          p_response_time_ms: Date.now() - startTime
        });

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

      const dominantIndicator = determineDominantIndicator(indicators);
      const strongestSignal = determineStrongestSignal(indicators, dominantIndicator);

      const dailyAnalysisData = {
        asset: symbol.toUpperCase(),
        symbol: symbol.toUpperCase(),
        run_date: date || new Date().toISOString().split('T')[0],
        price,
        cumulative_score: cumulativeSignal,
        dominant_indicator: dominantIndicator,
        strongest_signal: strongestSignal,
        volatility: null,
        trend: null,
        indicator_json: indicators,
        news_json: newsSummary,
        horizon_json: optimizedParameters,
        relative_value_json: relativeValueAnalysis,
        ai_weights: aiData?.ai_weights || null,
        ai_win_rates: aiData?.ai_win_rates || null,
        inserted_at: new Date().toISOString(),
      };

      const { error: dailyError } = await supabase
        .from('asset_daily_analysis')
        .insert(dailyAnalysisData);

      if (dailyError) {
        console.error('Error inserting into asset_daily_analysis:', dailyError.message);
      }

      // Log successful webhook call
      await supabase.rpc('log_webhook_call', {
        p_webhook_type: 'top_picks',
        p_source_ip: sourceIp,
        p_authenticated: authenticated,
        p_success: true,
        p_payload_size: payloadSize,
        p_response_time_ms: Date.now() - startTime
      });

      return new Response(
        JSON.stringify({
          success: true,
          data: result[0],
          asset_class: assetClass,
          message: 'Top pick updated successfully',
          daily_analysis_saved: !dailyError,
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
          message: 'Top Picks Webhook (Secured)',
          version: '5.0 - Security Enhanced',
          description: 'Parses webhook data with authentication, rate limiting, and audit logging',
          security_features: [
            'IP-based rate limiting (100 calls/hour per IP)',
            'Webhook secret authentication',
            'Comprehensive audit logging',
            'Request tracking and monitoring'
          ],
          usage: {
            endpoint: 'POST /top-picks-webhook',
            required_headers: {
              'X-Webhook-Secret': 'Your webhook secret key'
            },
            required_fields: {
              symbol: 'Stock ticker symbol',
              name: 'Full asset name',
            },
            optional_fields: {
              'JSON 1': 'Indicator data (SMA, CCI, RSI, BOLL, MACD, ROC)',
              'JSON 2': 'AI optimizer data (win rates and weights)',
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
        error: String(error),
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