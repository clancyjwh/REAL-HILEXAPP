import { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Network, RefreshCw, TrendingUp, TrendingDown } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface AssetData {
  asset: string;
  pct_change: number;
}

interface CorrelationWebhook {
  id: string;
  data: AssetData[];
  created_at: string;
  updated_at: string;
}

export default function CorrelationIndexPage() {
  const navigate = useNavigate();
  const [webhooks, setWebhooks] = useState<CorrelationWebhook[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedAsset1, setSelectedAsset1] = useState<string>('');
  const [selectedAsset2, setSelectedAsset2] = useState<string>('');

  const fetchWebhooks = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('correlation_webhooks')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);

      if (fetchError) throw fetchError;

      setWebhooks(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch webhooks');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWebhooks();

    const channel = supabase
      .channel('correlation-webhooks')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'correlation_webhooks',
        },
        (payload) => {
          setWebhooks((prev) => [payload.new as CorrelationWebhook, ...prev].slice(0, 100));
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const availableAssets = useMemo(() => {
    const assetMap = new Map<string, string>();
    webhooks.forEach((webhook) => {
      if (Array.isArray(webhook.data)) {
        webhook.data.forEach((item) => {
          if (item.asset) {
            // Extract symbol from formats like "AAPL (Apple Inc.)" or just "AAPL"
            const match = item.asset.match(/^([A-Z]+)/);
            const symbol = match ? match[1] : item.asset;
            // Keep the full name if it exists
            const fullName = item.asset.includes('(') ? item.asset : symbol;
            // Only store if not already present or if new format has more info
            if (!assetMap.has(symbol) || fullName.includes('(')) {
              assetMap.set(symbol, fullName);
            }
          }
        });
      }
    });
    return Array.from(assetMap.values()).sort();
  }, [webhooks]);

  useEffect(() => {
    if (availableAssets.length >= 2 && !selectedAsset1 && !selectedAsset2) {
      setSelectedAsset1(availableAssets[0]);
      setSelectedAsset2(availableAssets[1]);
    }
  }, [availableAssets, selectedAsset1, selectedAsset2]);

  const { correlation, dataPoints } = useMemo(() => {
    if (!selectedAsset1 || !selectedAsset2 || selectedAsset1 === selectedAsset2) {
      return { correlation: null, dataPoints: 0 };
    }

    // Extract symbols for matching
    const extractSymbol = (asset: string) => {
      const match = asset.match(/^([A-Z]+)/);
      return match ? match[1] : asset;
    };

    const symbol1 = extractSymbol(selectedAsset1);
    const symbol2 = extractSymbol(selectedAsset2);

    // Collect all data points for each asset separately
    const asset1Data: Array<{ timestamp: string; pct_change: number }> = [];
    const asset2Data: Array<{ timestamp: string; pct_change: number }> = [];

    webhooks.forEach((webhook) => {
      if (Array.isArray(webhook.data)) {
        webhook.data.forEach((item) => {
          const itemSymbol = extractSymbol(item.asset);
          if (itemSymbol === symbol1 && typeof item.pct_change === 'number') {
            asset1Data.push({ timestamp: webhook.created_at, pct_change: item.pct_change });
          } else if (itemSymbol === symbol2 && typeof item.pct_change === 'number') {
            asset2Data.push({ timestamp: webhook.created_at, pct_change: item.pct_change });
          }
        });
      }
    });

    // For correlation, we need time-matched pairs (within 1 hour of each other)
    const asset1Changes: number[] = [];
    const asset2Changes: number[] = [];

    asset1Data.forEach((a1) => {
      const a1Time = new Date(a1.timestamp).getTime();
      // Find closest asset2 entry within 1 hour
      const match = asset2Data.find((a2) => {
        const a2Time = new Date(a2.timestamp).getTime();
        const diffHours = Math.abs(a1Time - a2Time) / (1000 * 60 * 60);
        return diffHours <= 1;
      });
      if (match) {
        asset1Changes.push(a1.pct_change);
        asset2Changes.push(match.pct_change);
      }
    });

    if (asset1Changes.length < 2) {
      return { correlation: null, dataPoints: asset1Changes.length };
    }

    const n = asset1Changes.length;
    const mean1 = asset1Changes.reduce((a, b) => a + b, 0) / n;
    const mean2 = asset2Changes.reduce((a, b) => a + b, 0) / n;

    let numerator = 0;
    let sum1 = 0;
    let sum2 = 0;

    for (let i = 0; i < n; i++) {
      const diff1 = asset1Changes[i] - mean1;
      const diff2 = asset2Changes[i] - mean2;
      numerator += diff1 * diff2;
      sum1 += diff1 * diff1;
      sum2 += diff2 * diff2;
    }

    const denominator = Math.sqrt(sum1 * sum2);
    const correlationValue = denominator === 0 ? 0 : numerator / denominator;

    return {
      correlation: correlationValue,
      dataPoints: n
    };
  }, [webhooks, selectedAsset1, selectedAsset2]);

  const getCorrelationColor = (corr: number | null) => {
    if (corr === null) return 'text-slate-400';
    const abs = Math.abs(corr);
    if (abs >= 0.8) return corr > 0 ? 'text-emerald-400' : 'text-red-400';
    if (abs >= 0.6) return corr > 0 ? 'text-emerald-500' : 'text-red-500';
    if (abs >= 0.4) return corr > 0 ? 'text-emerald-600' : 'text-red-600';
    if (abs >= 0.2) return corr > 0 ? 'text-blue-400' : 'text-orange-400';
    return 'text-slate-400';
  };

  const getCorrelationBg = (corr: number | null) => {
    if (corr === null) return 'from-slate-800 to-slate-900';
    const abs = Math.abs(corr);
    if (abs >= 0.8) return corr > 0 ? 'from-emerald-900/40 to-emerald-950/40' : 'from-red-900/40 to-red-950/40';
    if (abs >= 0.6) return corr > 0 ? 'from-emerald-900/30 to-emerald-950/30' : 'from-red-900/30 to-red-950/30';
    if (abs >= 0.4) return corr > 0 ? 'from-emerald-900/20 to-emerald-950/20' : 'from-red-900/20 to-red-950/20';
    if (abs >= 0.2) return corr > 0 ? 'from-blue-900/20 to-blue-950/20' : 'from-orange-900/20 to-orange-950/20';
    return 'from-slate-800 to-slate-900';
  };

  const getCorrelationLabel = (corr: number | null) => {
    if (corr === null) return 'No Data';
    const abs = Math.abs(corr);
    if (abs >= 0.8) return corr > 0 ? 'Very Strong Positive' : 'Very Strong Negative';
    if (abs >= 0.6) return corr > 0 ? 'Strong Positive' : 'Strong Negative';
    if (abs >= 0.4) return corr > 0 ? 'Moderate Positive' : 'Moderate Negative';
    if (abs >= 0.2) return corr > 0 ? 'Weak Positive' : 'Weak Negative';
    return 'Very Weak';
  };

  const latestChanges = useMemo(() => {
    if (!selectedAsset1 || !selectedAsset2 || webhooks.length === 0) {
      return { asset1: null, asset2: null };
    }

    // Extract symbols for matching
    const extractSymbol = (asset: string) => {
      const match = asset.match(/^([A-Z]+)/);
      return match ? match[1] : asset;
    };

    const symbol1 = extractSymbol(selectedAsset1);
    const symbol2 = extractSymbol(selectedAsset2);

    // Find the latest entry for each asset
    let asset1Change: number | null = null;
    let asset2Change: number | null = null;

    for (const webhook of webhooks) {
      if (Array.isArray(webhook.data)) {
        for (const item of webhook.data) {
          const itemSymbol = extractSymbol(item.asset);
          if (itemSymbol === symbol1 && asset1Change === null) {
            asset1Change = item.pct_change;
          }
          if (itemSymbol === symbol2 && asset2Change === null) {
            asset2Change = item.pct_change;
          }
          if (asset1Change !== null && asset2Change !== null) {
            break;
          }
        }
      }
      if (asset1Change !== null && asset2Change !== null) {
        break;
      }
    }

    return {
      asset1: asset1Change,
      asset2: asset2Change,
    };
  }, [webhooks, selectedAsset1, selectedAsset2]);

  return (
    <>
      <div className="mb-8">
        <button
          onClick={() => navigate('/tools')}
          className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-4"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Tools
        </button>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-500/10 rounded-lg">
              <Network className="w-6 h-6 text-emerald-500" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-white">Correlation Index</h1>
              <p className="text-slate-400">Compare asset price movements</p>
            </div>
          </div>
          <button
            onClick={fetchWebhooks}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-500 rounded-lg transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
          <p className="text-red-400">{error}</p>
        </div>
      )}

      {loading && webhooks.length === 0 ? (
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <RefreshCw className="w-12 h-12 text-emerald-500 animate-spin mx-auto mb-4" />
            <p className="text-slate-400">Loading data...</p>
          </div>
        </div>
      ) : availableAssets.length === 0 ? (
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <Network className="w-12 h-12 text-slate-600 mx-auto mb-4" />
            <p className="text-slate-400 mb-2">No data received yet</p>
            <p className="text-slate-500 text-sm mb-6">Send POST requests to receive asset correlation data</p>
            <div className="max-w-2xl mx-auto p-6 bg-slate-800/50 border border-slate-700 rounded-xl text-left">
              <h3 className="text-lg font-semibold text-white mb-3">Webhook URL</h3>
              <div className="bg-slate-950 rounded-lg p-4 mb-3">
                <code className="text-emerald-400 text-sm break-all">
                  https://wdkvxjegedxlswvihmeo.supabase.co/functions/v1/correlation-webhook
                </code>
              </div>
              <p className="text-slate-400 text-sm mb-2">Expected format:</p>
              <div className="bg-slate-950 rounded-lg p-4">
                <pre className="text-xs text-slate-300">{`[
  { "asset": "AAPL", "pct_change": 0.32 },
  { "asset": "TSLA", "pct_change": -0.28 },
  { "asset": "LSPD", "pct_change": 0.67 }
]`}</pre>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-6">
            <div className="bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 rounded-xl p-6">
              <label className="block text-slate-400 text-sm font-medium mb-3">Asset 1</label>
              <select
                value={selectedAsset1}
                onChange={(e) => setSelectedAsset1(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-3 text-white text-lg font-semibold focus:outline-none focus:border-emerald-500 transition-colors"
              >
                {availableAssets.map((asset) => (
                  <option key={asset} value={asset}>
                    {asset}
                  </option>
                ))}
              </select>
              {latestChanges.asset1 !== null && (
                <div className="mt-4 flex items-center gap-2">
                  {latestChanges.asset1 >= 0 ? (
                    <TrendingUp className="w-5 h-5 text-emerald-400" />
                  ) : (
                    <TrendingDown className="w-5 h-5 text-red-400" />
                  )}
                  <span className={`text-2xl font-bold ${latestChanges.asset1 >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                    {latestChanges.asset1 > 0 ? '+' : ''}{latestChanges.asset1.toFixed(2)}%
                  </span>
                  <span className="text-slate-500 text-sm">latest</span>
                </div>
              )}
            </div>

            <div className="bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 rounded-xl p-6">
              <label className="block text-slate-400 text-sm font-medium mb-3">Asset 2</label>
              <select
                value={selectedAsset2}
                onChange={(e) => setSelectedAsset2(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-3 text-white text-lg font-semibold focus:outline-none focus:border-emerald-500 transition-colors"
              >
                {availableAssets.map((asset) => (
                  <option key={asset} value={asset}>
                    {asset}
                  </option>
                ))}
              </select>
              {latestChanges.asset2 !== null && (
                <div className="mt-4 flex items-center gap-2">
                  {latestChanges.asset2 >= 0 ? (
                    <TrendingUp className="w-5 h-5 text-emerald-400" />
                  ) : (
                    <TrendingDown className="w-5 h-5 text-red-400" />
                  )}
                  <span className={`text-2xl font-bold ${latestChanges.asset2 >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                    {latestChanges.asset2 > 0 ? '+' : ''}{latestChanges.asset2.toFixed(2)}%
                  </span>
                  <span className="text-slate-500 text-sm">latest</span>
                </div>
              )}
            </div>
          </div>

          <div className={`bg-gradient-to-br ${getCorrelationBg(correlation)} border border-slate-700 rounded-xl p-12 text-center`}>
            <h2 className="text-slate-400 text-lg font-medium mb-6">Correlation Analysis</h2>
            {selectedAsset1 === selectedAsset2 ? (
              <p className="text-slate-500 text-lg">Please select different assets</p>
            ) : dataPoints === 0 ? (
              <div>
                <p className="text-slate-500 text-lg mb-2">No data available</p>
                <p className="text-slate-600 text-sm">Waiting for webhook data</p>
              </div>
            ) : dataPoints === 1 && latestChanges.asset1 !== null && latestChanges.asset2 !== null ? (
              <div>
                <div className="mb-6">
                  <div className="text-6xl font-bold mb-4">
                    {latestChanges.asset1 * latestChanges.asset2 > 0 ? (
                      <span className="text-emerald-400">↗↗</span>
                    ) : (
                      <span className="text-red-400">↗↘</span>
                    )}
                  </div>
                  <div className={`text-2xl font-semibold mb-2 ${latestChanges.asset1 * latestChanges.asset2 > 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                    {latestChanges.asset1 * latestChanges.asset2 > 0 ? 'Moving Together' : 'Moving Opposite'}
                  </div>
                  <p className="text-slate-500 text-sm">Based on latest movement</p>
                </div>
                <div className="pt-6 border-t border-slate-700">
                  <p className="text-slate-400 text-sm mb-2">Current Direction:</p>
                  <p className="text-slate-500 text-xs max-w-2xl mx-auto">
                    {latestChanges.asset1 * latestChanges.asset2 > 0
                      ? 'Both assets are moving in the same direction. Need more data points to calculate statistical correlation.'
                      : 'Assets are moving in opposite directions. Need more data points to calculate statistical correlation.'}
                  </p>
                </div>
              </div>
            ) : dataPoints < 2 ? (
              <div>
                <p className="text-slate-500 text-lg mb-2">Need more data</p>
                <p className="text-slate-600 text-sm">Statistical correlation requires at least 2 time periods</p>
              </div>
            ) : (
              <div>
                <div className={`text-8xl font-bold mb-4 ${getCorrelationColor(correlation)}`}>
                  {correlation !== null ? correlation.toFixed(3) : '—'}
                </div>
                <div className={`text-2xl font-semibold mb-2 ${getCorrelationColor(correlation)}`}>
                  {getCorrelationLabel(correlation)}
                </div>
                <p className="text-slate-500 text-sm">
                  Based on {dataPoints} data points
                </p>
                <div className="mt-6 pt-6 border-t border-slate-700">
                  <p className="text-slate-400 text-sm mb-2">Interpretation:</p>
                  <p className="text-slate-500 text-xs max-w-2xl mx-auto">
                    {correlation !== null && correlation > 0.6 && 'These assets tend to move in the same direction together.'}
                    {correlation !== null && correlation < -0.6 && 'These assets tend to move in opposite directions.'}
                    {correlation !== null && Math.abs(correlation) <= 0.6 && Math.abs(correlation) > 0.2 && 'These assets show some relationship but with significant independence.'}
                    {correlation !== null && Math.abs(correlation) <= 0.2 && 'These assets move largely independently of each other.'}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
