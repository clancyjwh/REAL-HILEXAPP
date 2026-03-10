import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Home, TrendingUp, DollarSign, Shield, AlertCircle, Activity } from 'lucide-react';

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

interface ResistanceSignalResponse {
  'AI Summary'?: string;
  'ATR Definition'?: string;
  'Support/Resistance 1'?: string;
  'Support/Resistance 2'?: string;
  [key: string]: any;
}

export default function ResistanceSignalPage() {
  const { category, symbol } = useParams<{ category: string; symbol: string }>();
  const navigate = useNavigate();
  const [response, setResponse] = useState<ResistanceSignalResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!category || !symbol) return;
    fetchResistanceSignal();
  }, [category, symbol]);

  const fetchResistanceSignal = async () => {
    if (!category || !symbol) return;

    try {
      const payload = {
        symbol: symbol.toUpperCase(),
        category: category.charAt(0).toUpperCase() + category.slice(1)
      };

      const res = await fetch('https://hook.us2.make.com/dm6qp7n61wyhvyfl2444q67w1bsltb81', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      });

      if (!res.ok) throw new Error('Failed to fetch resistance signal');

      const text = await res.text();

      try {
        const data = JSON.parse(text);
        setResponse(data);
      } catch {
        setResponse({ reason: text });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

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

  const formatPrice = (value: any): string => {
    if (value === null || value === undefined || value === '' || value === 'N/A' || value === 'null') return 'N/A';
    const num = typeof value === 'string' ? parseFloat(value) : value;
    if (isNaN(num)) return 'N/A';

    // Remove trailing zeros but keep at least 2 decimal places
    let formatted = num.toFixed(6);
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

    return `$${formatted}`;
  };

  const formatValue = (value: any): string => {
    if (value === null || value === undefined || value === '' || value === 'N/A' || value === 'null' || value === '%') return 'No Data Found';
    return String(value);
  };

  const hasValidData = (level: SupportResistanceLevel | null, type: 'support' | 'resistance'): boolean => {
    if (!level) return false;
    const priceKey = type === 'support' ? 'Support Price' : 'Resistance Price';
    const price = level[priceKey];
    return !!(price && price !== '' && price !== 'N/A' && price !== 'null' && price !== '0' && price !== null);
  };

  return (
    <div className="min-h-screen pb-12">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-5xl font-bold text-white mb-4 flex items-center gap-4">
            <TrendingUp className="w-12 h-12 text-green-400" />
            Resistance Signal Analysis
          </h1>
          <p className="text-slate-400 text-lg mb-2">
            {symbol?.toUpperCase()} - {category?.charAt(0).toUpperCase()}{category?.slice(1)}
          </p>
          <p className="text-amber-400 text-sm font-medium">
            Calculated using historical data - prices may not match current
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => navigate(`/top-picks/${category}/${symbol}`)}
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
      </div>

      {loading && (
        <div className="flex items-center justify-center py-20">
          <div className="w-full max-w-2xl">
            <div className="h-3 bg-slate-800 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-green-500 to-green-400 animate-pulse" style={{ width: '100%' }}></div>
            </div>
          </div>
        </div>
      )}

      {error && (
        <div className="bg-red-900/40 border-2 border-red-600/50 rounded-2xl p-8 shadow-xl">
          <div className="flex items-center gap-3 mb-4">
            <AlertCircle className="w-8 h-8 text-red-400" />
            <h2 className="text-2xl font-bold text-red-400">Error</h2>
          </div>
          <p className="text-white">{error}</p>
        </div>
      )}

      {!loading && !error && response && (
        <div className="space-y-6">
          {response['AI Summary'] && (
            <div className="bg-gradient-to-br from-slate-900/80 to-slate-800/60 border-2 border-slate-700 rounded-2xl p-8 shadow-xl">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-slate-700 rounded-lg">
                  <AlertCircle className="w-6 h-6 text-slate-300" />
                </div>
                <h3 className="text-2xl font-bold text-white">Summary</h3>
              </div>
              <div className="space-y-4">
                <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700">
                  <div className="text-cyan-400 font-semibold mb-2">AI Summary</div>
                  <p className="text-slate-200 text-lg leading-relaxed">
                    {response['AI Summary']}
                  </p>
                </div>
                {response['ATR Definition'] && (
                  <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700">
                    <div className="text-purple-400 font-semibold mb-2">ATR Definition</div>
                    <p className="text-slate-200 text-lg leading-relaxed">
                      {response['ATR Definition']}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {response['Support/Resistance 1'] && (() => {
              const level1 = parseSupportResistanceLevel(response['Support/Resistance 1']);
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
                        <div className="bg-slate-900/60 rounded-xl p-4 mb-4">
                          <div className="text-green-300 text-sm mb-2">Support Price</div>
                          <div className="text-white text-3xl font-bold">{formatPrice(level1!['Support Price'])}</div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div className="bg-slate-900/40 rounded-lg p-4">
                            <div className="text-green-300 text-xs mb-1">Score</div>
                            <div className="text-white text-xl font-bold">{formatValue(level1!['Support Score '])}</div>
                          </div>
                          <div className="bg-slate-900/40 rounded-lg p-4">
                            <div className="text-green-300 text-xs mb-1">Historical Accuracy Rate</div>
                            <div className="text-white text-xl font-bold">{formatValue(level1!['Support Win Rate'])}</div>
                          </div>
                          <div className="bg-slate-900/40 rounded-lg p-4">
                            <div className="text-green-300 text-xs mb-1">Avg Move</div>
                            <div className="text-white text-xl font-bold">{formatValue(level1!['Support Average Move'])}</div>
                          </div>
                          <div className="bg-slate-900/40 rounded-lg p-4">
                            <div className="text-green-300 text-xs mb-1">Distance</div>
                            <div className="text-white text-xl font-bold">{formatValue(level1!['Support Distance Percentage'])}</div>
                          </div>
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
                      <div className="bg-slate-900/60 rounded-xl p-4 mb-4">
                        <div className="text-red-300 text-sm mb-2">Resistance Price</div>
                        <div className="text-white text-3xl font-bold">{formatPrice(level1!['Resistance Price'])}</div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-slate-900/40 rounded-lg p-4">
                          <div className="text-red-300 text-xs mb-1">Score</div>
                          <div className="text-white text-xl font-bold">{formatValue(level1!['Resistance Score'])}</div>
                        </div>
                        <div className="bg-slate-900/40 rounded-lg p-4">
                          <div className="text-red-300 text-xs mb-1">Historical Accuracy Rate</div>
                          <div className="text-white text-xl font-bold">{formatValue(level1!['Resistance Win Rate'])}</div>
                        </div>
                        <div className="bg-slate-900/40 rounded-lg p-4">
                          <div className="text-red-300 text-xs mb-1">Avg Move</div>
                          <div className="text-white text-xl font-bold">{formatValue(level1!['Resistance Average Move'])}</div>
                        </div>
                        <div className="bg-slate-900/40 rounded-lg p-4">
                          <div className="text-red-300 text-xs mb-1">Distance</div>
                          <div className="text-white text-xl font-bold">{formatValue(level1!['Resistance Distance Percentage'])}</div>
                        </div>
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

            {response['Support/Resistance 2'] && (() => {
              const level2 = parseSupportResistanceLevel(response['Support/Resistance 2']);
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
                        <div className="bg-slate-900/60 rounded-xl p-4 mb-4">
                          <div className="text-green-300 text-sm mb-2">Support Price</div>
                          <div className="text-white text-3xl font-bold">{formatPrice(level2['Support Price'])}</div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div className="bg-slate-900/40 rounded-lg p-4">
                            <div className="text-green-300 text-xs mb-1">Score</div>
                            <div className="text-white text-xl font-bold">{formatValue(level2['Support Score '])}</div>
                          </div>
                          <div className="bg-slate-900/40 rounded-lg p-4">
                            <div className="text-green-300 text-xs mb-1">Historical Accuracy Rate</div>
                            <div className="text-white text-xl font-bold">{formatValue(level2['Support Win Rate'])}</div>
                          </div>
                          <div className="bg-slate-900/40 rounded-lg p-4">
                            <div className="text-green-300 text-xs mb-1">Avg Move</div>
                            <div className="text-white text-xl font-bold">{formatValue(level2['Support Average Move'])}</div>
                          </div>
                          <div className="bg-slate-900/40 rounded-lg p-4">
                            <div className="text-green-300 text-xs mb-1">Distance</div>
                            <div className="text-white text-xl font-bold">{formatValue(level2['Support Distance Percentage'])}</div>
                          </div>
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
                        <div className="bg-slate-900/60 rounded-xl p-4 mb-4">
                          <div className="text-red-300 text-sm mb-2">Resistance Price</div>
                          <div className="text-white text-3xl font-bold">{formatPrice(level2['Resistance Price'])}</div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div className="bg-slate-900/40 rounded-lg p-4">
                            <div className="text-red-300 text-xs mb-1">Score</div>
                            <div className="text-white text-xl font-bold">{formatValue(level2['Resistance Score'])}</div>
                          </div>
                          <div className="bg-slate-900/40 rounded-lg p-4">
                            <div className="text-red-300 text-xs mb-1">Historical Accuracy Rate</div>
                            <div className="text-white text-xl font-bold">{formatValue(level2['Resistance Win Rate'])}</div>
                          </div>
                          <div className="bg-slate-900/40 rounded-lg p-4">
                            <div className="text-red-300 text-xs mb-1">Avg Move</div>
                            <div className="text-white text-xl font-bold">{formatValue(level2['Resistance Average Move'])}</div>
                          </div>
                          <div className="bg-slate-900/40 rounded-lg p-4">
                            <div className="text-red-300 text-xs mb-1">Distance</div>
                            <div className="text-white text-xl font-bold">{formatValue(level2['Resistance Distance Percentage'])}</div>
                          </div>
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
    </div>
  );
}
