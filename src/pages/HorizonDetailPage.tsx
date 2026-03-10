import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Home, Activity, BarChart3 } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { extractAllIndicatorBoxes, extractHighLevelSummary } from '../utils/backtestDataParser';
import { calculateMarketSentiment } from '../utils/marketSentiment';

interface HorizonDetailData {
  [key: string]: any;
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

const formatFieldName = (key: string): string => {
  // Known acronyms that should stay uppercase
  const acronyms = ['SMA', 'RSI', 'CCI', 'ATR', 'MACD', 'ROC', 'ADX', 'BOLLINGER'];

  // Remove the indicator prefix (RSI_, MACD_, etc.)
  let formatted = key.replace(/^(RSI|MACD|CCI|ROC|SMA|Boll|Bollinger)_/i, '');

  // Remove "Original" prefix
  formatted = formatted.replace(/^Original_/i, '').replace(/^Original\s/i, '');

  // Replace underscores with spaces
  formatted = formatted.replace(/_/g, ' ');

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

const renderValue = (value: any): JSX.Element => {
  if (value === null || value === undefined) {
    return <span className="text-slate-500 italic">N/A</span>;
  }

  if (typeof value === 'boolean') {
    return <span className="text-white">{value ? 'Yes' : 'No'}</span>;
  }

  if (typeof value === 'number') {
    return <span className="text-white font-mono">{value.toLocaleString()}</span>;
  }

  if (typeof value === 'object') {
    return (
      <pre className="text-xs text-slate-300 bg-slate-900 p-3 rounded-lg overflow-x-auto">
        {JSON.stringify(value, null, 2)}
      </pre>
    );
  }

  return <span className="text-white">{String(value).replace(/\*/g, '')}</span>;
};

export default function HorizonDetailPage() {
  const { category, symbol, horizonKey } = useParams<{ category: string; symbol: string; horizonKey: string }>();
  const navigate = useNavigate();
  const [horizonData, setHorizonData] = useState<HorizonDetailData | null>(null);
  const [assetName, setAssetName] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!category || !symbol || !horizonKey) return;
    fetchHorizonData();
  }, [category, symbol, horizonKey]);

  const fetchHorizonData = async () => {
    if (!category || !symbol || !horizonKey) return;

    const tableName = tableMap[category];
    if (!tableName) return;

    try {
      const decodedSymbol = decodeURIComponent(symbol);
      const { data, error } = await supabase
        .from(tableName)
        .select('*')
        .eq('symbol', decodedSymbol.toUpperCase())
        .maybeSingle();

      if (error) throw error;

      if (data) {
        const nameField = nameFieldMap[category];
        setAssetName(data[nameField] || data.symbol);

        const historicalPerformance = data.historical_performance;

        if (historicalPerformance) {
          const foundData = historicalPerformance[horizonKey as string] ||
                          historicalPerformance[`Horizon_${horizonKey}`] ||
                          historicalPerformance.horizons?.[horizonKey as string];

          if (foundData) {
            setHorizonData(foundData);
          }
        }
      }
    } catch (error) {
      console.error('Error fetching horizon data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-white text-xl">Loading backtest details...</div>
      </div>
    );
  }

  if (!horizonData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-slate-400 text-xl">Backtest data not found</div>
      </div>
    );
  }

  const summaryData = extractHighLevelSummary(horizonData);
  const indicatorBoxes = extractAllIndicatorBoxes(horizonData);

  // Calculate cumulative signal (average of all indicator signals)
  const calculateCumulativeSignal = () => {
    const signals = indicatorBoxes
      .map(indicator => indicator.signal)
      .filter(signal => typeof signal === 'number' && !isNaN(signal)) as number[];

    if (signals.length === 0) return null;
    const sum = signals.reduce((acc, val) => acc + val, 0);
    return sum / signals.length;
  };

  const cumulativeSignal = calculateCumulativeSignal();
  const signalStrength = horizonData?.Signal_Strength || horizonData?.signal_strength || horizonData?.Confidence || horizonData?.confidence;
  const sentiment = calculateMarketSentiment(signalStrength);

  // Extract summary text and combinations tested from horizonData
  const summaryText = horizonData?.Summary || horizonData?.summary || null;
  const combinationsTested = horizonData?.Combinations_Tested ||
                            horizonData?.combinations_tested ||
                            horizonData?.['Combinations Tested'] ||
                            horizonData?.['combinations tested'] ||
                            null;

  return (
    <div className="min-h-screen pb-12">
      <div className="flex items-start justify-between mb-8">
        <div className="flex-1">
          <h1 className="text-5xl font-bold text-white mb-2">{assetName}</h1>
          <div className="flex items-center gap-3">
            <span className="text-slate-400 text-xl">{symbol}</span>
            <span className="text-slate-600">•</span>
            <span className="text-2xl font-bold text-cyan-400">{horizonKey?.toUpperCase()} Backtest</span>
          </div>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => navigate(`/top-picks/${category}/${symbol}`)}
            className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Asset
          </button>
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg transition-colors"
          >
            <Home className="w-4 h-4" />
            Home
          </button>
        </div>
      </div>

      <div className="bg-gradient-to-br from-slate-800/70 to-slate-900/50 border-2 border-cyan-500/50 rounded-2xl p-8 shadow-xl mb-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-lg flex items-center justify-center">
            <Activity className="w-6 h-6 text-white" />
          </div>
          <h2 className="text-3xl font-bold text-white">Summary</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {cumulativeSignal !== null && (
            <div className="bg-slate-800/50 rounded-xl p-5 border border-slate-700">
              <div className="text-sm font-semibold text-cyan-400 mb-2 uppercase tracking-wide">
                Cumulative Signal
              </div>
              <div className="text-base">
                <span className="text-white font-mono">{cumulativeSignal.toFixed(2)}</span>
              </div>
            </div>
          )}
          {summaryText && (
            <div className="bg-slate-800/50 rounded-xl p-5 border border-slate-700 md:col-span-2">
              <div className="text-sm font-semibold text-cyan-400 mb-2 uppercase tracking-wide">
                Summary
              </div>
              <div className="text-base">
                {renderValue(summaryText)}
              </div>
            </div>
          )}
          {combinationsTested !== null && (
            <div className="bg-slate-800/50 rounded-xl p-5 border border-slate-700">
              <div className="text-sm font-semibold text-cyan-400 mb-2 uppercase tracking-wide">
                Combinations Tested
              </div>
              <div className="text-base">
                {renderValue(combinationsTested)}
              </div>
            </div>
          )}
        </div>
      </div>

      {indicatorBoxes.length > 0 && (
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
              <BarChart3 className="w-6 h-6 text-white" />
            </div>
            <h2 className="text-4xl font-bold text-white">Analysis Data</h2>
          </div>
          <div className="space-y-6">
            {indicatorBoxes.map((indicator) => (
              <div
                key={indicator.name}
                className="bg-slate-900/50 border-2 border-slate-700 rounded-2xl p-6 shadow-xl"
              >
                <div className="mb-5">
                  <h3 className="text-2xl font-bold text-white">{horizonKey?.replace('d', '')} Day {indicator.displayName} Result</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {Object.entries(indicator.data)
                    .filter(([key]) => !key.toLowerCase().includes('reason'))
                    .map(([key, value]) => (
                    <div key={key} className="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
                      <div className="text-xs font-semibold text-cyan-400 mb-2 uppercase tracking-wide">
                        {formatFieldName(key)}
                      </div>
                      <div className="text-sm">
                        {renderValue(value)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="mt-8 bg-slate-800/50 border border-slate-600 rounded-xl p-6">
        <p className="text-slate-400 text-sm leading-relaxed">
          This tool analyzes historical data to identify which parameter combinations showed the strongest past performance. Past performance does not guarantee future results. This analysis is for informational purposes only and does not constitute investment advice.
        </p>
      </div>
    </div>
  );
}
