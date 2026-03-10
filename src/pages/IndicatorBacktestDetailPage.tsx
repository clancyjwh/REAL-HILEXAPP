import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Home, Activity } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { extractIndicatorDetail } from '../utils/backtestDataParser';

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

  // Remove indicator prefix
  let formatted = key.replace(/^(RSI|MACD|CCI|ROC|SMA|Boll|Bollinger)_/i, '');

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

  return <span className="text-white">{String(value)}</span>;
};

export default function IndicatorBacktestDetailPage() {
  const { category, symbol, horizonKey, indicator } = useParams<{
    category: string;
    symbol: string;
    horizonKey: string;
    indicator: string;
  }>();
  const navigate = useNavigate();
  const [indicatorData, setIndicatorData] = useState<any | null>(null);
  const [assetName, setAssetName] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!category || !symbol || !horizonKey || !indicator) return;
    fetchIndicatorData();
  }, [category, symbol, horizonKey, indicator]);

  const fetchIndicatorData = async () => {
    if (!category || !symbol || !horizonKey || !indicator) return;

    const tableName = tableMap[category];
    if (!tableName) return;

    try {
      const decodedSymbol = decodeURIComponent(symbol);
      const decodedIndicator = decodeURIComponent(indicator);
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
          const horizonKeyMap: Record<string, string> = {
            '30d': 'Horizon_30d',
            '60d': 'Horizon_60d',
            '90d': 'Horizon_90d',
            '120d': 'Horizon_120d',
            '150d': 'Horizon_150d',
            '180d': 'Horizon_180d',
          };

          const horizonDataKey = horizonKeyMap[horizonKey as string] || horizonKey;
          const foundData = historicalPerformance[horizonDataKey] ||
                          historicalPerformance[horizonKey as string] ||
                          historicalPerformance.horizons?.[horizonKey as string];

          if (foundData) {
            const extracted = extractIndicatorDetail(foundData, decodedIndicator);
            setIndicatorData(extracted);
          }
        }
      }
    } catch (error) {
      console.error('Error fetching indicator data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-white text-xl">Loading indicator details...</div>
      </div>
    );
  }

  if (!indicatorData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-slate-400 text-xl">Indicator data not found</div>
      </div>
    );
  }

  const displayIndicatorName = indicator === 'Bollinger' ? 'Bollinger Bands' : indicator;

  const getFilteredFields = (data: any, indicatorName: string): [string, any][] => {
    const allEntries = Object.entries(data).filter(([key]) => key !== 'signal' && key !== 'reason');

    if (indicatorName === 'MACD') {
      const allowedFields = ['signal', 'fast_ema', 'slow_ema', 'fastema', 'slowema'];
      return allEntries.filter(([key]) =>
        allowedFields.includes(key.toLowerCase().replace(/_/g, ''))
      );
    }

    if (indicatorName === 'Bollinger') {
      const allowedFields = ['period', 'signal', 'multiplier'];
      return allEntries.filter(([key]) =>
        allowedFields.includes(key.toLowerCase().replace(/_/g, ''))
      );
    }

    if (indicatorName === 'SMA') {
      const allowedFields = ['fast', 'slow', 'signal'];
      return allEntries.filter(([key]) =>
        allowedFields.includes(key.toLowerCase().replace(/_/g, ''))
      );
    }

    return allEntries;
  };

  const filteredFields = getFilteredFields(indicatorData, indicator || '');

  return (
    <div className="min-h-screen pb-12">
      <div className="flex items-start justify-between mb-8">
        <div className="flex-1">
          <h1 className="text-5xl font-bold text-white mb-2">{displayIndicatorName}</h1>
          <div className="flex items-center gap-3">
            <span className="text-slate-400 text-xl">{assetName}</span>
            <span className="text-slate-600">•</span>
            <span className="text-slate-400 text-xl">{symbol}</span>
            <span className="text-slate-600">•</span>
            <span className="text-xl font-bold text-cyan-400">{horizonKey?.toUpperCase()} Backtest</span>
          </div>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => navigate(`/top-picks/${category}/${symbol}/horizon/${horizonKey}`)}
            className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Backtest
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

      {indicatorData.signal !== null && indicatorData.signal !== undefined && (
        <div className="bg-gradient-to-br from-slate-800/70 to-slate-900/50 border-2 border-cyan-500/50 rounded-xl p-8 mb-8 shadow-xl">
          <h3 className="text-2xl font-bold text-white mb-4">Signal Value</h3>
          <div className="text-center">
            <div className="text-6xl font-bold text-cyan-400 mb-2">
              {typeof indicatorData.signal === 'number'
                ? (indicatorData.signal > 0 ? '+' : '') + indicatorData.signal.toFixed(1)
                : indicatorData.signal}
            </div>
            <div className="text-slate-400 text-lg">Original Signal</div>
          </div>
        </div>
      )}

      <div className="bg-slate-900/50 border-2 border-slate-700 rounded-2xl p-8 shadow-xl">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-lg flex items-center justify-center">
            <Activity className="w-6 h-6 text-white" />
          </div>
          <h2 className="text-3xl font-bold text-white">Technical Parameters</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredFields.map(([key, value]) => (
              <div key={key} className="bg-slate-800/50 rounded-xl p-5 border border-slate-700">
                <div className="text-sm font-semibold text-cyan-400 mb-2 uppercase tracking-wide">
                  {formatFieldName(key)}
                </div>
                <div className="text-base">
                  {renderValue(value)}
                </div>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}
