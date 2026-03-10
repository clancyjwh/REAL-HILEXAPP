import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Zap, TrendingUp, TrendingDown, Activity } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface SignalData {
  daysBack: number;
  signal: number;
  predictedDirection: string;
  actualDirection: string;
  correct: boolean;
  priceChange: number;
  signalDate: string;
  outcomeEndDate: string;
  entryPrice: number;
  exitPrice: number;
}

interface OptimizedParametersData {
  optimized_parameters?: any;
  symbol: string;
  name: string;
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

const getSignalBackgroundColor = (signal: number): string => {
  if (signal >= 9) return 'bg-[linear-gradient(145deg,#FFFDF5_0%,#FFF3CC_35%,#EBD48E_70%,#C9A43B_100%)] bg-[length:200%_200%] animate-[shimmer_4s_linear_infinite] shadow-[0_0_20px_rgba(201,164,59,0.8),0_0_40px_rgba(235,212,142,0.4),0_0_60px_rgba(255,253,245,0.2)]';
  if (signal >= 7) return 'bg-green-600/50';
  if (signal >= 4) return 'bg-green-500/40';
  if (signal >= 1) return 'bg-green-400/30';
  if (signal > -1) return 'bg-slate-600/30';
  if (signal >= -4) return 'bg-orange-500/30';
  if (signal >= -7) return 'bg-red-500/40';
  if (signal <= -9) return 'bg-gradient-to-br from-red-900/60 to-red-950/60';
  return 'bg-red-600/50';
};

export default function OptimizedParametersPage() {
  const { category, symbol } = useParams<{ category: string; symbol: string }>();
  const navigate = useNavigate();
  const location = window.location;
  const [data, setData] = useState<OptimizedParametersData | null>(null);
  const [loading, setLoading] = useState(true);

  const isWatchlistRoute = location.pathname.includes('/watchlist/');

  useEffect(() => {
    if (symbol) {
      fetchData();
    }
  }, [category, symbol, isWatchlistRoute]);

  const fetchData = async () => {
    try {
      setLoading(true);

      if (isWatchlistRoute) {
        await fetchFromWatchlist();
        return;
      }

      if (!category) return;

      const tableName = tableMap[category!];

      const { data: result, error } = await supabase
        .from(tableName)
        .select('optimized_parameters, symbol')
        .eq('symbol', symbol)
        .maybeSingle();

      if (error) throw error;

      if (result) {
        const nameField = nameFieldMap[category!];
        const { data: fullData } = await supabase
          .from(tableName)
          .select(nameField)
          .eq('symbol', symbol)
          .maybeSingle();

        setData({
          optimized_parameters: result.optimized_parameters,
          symbol: result.symbol,
          name: fullData?.[nameField] || result.symbol,
        });
      } else {
        // If not found in top picks, try fetching from user_watchlist
        const { data: watchlistData, error: watchlistError } = await supabase
          .from('user_watchlist')
          .select('*')
          .eq('symbol', symbol)
          .maybeSingle();

        if (watchlistError) throw watchlistError;

        if (watchlistData && watchlistData.detailed_signal_data) {
          try {
            const detailedData = typeof watchlistData.detailed_signal_data === 'string'
              ? JSON.parse(watchlistData.detailed_signal_data)
              : watchlistData.detailed_signal_data;

            let optimizedParams = null;
            if (detailedData['JSON 9']) {
              optimizedParams = typeof detailedData['JSON 9'] === 'string'
                ? JSON.parse(detailedData['JSON 9'])
                : detailedData['JSON 9'];
            }

            setData({
              optimized_parameters: optimizedParams,
              symbol: watchlistData.symbol,
              name: watchlistData.name,
            });
          } catch (parseError) {
            console.error('Error parsing watchlist data:', parseError);
          }
        }
      }
    } catch (error) {
      console.error('Error fetching optimized parameters:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchFromWatchlist = async () => {
    try {
      const { data: watchlistData, error } = await supabase
        .from('user_watchlist')
        .select('*')
        .eq('symbol', symbol)
        .maybeSingle();

      if (error) throw error;

      if (watchlistData) {
        setData({
          optimized_parameters: watchlistData.optimized_parameters,
          symbol: watchlistData.symbol,
          name: watchlistData.name,
        });
      }
    } catch (error) {
      console.error('Error fetching watchlist optimized parameters:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  if (!data || !data.optimized_parameters) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-white text-xl">No optimized parameters available</div>
      </div>
    );
  }

  const params = data.optimized_parameters;
  const periods = ['30', '60', '90', '120', '150', '180'];

  const getValueForPeriod = (key: string, period: string) => {
    const variations = [
      `${key} ${period}`,
      `${key} back ${period}`,
      `${key}${period}`,
      `${key.toLowerCase()} ${period}`,
      `${key.toLowerCase()}${period}`,
    ];

    for (const variation of variations) {
      if (params[variation] !== undefined) {
        return params[variation];
      }
    }

    const exactMatch = Object.keys(params).find(k =>
      k.toLowerCase().includes(key.toLowerCase()) && k.includes(period)
    );
    return exactMatch ? params[exactMatch] : null;
  };

  const renderPeriodBox = (period: string) => {
    const daysBack = getValueForPeriod('Days Back', period) || getValueForPeriod('Days back', period);
    const signal = getValueForPeriod('Signal', period) || getValueForPeriod('Original Signal', period);
    const prediction = getValueForPeriod('Prediction', period) || getValueForPeriod('PRediction', period);
    const result = getValueForPeriod('Result', period) || getValueForPeriod('REsult', period);

    if (!daysBack && !signal && !prediction && !result) return null;

    const isCorrect = prediction && result && prediction.toUpperCase() === result.toUpperCase();
    const signalNum = typeof signal === 'string' ? parseFloat(signal) : signal;

    return (
      <div key={period} className="bg-slate-900/60 rounded-xl p-6 border border-green-500/30">
        <div className="text-green-400 font-bold text-lg mb-4 uppercase tracking-wide">
          {period} Days Backtest
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-slate-400 text-xs mb-1">Analytical Score</div>
              <div className="text-white text-xl font-bold">
                {signalNum !== null && signalNum !== undefined ? signalNum.toFixed(2) : 'N/A'}
              </div>
            </div>
            <div>
              <div className="text-slate-400 text-xs mb-1">Days Back</div>
              <div className="text-white text-xl font-bold">{daysBack || period}</div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-slate-400 text-xs mb-1">Predicted</div>
              <div className={`flex items-center gap-2 text-lg font-bold ${
                prediction && prediction.toUpperCase() === 'UP' ? 'text-green-400' :
                prediction && prediction.toUpperCase() === 'DOWN' ? 'text-red-400' : 'text-slate-400'
              }`}>
                {prediction && prediction.toUpperCase() === 'UP' ? <TrendingUp className="w-5 h-5" /> :
                 prediction && prediction.toUpperCase() === 'DOWN' ? <TrendingDown className="w-5 h-5" /> : null}
                {prediction || 'N/A'}
              </div>
            </div>
            <div>
              <div className="text-slate-400 text-xs mb-1">Actual Result</div>
              <div className={`flex items-center gap-2 text-lg font-bold ${
                result && result.toUpperCase() === 'UP' ? 'text-green-400' :
                result && result.toUpperCase() === 'DOWN' ? 'text-red-400' : 'text-slate-400'
              }`}>
                {result && result.toUpperCase() === 'UP' ? <TrendingUp className="w-5 h-5" /> :
                 result && result.toUpperCase() === 'DOWN' ? <TrendingDown className="w-5 h-5" /> : null}
                {result || 'N/A'}
              </div>
            </div>
          </div>

          {(prediction && result) && (
            <div className={`text-center py-2 rounded-lg font-bold ${
              isCorrect ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
            }`}>
              {isCorrect ? '✓ ACCURATE' : '✗ INACCURATE'}
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-slate-950 pb-12">
      <div className="sticky top-0 z-10 bg-slate-900 border-b border-slate-800 px-8 py-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => {
                if (isWatchlistRoute) {
                  navigate(`/watchlist/${symbol}`);
                } else {
                  navigate(`/top-picks/${category}/${symbol}`);
                }
              }}
              className="p-2 hover:bg-slate-800 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-6 h-6 text-white" />
            </button>
            <div>
              <h1 className="text-3xl font-bold text-white">{data.symbol}</h1>
              <p className="text-slate-400 text-sm">{data.name}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="px-8 py-8">
        <div className="mb-8 flex items-center gap-3">
          <Zap className="w-10 h-10 text-green-400" />
          <div>
            <h2 className="text-4xl font-bold text-white">Top Historical Parameter</h2>
            <p className="text-slate-400">Complete AI trading analysis</p>
          </div>
        </div>

<div className="bg-gradient-to-br from-green-900/40 to-green-800/30 border-2 border-green-600/50 rounded-2xl p-8 shadow-xl mb-8">
          <div className={`mb-8 rounded-2xl p-8 border border-green-400/40 ${getSignalBackgroundColor(parseFloat(params['Current Signal (with parameters)'] || params['Current Signal'] || '0'))}`}>
            <div className="text-green-400 font-bold text-lg mb-6 uppercase tracking-wide text-center">
              Current Signal
            </div>
            <div className="text-center">
              <div className="text-7xl font-bold text-white mb-2">
                {params['Current Signal (with parameters)'] || params['Current Signal'] || 'N/A'}
              </div>
              <div className="text-slate-400 text-lg">
                Analytical Score with Top Historical Parameter
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
            {params.Indicator && (
              <div className="bg-slate-900/60 rounded-xl p-6 border border-green-500/30">
                <div className="text-green-400 font-bold text-sm mb-2 uppercase tracking-wide">Indicator</div>
                <div className="text-white text-2xl font-bold">{params.Indicator}</div>
              </div>
            )}
            {params.Parameters && (
              <div className="bg-slate-900/60 rounded-xl p-6 border border-green-500/30">
                <div className="text-green-400 font-bold text-sm mb-2 uppercase tracking-wide">Parameters</div>
                <div className="text-white text-2xl font-bold">{params.Parameters}</div>
              </div>
            )}
            {params['Win Percentage'] && (
              <div className="bg-slate-900/60 rounded-xl p-6 border border-green-500/30">
                <div className="text-green-400 font-bold text-sm mb-2 uppercase tracking-wide">Win Percentage</div>
                <div className="text-white text-2xl font-bold">{params['Win Percentage']}</div>
              </div>
            )}
            {params['Win Rate'] && (
              <div className="bg-slate-900/60 rounded-xl p-6 border border-green-500/30">
                <div className="text-green-400 font-bold text-sm mb-2 uppercase tracking-wide">Historical Accuracy Rate (Six Months)</div>
                <div className="text-white text-2xl font-bold">{params['Win Rate']}</div>
              </div>
            )}
            {params['Combinations Tested'] && (
              <div className="bg-slate-900/60 rounded-xl p-6 border border-green-500/30">
                <div className="text-green-400 font-bold text-sm mb-2 uppercase tracking-wide">Combinations Tested</div>
                <div className="text-white text-2xl font-bold">{params['Combinations Tested'].toLocaleString()}</div>
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {periods.map(period => renderPeriodBox(period))}
        </div>
      </div>
    </div>
  );
}
