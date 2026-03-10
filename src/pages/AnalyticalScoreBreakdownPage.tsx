import { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, Calculator, TrendingUp, Activity } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface IndicatorData {
  signal: number;
  [key: string]: any;
}

interface AssetData {
  id: string;
  symbol: string;
  name: string;
  signal?: number;
  indicators?: Record<string, IndicatorData>;
  raw_data?: any;
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

function extractIndicatorsFromJSON1(json1: any): Record<string, any> {
  return {
    SMA: {
      signal: parseFloat(json1['SMA Signal'] || '0'),
    },
    RSI: {
      signal: parseFloat(json1['RSI Signal'] || '0'),
    },
    Bollinger: {
      signal: parseFloat(json1['Boll Signal'] || '0'),
    },
    CCI: {
      signal: parseFloat(json1['CCI Signal'] || '0'),
    },
    MACD: {
      signal: parseFloat(json1['MACD Signal'] || '0'),
    },
    ROC: {
      signal: parseFloat(json1['ROC Signal'] || '0'),
    },
  };
}

export default function AnalyticalScoreBreakdownPage() {
  const { category, symbol } = useParams<{ category: string; symbol: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const [asset, setAsset] = useState<AssetData | null>(null);
  const [loading, setLoading] = useState(true);

  const isWatchlistRoute = location.pathname.startsWith('/watchlist/');

  useEffect(() => {
    if (!symbol) return;
    fetchData();
  }, [category, symbol, isWatchlistRoute]);

  const fetchData = async () => {
    if (!symbol) return;

    try {
      const decodedSymbol = decodeURIComponent(symbol);

      if (isWatchlistRoute) {
        const { data: watchlistData, error: watchlistError } = await supabase
          .from('user_watchlist')
          .select('*')
          .eq('symbol', decodedSymbol.toUpperCase())
          .maybeSingle();

        if (watchlistError) throw watchlistError;

        if (watchlistData) {
          let extractedIndicators: any = {};

          if (watchlistData.indicators) {
            extractedIndicators = watchlistData.indicators;
          } else if (watchlistData.raw_data?.['JSON 1']) {
            try {
              const json1 = typeof watchlistData.raw_data['JSON 1'] === 'string'
                ? JSON.parse(watchlistData.raw_data['JSON 1'])
                : watchlistData.raw_data['JSON 1'];

              extractedIndicators = extractIndicatorsFromJSON1(json1);
            } catch (e) {
              console.error('Error parsing JSON 1 from watchlist:', e);
            }
          }

          setAsset({
            id: watchlistData.id,
            symbol: watchlistData.symbol,
            name: watchlistData.name,
            signal: watchlistData.signal,
            indicators: extractedIndicators,
            raw_data: watchlistData.raw_data,
          });
        }
        setLoading(false);
        return;
      }

      if (!category) return;

      const tableName = tableMap[category];
      if (!tableName) return;

      const { data, error } = await supabase
        .from(tableName)
        .select('*')
        .eq('symbol', decodedSymbol.toUpperCase())
        .maybeSingle();

      if (error) throw error;

      if (data) {
        const nameField = nameFieldMap[category];

        let extractedIndicators: any = {};

        if (data.indicators) {
          extractedIndicators = data.indicators;
        } else if (data.raw_data?.['JSON 1']) {
          try {
            const json1 = typeof data.raw_data['JSON 1'] === 'string'
              ? JSON.parse(data.raw_data['JSON 1'])
              : data.raw_data['JSON 1'];

            extractedIndicators = extractIndicatorsFromJSON1(json1);
          } catch (e) {
            console.error('Error parsing JSON 1:', e);
          }
        }

        setAsset({
          id: data.id,
          symbol: data.symbol,
          name: data[nameField],
          signal: data.signal,
          indicators: extractedIndicators,
          raw_data: data.raw_data,
        });
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-white text-xl">Loading score breakdown...</div>
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

  const cumulativeSignal = asset.signal || 0;
  const indicators = asset.indicators || {};

  // Base weights
  const baseWeights = {
    SMA: 0.35,
    RSI: 0.30,
    Bollinger: 0.20,
    CCI: 0.15,
    MACD: 0.00,
    ROC: 0.00,
  };

  // Calculate estimated score using base weights
  const activeIndicators = ['SMA', 'RSI', 'Bollinger', 'CCI'].filter(
    ind => indicators[ind] && baseWeights[ind as keyof typeof baseWeights] > 0
  );

  let estimatedScore = 0;
  activeIndicators.forEach(ind => {
    const signal = indicators[ind]?.signal || 0;
    const weight = baseWeights[ind as keyof typeof baseWeights];
    estimatedScore += signal * weight;
  });

  // Cap between -10 and +10
  estimatedScore = Math.max(-10, Math.min(10, estimatedScore));

  const getSignalColor = (signal: number) => {
    if (signal >= 7) return 'text-emerald-400';
    if (signal >= 4) return 'text-emerald-300';
    if (signal >= 1) return 'text-green-300';
    if (signal > -1) return 'text-slate-300';
    if (signal >= -4) return 'text-orange-400';
    if (signal >= -7) return 'text-red-400';
    return 'text-red-500';
  };

  const getBarColor = (signal: number) => {
    if (signal >= 7) return 'bg-green-500';
    if (signal >= 4) return 'bg-green-400';
    if (signal >= 1) return 'bg-green-300';
    if (signal > -1) return 'bg-slate-400';
    if (signal >= -4) return 'bg-orange-400';
    if (signal >= -7) return 'bg-red-500';
    return 'bg-red-600';
  };

  return (
    <div className="min-h-screen pb-12">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-5xl font-bold text-white mb-2">Analytical Score Breakdown</h1>
          <p className="text-slate-400">
            {asset.name} ({asset.symbol})
          </p>
        </div>
        <button
          onClick={() => {
            if (isWatchlistRoute) {
              navigate(`/watchlist/${symbol}`);
            } else {
              navigate(`/top-picks/${category}/${symbol}`);
            }
          }}
          className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to {asset.symbol}
        </button>
      </div>

      {/* Current Score Display */}
      <div className="bg-gradient-to-br from-slate-800/80 to-slate-900/60 border-2 border-slate-700 rounded-2xl p-8 shadow-xl mb-8">
        <div className="flex items-center gap-4 mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-500 shadow-lg shadow-cyan-500/50">
            <Activity className="w-8 h-8 text-white" />
          </div>
          <div>
            <h2 className="text-3xl font-bold text-white">Current Analytical Score</h2>
            <p className="text-slate-400 text-sm mt-1">Combined score from multiple technical indicators</p>
          </div>
        </div>
        <div className="text-center">
          <div className={`text-8xl font-bold ${getSignalColor(cumulativeSignal)} mb-4`}>
            {cumulativeSignal > 0 ? '+' : ''}{cumulativeSignal.toFixed(1)}
          </div>
        </div>
      </div>

      {/* How It Works Section */}
      <div className="bg-gradient-to-br from-emerald-900/30 to-teal-900/20 border-2 border-emerald-400/60 rounded-2xl p-8 shadow-xl shadow-emerald-500/20 mb-8">
        <h3 className="text-2xl font-bold text-white mb-6">How the Analytical Score is Calculated</h3>

        <div className="space-y-6">
          <div className="bg-slate-800/50 rounded-xl p-6 border border-emerald-400/30">
            <h4 className="text-xl font-semibold text-white mb-4">Multi-Indicator Analysis</h4>
            <p className="text-slate-300 leading-relaxed mb-4">
              Each technical indicator generates its own signal ranging from -10 to +10. However, not all indicators interpret market behavior in the same way. To create a balanced and reliable combined score, the system applies a weighted approach based on each indicator's characteristics.
            </p>
            <p className="text-slate-300 leading-relaxed">
              Trend-following indicators like SMA and momentum tools like RSI typically provide more stable readings over time, so they receive greater influence in the final calculation. Meanwhile, faster-reacting indicators such as Bollinger Bands and CCI contribute proportionally less to prevent excessive volatility in the combined score.
            </p>
          </div>

          <div className="bg-slate-800/50 rounded-xl p-6 border border-emerald-400/30">
            <h4 className="text-xl font-semibold text-white mb-4">AI-Enhanced Weighting</h4>
            <p className="text-slate-300 leading-relaxed mb-4">
              Beyond the foundational weights, our system employs artificial intelligence to analyze approximately one year of historical performance data for each specific asset. This analysis evaluates how accurately each indicator's past signals aligned with subsequent price movements over 10-day periods.
            </p>
            <p className="text-slate-300 leading-relaxed mb-4">
              For example, if the SMA indicator correctly predicted price direction in 11 out of 12 months for a particular asset, it receives a modest boost in influence for that asset's current score calculation. These AI-driven adjustments are conservative, asset-specific, and derived exclusively from historical observations.
            </p>
            <p className="text-slate-400 italic text-sm">
              Important: Past performance patterns do not predict or guarantee future results. These adjustments simply reflect historical consistency for informational purposes.
            </p>
          </div>

          <div className="bg-slate-800/50 rounded-xl p-6 border border-emerald-400/30">
            <h4 className="text-xl font-semibold text-white mb-4">Score Normalization</h4>
            <p className="text-slate-300 leading-relaxed mb-4">
              After calculating the weighted combination of active indicators, the system ensures the final score remains within the -10 to +10 range for consistent interpretation. If any indicator data is unavailable, the system compensates by blending in the median value of the remaining active indicators, maintaining stability and reliability in the output.
            </p>
            <p className="text-slate-400 text-sm mt-4">
              <strong>Note:</strong> MACD tends to generate extreme values, and ROC historically shows weak correlation with actual price movements. Therefore, both indicators are excluded from the cumulative analytical score to improve overall accuracy and consistency.
            </p>
          </div>
        </div>
      </div>

      {/* Base Weights Section */}
      <div className="bg-gradient-to-br from-blue-900/30 to-cyan-900/20 border-2 border-blue-400/60 rounded-2xl p-8 shadow-xl shadow-blue-500/20 mb-8">
        <div className="flex items-center gap-4 mb-6">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 shadow-lg shadow-blue-500/50">
            <Calculator className="w-7 h-7 text-white" />
          </div>
          <div>
            <h3 className="text-2xl font-bold text-white">Base Indicator Weights</h3>
            <p className="text-slate-400 text-sm mt-1">Foundation weights before AI adjustments</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Object.entries(baseWeights).map(([indicator, weight]) => (
            <div key={indicator} className="bg-slate-800/60 rounded-lg p-4 border border-blue-400/30">
              <div className="flex justify-between items-center mb-2">
                <span className="text-white font-semibold">{indicator}</span>
                <span className="text-cyan-400 font-mono text-lg">{(weight * 100).toFixed(0)}%</span>
              </div>
              <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-blue-500 to-cyan-500"
                  style={{ width: `${weight * 100}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* AI Adjustment Ranges */}
      <div className="bg-gradient-to-br from-purple-900/30 to-pink-900/20 border-2 border-purple-400/60 rounded-2xl p-8 shadow-xl shadow-purple-500/20 mb-8">
        <div className="flex items-center gap-4 mb-6">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 shadow-lg shadow-purple-500/50">
            <TrendingUp className="w-7 h-7 text-white" />
          </div>
          <div>
            <h3 className="text-2xl font-bold text-white">AI-Adjusted Weight Ranges</h3>
            <p className="text-slate-400 text-sm mt-1">Dynamic adjustments based on historical performance</p>
          </div>
        </div>

        <div className="bg-slate-800/60 rounded-xl p-6 border border-purple-400/30">
          <p className="text-slate-300 leading-relaxed mb-6">
            After analyzing approximately 12 months of historical data for {asset.symbol}, the AI system makes subtle adjustments to the base weights:
          </p>

          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="mt-1 w-2 h-2 rounded-full bg-green-500 flex-shrink-0"></div>
              <div>
                <p className="text-white font-semibold mb-1">High Consistency Indicators</p>
                <p className="text-slate-400 text-sm">
                  Indicators demonstrating strong month-over-month alignment with price movements receive a modest boost of <span className="text-green-400 font-mono">+5% to +10%</span> relative to their base weight.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="mt-1 w-2 h-2 rounded-full bg-orange-500 flex-shrink-0"></div>
              <div>
                <p className="text-white font-semibold mb-1">Lower Consistency Indicators</p>
                <p className="text-slate-400 text-sm">
                  Indicators showing less reliable historical alignment receive a small reduction of <span className="text-orange-400 font-mono">-5% to -10%</span> relative to their base weight.
                </p>
              </div>
            </div>
          </div>

          <div className="mt-6 p-4 bg-purple-900/30 rounded-lg border border-purple-400/20">
            <p className="text-purple-200 text-sm italic">
              These adjustments are asset-specific and recalculated periodically. The exact adjusted weights are proprietary but typically remain within 5-10% of the base values shown above.
            </p>
          </div>
        </div>
      </div>

      {/* Live Calculation Example */}
      <div className="bg-gradient-to-br from-amber-900/30 to-orange-900/20 border-2 border-amber-400/60 rounded-2xl p-8 shadow-xl shadow-amber-500/20">
        <h3 className="text-2xl font-bold text-white mb-6">Calculation Example for {asset.symbol}</h3>
        <p className="text-slate-400 mb-6 text-sm">
          This example uses base weights only. The actual score incorporates AI adjustments which may vary the final result slightly.
        </p>

        <div className="space-y-4 mb-8">
          {activeIndicators.map((indicator) => {
            const signal = indicators[indicator]?.signal || 0;
            const weight = baseWeights[indicator as keyof typeof baseWeights];
            const contribution = signal * weight;

            return (
              <div key={indicator} className="bg-slate-800/50 rounded-xl p-6 border border-amber-400/30">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-4">
                    <span className="text-white font-semibold text-lg">{indicator}</span>
                    <span className="text-slate-500 text-sm">× {(weight * 100).toFixed(0)}% weight</span>
                  </div>
                  <div className="text-right">
                    <div className={`text-2xl font-bold ${getSignalColor(signal)}`}>
                      {signal > 0 ? '+' : ''}{signal.toFixed(1)}
                    </div>
                    <div className="text-slate-500 text-sm">
                      = {contribution > 0 ? '+' : ''}{contribution.toFixed(2)} contribution
                    </div>
                  </div>
                </div>

                <div className="relative h-3 bg-slate-700 rounded-full overflow-hidden">
                  <div className="absolute inset-0 flex">
                    <div className="flex-1"></div>
                    <div className="w-px bg-slate-500"></div>
                    <div className="flex-1"></div>
                  </div>
                  <div
                    className={`absolute h-full ${getBarColor(signal)} transition-all`}
                    style={{
                      left: signal < 0 ? `${50 + (signal / 10) * 50}%` : '50%',
                      width: `${Math.abs(signal / 10) * 50}%`,
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>

        <div className="bg-gradient-to-r from-cyan-900/40 to-blue-900/40 rounded-xl p-6 border-2 border-cyan-400/60">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xl font-semibold text-white">Estimated Combined Score</span>
            <span className={`text-4xl font-bold ${getSignalColor(estimatedScore)}`}>
              {estimatedScore > 0 ? '+' : ''}{estimatedScore.toFixed(1)}
            </span>
          </div>
          <p className="text-slate-400 text-sm mt-3">
            Actual score with AI adjustments: <span className={`font-bold ${getSignalColor(cumulativeSignal)}`}>{cumulativeSignal > 0 ? '+' : ''}{cumulativeSignal.toFixed(1)}</span>
          </p>
          <p className="text-slate-500 text-xs mt-2 italic">
            Difference is due to AI-based weight optimization specific to {asset.symbol}
          </p>
        </div>
      </div>
    </div>
  );
}
