import { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation, Link } from 'react-router-dom';
import { ArrowLeft, Home, Shield, TrendingUp, TrendingDown, Loader2, AlertCircle } from 'lucide-react';

interface SupportResistanceData {
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

interface StopSignalResponse {
  'AI Summary': string;
  'ATR Definition': string;
  'Support/Resistance 1': string;
  'Support/Resistance 2': string;
}

export default function StopSignalPage() {
  const { category, symbol } = useParams<{ category: string; symbol: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const [response, setResponse] = useState<StopSignalResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!category || !symbol) return;
    fetchStopSignal();
  }, [category, symbol]);

  const fetchStopSignal = async () => {
    if (!category || !symbol) return;

    try {
      const payload = {
        symbol: symbol.toUpperCase(),
        category: category.charAt(0).toUpperCase() + category.slice(1)
      };

      const res = await fetch('https://hook.us2.make.com/rd8evkxibks74xdfiij2591q52xjjfvp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      });

      if (!res.ok) throw new Error('Failed to fetch support/resistance analysis');

      const data = await res.json();
      setResponse(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const parseSupportResistanceData = (jsonString: string): SupportResistanceData | null => {
    try {
      if (!jsonString || jsonString.toLowerCase() === 'null' || jsonString.toLowerCase() === 'empty') {
        return null;
      }
      return JSON.parse(jsonString);
    } catch {
      return null;
    }
  };

  const formatValue = (value: any): string => {
    if (value === null || value === undefined || value === '' || value === 'N/A' || value === 'null' || value === '%') return 'No Data Found';
    const strValue = String(value);
    const num = parseFloat(strValue);
    if (!isNaN(num)) {
      return num.toFixed(2);
    }
    return strValue;
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

  const hasValidData = (data: SupportResistanceData | null, type: 'support' | 'resistance'): boolean => {
    if (!data) return false;
    const priceKey = type === 'support' ? 'Support Price' : 'Resistance Price';
    const price = data[priceKey];
    return !!(price && price !== '' && price !== 'N/A' && price !== 'null' && price !== '0' && price !== null);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <Loader2 className="w-20 h-20 text-red-500 animate-spin mb-6" />
        <h2 className="text-3xl font-bold text-white mb-3">Calculating Support & Resistance...</h2>
        <p className="text-slate-400 text-lg">Analyzing price levels and market structure</p>
        <div className="mt-8 flex gap-2">
          <div className="w-3 h-3 bg-red-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
          <div className="w-3 h-3 bg-red-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
          <div className="w-3 h-3 bg-red-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen pb-12">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-5xl font-bold text-white mb-4">Support & Resistance Analysis</h1>
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

        <div className="bg-red-900/40 border-2 border-red-600/50 rounded-2xl p-8 shadow-xl">
          <h2 className="text-2xl font-bold text-red-400 mb-4">Error</h2>
          <p className="text-white">{error}</p>
        </div>
      </div>
    );
  }

  if (!response) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-slate-400 text-xl">No data available</p>
      </div>
    );
  }

  const sr1Data = parseSupportResistanceData(response['Support/Resistance 1']);
  const sr2Data = parseSupportResistanceData(response['Support/Resistance 2']);

  return (
    <div className="min-h-screen pb-12">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-5xl font-bold text-white mb-4">Support & Resistance Analysis</h1>
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

      <div className="space-y-6">
        {(response['AI Summary'] || response['ATR Definition']) && (
          <div className="bg-gradient-to-br from-slate-900/80 to-slate-800/60 border-2 border-slate-700 rounded-2xl p-8 shadow-xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-slate-700 rounded-lg">
                <AlertCircle className="w-6 h-6 text-slate-300" />
              </div>
              <h3 className="text-2xl font-bold text-white">Summary</h3>
            </div>
            <div className="space-y-4">
              {response['AI Summary'] && (
                <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700">
                  <div className="text-cyan-400 font-semibold mb-2">AI Summary</div>
                  <p className="text-slate-200 text-lg leading-relaxed">
                    {response['AI Summary']}
                  </p>
                </div>
              )}
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
          {sr1Data && (
            <>
              <div className="bg-gradient-to-br from-green-900/40 to-green-800/30 border-2 border-green-600/50 rounded-2xl p-6 shadow-xl">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-green-500/20 rounded-lg">
                    <Shield className="w-6 h-6 text-green-400" />
                  </div>
                  <h3 className="text-xl font-bold text-white">Support Level 1</h3>
                </div>
                {!hasValidData(sr1Data, 'support') ? (
                  <div className="flex items-center justify-center py-12">
                    <p className="text-slate-400 text-2xl font-semibold">Not Found</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <Link to="/metric-definition?metric=support-price" state={{ from: location.pathname }} className="block bg-slate-900/50 rounded-lg p-4 border border-green-500/30 hover:bg-slate-900/80 hover:scale-[1.02] hover:shadow-lg hover:shadow-green-500/20 transition-all cursor-pointer">
                      <div className="text-green-300 text-sm font-semibold mb-1">Support Price</div>
                      <div className="text-white text-2xl font-bold">{formatPrice(sr1Data['Support Price'])}</div>
                    </Link>
                    <div className="grid grid-cols-2 gap-3">
                      <Link to="/metric-definition?metric=score" state={{ from: location.pathname }} className="bg-slate-900/50 rounded-lg p-3 border border-green-500/20 hover:bg-slate-900/80 hover:scale-105 hover:shadow-lg hover:shadow-green-500/20 transition-all cursor-pointer">
                        <div className="text-green-300 text-xs font-semibold mb-1">Score</div>
                        <div className="text-white text-lg font-bold">{formatValue(sr1Data['Support Score '])}</div>
                      </Link>
                      <Link to="/metric-definition?metric=historical-accuracy" state={{ from: location.pathname }} className="bg-slate-900/50 rounded-lg p-3 border border-green-500/20 hover:bg-slate-900/80 hover:scale-105 hover:shadow-lg hover:shadow-green-500/20 transition-all cursor-pointer">
                        <div className="text-green-300 text-xs font-semibold mb-1">Historical Accuracy Rate</div>
                        <div className="text-white text-lg font-bold">{formatValue(sr1Data['Support Win Rate'])}</div>
                      </Link>
                      <Link to="/metric-definition?metric=average-move" state={{ from: location.pathname }} className="bg-slate-900/50 rounded-lg p-3 border border-green-500/20 hover:bg-slate-900/80 hover:scale-105 hover:shadow-lg hover:shadow-green-500/20 transition-all cursor-pointer">
                        <div className="text-green-300 text-xs font-semibold mb-1">Avg Move</div>
                        <div className="text-white text-lg font-bold">{formatValue(sr1Data['Support Average Move'])}</div>
                      </Link>
                      <Link to="/metric-definition?metric=distance" state={{ from: location.pathname }} className="bg-slate-900/50 rounded-lg p-3 border border-green-500/20 hover:bg-slate-900/80 hover:scale-105 hover:shadow-lg hover:shadow-green-500/20 transition-all cursor-pointer">
                        <div className="text-green-300 text-xs font-semibold mb-1">Distance</div>
                        <div className="text-white text-lg font-bold">{formatValue(sr1Data['Support Distance Percentage'])}</div>
                      </Link>
                    </div>
                    {sr1Data['Best Support Level'] && sr1Data['Best Support Level'] !== 'null' && (
                      <div className="bg-green-900/30 rounded-lg p-3">
                        <div className="text-green-300 text-xs font-semibold mb-1">Best Support Level</div>
                        <div className="text-white text-sm">{sr1Data['Best Support Level']}</div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="bg-gradient-to-br from-red-900/40 to-red-800/30 border-2 border-red-600/50 rounded-2xl p-6 shadow-xl">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-red-500/20 rounded-lg">
                    <TrendingUp className="w-6 h-6 text-red-400" />
                  </div>
                  <h3 className="text-xl font-bold text-white">Resistance Level 1</h3>
                </div>
                {!hasValidData(sr1Data, 'resistance') ? (
                  <div className="flex items-center justify-center py-12">
                    <p className="text-slate-400 text-2xl font-semibold">Not Found</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <Link to="/metric-definition?metric=resistance-price" state={{ from: location.pathname }} className="block bg-slate-900/50 rounded-lg p-4 border border-red-500/30 hover:bg-slate-900/80 hover:scale-[1.02] hover:shadow-lg hover:shadow-red-500/20 transition-all cursor-pointer">
                      <div className="text-red-300 text-sm font-semibold mb-1">Resistance Price</div>
                      <div className="text-white text-2xl font-bold">{formatPrice(sr1Data['Resistance Price'])}</div>
                    </Link>
                    <div className="grid grid-cols-2 gap-3">
                      <Link to="/metric-definition?metric=score" state={{ from: location.pathname }} className="bg-slate-900/50 rounded-lg p-3 border border-red-500/20 hover:bg-slate-900/80 hover:scale-105 hover:shadow-lg hover:shadow-red-500/20 transition-all cursor-pointer">
                        <div className="text-red-300 text-xs font-semibold mb-1">Score</div>
                        <div className="text-white text-lg font-bold">{formatValue(sr1Data['Resistance Score'])}</div>
                      </Link>
                      <Link to="/metric-definition?metric=historical-accuracy" state={{ from: location.pathname }} className="bg-slate-900/50 rounded-lg p-3 border border-red-500/20 hover:bg-slate-900/80 hover:scale-105 hover:shadow-lg hover:shadow-red-500/20 transition-all cursor-pointer">
                        <div className="text-red-300 text-xs font-semibold mb-1">Historical Accuracy Rate</div>
                        <div className="text-white text-lg font-bold">{formatValue(sr1Data['Resistance Win Rate'])}</div>
                      </Link>
                      <Link to="/metric-definition?metric=average-move" state={{ from: location.pathname }} className="bg-slate-900/50 rounded-lg p-3 border border-red-500/20 hover:bg-slate-900/80 hover:scale-105 hover:shadow-lg hover:shadow-red-500/20 transition-all cursor-pointer">
                        <div className="text-red-300 text-xs font-semibold mb-1">Avg Move</div>
                        <div className="text-white text-lg font-bold">{formatValue(sr1Data['Resistance Average Move'])}</div>
                      </Link>
                      <Link to="/metric-definition?metric=distance" state={{ from: location.pathname }} className="bg-slate-900/50 rounded-lg p-3 border border-red-500/20 hover:bg-slate-900/80 hover:scale-105 hover:shadow-lg hover:shadow-red-500/20 transition-all cursor-pointer">
                        <div className="text-red-300 text-xs font-semibold mb-1">Distance</div>
                        <div className="text-white text-lg font-bold">{formatValue(sr1Data['Resistance Distance Percentage'])}</div>
                      </Link>
                    </div>
                    {sr1Data['Best Resistance Level'] && sr1Data['Best Resistance Level'] !== 'null' && (
                      <div className="bg-red-900/30 rounded-lg p-3">
                        <div className="text-red-300 text-xs font-semibold mb-1">Best Resistance Level</div>
                        <div className="text-white text-sm">{sr1Data['Best Resistance Level']}</div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </>
          )}

          {sr2Data && (
            <>
              <div className="bg-gradient-to-br from-green-900/40 to-green-800/30 border-2 border-green-600/50 rounded-2xl p-6 shadow-xl">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-green-500/20 rounded-lg">
                    <Shield className="w-6 h-6 text-green-400" />
                  </div>
                  <h3 className="text-xl font-bold text-white">Support Level 2</h3>
                </div>
                {!hasValidData(sr2Data, 'support') ? (
                  <div className="flex items-center justify-center py-12">
                    <p className="text-slate-400 text-2xl font-semibold">Not Found</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <Link to="/metric-definition?metric=support-price" state={{ from: location.pathname }} className="block bg-slate-900/50 rounded-lg p-4 border border-green-500/30 hover:bg-slate-900/80 hover:scale-[1.02] hover:shadow-lg hover:shadow-green-500/20 transition-all cursor-pointer">
                      <div className="text-green-300 text-sm font-semibold mb-1">Support Price</div>
                      <div className="text-white text-2xl font-bold">{formatPrice(sr2Data['Support Price'])}</div>
                    </Link>
                    <div className="grid grid-cols-2 gap-3">
                      <Link to="/metric-definition?metric=score" state={{ from: location.pathname }} className="bg-slate-900/50 rounded-lg p-3 border border-green-500/20 hover:bg-slate-900/80 hover:scale-105 hover:shadow-lg hover:shadow-green-500/20 transition-all cursor-pointer">
                        <div className="text-green-300 text-xs font-semibold mb-1">Score</div>
                        <div className="text-white text-lg font-bold">{formatValue(sr2Data['Support Score '])}</div>
                      </Link>
                      <Link to="/metric-definition?metric=historical-accuracy" state={{ from: location.pathname }} className="bg-slate-900/50 rounded-lg p-3 border border-green-500/20 hover:bg-slate-900/80 hover:scale-105 hover:shadow-lg hover:shadow-green-500/20 transition-all cursor-pointer">
                        <div className="text-green-300 text-xs font-semibold mb-1">Historical Accuracy Rate</div>
                        <div className="text-white text-lg font-bold">{formatValue(sr2Data['Support Win Rate'])}</div>
                      </Link>
                      <Link to="/metric-definition?metric=average-move" state={{ from: location.pathname }} className="bg-slate-900/50 rounded-lg p-3 border border-green-500/20 hover:bg-slate-900/80 hover:scale-105 hover:shadow-lg hover:shadow-green-500/20 transition-all cursor-pointer">
                        <div className="text-green-300 text-xs font-semibold mb-1">Avg Move</div>
                        <div className="text-white text-lg font-bold">{formatValue(sr2Data['Support Average Move'])}</div>
                      </Link>
                      <Link to="/metric-definition?metric=distance" state={{ from: location.pathname }} className="bg-slate-900/50 rounded-lg p-3 border border-green-500/20 hover:bg-slate-900/80 hover:scale-105 hover:shadow-lg hover:shadow-green-500/20 transition-all cursor-pointer">
                        <div className="text-green-300 text-xs font-semibold mb-1">Distance</div>
                        <div className="text-white text-lg font-bold">{formatValue(sr2Data['Support Distance Percentage'])}</div>
                      </Link>
                    </div>
                    {sr2Data['Best Support Level'] && sr2Data['Best Support Level'] !== 'null' && (
                      <div className="bg-green-900/30 rounded-lg p-3">
                        <div className="text-green-300 text-xs font-semibold mb-1">Best Support Level</div>
                        <div className="text-white text-sm">{sr2Data['Best Support Level']}</div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="bg-gradient-to-br from-red-900/40 to-red-800/30 border-2 border-red-600/50 rounded-2xl p-6 shadow-xl">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-red-500/20 rounded-lg">
                    <TrendingUp className="w-6 h-6 text-red-400" />
                  </div>
                  <h3 className="text-xl font-bold text-white">Resistance Level 2</h3>
                </div>
                {!hasValidData(sr2Data, 'resistance') ? (
                  <div className="flex items-center justify-center py-12">
                    <p className="text-slate-400 text-2xl font-semibold">Not Found</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <Link to="/metric-definition?metric=resistance-price" state={{ from: location.pathname }} className="block bg-slate-900/50 rounded-lg p-4 border border-red-500/30 hover:bg-slate-900/80 hover:scale-[1.02] hover:shadow-lg hover:shadow-red-500/20 transition-all cursor-pointer">
                      <div className="text-red-300 text-sm font-semibold mb-1">Resistance Price</div>
                      <div className="text-white text-2xl font-bold">{formatPrice(sr2Data['Resistance Price'])}</div>
                    </Link>
                    <div className="grid grid-cols-2 gap-3">
                      <Link to="/metric-definition?metric=score" state={{ from: location.pathname }} className="bg-slate-900/50 rounded-lg p-3 border border-red-500/20 hover:bg-slate-900/80 hover:scale-105 hover:shadow-lg hover:shadow-red-500/20 transition-all cursor-pointer">
                        <div className="text-red-300 text-xs font-semibold mb-1">Score</div>
                        <div className="text-white text-lg font-bold">{formatValue(sr2Data['Resistance Score'])}</div>
                      </Link>
                      <Link to="/metric-definition?metric=historical-accuracy" state={{ from: location.pathname }} className="bg-slate-900/50 rounded-lg p-3 border border-red-500/20 hover:bg-slate-900/80 hover:scale-105 hover:shadow-lg hover:shadow-red-500/20 transition-all cursor-pointer">
                        <div className="text-red-300 text-xs font-semibold mb-1">Historical Accuracy Rate</div>
                        <div className="text-white text-lg font-bold">{formatValue(sr2Data['Resistance Win Rate'])}</div>
                      </Link>
                      <Link to="/metric-definition?metric=average-move" state={{ from: location.pathname }} className="bg-slate-900/50 rounded-lg p-3 border border-red-500/20 hover:bg-slate-900/80 hover:scale-105 hover:shadow-lg hover:shadow-red-500/20 transition-all cursor-pointer">
                        <div className="text-red-300 text-xs font-semibold mb-1">Avg Move</div>
                        <div className="text-white text-lg font-bold">{formatValue(sr2Data['Resistance Average Move'])}</div>
                      </Link>
                      <Link to="/metric-definition?metric=distance" state={{ from: location.pathname }} className="bg-slate-900/50 rounded-lg p-3 border border-red-500/20 hover:bg-slate-900/80 hover:scale-105 hover:shadow-lg hover:shadow-red-500/20 transition-all cursor-pointer">
                        <div className="text-red-300 text-xs font-semibold mb-1">Distance</div>
                        <div className="text-white text-lg font-bold">{formatValue(sr2Data['Resistance Distance Percentage'])}</div>
                      </Link>
                    </div>
                    {sr2Data['Best Resistance Level'] && sr2Data['Best Resistance Level'] !== 'null' && (
                      <div className="bg-red-900/30 rounded-lg p-3">
                        <div className="text-red-300 text-xs font-semibold mb-1">Best Resistance Level</div>
                        <div className="text-white text-sm">{sr2Data['Best Resistance Level']}</div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </>
          )}
        </div>

      </div>
    </div>
  );
}
