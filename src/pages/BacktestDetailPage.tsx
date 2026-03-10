import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Activity } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface BacktestData {
  days: string;
  data: any;
  isCorrect: boolean;
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

export default function BacktestDetailPage() {
  const { category, symbol } = useParams<{ category: string; symbol: string }>();
  const navigate = useNavigate();
  const location = window.location;
  const [backtestData, setBacktestData] = useState<BacktestData[]>([]);
  const [assetName, setAssetName] = useState<string>('');
  const [loading, setLoading] = useState(true);

  const isWatchlistRoute = location.pathname.includes('/watchlist/');

  useEffect(() => {
    const fetchBacktestData = async () => {
      if (!symbol) return;

      if (isWatchlistRoute) {
        await fetchFromWatchlist();
        setLoading(false);
        return;
      }

      if (!category) {
        setLoading(false);
        return;
      }

      const tableName = tableMap[category];
      const nameField = nameFieldMap[category];

      if (!tableName) {
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from(tableName)
        .select('*, raw_data')
        .eq('symbol', symbol.toUpperCase())
        .maybeSingle();

      if (error) {
        console.error('Error fetching backtest data:', error);
        setLoading(false);
        return;
      }

      if (data) {
        setAssetName(data[nameField] || symbol);

        try {
          const json9String = data.raw_data?.['JSON 9'];

          if (json9String) {
            const json9Data = typeof json9String === 'string' ? JSON.parse(json9String) : json9String;

            const backtests: BacktestData[] = ['30', '60', '90', '120', '150', '180', '210', '240', '270', '300', '330', '360'].map((days) => {
              if (json9Data[days]) {
                const dayDataString = json9Data[days];
                const dayData = typeof dayDataString === 'string' ? JSON.parse(dayDataString) : dayDataString;

                const isCorrect = dayData.Correct === "true" || dayData.Correct === true;

                return {
                  days,
                  data: dayData,
                  isCorrect,
                };
              }

              return {
                days,
                data: null,
                isCorrect: false,
              };
            });

            setBacktestData(backtests);
          }
        } catch (error) {
          console.error('Error parsing JSON 9:', error);
        }
      } else {
        // If not found in top picks, try fetching from user_watchlist
        const { data: watchlistData, error: watchlistError } = await supabase
          .from('user_watchlist')
          .select('*')
          .eq('symbol', symbol.toUpperCase())
          .maybeSingle();

        if (watchlistError) {
          console.error('Error fetching from watchlist:', watchlistError);
        }

        if (watchlistData) {
          setAssetName(watchlistData.name || symbol);

          try {
            const detailedData = typeof watchlistData.detailed_signal_data === 'string'
              ? JSON.parse(watchlistData.detailed_signal_data)
              : watchlistData.detailed_signal_data;

            if (detailedData && detailedData['JSON 9']) {
              const json9Data = typeof detailedData['JSON 9'] === 'string'
                ? JSON.parse(detailedData['JSON 9'])
                : detailedData['JSON 9'];

              const backtests: BacktestData[] = ['30', '60', '90', '120', '150', '180', '210', '240', '270', '300', '330', '360'].map((days) => {
                if (json9Data[days]) {
                  const dayDataString = json9Data[days];
                  const dayData = typeof dayDataString === 'string' ? JSON.parse(dayDataString) : dayDataString;

                  const isCorrect = dayData.Correct === "true" || dayData.Correct === true;

                  return {
                    days,
                    data: dayData,
                    isCorrect,
                  };
                }

                return {
                  days,
                  data: null,
                  isCorrect: false,
                };
              });

              setBacktestData(backtests);
            }
          } catch (error) {
            console.error('Error parsing watchlist JSON 9:', error);
          }
        }
      }

      setLoading(false);
    };

    fetchBacktestData();
  }, [category, symbol, isWatchlistRoute]);

  const fetchFromWatchlist = async () => {
    try {
      const { data: watchlistData, error } = await supabase
        .from('user_watchlist')
        .select('*')
        .eq('symbol', symbol?.toUpperCase())
        .maybeSingle();

      if (error) {
        console.error('Error fetching from watchlist:', error);
        return;
      }

      if (watchlistData) {
        setAssetName(watchlistData.name || symbol || '');

        const json2Data = watchlistData.historical_performance;

        if (json2Data) {
          const backtests: BacktestData[] = ['30', '60', '90', '120', '150', '180'].map((days) => {
            const key = `${days}d`;
            if (json2Data[key]) {
              const dayData = json2Data[key];
              const isCorrect = dayData.correct === "true" || dayData.correct === true;

              return {
                days,
                data: {
                  Result: dayData.result,
                  Signal: dayData.signal,
                  Prediction: dayData.prediction,
                  Correct: dayData.correct,
                  Daysback: dayData.daysback,
                  'SMA Fast': dayData.sma_fast,
                  'SMA Slow': dayData.sma_slow,
                  'SMA Signal': dayData.sma_signal,
                  'CCI Period': dayData.cci_period,
                  'CCI Signal': dayData.cci_signal,
                  'RSI Period': dayData.rsi_period,
                  'RSI Signal': dayData.rsi_signal,
                  'RSI Oversold': dayData.rsi_oversold,
                  'RSI Overbought': dayData.rsi_overbought,
                  'Bollinger Period': dayData.bollinger_period,
                  'Bollinger Signal': dayData.bollinger_signal,
                  'Bollinger Multiplier': dayData.bollinger_multiplier,
                  'Total Combinations Tested': dayData.total_combinations_tested,
                },
                isCorrect,
              };
            }

            return {
              days,
              data: null,
              isCorrect: false,
            };
          });

          setBacktestData(backtests);
        }
      }
    } catch (error) {
      console.error('Error fetching watchlist backtest data:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen pb-12">
        <div className="mb-8">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-6"
          >
            <ArrowLeft className="w-5 h-5" />
            Back
          </button>
        </div>
        <div className="flex items-center justify-center py-20">
          <div className="text-slate-400">Loading backtest data...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-12">
      <div className="mb-8">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-6"
        >
          <ArrowLeft className="w-5 h-5" />
          Back
        </button>

        <div className="flex items-center gap-3 mb-2">
          <Activity className="w-10 h-10 text-cyan-400" />
          <h1 className="text-4xl font-bold text-white">Top Historical Parameter: Monthly Snapshots</h1>
        </div>
        <p className="text-slate-400 text-lg">{assetName} ({symbol?.toUpperCase()})</p>
      </div>

      <div className="space-y-6">
        {backtestData.map((backtest) => {
          if (!backtest.data) {
            return (
              <div
                key={backtest.days}
                className="bg-slate-900/50 border border-slate-700 rounded-xl p-8"
              >
                <div className="text-center text-slate-500">
                  No data available for {backtest.days} days
                </div>
              </div>
            );
          }

          const bgColor = backtest.isCorrect ? 'bg-green-900/20' : 'bg-red-900/20';
          const borderColor = backtest.isCorrect ? 'border-green-600/50' : 'border-red-600/50';
          const accentColor = backtest.isCorrect ? 'text-green-400' : 'text-red-400';
          const badgeBg = backtest.isCorrect ? 'bg-green-900/40' : 'bg-red-900/40';

          return (
            <div
              key={backtest.days}
              className={`${bgColor} border-2 ${borderColor} rounded-xl p-8`}
            >
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                  <div className={`${badgeBg} ${borderColor} border-2 rounded-lg px-6 py-3`}>
                    <div className={`text-3xl font-bold ${accentColor}`}>{backtest.days}</div>
                    <div className="text-slate-400 text-xs mt-1 text-center">days</div>
                  </div>
                  <div>
                    <div className={`text-2xl font-bold ${accentColor}`}>
                      {backtest.isCorrect ? 'Correct ✓' : 'Incorrect ✗'}
                    </div>
                    <div className="text-slate-400 text-sm">Prediction Accuracy</div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {Object.entries(backtest.data).map(([key, value]) => {
                  if (key === 'Correct') return null;

                  const displayValue = value !== null && value !== undefined ? String(value) : 'N/A';

                  // Format the key with proper handling of acronyms
                  const formatLabel = (label: string): string => {
                    // Known acronyms that should stay uppercase
                    const acronyms = ['SMA', 'RSI', 'CCI', 'ATR', 'MACD', 'ROC', 'ADX'];

                    // Replace underscores with spaces
                    let formatted = label.replace(/_/g, ' ');

                    // Split into words
                    const words = formatted.split(' ').map(word => {
                      // Check if it's a known acronym (case-insensitive)
                      const upperWord = word.toUpperCase();
                      if (acronyms.includes(upperWord)) {
                        return upperWord;
                      }

                      // Otherwise capitalize first letter only
                      return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
                    });

                    return words.join(' ');
                  };

                  const formattedKey = formatLabel(key);

                  return (
                    <div
                      key={key}
                      className="bg-slate-900/50 border border-slate-700 rounded-lg p-4"
                    >
                      <div className="text-slate-400 text-xs font-semibold mb-1 uppercase tracking-wide">
                        {formattedKey}
                      </div>
                      <div className="text-white font-medium break-words">
                        {displayValue}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
