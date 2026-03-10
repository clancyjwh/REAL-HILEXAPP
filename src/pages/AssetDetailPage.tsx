import { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation, Link } from 'react-router-dom';
import { ArrowLeft, Home, TrendingUp, TrendingDown, Activity, StopCircle, Zap, Brain, Loader2, CheckCircle, XCircle, Shield, AlertCircle, Newspaper } from 'lucide-react';
import { supabase } from '../lib/supabase';
import PerformanceByHorizon from '../components/PerformanceByHorizon';
import RelativeValueSection from '../components/RelativeValueSection';
import BacktestCards from '../components/BacktestCards';
import { calculateMarketSentiment } from '../utils/marketSentiment';
import { cleanMarkdown } from '../utils/textUtils';
import Disclaimer from '../components/Disclaimer';

interface AssetData {
  id: string;
  symbol: string;
  name: string;
  date?: string;
  price?: number;
  currency?: string;
  signal: number;
  roc_signal?: number;
  roc_value?: number;
  indicators?: any;
  rate_of_change?: any;
  raw_data?: any;
  summary?: {
    bullish_indicators?: string[];
    bearish_indicators?: string[];
    overall_sentiment?: string;
    comment?: string;
  };
  historical_performance?: any;
  news_summary?: string;
  optimized_parameters?: any;
  relative_value_analysis?: any;
  updated_at: string;
}

interface SupportResistanceLevel {
  'Support Price'?: string | null;
  'Support Score '?: string | null;
  'Resistance Price'?: string | null;
  'Resistance Score'?: string | null;
  'Support Win Rate'?: string | null;
  'Best Support Level'?: string | null;
  'Resistance Win Rate'?: string | null;
  'Support Average Move'?: string | null;
  'Best Resistance Level'?: string | null;
  'Resistance Average Move'?: string | null;
  'Support Distance Percentage'?: string | null;
  'Resistance Distance Percentage'?: string | null;
}

interface SupportResistanceResponse {
  Summary?: string;
  'AI Summary'?: string;
  'Support/Resistance 1'?: string;
  'Support/Resistance 2'?: string;
}

const tableMap: Record<string, string> = {
  crypto: 'crypto_top_picks',
  forex: 'forex_top_picks',
  stocks: 'stocks_top_picks',
  commodities: 'commodities_top_picks',
};

const nameFieldMap: Record<string, string> = {
  crypto: 'crypto_name',
  forex: 'pair_name',
  stocks: 'stock_name',
  commodities: 'commodity_name',
};

const getSignalLabel = (signal: number): string => {
  if (signal >= 7) return 'Highly Positive';
  if (signal >= 4) return 'Positive';
  if (signal >= 1) return 'Slightly Positive';
  if (signal > -1) return 'Neutral';
  if (signal >= -4) return 'Slightly Negative';
  if (signal >= -7) return 'Negative';
  return 'Highly Negative';
};

const getSignalColors = (signal: number) => {
  if (signal >= 9) return { bg: 'bg-[linear-gradient(145deg,#FFFDF5_0%,#FFF3CC_35%,#EBD48E_70%,#C9A43B_100%)] bg-[length:200%_200%] animate-[shimmer_4s_linear_infinite] shadow-[0_0_20px_rgba(201,164,59,0.8),0_0_40px_rgba(235,212,142,0.4),0_0_60px_rgba(255,253,245,0.2)]', border: 'border-yellow-400', text: 'text-black', fill: 'bg-yellow-500' };
  if (signal >= 7) return { bg: 'bg-green-900', border: 'border-green-700', text: 'text-green-300', fill: 'bg-green-500' };
  if (signal >= 4) return { bg: 'bg-green-700', border: 'border-green-600', text: 'text-green-200', fill: 'bg-green-400' };
  if (signal >= 1) return { bg: 'bg-green-500', border: 'border-green-400', text: 'text-green-100', fill: 'bg-green-300' };
  if (signal > -1) return { bg: 'bg-slate-600', border: 'border-slate-500', text: 'text-slate-200', fill: 'bg-slate-400' };
  if (signal >= -4) return { bg: 'bg-orange-500', border: 'border-orange-400', text: 'text-orange-100', fill: 'bg-orange-300' };
  if (signal >= -7) return { bg: 'bg-red-600', border: 'border-red-500', text: 'text-red-100', fill: 'bg-red-400' };
  if (signal <= -9) return { bg: 'bg-gradient-to-br from-red-900 to-red-950', border: 'border-red-600', text: 'text-red-200', fill: 'bg-red-700' };
  return { bg: 'bg-red-900', border: 'border-red-700', text: 'text-red-300', fill: 'bg-red-500' };
};

const formatDate = (dateString?: string): string => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

const formatPrice = (price?: number): string => {
  if (!price) return '';

  // Remove trailing zeros but keep at least 2 decimal places
  let formatted = price.toFixed(6);
  // Remove trailing zeros after decimal point
  formatted = formatted.replace(/(\.\d*?)0+$/, '$1');
  // If we end up with just a decimal point, remove it
  formatted = formatted.replace(/\.$/, '');
  // Ensure we have at least 2 decimal places
  const parts = formatted.split('.');
  if (parts.length === 1) {
    formatted = formatted + '.00';
  } else if (parts[1].length === 1) {
    formatted = formatted + '0';
  }

  // Add thousand separators for prices >= 1000
  if (price >= 1000) {
    const [intPart, decPart] = formatted.split('.');
    const withCommas = parseInt(intPart).toLocaleString();
    formatted = decPart ? `${withCommas}.${decPart}` : withCommas;
  }

  return `$${formatted}`;
};

const formatDateTime = (timestamp: string): { date: string; time: string } => {
  const date = new Date(timestamp);
  const options: Intl.DateTimeFormatOptions = {
    timeZone: 'America/New_York',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  };
  const timeOptions: Intl.DateTimeFormatOptions = {
    timeZone: 'America/New_York',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  };
  return {
    date: date.toLocaleDateString('en-US', options),
    time: date.toLocaleTimeString('en-US', timeOptions) + ' ET',
  };
};


const calculateAverageSignal = (asset: AssetData): number => {
  if (asset.signal !== undefined && asset.signal !== null) {
    return asset.signal;
  }

  const signals: number[] = [];

  if (asset.roc_signal !== undefined) signals.push(asset.roc_signal);

  if (asset.indicators) {
    Object.values(asset.indicators).forEach((indicator: any) => {
      if (indicator.signal !== undefined) {
        signals.push(indicator.signal);
      }
    });
  }

  if (signals.length === 0) return 0;

  const sum = signals.reduce((acc, val) => acc + val, 0);
  return sum / signals.length;
};

export default function AssetDetailPage() {
  const { category, symbol } = useParams<{ category: string; symbol: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const [asset, setAsset] = useState<AssetData | null>(null);
  const [loading, setLoading] = useState(true);
  const [aiVerdictLoading, setAiVerdictLoading] = useState(false);
  const [aiVerdictResult, setAiVerdictResult] = useState<string | null>(null);
  const [supportResistanceLoading, setSupportResistanceLoading] = useState(false);
  const [supportResistanceResult, setSupportResistanceResult] = useState<string | null>(null);

  const isWatchlistRoute = location.pathname.startsWith('/watchlist/');

  useEffect(() => {
    if (!symbol) return;

    fetchAssetData();
  }, [category, symbol, isWatchlistRoute]);

  useEffect(() => {
    if (!symbol || !asset) return;

    const storageKey = `sr-result-${symbol.toUpperCase()}`;
    const returnToSR = location.state?.returnToSupportResistance;

    if (returnToSR) {
      const stored = sessionStorage.getItem(storageKey);
      if (stored) {
        setSupportResistanceResult(stored);
      }
    }
  }, [symbol, asset, location.state]);

  const fetchAssetData = async () => {
    if (!symbol) return;

    if (isWatchlistRoute) {
      await fetchFromWatchlist();
      return;
    }

    if (!category) return;

    const tableName = tableMap[category];
    if (!tableName) return;

    try {
      const decodedSymbol = decodeURIComponent(symbol);

      // First, try to fetch from the category-specific table (top picks)
      const { data, error } = await supabase
        .from(tableName)
        .select('*')
        .eq('symbol', decodedSymbol.toUpperCase())
        .maybeSingle();

      if (error) throw error;

      if (data) {
        const nameField = nameFieldMap[category];

        let newsText = null;
        let extractedIndicators = data.indicators;
        let extractedOptimizedParams = data.optimized_parameters;
        let extractedPrice = data.price;
        let extractedCurrency = data.currency;
        let extractedRocSignal = data.roc_signal;
        let extractedRocValue = data.roc_value;
        let extractedHistoricalPerformance = data.historical_performance;

        // Extract from raw_data if columns are null/empty
        if (data.raw_data) {
          try {
            // Extract indicators from JSON 1 if not already populated
            if (!extractedIndicators && data.raw_data['JSON 1']) {
              const json1 = typeof data.raw_data['JSON 1'] === 'string'
                ? JSON.parse(data.raw_data['JSON 1'])
                : data.raw_data['JSON 1'];

              if (!extractedPrice && json1['Price']) {
                extractedPrice = parseFloat(json1['Price']);
              }
              if (!extractedCurrency && json1['Currency']) {
                extractedCurrency = json1['Currency'];
              }
              if (!extractedRocSignal && json1['ROC Signal']) {
                extractedRocSignal = parseFloat(json1['ROC Signal']);
              }
              if (!extractedRocValue && json1['Current ROC']) {
                extractedRocValue = parseFloat(json1['Current ROC']);
              }

              const indicators: any = {};
              if (json1['SMA Signal'] !== undefined) indicators.SMA = { signal: parseFloat(json1['SMA Signal']) };
              if (json1['CCI Signal'] !== undefined) indicators.CCI = { signal: parseFloat(json1['CCI Signal']) };
              if (json1['RSI Signal'] !== undefined) indicators.RSI = { signal: parseFloat(json1['RSI Signal']) };
              if (json1['Boll Signal'] !== undefined) indicators.Bollinger = { signal: parseFloat(json1['Boll Signal']) };
              if (json1['MACD Signal'] !== undefined) indicators.MACD = { signal: parseFloat(json1['MACD Signal']) };
              if (json1['ROC Signal'] !== undefined) indicators.Rate_of_Change = { signal: parseFloat(json1['ROC Signal']) };

              if (Object.keys(indicators).length > 0) {
                extractedIndicators = indicators;
              }
            }

            // Extract news from JSON 8 if not already populated
            if (!data.news_summary && data.raw_data['JSON 8']) {
              const json8 = typeof data.raw_data['JSON 8'] === 'string'
                ? JSON.parse(data.raw_data['JSON 8'])
                : data.raw_data['JSON 8'];
              newsText = json8['Rundown'] || null;
            }

            // Extract optimized parameters from JSON 9 if not already populated
            if (!extractedOptimizedParams && data.raw_data['JSON 9']) {
              extractedOptimizedParams = typeof data.raw_data['JSON 9'] === 'string'
                ? JSON.parse(data.raw_data['JSON 9'])
                : data.raw_data['JSON 9'];
            }

            // Extract historical performance from JSON 2 if not already populated
            if (!extractedHistoricalPerformance && data.raw_data['JSON 2']) {
              extractedHistoricalPerformance = data.raw_data['JSON 2'];
            }
          } catch (e) {
            console.error('Error extracting data from raw_data:', e);
          }
        }

        // Always extract news_summary properly, whether from column or raw_data
        if (!newsText && data.news_summary) {
          if (typeof data.news_summary === 'string') {
            newsText = data.news_summary;
          } else if (data.news_summary.rundown) {
            newsText = data.news_summary.rundown;
          }
        }

        setAsset({
          id: data.id,
          symbol: data.symbol,
          name: data[nameField],
          date: data.date,
          price: extractedPrice,
          currency: extractedCurrency,
          signal: parseFloat(data.signal),
          roc_signal: extractedRocSignal ? parseFloat(extractedRocSignal) : undefined,
          roc_value: extractedRocValue ? parseFloat(extractedRocValue) : undefined,
          indicators: extractedIndicators,
          rate_of_change: data.rate_of_change,
          raw_data: data.raw_data,
          summary: data.summary,
          historical_performance: extractedHistoricalPerformance,
          news_summary: newsText,
          optimized_parameters: extractedOptimizedParams,
          relative_value_analysis: data.relative_value_analysis,
          updated_at: data.updated_at,
        });
      } else {
        // If not found in top picks, try fetching from user_watchlist
        const { data: watchlistData, error: watchlistError } = await supabase
          .from('user_watchlist')
          .select('*')
          .eq('symbol', decodedSymbol.toUpperCase())
          .maybeSingle();

        if (watchlistError) throw watchlistError;

        if (watchlistData) {
          // Extract data from detailed_signal_data
          let extractedData: any = {};
          if (watchlistData.detailed_signal_data) {
            try {
              const detailedData = typeof watchlistData.detailed_signal_data === 'string'
                ? JSON.parse(watchlistData.detailed_signal_data)
                : watchlistData.detailed_signal_data;

              if (detailedData['JSON 1']) {
                const json1 = typeof detailedData['JSON 1'] === 'string'
                  ? JSON.parse(detailedData['JSON 1'])
                  : detailedData['JSON 1'];

                extractedData.price = json1['Price'] ? parseFloat(json1['Price']) : undefined;
                extractedData.currency = json1['Currency'] || undefined;
                extractedData.roc_signal = json1['ROC Signal'] ? parseFloat(json1['ROC Signal']) : undefined;
                extractedData.roc_value = json1['Current ROC'] ? parseFloat(json1['Current ROC']) : undefined;
                extractedData.date = json1['Date'] || undefined;

                // Extract indicators
                const indicators: any = {};
                if (json1['Signal SMA'] !== undefined) indicators.SMA = { signal: parseFloat(json1['Signal SMA']) };
                if (json1['Signal CCI'] !== undefined) indicators.CCI = { signal: parseFloat(json1['Signal CCI']) };
                if (json1['Signal RSI'] !== undefined) indicators.RSI = { signal: parseFloat(json1['Signal RSI']) };
                if (json1['Signal BOLL'] !== undefined) indicators.BOLL = { signal: parseFloat(json1['Signal BOLL']) };
                if (json1['Signal MACD'] !== undefined) indicators.MACD = { signal: parseFloat(json1['Signal MACD']) };
                if (json1['ROC Signal'] !== undefined) indicators.Rate_of_Change = { signal: parseFloat(json1['ROC Signal']) };

                if (Object.keys(indicators).length > 0) {
                  extractedData.indicators = indicators;
                }
              }

              if (detailedData['JSON 2']) {
                extractedData.historical_performance = detailedData['JSON 2'];
              }

              if (detailedData['JSON 8']) {
                const json8 = typeof detailedData['JSON 8'] === 'string'
                  ? JSON.parse(detailedData['JSON 8'])
                  : detailedData['JSON 8'];
                extractedData.news_summary = json8['Rundown'] || null;
              }

              if (detailedData['JSON 9']) {
                extractedData.optimized_parameters = typeof detailedData['JSON 9'] === 'string'
                  ? JSON.parse(detailedData['JSON 9'])
                  : detailedData['JSON 9'];
              }

              extractedData.raw_data = detailedData;
            } catch (parseError) {
              console.error('Error parsing watchlist detailed data:', parseError);
            }
          }

          setAsset({
            id: watchlistData.id,
            symbol: watchlistData.symbol,
            name: watchlistData.name,
            date: extractedData.date,
            price: extractedData.price,
            currency: extractedData.currency,
            signal: watchlistData.score || 0,
            roc_signal: extractedData.roc_signal,
            roc_value: extractedData.roc_value,
            indicators: extractedData.indicators,
            rate_of_change: undefined,
            raw_data: extractedData.raw_data,
            summary: undefined,
            historical_performance: extractedData.historical_performance,
            news_summary: extractedData.news_summary,
            optimized_parameters: extractedData.optimized_parameters,
            updated_at: watchlistData.last_updated || watchlistData.created_at,
          });
        }
      }
    } catch (error) {
      console.error('Error fetching asset data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchFromWatchlist = async () => {
    if (!symbol) return;

    try {
      const decodedSymbol = decodeURIComponent(symbol);

      const { data, error } = await supabase
        .from('user_watchlist')
        .select('*')
        .eq('symbol', decodedSymbol.toUpperCase())
        .maybeSingle();

      if (error) throw error;

      if (data) {
        let newsText = null;
        if (data.news_summary) {
          if (typeof data.news_summary === 'string') {
            newsText = data.news_summary;
          } else if (data.news_summary.rundown) {
            newsText = data.news_summary.rundown;
          }
        }

        setAsset({
          id: data.id,
          symbol: data.symbol,
          name: data.name,
          date: data.date,
          price: data.price ? parseFloat(data.price) : undefined,
          currency: data.currency,
          signal: data.signal ? parseFloat(data.signal) : 0,
          roc_signal: data.roc_signal ? parseFloat(data.roc_signal) : undefined,
          roc_value: data.roc_value ? parseFloat(data.roc_value) : undefined,
          indicators: data.indicators,
          rate_of_change: data.rate_of_change,
          raw_data: data.raw_data,
          summary: data.summary,
          historical_performance: data.historical_performance,
          news_summary: newsText,
          optimized_parameters: data.optimized_parameters,
          relative_value_analysis: data.relative_value_analysis,
          updated_at: data.last_updated || data.created_at,
        });
      }
    } catch (error) {
      console.error('Error fetching watchlist asset data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAiVerdict = async () => {
    if (!asset) return;

    setAiVerdictLoading(true);

    try {
      const payload = {
        symbol: asset.symbol,
        name: asset.name,
        category: category,
        date: asset.date,
        price: asset.price,
        signal_strength: averageSignal,
        signal_label: getSignalLabel(averageSignal),
        market_sentiment: sentiment.label,
        roc_signal: asset.roc_signal,
        roc_value: asset.roc_value,
        indicators: asset.indicators,
        rate_of_change: asset.rate_of_change,
        historical_performance: asset.historical_performance,
        raw_data: asset.raw_data,
        summary: asset.summary,
        news_summary: asset.news_summary,
        optimized_parameters: asset.optimized_parameters,
        updated_at: asset.updated_at
      };

      const response = await fetch('https://hook.us2.make.com/oi4pvx41x7m83pvn9dncecn7nbf1x8jp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const text = await response.text();
      const cleanedText = text.replace(/\*/g, '');
      setAiVerdictResult(cleanedText);
    } catch (error) {
      console.error('Error fetching AI verdict:', error);
      setAiVerdictResult('Error: Failed to fetch AI verdict. Please try again.');
    } finally {
      setAiVerdictLoading(false);
    }
  };

  const handleSupportResistance = async () => {
    if (!asset) return;

    setSupportResistanceLoading(true);
    setSupportResistanceResult(null);

    try {
      const payload = {
        symbol: asset.symbol,
        name: asset.name,
        category: category,
        date: asset.date,
        price: asset.price,
        signal: asset.signal,
        roc_signal: asset.roc_signal,
        roc_value: asset.roc_value,
        indicators: asset.indicators,
        rate_of_change: asset.rate_of_change,
        historical_performance: asset.historical_performance,
        raw_data: asset.raw_data,
        summary: asset.summary,
        news_summary: asset.news_summary,
        optimized_parameters: asset.optimized_parameters,
        updated_at: asset.updated_at
      };

      const response = await fetch('https://hook.us2.make.com/rd8evkxibks74xdfiij2591q52xjjfvp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const text = await response.text();
      let resultData: string;
      try {
        const jsonData = JSON.parse(text);
        resultData = JSON.stringify(jsonData);
      } catch {
        resultData = text.replace(/\*/g, '');
      }

      setSupportResistanceResult(resultData);

      if (symbol) {
        const storageKey = `sr-result-${symbol.toUpperCase()}`;
        sessionStorage.setItem(storageKey, resultData);
      }
    } catch (error) {
      console.error('Error fetching support/resistance:', error);
      setSupportResistanceResult('Error: Failed to calculate support/resistance. Please try again.');
    } finally {
      setSupportResistanceLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-white text-xl">Loading asset details...</div>
      </div>
    );
  }

  if (!asset) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-slate-400 text-xl">Asset not found</div>
      </div>
    );
  }

  const averageSignal = calculateAverageSignal(asset);
  const colors = getSignalColors(averageSignal);
  const sentiment = calculateMarketSentiment(averageSignal);
  const signalPercent = ((averageSignal + 10) / 20) * 100;

  const getLivePrice = (): number | null => {
    try {
      if (!asset.raw_data) {
        return null;
      }

      const rawData = typeof asset.raw_data === 'string'
        ? JSON.parse(asset.raw_data)
        : asset.raw_data;

      if (rawData['Live Price']) {
        const livePrice = rawData['Live Price'];
        const parsed = typeof livePrice === 'string' ? parseFloat(livePrice) : livePrice;
        return isNaN(parsed) ? null : parsed;
      }
    } catch (error) {
      console.error('Error parsing Live Price:', error);
    }
    return null;
  };

  const livePrice = getLivePrice();

  const getBacktestData = (): Record<string, string> => {
    try {
      const json9Data = asset.optimized_parameters || (asset.raw_data?.['JSON 9'] ?
        (typeof asset.raw_data['JSON 9'] === 'string' ? JSON.parse(asset.raw_data['JSON 9']) : asset.raw_data['JSON 9'])
        : null);

      if (json9Data) {
        const backtestData: Record<string, string> = {};
        ['30', '60', '90', '120', '150', '180', '210', '240', '270', '300', '330', '360'].forEach(key => {
          if (json9Data[key]) {
            backtestData[key] = json9Data[key];
          }
        });

        return backtestData;
      }
    } catch (error) {
      console.error('Error parsing optimized_parameters data:', error);
    }
    return {};
  };

  if (aiVerdictLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh]">
        <Loader2 className="w-20 h-20 text-purple-500 animate-spin mb-6" />
        <h2 className="text-3xl font-bold text-white mb-3">Generating Indicator Summary...</h2>
        <p className="text-slate-400 text-lg">Analyzing all available data and market conditions</p>
        <div className="mt-8 flex gap-2">
          <div className="w-3 h-3 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
          <div className="w-3 h-3 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
          <div className="w-3 h-3 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
        </div>
      </div>
    );
  }

  if (supportResistanceLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh]">
        <Loader2 className="w-20 h-20 text-red-500 animate-spin mb-6" />
        <h2 className="text-3xl font-bold text-white mb-3">Calculating Support/Resistance...</h2>
        <p className="text-slate-400 text-lg">Analyzing price levels and market structure</p>
        <div className="mt-8 flex gap-2">
          <div className="w-3 h-3 bg-red-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
          <div className="w-3 h-3 bg-red-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
          <div className="w-3 h-3 bg-red-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
        </div>
      </div>
    );
  }

  if (aiVerdictResult) {
    // Extract live price from the result text
    const extractLivePrice = (text: string): string | null => {
      const match = text.match(/Live Price:\s*([\d.]+)/i);
      return match ? match[1] : null;
    };

    const livePriceValue = extractLivePrice(aiVerdictResult);
    const displayText = aiVerdictResult.replace(/Live Price:\s*[\d.]+\s*/gi, '').trim();

    return (
      <div className="min-h-screen pb-12">
        <button
          onClick={() => setAiVerdictResult(null)}
          className="flex items-center gap-2 text-slate-400 hover:text-white mb-6 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back to {asset.symbol}</span>
        </button>

        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-purple-500/10 rounded-xl">
              <Brain className="w-8 h-8 text-purple-500" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-white">Indicator Summary</h1>
              <p className="text-slate-400">{asset.symbol} - {asset.name}</p>
            </div>
          </div>
        </div>

        <div className="max-w-5xl">
          <div className="bg-gradient-to-br from-purple-900/40 to-slate-900/60 border-2 border-purple-500/50 rounded-2xl p-8 shadow-2xl relative">
            {/* Live Price Box */}
            {livePriceValue && (
              <div className="absolute top-6 right-6 bg-slate-900/90 border-2 border-cyan-500/60 rounded-lg px-4 py-3 shadow-lg backdrop-blur-sm">
                <div className="text-slate-400 text-xs font-medium mb-1">Live Price</div>
                <div className="text-cyan-400 text-2xl font-bold font-mono">${livePriceValue}</div>
              </div>
            )}

            <div className="prose prose-invert max-w-none">
              <div className="text-slate-200 text-lg leading-relaxed whitespace-pre-wrap">
                {displayText}
              </div>
            </div>
          </div>

          <div className="flex gap-4 mt-8">
            <button
              onClick={() => setAiVerdictResult(null)}
              className="flex-1 px-6 py-4 bg-purple-600 hover:bg-purple-700 text-white font-bold text-lg rounded-xl transition-colors shadow-lg"
            >
              Back to Asset Details
            </button>
            <button
              onClick={() => navigate(location.state?.from === 'watchlist' ? '/my-watchlist' : '/')}
              className="flex-1 px-6 py-4 bg-slate-800 hover:bg-slate-700 border border-slate-600 text-white font-medium text-lg rounded-xl transition-colors"
            >
              Back to {location.state?.from === 'watchlist' ? 'My Watchlist' : 'Home'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (supportResistanceResult) {
    const parseSupportResistanceLevel = (jsonString: string): SupportResistanceLevel | null => {
      try {
        if (!jsonString || jsonString.toLowerCase() === 'null' || jsonString.toLowerCase() === 'empty') {
          return null;
        }
        return JSON.parse(jsonString);
      } catch (error) {
        console.error('Error parsing support/resistance level:', error);
        return null;
      }
    };

    const formatSRPrice = (value: any): string => {
      if (value === null || value === undefined || value === '' || value === 'N/A' || value === 'null') return 'N/A';
      const num = typeof value === 'string' ? parseFloat(value) : value;
      if (isNaN(num)) return 'N/A';
      return `$${num.toFixed(6)}`;
    };

    const formatSRValue = (value: any): string => {
      if (value === null || value === undefined || value === '' || value === 'N/A' || value === 'null' || value === '%') return 'No Data Found';
      const strValue = String(value);
      const num = parseFloat(strValue);
      if (!isNaN(num)) {
        return num.toFixed(2);
      }
      return strValue;
    };

    const hasValidData = (level: SupportResistanceLevel | null, type: 'support' | 'resistance'): boolean => {
      if (!level) return false;
      const priceKey = type === 'support' ? 'Support Price' : 'Resistance Price';
      const price = level[priceKey];
      return !!(price && price !== '' && price !== 'N/A' && price !== 'null' && price !== '0' && price !== null);
    };

    let responseData: SupportResistanceResponse | null = null;
    let isError = false;

    try {
      responseData = JSON.parse(supportResistanceResult);
    } catch {
      isError = true;
    }

    return (
      <div className="min-h-screen pb-12">
        <button
          onClick={() => {
            setSupportResistanceResult(null);
            if (symbol) {
              const storageKey = `sr-result-${symbol.toUpperCase()}`;
              sessionStorage.removeItem(storageKey);
            }
          }}
          className="flex items-center gap-2 text-slate-400 hover:text-white mb-6 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back to {asset.symbol}</span>
        </button>

        <div className="mb-8">
          <div className="flex items-start justify-between gap-6 mb-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-red-500/10 rounded-xl">
                <Activity className="w-8 h-8 text-red-500" />
              </div>
              <div>
                <h1 className="text-4xl font-bold text-white">Support & Resistance Analysis</h1>
                <p className="text-slate-400">{asset.symbol} - {asset.name}</p>
                <p className="text-amber-400 text-sm mt-1 italic">Caution: Support/resistance levels might be outdated. Always check current price for discrepancies.</p>
              </div>
            </div>
            {responseData?.['Live Price'] && (
              <div className="bg-gradient-to-br from-cyan-900/40 to-slate-900/60 border-2 border-cyan-500/50 rounded-xl p-6 min-w-[200px]">
                <div className="text-cyan-400 text-sm font-medium mb-1">Live Price</div>
                <div className="text-white text-3xl font-bold">
                  ${parseFloat(responseData['Live Price']).toFixed(6)}
                </div>
              </div>
            )}
          </div>
        </div>

        {isError || !responseData ? (
          <div className="max-w-5xl">
            <div className="bg-gradient-to-br from-red-900/40 to-slate-900/60 border-2 border-red-500/50 rounded-2xl p-8 shadow-2xl">
              <div className="prose prose-invert max-w-none">
                <div className="text-slate-200 text-lg leading-relaxed whitespace-pre-wrap">
                  {supportResistanceResult}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {(responseData.Summary || responseData['AI Summary']) && (
              <div className="bg-gradient-to-br from-slate-900/80 to-slate-800/60 border-2 border-slate-700 rounded-2xl p-8 shadow-xl">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-slate-700 rounded-lg">
                    <AlertCircle className="w-6 h-6 text-slate-300" />
                  </div>
                  <h3 className="text-2xl font-bold text-white">Summary</h3>
                </div>
                <div className="space-y-4">
                  {responseData.Summary && (
                    <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700">
                      <p className="text-slate-200 text-lg leading-relaxed">
                        {responseData.Summary}
                      </p>
                    </div>
                  )}
                  {responseData['AI Summary'] && (
                    <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700">
                      <div className="text-cyan-400 font-semibold mb-2">AI Summary</div>
                      <p className="text-slate-200 text-lg leading-relaxed">
                        {responseData['AI Summary']}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            <div id="support-resistance-section" className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {responseData['Support/Resistance 1'] && (() => {
                const level1 = parseSupportResistanceLevel(responseData['Support/Resistance 1']!);
                const hasSupportData = hasValidData(level1, 'support');

                return (
                  <>
                    <div className="bg-gradient-to-br from-green-900/40 to-green-800/30 border-2 border-green-600/50 rounded-2xl p-6 shadow-xl">
                      <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 bg-green-500/20 rounded-lg">
                          <Shield className="w-6 h-6 text-green-400" />
                        </div>
                        <h3 className="text-xl font-bold text-white">Support Level 1</h3>
                      </div>

                      {!hasSupportData ? (
                        <div className="flex items-center justify-center py-12">
                          <p className="text-slate-400 text-2xl font-semibold">Not Found</p>
                        </div>
                      ) : (
                        <>
                          <Link to="/metric-definition?metric=support-price" state={{ from: location.pathname, returnToSupportResistance: true }} className="block bg-slate-900/60 rounded-xl p-4 mb-4 hover:bg-slate-900/90 hover:scale-[1.02] hover:shadow-lg hover:shadow-green-500/20 transition-all cursor-pointer">
                            <div className="text-green-300 text-sm mb-2">Support Price</div>
                            <div className="text-white text-3xl font-bold">{formatSRPrice(level1!['Support Price'])}</div>
                          </Link>

                          <div className="grid grid-cols-2 gap-4">
                            <Link to="/metric-definition?metric=score" state={{ from: location.pathname, returnToSupportResistance: true }} className="bg-slate-900/40 rounded-lg p-4 hover:bg-slate-900/80 hover:scale-105 hover:shadow-lg hover:shadow-green-500/20 transition-all cursor-pointer">
                              <div className="text-green-300 text-xs mb-1">Score</div>
                              <div className="text-white text-xl font-bold">{formatSRValue(level1!['Support Score '])}</div>
                            </Link>
                            <Link to="/metric-definition?metric=historical-accuracy" state={{ from: location.pathname, returnToSupportResistance: true }} className="bg-slate-900/40 rounded-lg p-4 hover:bg-slate-900/80 hover:scale-105 hover:shadow-lg hover:shadow-green-500/20 transition-all cursor-pointer">
                              <div className="text-green-300 text-xs mb-1">Historical Accuracy Rate</div>
                              <div className="text-white text-xl font-bold">{formatSRValue(level1!['Support Win Rate'])}</div>
                            </Link>
                            <Link to="/metric-definition?metric=average-move" state={{ from: location.pathname, returnToSupportResistance: true }} className="bg-slate-900/40 rounded-lg p-4 hover:bg-slate-900/80 hover:scale-105 hover:shadow-lg hover:shadow-green-500/20 transition-all cursor-pointer">
                              <div className="text-green-300 text-xs mb-1">Avg Move</div>
                              <div className="text-white text-xl font-bold">{formatSRValue(level1!['Support Average Move'])}</div>
                            </Link>
                            <Link to="/metric-definition?metric=distance" state={{ from: location.pathname, returnToSupportResistance: true }} className="bg-slate-900/40 rounded-lg p-4 hover:bg-slate-900/80 hover:scale-105 hover:shadow-lg hover:shadow-green-500/20 transition-all cursor-pointer">
                              <div className="text-green-300 text-xs mb-1">Distance</div>
                              <div className="text-white text-xl font-bold">{formatSRValue(level1!['Support Distance Percentage'])}</div>
                            </Link>
                          </div>
                          {level1!['Best Support Level'] && level1!['Best Support Level'] !== 'null' && (
                            <div className="mt-4 bg-green-900/30 rounded-lg p-3">
                              <div className="text-green-300 text-xs mb-1">Best Support Level</div>
                              <div className="text-white text-sm">{level1!['Best Support Level']}</div>
                            </div>
                          )}
                        </>
                      )}
                    </div>

                    <div className="bg-gradient-to-br from-red-900/40 to-red-800/30 border-2 border-red-600/50 rounded-2xl p-6 shadow-xl">
                      <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 bg-red-500/20 rounded-lg">
                          <TrendingUp className="w-6 h-6 text-red-400" />
                        </div>
                        <h3 className="text-xl font-bold text-white">Resistance Level 1</h3>
                      </div>

                      {!hasValidData(level1, 'resistance') ? (
                        <div className="flex items-center justify-center py-12">
                          <p className="text-slate-400 text-2xl font-semibold">Not Found</p>
                        </div>
                      ) : (
                        <>
                          <Link to="/metric-definition?metric=resistance-price" state={{ from: location.pathname, returnToSupportResistance: true }} className="block bg-slate-900/60 rounded-xl p-4 mb-4 hover:bg-slate-900/90 hover:scale-[1.02] hover:shadow-lg hover:shadow-red-500/20 transition-all cursor-pointer">
                            <div className="text-red-300 text-sm mb-2">Resistance Price</div>
                            <div className="text-white text-3xl font-bold">{formatSRPrice(level1!['Resistance Price'])}</div>
                          </Link>

                          <div className="grid grid-cols-2 gap-4">
                            <Link to="/metric-definition?metric=score" state={{ from: location.pathname, returnToSupportResistance: true }} className="bg-slate-900/40 rounded-lg p-4 hover:bg-slate-900/80 hover:scale-105 hover:shadow-lg hover:shadow-red-500/20 transition-all cursor-pointer">
                              <div className="text-red-300 text-xs mb-1">Score</div>
                              <div className="text-white text-xl font-bold">{formatSRValue(level1!['Resistance Score'])}</div>
                            </Link>
                            <Link to="/metric-definition?metric=historical-accuracy" state={{ from: location.pathname, returnToSupportResistance: true }} className="bg-slate-900/40 rounded-lg p-4 hover:bg-slate-900/80 hover:scale-105 hover:shadow-lg hover:shadow-red-500/20 transition-all cursor-pointer">
                              <div className="text-red-300 text-xs mb-1">Historical Accuracy Rate</div>
                              <div className="text-white text-xl font-bold">{formatSRValue(level1!['Resistance Win Rate'])}</div>
                            </Link>
                            <Link to="/metric-definition?metric=average-move" state={{ from: location.pathname, returnToSupportResistance: true }} className="bg-slate-900/40 rounded-lg p-4 hover:bg-slate-900/80 hover:scale-105 hover:shadow-lg hover:shadow-red-500/20 transition-all cursor-pointer">
                              <div className="text-red-300 text-xs mb-1">Avg Move</div>
                              <div className="text-white text-xl font-bold">{formatSRValue(level1!['Resistance Average Move'])}</div>
                            </Link>
                            <Link to="/metric-definition?metric=distance" state={{ from: location.pathname, returnToSupportResistance: true }} className="bg-slate-900/40 rounded-lg p-4 hover:bg-slate-900/80 hover:scale-105 hover:shadow-lg hover:shadow-red-500/20 transition-all cursor-pointer">
                              <div className="text-red-300 text-xs mb-1">Distance</div>
                              <div className="text-white text-xl font-bold">{formatSRValue(level1!['Resistance Distance Percentage'])}</div>
                            </Link>
                          </div>
                          {level1!['Best Resistance Level'] && level1!['Best Resistance Level'] !== 'null' && (
                            <div className="mt-4 bg-red-900/30 rounded-lg p-3">
                              <div className="text-red-300 text-xs mb-1">Best Resistance Level</div>
                              <div className="text-white text-sm">{level1!['Best Resistance Level']}</div>
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  </>
                );
              })()}

              {responseData['Support/Resistance 2'] && (() => {
                const level2 = parseSupportResistanceLevel(responseData['Support/Resistance 2']!);
                if (!level2) return null;
                const hasSupportData2 = hasValidData(level2, 'support');

                return (
                  <>
                    <div className="bg-gradient-to-br from-green-900/40 to-green-800/30 border-2 border-green-600/50 rounded-2xl p-6 shadow-xl">
                      <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 bg-green-500/20 rounded-lg">
                          <Shield className="w-6 h-6 text-green-400" />
                        </div>
                        <h3 className="text-xl font-bold text-white">Support Level 2</h3>
                      </div>

                      {!hasSupportData2 ? (
                        <div className="flex items-center justify-center py-12">
                          <p className="text-slate-400 text-2xl font-semibold">Not Found</p>
                        </div>
                      ) : (
                        <>
                          <Link to="/metric-definition?metric=support-price" state={{ from: location.pathname, returnToSupportResistance: true }} className="block bg-slate-900/60 rounded-xl p-4 mb-4 hover:bg-slate-900/90 hover:scale-[1.02] hover:shadow-lg hover:shadow-green-500/20 transition-all cursor-pointer">
                            <div className="text-green-300 text-sm mb-2">Support Price</div>
                            <div className="text-white text-3xl font-bold">{formatSRPrice(level2['Support Price'])}</div>
                          </Link>

                          <div className="grid grid-cols-2 gap-4">
                            <Link to="/metric-definition?metric=score" state={{ from: location.pathname, returnToSupportResistance: true }} className="bg-slate-900/40 rounded-lg p-4 hover:bg-slate-900/80 hover:scale-105 hover:shadow-lg hover:shadow-green-500/20 transition-all cursor-pointer">
                              <div className="text-green-300 text-xs mb-1">Score</div>
                              <div className="text-white text-xl font-bold">{formatSRValue(level2['Support Score '])}</div>
                            </Link>
                            <Link to="/metric-definition?metric=historical-accuracy" state={{ from: location.pathname, returnToSupportResistance: true }} className="bg-slate-900/40 rounded-lg p-4 hover:bg-slate-900/80 hover:scale-105 hover:shadow-lg hover:shadow-green-500/20 transition-all cursor-pointer">
                              <div className="text-green-300 text-xs mb-1">Historical Accuracy Rate</div>
                              <div className="text-white text-xl font-bold">{formatSRValue(level2['Support Win Rate'])}</div>
                            </Link>
                            <Link to="/metric-definition?metric=average-move" state={{ from: location.pathname, returnToSupportResistance: true }} className="bg-slate-900/40 rounded-lg p-4 hover:bg-slate-900/80 hover:scale-105 hover:shadow-lg hover:shadow-green-500/20 transition-all cursor-pointer">
                              <div className="text-green-300 text-xs mb-1">Avg Move</div>
                              <div className="text-white text-xl font-bold">{formatSRValue(level2['Support Average Move'])}</div>
                            </Link>
                            <Link to="/metric-definition?metric=distance" state={{ from: location.pathname, returnToSupportResistance: true }} className="bg-slate-900/40 rounded-lg p-4 hover:bg-slate-900/80 hover:scale-105 hover:shadow-lg hover:shadow-green-500/20 transition-all cursor-pointer">
                              <div className="text-green-300 text-xs mb-1">Distance</div>
                              <div className="text-white text-xl font-bold">{formatSRValue(level2['Support Distance Percentage'])}</div>
                            </Link>
                          </div>
                          {level2['Best Support Level'] && level2['Best Support Level'] !== 'null' && (
                            <div className="mt-4 bg-green-900/30 rounded-lg p-3">
                              <div className="text-green-300 text-xs mb-1">Best Support Level</div>
                              <div className="text-white text-sm">{level2['Best Support Level']}</div>
                            </div>
                          )}
                        </>
                      )}
                    </div>

                    <div className="bg-gradient-to-br from-red-900/40 to-red-800/30 border-2 border-red-600/50 rounded-2xl p-6 shadow-xl">
                      <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 bg-red-500/20 rounded-lg">
                          <TrendingUp className="w-6 h-6 text-red-400" />
                        </div>
                        <h3 className="text-xl font-bold text-white">Resistance Level 2</h3>
                      </div>

                      {!hasValidData(level2, 'resistance') ? (
                        <div className="flex items-center justify-center py-12">
                          <p className="text-slate-400 text-2xl font-semibold">Not Found</p>
                        </div>
                      ) : (
                        <>
                          <Link to="/metric-definition?metric=resistance-price" state={{ from: location.pathname, returnToSupportResistance: true }} className="block bg-slate-900/60 rounded-xl p-4 mb-4 hover:bg-slate-900/90 hover:scale-[1.02] hover:shadow-lg hover:shadow-red-500/20 transition-all cursor-pointer">
                            <div className="text-red-300 text-sm mb-2">Resistance Price</div>
                            <div className="text-white text-3xl font-bold">{formatSRPrice(level2['Resistance Price'])}</div>
                          </Link>

                          <div className="grid grid-cols-2 gap-4">
                            <Link to="/metric-definition?metric=score" state={{ from: location.pathname, returnToSupportResistance: true }} className="bg-slate-900/40 rounded-lg p-4 hover:bg-slate-900/80 hover:scale-105 hover:shadow-lg hover:shadow-red-500/20 transition-all cursor-pointer">
                              <div className="text-red-300 text-xs mb-1">Score</div>
                              <div className="text-white text-xl font-bold">{formatSRValue(level2['Resistance Score'])}</div>
                            </Link>
                            <Link to="/metric-definition?metric=historical-accuracy" state={{ from: location.pathname, returnToSupportResistance: true }} className="bg-slate-900/40 rounded-lg p-4 hover:bg-slate-900/80 hover:scale-105 hover:shadow-lg hover:shadow-red-500/20 transition-all cursor-pointer">
                              <div className="text-red-300 text-xs mb-1">Historical Accuracy Rate</div>
                              <div className="text-white text-xl font-bold">{formatSRValue(level2['Resistance Win Rate'])}</div>
                            </Link>
                            <Link to="/metric-definition?metric=average-move" state={{ from: location.pathname, returnToSupportResistance: true }} className="bg-slate-900/40 rounded-lg p-4 hover:bg-slate-900/80 hover:scale-105 hover:shadow-lg hover:shadow-red-500/20 transition-all cursor-pointer">
                              <div className="text-red-300 text-xs mb-1">Avg Move</div>
                              <div className="text-white text-xl font-bold">{formatSRValue(level2['Resistance Average Move'])}</div>
                            </Link>
                            <Link to="/metric-definition?metric=distance" state={{ from: location.pathname, returnToSupportResistance: true }} className="bg-slate-900/40 rounded-lg p-4 hover:bg-slate-900/80 hover:scale-105 hover:shadow-lg hover:shadow-red-500/20 transition-all cursor-pointer">
                              <div className="text-red-300 text-xs mb-1">Distance</div>
                              <div className="text-white text-xl font-bold">{formatSRValue(level2['Resistance Distance Percentage'])}</div>
                            </Link>
                          </div>
                          {level2['Best Resistance Level'] && level2['Best Resistance Level'] !== 'null' && (
                            <div className="mt-4 bg-red-900/30 rounded-lg p-3">
                              <div className="text-red-300 text-xs mb-1">Best Resistance Level</div>
                              <div className="text-white text-sm">{level2['Best Resistance Level']}</div>
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  </>
                );
              })()}
            </div>
          </div>
        )}

        <div className="flex gap-4 mt-8">
          <button
            onClick={() => {
              setSupportResistanceResult(null);
              if (symbol) {
                const storageKey = `sr-result-${symbol.toUpperCase()}`;
                sessionStorage.removeItem(storageKey);
              }
            }}
            className="flex-1 px-6 py-4 bg-red-600 hover:bg-red-700 text-white font-bold text-lg rounded-xl transition-colors shadow-lg"
          >
            Back to Asset Details
          </button>
          <button
            onClick={() => navigate(location.state?.from === 'watchlist' ? '/my-watchlist' : '/')}
            className="flex-1 px-6 py-4 bg-slate-800 hover:bg-slate-700 border border-slate-600 text-white font-medium text-lg rounded-xl transition-colors"
          >
            Back to {location.state?.from === 'watchlist' ? 'My Watchlist' : 'Home'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-12">
      <div className="flex items-start justify-between mb-8">
        <div className="flex-1">
          <div className="flex items-center gap-6 mb-4">
            <div>
              <h1 className="text-5xl font-bold text-white mb-2">{asset.symbol}</h1>
              <div className="text-2xl text-slate-400">{asset.name}</div>
            </div>
            {asset.price && (
              <div className={`${
                asset.roc_value && asset.roc_value > 0
                  ? 'bg-gradient-to-br from-green-800/80 to-green-900/60 border-green-500/70'
                  : asset.roc_value && asset.roc_value < 0
                  ? 'bg-gradient-to-br from-red-800/80 to-red-900/60 border-red-500/70'
                  : 'bg-slate-800/50 border-slate-700'
              } border-2 rounded-xl px-6 py-3 shadow-lg w-[180px]`}>
                <div className="text-2xl font-bold text-white mb-1">
                  {formatPrice(asset.price)}{asset.currency === 'CAD' && ' (CAD)'}
                </div>
                {asset.roc_value && (
                  <div className={`flex items-center gap-1 text-sm font-medium ${
                    asset.roc_value > 0 ? 'text-green-300' : 'text-red-300'
                  }`}>
                    {asset.roc_value > 0 ? (
                      <TrendingUp className="w-4 h-4" />
                    ) : (
                      <TrendingDown className="w-4 h-4" />
                    )}
                    <span>{asset.roc_value > 0 ? '+' : ''}{asset.roc_value.toFixed(2)}%</span>
                    <span className="text-slate-500 ml-1">24h</span>
                  </div>
                )}
              </div>
            )}
            <div className="bg-slate-800/50 border-2 border-slate-700 rounded-xl px-6 py-3 shadow-lg w-[180px]">
              <div className="text-xs text-slate-400 uppercase tracking-wide mb-1">Last Updated</div>
              <div className="text-lg font-semibold text-white">{formatDateTime(asset.updated_at).date}</div>
              <div className="text-sm text-slate-300">{formatDateTime(asset.updated_at).time}</div>
            </div>
          </div>
          <div className="flex items-center gap-4 text-slate-300">
            {asset.date && (
              <span className="bg-slate-800 px-3 py-1 rounded-lg text-sm">{formatDate(asset.date)}</span>
            )}
          </div>
        </div>
        <div className="flex flex-col gap-3 items-end">
          <div className="flex gap-3">
            <button
              onClick={() => navigate(isWatchlistRoute ? '/my-watchlist' : '/')}
              className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </button>
            <button
              onClick={() => navigate('/')}
              className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg transition-colors"
            >
              <Home className="w-4 h-4" />
              Home
            </button>
          </div>
          {livePrice !== null && (
            <div className="bg-gradient-to-br from-cyan-800/80 to-cyan-900/60 border-2 border-cyan-500/70 rounded-xl px-6 py-4 shadow-lg min-w-[200px]">
              <div className="flex items-center gap-2 mb-2">
                <Zap className="w-4 h-4 text-cyan-300" />
                <div className="text-xs text-cyan-300 uppercase tracking-wide font-semibold">Live Price</div>
              </div>
              <div className="text-3xl font-bold text-white">
                {formatPrice(livePrice)}{asset.currency === 'CAD' && ' (CAD)'}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <button
          onClick={() => {
            if (isWatchlistRoute) {
              navigate(`/watchlist/${symbol}/analytical-score`);
            } else {
              navigate(`/top-picks/${category}/${symbol}/analytical-score`);
            }
          }}
          className={`${colors.bg} ${colors.border} border-2 rounded-2xl p-8 shadow-xl hover:shadow-2xl transition-all duration-200 cursor-pointer text-left w-full`}
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className={`text-2xl font-bold ${averageSignal >= 9 ? 'text-black' : 'text-white'}`}>Analytical Score</h2>
            {averageSignal > 0 ? (
              <TrendingUp className={`w-6 h-6 ${averageSignal >= 9 ? 'text-black' : 'text-white'}`} />
            ) : averageSignal < 0 ? (
              <TrendingDown className={`w-6 h-6 ${averageSignal >= 9 ? 'text-black' : 'text-white'}`} />
            ) : (
              <Activity className={`w-6 h-6 ${averageSignal >= 9 ? 'text-black' : 'text-white'}`} />
            )}
          </div>

          <div className="text-center mb-6">
            <div className={`text-7xl font-bold ${colors.text} mb-2`}>
              {averageSignal > 0 ? '+' : ''}{averageSignal.toFixed(1)}
            </div>
            <div className={`${averageSignal >= 9 ? 'text-black' : 'text-white/80'} text-lg font-semibold`}>{sentiment.label}</div>
          </div>

          <div className="space-y-2 mb-6">
            <div className={`h-4 ${averageSignal >= 9 ? 'bg-yellow-600/30' : 'bg-slate-700'} rounded-full overflow-hidden`}>
              <div
                className={`h-full ${colors.fill} transition-all duration-500`}
                style={{ width: `${signalPercent}%` }}
              />
            </div>
            <div className={`flex justify-between ${averageSignal >= 9 ? 'text-black/70' : 'text-white/60'} text-xs font-medium`}>
              <span>-10</span>
              <span>0</span>
              <span>+10</span>
            </div>
          </div>

          <div className="space-y-3">
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleSupportResistance();
              }}
              className={`w-full flex items-center justify-center gap-2 px-4 py-3 ${
                averageSignal >= 9
                  ? 'bg-black/20 hover:bg-black/30 text-black border border-black/30'
                  : 'bg-white/10 hover:bg-white/20 text-white border border-white/20'
              } rounded-lg transition-all duration-200 font-medium`}
            >
              <StopCircle className="w-5 h-5" />
              <span>Support/Resistance Levels</span>
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleAiVerdict();
              }}
              className={`w-full flex items-center justify-center gap-2 px-4 py-3 ${
                averageSignal >= 9
                  ? 'bg-black/20 hover:bg-black/30 text-black border border-black/30'
                  : 'bg-white/10 hover:bg-white/20 text-white border border-white/20'
              } rounded-lg transition-all duration-200 font-medium`}
            >
              <Brain className="w-5 h-5" />
              <span>Summary</span>
            </button>
          </div>
        </button>

        <div className={`flex flex-col rounded-2xl p-8 shadow-xl border-2 ${
          sentiment.label.toLowerCase().includes('bullish')
            ? 'bg-gradient-to-br from-green-900/40 to-green-800/30 border-green-600/50'
            : sentiment.label.toLowerCase().includes('bearish')
            ? 'bg-gradient-to-br from-red-900/40 to-red-800/30 border-red-600/50'
            : 'bg-gradient-to-br from-slate-900/40 to-slate-800/30 border-slate-600/50'
        }`}>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-white">Market Sentiment:</h2>
            <span className={`text-xl font-bold ${
              sentiment.label.toLowerCase().includes('bullish')
                ? 'text-green-300'
                : sentiment.label.toLowerCase().includes('bearish')
                ? 'text-red-300'
                : 'text-slate-300'
            }`}>
              {sentiment.label}
            </span>
          </div>

          {asset.news_summary && (
            <>
              <div className="flex-1 mb-6">
                <div className="text-slate-200 leading-relaxed text-sm line-clamp-6">
                  {(() => {
                    const summaryText = typeof asset.news_summary === 'string'
                      ? asset.news_summary
                      : (asset.news_summary as any)?.rundown || '';

                    const cleaned = cleanMarkdown(summaryText);
                    const paragraphs = cleaned.split('\n\n').filter(p => p.trim().length > 0);
                    const firstParagraph = paragraphs[0] || '';

                    return firstParagraph;
                  })()}
                </div>
              </div>

              <div className="space-y-3">
                <button
                  onClick={() => {
                    const basePath = isWatchlistRoute ? `/watchlist/${encodeURIComponent(symbol)}` : `/top-picks/${category}/${encodeURIComponent(symbol)}`;
                    const summaryText = typeof asset.news_summary === 'string'
                      ? asset.news_summary
                      : (asset.news_summary as any)?.rundown || '';
                    navigate(`${basePath}/market-analysis`, {
                      state: {
                        symbol: asset.symbol,
                        name: asset.name,
                        newsSummary: summaryText,
                        sentiment: sentiment.label
                      }
                    });
                  }}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-white/10 hover:bg-white/20 text-white border border-white/20 rounded-lg transition-all duration-200 font-medium"
                >
                  <Newspaper className="w-5 h-5" />
                  <span>Read More</span>
                </button>
                <button
                  onClick={() => navigate(`/top-picks/${category}/${encodeURIComponent(symbol)}/sources`)}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-white/10 hover:bg-white/20 text-white border border-white/20 rounded-lg transition-all duration-200 font-medium"
                >
                  <Activity className="w-5 h-5" />
                  <span>View Sources</span>
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {asset.indicators && (
        <div className="mb-8">
          <div className="mb-6">
            <h2 className="text-3xl font-bold text-white">Technical Indicators</h2>
            <div className="h-1 w-56 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full mt-2" />
          </div>

          <div className="grid grid-cols-3 gap-4">
            {Object.entries(asset.indicators).map(([name, data]: [string, any]) => {
              let displaySignal = data.signal || 0;

              // For ROC, get the score from JSON 1's ROC Signal field or use the data.signal if already present
              if (name === 'Rate_of_Change') {
                // First check if data.signal is already set from the indicator mapping
                if (data.signal !== undefined && data.signal !== null && data.signal !== 0) {
                  displaySignal = data.signal;
                } else if (asset.raw_data?.['JSON 1']) {
                  // Fallback to raw_data parsing
                  try {
                    const json1String = asset.raw_data['JSON 1'];
                    const json1Data = typeof json1String === 'string' ? JSON.parse(json1String) : json1String;
                    if (json1Data['ROC Signal'] !== undefined) {
                      displaySignal = parseFloat(json1Data['ROC Signal']);
                    }
                  } catch (e) {
                    console.error('Error parsing JSON 1 for ROC:', e);
                  }
                }
              }

              const indicatorColors = getSignalColors(displaySignal);
              const displayName = name === 'Rate_of_Change' ? 'ROC' : name;
              return (
                <button
                  key={name}
                  onClick={() => {
                    if (isWatchlistRoute) {
                      navigate(`/watchlist/${encodeURIComponent(symbol)}/${encodeURIComponent(name)}`);
                    } else {
                      navigate(`/top-picks/${category}/${encodeURIComponent(symbol)}/${encodeURIComponent(name)}`);
                    }
                  }}
                  className={`${indicatorColors.bg} ${indicatorColors.border} border-2 rounded-xl p-6 shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 cursor-pointer flex flex-col items-center justify-center`}
                >
                  <div className={`${displaySignal >= 9 ? 'text-black/70' : 'text-white/60'} text-sm mb-2 font-semibold uppercase tracking-wide`}>{displayName}</div>
                  <div className={`text-5xl font-bold ${indicatorColors.text}`}>
                    {displaySignal.toFixed(1)}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {(() => {
        try {
          const json9Data = asset.optimized_parameters || (asset.raw_data?.['JSON 9'] ?
            (typeof asset.raw_data['JSON 9'] === 'string' ? JSON.parse(asset.raw_data['JSON 9']) : asset.raw_data['JSON 9'])
            : null);

          if (json9Data) {
            const analysis = json9Data.Analysis;
            const parameters = json9Data.Parameters;

            const monthlyData = [];
            for (let i = 30; i <= 360; i += 30) {
              if (json9Data[i.toString()]) {
                const monthData = typeof json9Data[i.toString()] === 'string'
                  ? JSON.parse(json9Data[i.toString()])
                  : json9Data[i.toString()];
                monthlyData.push({
                  days: i,
                  ...monthData
                });
              }
            }

            const correctCount = monthlyData.filter(month =>
              month.Correct === 'true' || month.Correct === true
            ).length;
            const winRate = `${correctCount}/12`;

            if (monthlyData.length > 0) {
              return (
                <div className="mb-8">
                  <div className="mb-6">
                    <h2 className="text-2xl font-bold text-white">Top Historical Parameter: Monthly Snapshots</h2>
                  </div>

                    {(analysis || parameters || winRate) && (
                      <button
                        onClick={() => {
                          navigate('/metric-definition?metric=parameters-monthly', {
                            state: { from: location.pathname }
                          });
                        }}
                        className="w-full bg-slate-900/50 border border-slate-700 hover:border-slate-600 rounded-xl p-4 mb-6 transition-all duration-200 hover:shadow-xl cursor-pointer text-left"
                      >
                        <div className="grid grid-cols-3 gap-4">
                          <div className="text-center">
                            <div className="text-slate-400 text-xs uppercase tracking-wide mb-1">
                              Indicator
                            </div>
                            <div className="text-white text-lg font-bold">{analysis ? analysis.replace(/\*/g, '') : 'N/A'}</div>
                          </div>
                          <div className="text-center">
                            <div className="text-slate-400 text-xs uppercase tracking-wide mb-1">
                              Parameters
                            </div>
                            <div className="text-white text-lg font-bold">{parameters || 'N/A'}</div>
                          </div>
                          <div className="text-center">
                            <div className="text-slate-400 text-xs uppercase tracking-wide mb-1">
                              Historical Accuracy Rate
                            </div>
                            <div className="text-white text-lg font-bold">{winRate || 'N/A'}</div>
                          </div>
                        </div>
                      </button>
                    )}

                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                      {monthlyData.map((month) => {
                      const isCorrect = month.Correct === 'true' || month.Correct === true;
                      const bgColor = isCorrect ? 'bg-emerald-900/40' : 'bg-red-900/40';
                      const borderColor = isCorrect ? 'border-emerald-600' : 'border-red-600';
                      const iconColor = isCorrect ? 'text-emerald-400' : 'text-red-400';
                      const textColor = isCorrect ? 'text-emerald-400' : 'text-red-400';

                      return (
                        <button
                          key={month.days}
                          onClick={() => {
                            const basePath = isWatchlistRoute ? `/watchlist/${encodeURIComponent(symbol)}` : `/top-picks/${category}/${encodeURIComponent(symbol)}`;
                            navigate(`${basePath}/backtest/${month.days}`, {
                              state: {
                                backtestData: json9Data,
                                symbol: symbol,
                                category: category,
                                assetName: asset.name || asset.stock_name || asset.crypto_name || asset.pair_name || asset.commodity_name || symbol,
                                analysis: analysis,
                                parameters: parameters,
                              }
                            });
                          }}
                          className={`${bgColor} ${borderColor} border-2 rounded-xl p-5 text-center cursor-pointer hover:scale-105 transition-transform duration-200`}
                        >
                          {isCorrect ? (
                            <CheckCircle className={`w-8 h-8 ${iconColor} mx-auto mb-3`} />
                          ) : (
                            <XCircle className={`w-8 h-8 ${iconColor} mx-auto mb-3`} />
                          )}
                          <div className="text-white text-4xl font-bold mb-1">
                            {month.days}
                          </div>
                          <div className="text-white/60 text-sm mb-3">days</div>
                          <div className={`${textColor} text-lg font-bold`}>
                            {isCorrect ? 'Accurate' : 'Inaccurate'}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            }
          }
        } catch (error) {
          console.error('Error parsing JSON 9 data:', error);
        }
        return null;
      })()}

      <RelativeValueSection data={asset.relative_value_analysis} symbol={asset.symbol} />

      <div className="flex items-center justify-center gap-2 text-slate-400 text-sm">
        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
        <span>Last updated: {formatDate(asset.updated_at)}</span>
      </div>
      <Disclaimer />
    </div>
  );
}
