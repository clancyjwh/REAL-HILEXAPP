import { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams, useLocation, useParams } from 'react-router-dom';
import { ArrowLeft, TrendingUp, Search } from 'lucide-react';
import CompactAnalysisCard from '../components/CompactAnalysisCard';
import CompactCumulativeCard from '../components/CompactCumulativeCard';
import { searchAssets, AssetSuggestion } from '../utils/assetSuggestions';

type IndicatorType = 'RSI' | 'SMA' | 'Boll' | 'MACD' | 'ROC' | 'CCI';

interface AnalysisResult {
  indicator: IndicatorType;
  result: string;
  isLoading: boolean;
  error?: string;
}

interface CumulativeSignal {
  value: number;
  SMA: number;
  RSI: number;
  Boll: number;
  CCI: number;
  weights: {
    SMA: number;
    RSI: number;
    Boll: number;
    CCI: number;
  };
}

const webhookUrls: Record<IndicatorType, string> = {
  RSI: 'https://hook.us2.make.com/fwoogwb1myp9akspd6rnfbmux2obkqga',
  SMA: 'https://hook.us2.make.com/d6gfbj0in2ouo0xv534ei2q27kd76sgv',
  Boll: 'https://hook.us2.make.com/u9pfddv7d07ku5qt73mqs9i83wqcqimg',
  MACD: 'https://hook.us2.make.com/8po4p1j5ded4biv15s2jtkdvctiib495',
  ROC: 'https://hook.us2.make.com/srrciz77z6h5izegw90fg90nx2sr5oke',
  CCI: 'https://hook.us2.make.com/xrddsmlrm6n7ya5rniubrdajee1p1a6q',
};

const indicatorNames: Record<IndicatorType, string> = {
  RSI: 'Relative Strength Index',
  SMA: 'Simple Moving Average',
  Boll: 'Bollinger Bands',
  MACD: 'Moving Average Convergence Divergence',
  ROC: 'Rate of Change',
  CCI: 'Commodity Channel Index',
};

const assetClassInfo: Record<string, { name: string; placeholder: string }> = {
  cryptocurrency: {
    name: 'Cryptocurrency',
    placeholder: 'e.g., BTC, ETH, SOL...',
  },
  stock: {
    name: 'Stock',
    placeholder: 'e.g., AAPL, TSLA, NVDA...',
  },
  forex: {
    name: 'Forex Pair',
    placeholder: 'e.g., EUR/USD, GBP/USD...',
  },
  commodity: {
    name: 'Commodity',
    placeholder: 'e.g., XAU/USD, HG1, C_1, WTI/USD...',
  },
};

const formatForexPair = (value: string): string => {
  const cleaned = value.replace(/[^A-Z]/gi, '').toUpperCase();
  if (cleaned.length === 6) {
    return `${cleaned.slice(0, 3)}/${cleaned.slice(3)}`;
  }
  return value;
};

const validateForexPair = (value: string): boolean => {
  const regex = /^[A-Z]{3}\/[A-Z]{3}$/;
  return regex.test(value);
};

const assetClassToWebhook: Record<string, string> = {
  cryptocurrency: 'crypto',
  stock: 'stocks',
  forex: 'forex',
  commodity: 'commodities',
};

export default function AnalysisSearchPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { assetClass } = useParams<{ assetClass?: string }>();
  const [searchParams] = useSearchParams();
  const [input, setInput] = useState(location.state?.ticker || '');
  const [results, setResults] = useState<AnalysisResult[]>(location.state?.results || []);
  const [overallProgress, setOverallProgress] = useState(location.state?.results ? 100 : 0);
  const [error, setError] = useState<string>('');
  const [suggestions, setSuggestions] = useState<AssetSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  const selectedIndicators = (searchParams.get('indicators') || '').split(',').filter(Boolean) as IndicatorType[];

  useEffect(() => {
    const activeAnalyses = results.filter(r => r.isLoading).length;
    if (activeAnalyses > 0) {
      const completedAnalyses = results.filter(r => !r.isLoading && r.result).length;
      const progress = (completedAnalyses / selectedIndicators.length) * 100;
      setOverallProgress(progress);
    } else if (results.length > 0 && results.every(r => !r.isLoading)) {
      setOverallProgress(100);
    }
  }, [results, selectedIndicators.length]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const detectAssetClass = (ticker: string): string => {
    const cleanTicker = ticker.replace(/\s*\(.*?\)\s*/g, '').trim().toUpperCase();

    const cryptoSymbols = [
      'BTC', 'ETH', 'SOL', 'XRP', 'ADA', 'DOGE', 'DOT', 'MATIC', 'LINK', 'UNI',
      'AVAX', 'ATOM', 'LTC', 'BCH', 'XLM', 'ALGO', 'VET', 'ICP', 'FIL', 'TRX',
      'ETC', 'NEAR', 'HBAR', 'APT', 'ARB', 'OP', 'SUI', 'INJ', 'STX', 'TIA',
      'USDT', 'USDC', 'BUSD', 'DAI', 'TUSD', 'USDP', 'GUSD', 'USDD',
      'BNB', 'AXS', 'SAND', 'MANA', 'ENJ', 'GALA', 'CHZ', 'APE', 'SHIB',
      'PEPE', 'FLOKI', 'BONK'
    ];

    const commoditySymbols = [
      'XAU', 'XAG', 'OIL', 'GAS', 'GOLD', 'SILVER', 'COPPER', 'PLATINUM',
      'PALLADIUM', 'CRUDE', 'WTI', 'BRENT', 'NG', 'GC', 'SI', 'CL', 'HG'
    ];

    if (cryptoSymbols.includes(cleanTicker)) return 'crypto';
    if (commoditySymbols.includes(cleanTicker)) return 'commodities';
    if (cleanTicker.includes('/')) return 'forex';
    return 'stocks';
  };

  const analyzeIndicator = async (indicator: IndicatorType, ticker: string) => {
    try {
      const detectedAssetClass = assetClass
        ? assetClassToWebhook[assetClass] || 'stocks'
        : detectAssetClass(ticker);

      const response = await fetch(webhookUrls[indicator], {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ticker: ticker.toUpperCase(),
          asset_class: detectedAssetClass,
        }),
      });

      const text = await response.text();
      return text;
    } catch (error) {
      throw new Error('Failed to fetch analysis');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    if (assetClass === 'forex' && !validateForexPair(input)) {
      setError('Please enter a valid forex pair in format XXX/YYY (e.g., EUR/USD)');
      return;
    }

    setError('');

    const initialResults: AnalysisResult[] = selectedIndicators.map(indicator => ({
      indicator,
      result: '',
      isLoading: true,
    }));

    setResults(initialResults);
    setOverallProgress(0);

    selectedIndicators.forEach(async (indicator, index) => {
      try {
        const result = await analyzeIndicator(indicator, input.trim());
        setResults(prev => prev.map((r, i) =>
          i === index ? { ...r, result, isLoading: false } : r
        ));
      } catch (error) {
        setResults(prev => prev.map((r, i) =>
          i === index ? { ...r, error: 'Asset not found', isLoading: false } : r
        ));
      }
    });
  };

  const isAnalyzing = results.some(r => r.isLoading);

  const handleInputChange = (value: string) => {
    const upperValue = value.toUpperCase();
    if (assetClass === 'forex') {
      setInput(formatForexPair(upperValue));
    } else {
      setInput(upperValue);
    }
    setError('');

    if (upperValue.trim()) {
      const assetClassMap: Record<string, 'stocks' | 'crypto' | 'forex' | 'commodities'> = {
        cryptocurrency: 'crypto',
        stock: 'stocks',
        forex: 'forex',
        commodity: 'commodities',
      };
      const mappedAssetClass = assetClass ? assetClassMap[assetClass] : undefined;
      const results = searchAssets(upperValue, mappedAssetClass);
      setSuggestions(results);
      setShowSuggestions(results.length > 0);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  const handleSelectSuggestion = (suggestion: AssetSuggestion) => {
    setInput(suggestion.symbol);
    setSuggestions([]);
    setShowSuggestions(false);
  };

  const extractSignalValue = (result: string): number | null => {
    try {
      const jsonData = JSON.parse(result);
      if (jsonData['Analytical Score'] !== undefined) {
        return parseFloat(jsonData['Analytical Score']);
      } else if (jsonData.Signal !== undefined) {
        return parseFloat(jsonData.Signal);
      } else if (jsonData['Trade Signal'] !== undefined) {
        return parseFloat(jsonData['Trade Signal']);
      }
    } catch (error) {
      console.error('Error extracting signal value:', error);
    }
    return null;
  };

  const extractWeight = (result: string, indicator: string): number | null => {
    try {
      const jsonData = JSON.parse(result);

      // Try multiple key patterns
      const patterns = [
        `${indicator} Weight`,
        `${indicator.toLowerCase()} weight output`,
        `${indicator.toLowerCase()}_weight_output`,
      ];

      for (const pattern of patterns) {
        if (jsonData[pattern] !== undefined) {
          const value = parseFloat(jsonData[pattern]);
          if (!isNaN(value)) {
            return value;
          }
        }
      }
    } catch (error) {
      console.error('Error extracting weight:', error);
    }
    return null;
  };

  const calculateCumulativeSignal = (): CumulativeSignal | null => {
    const requiredIndicators: IndicatorType[] = ['SMA', 'RSI', 'Boll', 'CCI'];
    const completedResults = results.filter(r => !r.isLoading && !r.error && r.result);

    const hasAllRequired = requiredIndicators.every(indicator =>
      completedResults.some(r => r.indicator === indicator)
    );

    if (!hasAllRequired) {
      return null;
    }

    const signals: Partial<Record<IndicatorType, number>> = {};
    const weights: Partial<Record<IndicatorType, number>> = {};

    completedResults.forEach(result => {
      const signalValue = extractSignalValue(result.result);
      if (signalValue !== null && requiredIndicators.includes(result.indicator)) {
        signals[result.indicator] = signalValue;

        const weight = extractWeight(result.result, result.indicator);
        if (weight !== null) {
          weights[result.indicator] = weight;
        }
      }
    });

    if (signals.SMA !== undefined && signals.RSI !== undefined &&
        signals.Boll !== undefined && signals.CCI !== undefined) {

      const smaWeight = weights.SMA ?? 0.35;
      const rsiWeight = weights.RSI ?? 0.30;
      const bollWeight = weights.Boll ?? 0.20;
      const cciWeight = weights.CCI ?? 0.15;

      const cumulativeValue = (
        signals.SMA * smaWeight +
        signals.RSI * rsiWeight +
        signals.Boll * bollWeight +
        signals.CCI * cciWeight
      );

      return {
        value: parseFloat(cumulativeValue.toFixed(2)),
        SMA: signals.SMA,
        RSI: signals.RSI,
        Boll: signals.Boll,
        CCI: signals.CCI,
        weights: {
          SMA: smaWeight,
          RSI: rsiWeight,
          Boll: bollWeight,
          CCI: cciWeight,
        },
      };
    }

    return null;
  };

  const cumulativeSignal = calculateCumulativeSignal();

  return (
    <>
      <div className="mb-8">
        <button
          onClick={() => navigate(`/tools/analysis/${assetClass || 'stock'}`)}
          className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-4"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Indicator Selection
        </button>
        <div className="flex items-center gap-3">
          <div className="p-2 bg-amber-500/10 rounded-lg">
            <TrendingUp className="w-6 h-6 text-amber-500" />
          </div>
          <div>
            <h1 className="text-4xl font-bold text-white">Analysis</h1>
            <p className="text-slate-300 text-base font-bold mt-1">Generate current technical analysis based on historical trends</p>
            <p className="text-slate-500 text-xs mt-2 leading-relaxed max-w-2xl">
              This tool provides technical analysis based on historical data and current market indicators.
              It is for informational and educational purposes only and does not constitute financial advice.
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-4xl">
        <div className="bg-slate-900 border border-slate-700 rounded-xl p-6 mb-6">
          <div className="mb-4">
            <h3 className="text-white font-medium mb-2">Selected Indicators ({selectedIndicators.length})</h3>
            <div className="flex flex-wrap gap-2">
              {selectedIndicators.map(indicator => (
                <span
                  key={indicator}
                  className="px-3 py-1 bg-amber-500/10 border border-amber-500/30 rounded-lg text-amber-500 text-sm"
                >
                  {indicatorNames[indicator]}
                </span>
              ))}
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="mb-8">
          <div className="bg-slate-900 border border-slate-700 rounded-xl p-6">
            <label htmlFor="input" className="block text-white font-medium mb-3">
              Enter {assetClassInfo[assetClass || 'stock']?.name} Symbol
            </label>
            <div className="flex gap-3">
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  ref={inputRef}
                  type="text"
                  id="input"
                  value={input}
                  onChange={(e) => handleInputChange(e.target.value)}
                  onFocus={() => {
                    if (input.trim() && suggestions.length > 0) {
                      setShowSuggestions(true);
                    }
                  }}
                  placeholder={assetClassInfo[assetClass || 'stock']?.placeholder}
                  className="w-full pl-12 pr-4 py-3 bg-slate-800 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
                  disabled={isAnalyzing}
                  style={{ textTransform: 'uppercase' }}
                  autoComplete="off"
                />
                {showSuggestions && suggestions.length > 0 && (
                  <div
                    ref={suggestionsRef}
                    className="absolute z-50 w-full mt-2 bg-slate-800 border border-slate-600 rounded-lg shadow-xl max-h-64 overflow-y-auto"
                  >
                    {suggestions.map((suggestion, index) => (
                      <button
                        key={`${suggestion.symbol}-${index}`}
                        type="button"
                        onClick={() => handleSelectSuggestion(suggestion)}
                        className="w-full px-4 py-3 text-left hover:bg-slate-700 transition-colors border-b border-slate-700 last:border-b-0"
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="text-white font-medium">{suggestion.symbol}</div>
                            <div className="text-slate-400 text-sm">{suggestion.name}</div>
                          </div>
                          <div className="text-xs text-slate-500 bg-slate-900 px-2 py-1 rounded">
                            {suggestion.category}
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <button
                type="submit"
                disabled={isAnalyzing || !input.trim()}
                className="px-6 py-3 bg-amber-600 hover:bg-amber-700 disabled:bg-slate-700 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors"
              >
                {isAnalyzing ? 'Analyzing...' : 'Analyze'}
              </button>
            </div>
            {error && (
              <p className="mt-3 text-red-400 text-sm">{error}</p>
            )}
          </div>
        </form>

        {isAnalyzing && (
          <div className="bg-slate-900 border border-slate-700 rounded-xl p-6 mb-8">
            <div className="mb-3">
              <div className="flex items-center justify-between text-sm mb-2">
                <span className="text-slate-400">Running analysis across all indicators...</span>
                <span className="text-white font-medium">{Math.round(overallProgress)}%</span>
              </div>
              <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-amber-500 to-amber-600 transition-all duration-300 ease-out"
                  style={{ width: `${overallProgress}%` }}
                />
              </div>
            </div>
          </div>
        )}

        {cumulativeSignal && !isAnalyzing && (
          <div className="mb-8">
            <CompactCumulativeCard
              value={cumulativeSignal.value}
              onClick={() => navigate('/tools/analysis/cumulative?indicators=' + searchParams.get('indicators'), {
                state: {
                  cumulativeSignal,
                  ticker: input,
                  returnState: {
                    ticker: input,
                    results: results
                  }
                }
              })}
            />
          </div>
        )}

        {results.length > 0 && (
          <>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              {results.map((result, index) => (
                <div key={index}>
                  {result.isLoading ? (
                    <div className="bg-slate-900 border border-slate-700 rounded-xl p-6 h-full">
                      <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                        <TrendingUp className="w-5 h-5 text-amber-500" />
                        {indicatorNames[result.indicator]}
                      </h2>
                      <div className="bg-slate-800 rounded-lg p-4 text-slate-400 animate-pulse">
                        Loading analysis...
                      </div>
                    </div>
                  ) : result.error ? (
                    <div className="bg-slate-900 border border-slate-700 rounded-xl p-6 h-full">
                      <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                        <TrendingUp className="w-5 h-5 text-amber-500" />
                        {indicatorNames[result.indicator]}
                      </h2>
                      <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-4 text-red-400">
                        {result.error}
                      </div>
                    </div>
                  ) : (
                    <CompactAnalysisCard
                      indicator={indicatorNames[result.indicator]}
                      result={result.result}
                      onClick={() => navigate('/tools/analysis/detail?indicators=' + searchParams.get('indicators'), {
                        state: {
                          indicator: indicatorNames[result.indicator],
                          result: result.result,
                          ticker: input,
                          returnState: {
                            ticker: input,
                            results: results
                          }
                        }
                      })}
                    />
                  )}
                </div>
              ))}
            </div>

            {!isAnalyzing && (
              <div className="bg-slate-800/50 border border-slate-600 rounded-xl p-6">
                <p className="text-slate-400 text-sm leading-relaxed">
                  Analysis results are not recommendations to buy or sell. Past indicator performance does
                  not guarantee future results. Consult a licensed financial advisor before making investment decisions.
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </>
  );
}
