import { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, TrendingUp, TrendingDown, Activity, Calculator } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface IndicatorData {
  signal: number;
  strategy?: string;
  reason?: string;
  analysis?: string;
  explanation?: string;
  historical_accuracy_score?: number;
  win_rate?: string;
  confidence_score?: number;
  period?: string | number;
  horizon?: string | number;
  'Current ROC'?: string | number;
  [key: string]: any;
}

interface AssetData {
  id: string;
  symbol: string;
  name: string;
  indicators?: any;
  rate_of_change?: any;
  roc_signal?: number;
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
  const formatWinRate = (winRate: any): string | undefined => {
    if (!winRate) return undefined;
    const str = winRate.toString();
    return str.includes('%') ? str : `${str}%`;
  };

  return {
    ROC: {
      signal: parseFloat(json1['ROC Signal'] || '0'),
      period: json1['ROC Period'],
      horizon: '10',
      'Current ROC': json1['Current ROC'],
      analysis: json1['ROC Analysis'],
      win_rate: formatWinRate(json1['ROC Win Rate']),
    },
    BOLL: {
      signal: parseFloat(json1['Boll Signal'] || '0'),
      period: json1['Boll Period'],
      multiplier: json1['Boll Multiplier'],
      horizon: json1['Boll Horizon'],
      win_rate: formatWinRate(json1['Boll Win Rate']),
      analysis: json1['Boll Analysis'],
    },
    Bollinger: {
      signal: parseFloat(json1['Boll Signal'] || '0'),
      period: json1['Boll Period'],
      multiplier: json1['Boll Multiplier'],
      horizon: json1['Boll Horizon'],
      win_rate: formatWinRate(json1['Boll Win Rate']),
      analysis: json1['Boll Analysis'],
    },
    RSI: {
      signal: parseFloat(json1['RSI Signal'] || '0'),
      period: json1['RSI Period'],
      oversold: json1['RSI Oversold'],
      overbought: json1['RSI Overbought'],
      horizon: json1['RSI Horizon'],
      rsi_value: json1['Current RSI'],
      win_rate: formatWinRate(json1['RSI Win Rate']),
      analysis: json1['RSI analysis'],
    },
    CCI: {
      signal: parseFloat(json1['CCI Signal'] || '0'),
      period: json1['CCI Period'],
      horizon: json1['CCI Horizon'],
      cci_value: json1['Current CCI'],
      win_rate: formatWinRate(json1['CCI Win Rate']),
      analysis: json1['CCI analysis'],
    },
    SMA: {
      signal: parseFloat(json1['SMA Signal'] || '0'),
      fast_period: json1['SMA Fast Period'],
      slow_period: json1['Sma Slow Period'],
      horizon: json1['SMA Horizon'],
      win_rate: formatWinRate(json1['SMA Win Rate']),
      explanation: json1['SMA Explanation'],
    },
    MACD: {
      signal: parseFloat(json1['MACD Signal'] || '0'),
      fast_ema: json1['MACD Fast EMA'],
      slow_ema: json1['MACD Slow EMA'],
      signal_ema: json1['MACD Signal EMA'],
      win_rate: formatWinRate(json1['MACD Win Rate']),
      analysis: json1['MACD Analysis'],
    },
  };
}

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

const getSignalLabel = (signal: number): string => {
  if (signal >= 7) return 'Highly Positive';
  if (signal >= 4) return 'Positive';
  if (signal >= 1) return 'Slightly Positive';
  if (signal > -1) return 'Neutral';
  if (signal >= -4) return 'Slightly Negative';
  if (signal >= -7) return 'Negative';
  return 'Highly Negative';
};

const getFullIndicatorName = (shorthand: string | undefined): string => {
  if (!shorthand) return '';
  const indicatorMap: Record<string, string> = {
    'CCI': 'Commodity Channel Index',
    'SMA': 'Simple Moving Average',
    'Boll': 'Bollinger Bands',
    'BOLL': 'Bollinger Bands',
    'Bollinger': 'Bollinger Bands',
    'MACD': 'Moving Average Convergence Divergence',
    'RSI': 'Relative Strength Index',
    'ROC': 'Rate of Change',
    'Rate_of_Change': 'Rate of Change'
  };
  return indicatorMap[shorthand] || shorthand;
};

export default function IndicatorDetailPage() {
  const { category, symbol, indicator } = useParams<{ category: string; symbol: string; indicator: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const [asset, setAsset] = useState<AssetData | null>(null);
  const [indicatorData, setIndicatorData] = useState<IndicatorData | null>(null);
  const [loading, setLoading] = useState(true);

  const isWatchlistRoute = location.pathname.startsWith('/watchlist/');

  useEffect(() => {
    if (!symbol || !indicator) return;
    fetchData();
  }, [category, symbol, indicator, isWatchlistRoute]);

  const fetchData = async () => {
    if (!symbol || !indicator) return;

    try {
      const decodedSymbol = decodeURIComponent(symbol);
      const decodedIndicator = decodeURIComponent(indicator);

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
            indicators: extractedIndicators,
            raw_data: watchlistData.raw_data,
          });

          if (decodedIndicator === 'Rate_of_Change' && extractedIndicators.ROC) {
            setIndicatorData(extractedIndicators.ROC);
          } else if (extractedIndicators[decodedIndicator]) {
            setIndicatorData(extractedIndicators[decodedIndicator]);
          } else if (watchlistData.indicators?.[decodedIndicator]) {
            setIndicatorData(watchlistData.indicators[decodedIndicator]);
          }
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
          indicators: extractedIndicators,
          rate_of_change: data.rate_of_change,
          roc_signal: data.roc_signal ? parseFloat(data.roc_signal) : undefined,
          raw_data: data.raw_data,
        });

        console.log('IndicatorDetailPage - decodedIndicator:', decodedIndicator);
        console.log('IndicatorDetailPage - extractedIndicators keys:', Object.keys(extractedIndicators));
        console.log('IndicatorDetailPage - extractedIndicators:', extractedIndicators);

        if (decodedIndicator === 'Rate_of_Change' && extractedIndicators.ROC) {
          console.log('Setting ROC indicator data');
          setIndicatorData(extractedIndicators.ROC);
        } else if (extractedIndicators[decodedIndicator]) {
          console.log('Setting indicator data from extractedIndicators for:', decodedIndicator);
          setIndicatorData(extractedIndicators[decodedIndicator]);
        } else if (data.indicators?.[decodedIndicator]) {
          console.log('Setting indicator data from data.indicators for:', decodedIndicator);
          setIndicatorData(data.indicators[decodedIndicator]);
        } else {
          console.error('INDICATOR NOT FOUND:', decodedIndicator, 'Available:', Object.keys(extractedIndicators));
        }
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
        <div className="text-white text-xl">Loading indicator details...</div>
      </div>
    );
  }

  if (!asset || !indicatorData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-slate-400 text-xl">Indicator not found</div>
      </div>
    );
  }

  const colors = getSignalColors(indicatorData.signal);
  const signalLabel = getSignalLabel(indicatorData.signal);
  const signalPercent = ((indicatorData.signal + 10) / 20) * 100;
  const displayIndicator = indicator === 'Rate_of_Change' ? 'ROC' : indicator;
  const fullIndicatorName = getFullIndicatorName(displayIndicator);

  return (
    <div className="min-h-screen pb-12">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-5xl font-bold text-white mb-2">{fullIndicatorName}</h1>
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

      <div className={`${colors.bg} ${colors.border} border-2 rounded-2xl p-8 shadow-xl mb-8`}>
        <div className="flex items-center justify-between mb-6">
          <h2 className={`text-2xl font-bold ${indicatorData.signal >= 9 ? 'text-black' : 'text-white'}`}>Analytical Score</h2>
          {indicatorData.signal > 0 ? (
            <TrendingUp className={`w-6 h-6 ${indicatorData.signal >= 9 ? 'text-black' : 'text-white'}`} />
          ) : indicatorData.signal < 0 ? (
            <TrendingDown className={`w-6 h-6 ${indicatorData.signal >= 9 ? 'text-black' : 'text-white'}`} />
          ) : (
            <Activity className={`w-6 h-6 ${indicatorData.signal >= 9 ? 'text-black' : 'text-white'}`} />
          )}
        </div>

        <div className="text-center mb-6">
          <div className={`text-7xl font-bold ${colors.text} mb-2`}>
            {indicatorData.signal > 0 ? '+' : ''}{indicatorData.signal.toFixed(1)}
          </div>
          <div className={`${indicatorData.signal >= 9 ? 'text-black' : 'text-white/80'} text-lg font-semibold`}>{signalLabel}</div>
          {indicatorData.strategy && (
            <div className={`${indicatorData.signal >= 9 ? 'text-black/70' : 'text-white/60'} text-sm mt-2 uppercase tracking-wider font-medium`}>{indicatorData.strategy}</div>
          )}
        </div>

        <div className="space-y-2">
          <div className={`h-4 ${indicatorData.signal >= 9 ? 'bg-yellow-600/30' : 'bg-slate-700'} rounded-full overflow-hidden`}>
            <div
              className={`h-full ${colors.fill} transition-all duration-500`}
              style={{ width: `${signalPercent}%` }}
            />
          </div>
          <div className={`flex justify-between ${indicatorData.signal >= 9 ? 'text-black/70' : 'text-white/60'} text-xs font-medium`}>
            <span>-10</span>
            <span>0</span>
            <span>+10</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {(indicatorData.reason || indicatorData.analysis || indicatorData.explanation) && (() => {
          const signal = indicatorData.signal;
          let bgColor = 'bg-slate-800/50';
          let borderColor = 'border-slate-700';

          if (signal >= 7) {
            bgColor = 'bg-gradient-to-br from-green-700/50 to-green-600/40';
            borderColor = 'border-green-400';
          } else if (signal >= 4) {
            bgColor = 'bg-gradient-to-br from-green-600/40 to-green-500/30';
            borderColor = 'border-green-400/70';
          } else if (signal >= 1) {
            bgColor = 'bg-gradient-to-br from-green-600/30 to-green-500/20';
            borderColor = 'border-green-500/60';
          } else if (signal > -1) {
            bgColor = 'bg-slate-800/50';
            borderColor = 'border-slate-700';
          } else if (signal >= -4) {
            bgColor = 'bg-gradient-to-br from-orange-600/30 to-orange-500/20';
            borderColor = 'border-orange-500/60';
          } else if (signal >= -7) {
            bgColor = 'bg-gradient-to-br from-red-600/40 to-red-500/30';
            borderColor = 'border-red-400/70';
          } else {
            bgColor = 'bg-gradient-to-br from-red-700/50 to-red-600/40';
            borderColor = 'border-red-400';
          }

          return (
            <div className={`${bgColor} border-2 ${borderColor} rounded-2xl p-6 shadow-lg lg:col-span-2`}>
              <h3 className="text-xl font-bold text-white mb-3">Analysis</h3>
              <p className="text-white/90 leading-relaxed">{(indicatorData.reason || indicatorData.analysis || indicatorData.explanation || '').replace(/\*/g, '')}</p>
            </div>
          );
        })()}

        {(indicatorData.historical_accuracy_score !== undefined || indicatorData.win_rate !== undefined) && (() => {
          const winRateString = indicatorData.win_rate || (indicatorData.historical_accuracy_score ? `${indicatorData.historical_accuracy_score.toFixed(1)}%` : 'N/A');

          let percentage = 0;
          if (winRateString && winRateString !== 'N/A') {
            const match = winRateString.match(/(\d+\.?\d*)/);
            if (match) {
              percentage = parseFloat(match[1]);
            }
          }

          let bgColor = 'bg-slate-800/50';
          let borderColor = 'border-slate-700';
          let textColor = 'text-white';

          if (percentage >= 90) {
            bgColor = 'bg-gradient-to-br from-green-700/60 to-green-600/50';
            borderColor = 'border-green-400';
            textColor = 'text-green-200';
          } else if (percentage >= 80) {
            bgColor = 'bg-gradient-to-br from-green-700/50 to-green-600/40';
            borderColor = 'border-green-400/80';
            textColor = 'text-green-200';
          } else if (percentage >= 70) {
            bgColor = 'bg-gradient-to-br from-green-600/40 to-green-500/30';
            borderColor = 'border-green-400/70';
            textColor = 'text-green-300';
          } else if (percentage >= 60) {
            bgColor = 'bg-gradient-to-br from-lime-600/50 to-lime-500/40';
            borderColor = 'border-lime-400/80';
            textColor = 'text-lime-200';
          } else if (percentage >= 50) {
            bgColor = 'bg-gradient-to-br from-yellow-600/50 to-yellow-500/40';
            borderColor = 'border-yellow-400/80';
            textColor = 'text-yellow-200';
          } else if (percentage >= 40) {
            bgColor = 'bg-gradient-to-br from-orange-600/50 to-orange-500/40';
            borderColor = 'border-orange-400/80';
            textColor = 'text-orange-200';
          } else if (percentage >= 30) {
            bgColor = 'bg-gradient-to-br from-orange-700/60 to-orange-600/50';
            borderColor = 'border-orange-400';
            textColor = 'text-orange-200';
          } else if (percentage > 0) {
            bgColor = 'bg-gradient-to-br from-red-700/60 to-red-600/50';
            borderColor = 'border-red-400';
            textColor = 'text-red-200';
          }

          return (
            <button
              onClick={() => {
                navigate('/metric-definition?metric=historical-accuracy-percentage', {
                  state: { from: location.pathname, indicator: displayIndicator }
                });
              }}
              className={`${bgColor} border-2 ${borderColor} hover:border-opacity-80 rounded-2xl p-6 shadow-lg flex flex-col justify-center transition-all duration-200 hover:shadow-xl cursor-pointer text-left w-full`}
            >
              <div className="text-slate-300 text-sm mb-2 font-semibold">Historical Accuracy Percentage</div>
              <div className={`text-5xl font-bold ${textColor}`}>{winRateString}</div>
            </button>
          );
        })()}
      </div>

      {(indicatorData.summary) && (
        <div className="bg-slate-800/50 border-2 border-slate-700 rounded-2xl p-6 shadow-lg mb-8">
          <h3 className="text-xl font-bold text-white mb-3">Summary</h3>
          <p className="text-white/90 leading-relaxed">{indicatorData.summary.replace(/\*/g, '')}</p>
        </div>
      )}

      <button
        onClick={() => {
          navigate('/metric-definition?metric=parameters', {
            state: { from: location.pathname }
          });
        }}
        className="w-full bg-slate-800/50 border-2 border-slate-700 hover:border-slate-600 rounded-2xl p-6 shadow-lg transition-all duration-200 hover:shadow-xl cursor-pointer text-left"
      >
        <h3 className="text-xl font-bold text-white mb-4">Top Historical Parameter: Trade-by-Trade</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {indicator === 'SMA' && (
            <>
              {indicatorData.fast_period !== undefined && (
                <div className="flex justify-between py-2 border-b border-slate-700">
                  <span className="text-slate-400">Fast Period</span>
                  <span className="text-white font-mono">{indicatorData.fast_period}</span>
                </div>
              )}
              {indicatorData.slow_period !== undefined && (
                <div className="flex justify-between py-2 border-b border-slate-700">
                  <span className="text-slate-400">Slow Period</span>
                  <span className="text-white font-mono">{indicatorData.slow_period}</span>
                </div>
              )}
              {indicatorData.horizon !== undefined && (
                <div className="flex justify-between py-2 border-b border-slate-700">
                  <span className="text-slate-400">Horizon</span>
                  <span className="text-white font-mono">{indicatorData.horizon} days</span>
                </div>
              )}
            </>
          )}
          {indicator === 'MACD' && (
            <>
              {indicatorData.fast_ema !== undefined && (
                <div className="flex justify-between py-2 border-b border-slate-700">
                  <span className="text-slate-400">Fast EMA</span>
                  <span className="text-white font-mono">{indicatorData.fast_ema}</span>
                </div>
              )}
              {indicatorData.slow_ema !== undefined && (
                <div className="flex justify-between py-2 border-b border-slate-700">
                  <span className="text-slate-400">Slow EMA</span>
                  <span className="text-white font-mono">{indicatorData.slow_ema}</span>
                </div>
              )}
              {indicatorData.signal_ema !== undefined && (
                <div className="flex justify-between py-2 border-b border-slate-700">
                  <span className="text-slate-400">Signal EMA</span>
                  <span className="text-white font-mono">{indicatorData.signal_ema}</span>
                </div>
              )}
            </>
          )}
          {(indicator === 'Bollinger' || indicator === 'BOLL') && (
            <>
              {indicatorData.period !== undefined && (
                <div className="flex justify-between py-2 border-b border-slate-700">
                  <span className="text-slate-400">Period</span>
                  <span className="text-white font-mono">{indicatorData.period}</span>
                </div>
              )}
              {indicatorData.multiplier !== undefined && (
                <div className="flex justify-between py-2 border-b border-slate-700">
                  <span className="text-slate-400">Multiplier</span>
                  <span className="text-white font-mono">{indicatorData.multiplier}</span>
                </div>
              )}
              {indicatorData.horizon !== undefined && (
                <div className="flex justify-between py-2 border-b border-slate-700">
                  <span className="text-slate-400">Horizon</span>
                  <span className="text-white font-mono">{indicatorData.horizon} days</span>
                </div>
              )}
            </>
          )}
          {indicator === 'RSI' && (
            <>
              {indicatorData.period !== undefined && (
                <div className="flex justify-between py-2 border-b border-slate-700">
                  <span className="text-slate-400">Period</span>
                  <span className="text-white font-mono">{indicatorData.period}</span>
                </div>
              )}
              {indicatorData.overbought !== undefined && (
                <div className="flex justify-between py-2 border-b border-slate-700">
                  <span className="text-slate-400">Overbought</span>
                  <span className="text-white font-mono">{indicatorData.overbought}</span>
                </div>
              )}
              {indicatorData.oversold !== undefined && (
                <div className="flex justify-between py-2 border-b border-slate-700">
                  <span className="text-slate-400">Oversold</span>
                  <span className="text-white font-mono">{indicatorData.oversold}</span>
                </div>
              )}
              {indicatorData.horizon !== undefined && (
                <div className="flex justify-between py-2 border-b border-slate-700">
                  <span className="text-slate-400">Horizon</span>
                  <span className="text-white font-mono">{indicatorData.horizon} days</span>
                </div>
              )}
              {indicatorData.rsi_value !== undefined && (
                <div className="flex justify-between py-2 border-b border-slate-700">
                  <span className="text-slate-400">RSI Value</span>
                  <span className="text-white font-mono">{indicatorData.rsi_value}</span>
                </div>
              )}
            </>
          )}
          {indicator === 'CCI' && (
            <>
              {indicatorData.period !== undefined && (
                <div className="flex justify-between py-2 border-b border-slate-700">
                  <span className="text-slate-400">Period</span>
                  <span className="text-white font-mono">{indicatorData.period}</span>
                </div>
              )}
              {indicatorData.horizon !== undefined && (
                <div className="flex justify-between py-2 border-b border-slate-700">
                  <span className="text-slate-400">Horizon</span>
                  <span className="text-white font-mono">{indicatorData.horizon} days</span>
                </div>
              )}
              {indicatorData.cci_value !== undefined && (
                <div className="flex justify-between py-2 border-b border-slate-700">
                  <span className="text-slate-400">CCI Value</span>
                  <span className="text-white font-mono">{indicatorData.cci_value}</span>
                </div>
              )}
            </>
          )}
          {(indicator === 'ROC' || indicator === 'Rate_of_Change') && (
            <>
              {indicatorData.period !== undefined && (
                <div className="flex justify-between py-2 border-b border-slate-700">
                  <span className="text-slate-400">Period</span>
                  <span className="text-white font-mono">{indicatorData.period}</span>
                </div>
              )}
              {indicatorData.signal !== undefined && (
                <div className="flex justify-between py-2 border-b border-slate-700">
                  <span className="text-slate-400">Signal</span>
                  <span className="text-white font-mono">{indicatorData.signal.toFixed(1)}</span>
                </div>
              )}
              {indicatorData.horizon !== undefined && (
                <div className="flex justify-between py-2 border-b border-slate-700">
                  <span className="text-slate-400">Horizon</span>
                  <span className="text-white font-mono">{indicatorData.horizon} days</span>
                </div>
              )}
              {indicatorData['Current ROC'] !== undefined && (
                <div className="flex justify-between py-2 border-b border-slate-700">
                  <span className="text-slate-400">Current ROC</span>
                  <span className="text-white font-mono">{indicatorData['Current ROC']}</span>
                </div>
              )}
            </>
          )}
        </div>
      </button>

      {(displayIndicator === 'CCI' || displayIndicator === 'RSI' || displayIndicator === 'SMA' || displayIndicator === 'BOLL' || displayIndicator === 'MACD' || displayIndicator === 'ROC' || displayIndicator === 'Bollinger') && (() => {
        const definitions: Record<string, { title: string; description: string }> = {
          CCI: {
            title: 'Commodity Channel Index (CCI)',
            description: 'CCI measures how far a price is trading above or below its recent average, helping identify when an asset may be unusually strong or weak compared to its typical range. It highlights shifts in momentum, giving users a way to observe potential overextension without implying future performance.',
          },
          RSI: {
            title: 'Relative Strength Index (RSI)',
            description: 'RSI compares recent gains and losses to show whether price momentum has been unusually strong in one direction. It helps users observe when moves may be stretched relative to recent behaviour, without predicting or implying future outcomes.',
          },
          SMA: {
            title: 'Simple Moving Average (SMA)',
            description: 'SMA shows the average price over a chosen number of past periods, smoothing out short-term noise. It helps users see general directional tendencies in past data without implying anything about future movement.',
          },
          BOLL: {
            title: 'Bollinger Bands (BOLL)',
            description: 'Bollinger Bands (BOLL) plot a moving average with upper and lower bands set a certain distance away, based on recent volatility. They show how wide or tight price movements have been historically, helping users observe periods of relative calm or expansion without suggesting future direction.',
          },
          Bollinger: {
            title: 'Bollinger Bands',
            description: 'Bollinger Bands plot a moving average with upper and lower bands set a certain distance away, based on recent volatility. They show how wide or tight price movements have been historically, helping users observe periods of relative calm or expansion without suggesting future direction.',
          },
          MACD: {
            title: 'Moving Average Convergence Divergence (MACD)',
            description: 'MACD compares two moving averages to show how momentum has shifted over recent periods. It helps users visualize changes in trend strength based on past price behaviour, without indicating or forecasting future performance.',
          },
          ROC: {
            title: 'Rate of Change (ROC)',
            description: 'ROC measures how much price has changed over a selected number of past periods, expressed as a percentage. It helps users see the strength or weakness of recent momentum purely from historical price movement, without implying future results.',
          },
        };

        const scoreCalculations: Record<string, string> = {
          SMA: 'This score compares short-term price movement to long-term trends by analyzing the difference between two moving averages. When recent prices diverge significantly from the historical average, the score moves further from zero in the corresponding direction. The final result is normalized to a -10 to +10 scale, making it easy to interpret the strength and direction of the trend at a glance.',
          RSI: 'This score evaluates the momentum of recent price changes by measuring the ratio of upward to downward movements. When the RSI reaches extreme levels — indicating potential overbought or oversold conditions — the score reflects this intensity by moving further from zero. The result is standardized on a -10 to +10 scale for straightforward interpretation without requiring knowledge of raw RSI values.',
          MACD: 'This score analyzes the relationship between two exponential moving averages to identify momentum shifts. When the short-term average diverges significantly from the long-term average, the score moves further from zero in that direction. The calculation is normalized to a -10 to +10 scale to maintain consistency with other technical indicators and simplify trend assessment.',
          BOLL: 'This score identifies where the current price sits within its recent trading range by measuring its position relative to the upper and lower Bollinger Bands. Prices near the outer bands produce scores further from zero, indicating potential volatility or trend extremes. The final value is standardized on a -10 to +10 scale for easy comparison across different assets and timeframes.',
          CCI: 'This score measures how far the current price has deviated from its statistical average, identifying unusual price levels relative to recent history. Greater deviations from the typical range produce scores further from zero, highlighting potential trend exhaustion or reversal zones. The calculation is normalized to a -10 to +10 scale for intuitive interpretation without requiring familiarity with raw CCI values.',
          ROC: 'This score measures the percentage change in price over a specified period, capturing the velocity of price movement. Larger price changes — whether upward or downward — produce scores further from zero in the corresponding direction. The final result is standardized on a -10 to +10 scale to maintain consistency with other momentum indicators and facilitate quick analysis.',
        };

        const definition = definitions[displayIndicator];
        const scoreCalc = scoreCalculations[displayIndicator];
        if (!definition) return null;

        return (
          <>
            <div className="mt-8 bg-gradient-to-br from-slate-900/80 to-slate-800/60 border-2 border-slate-700 rounded-2xl p-8 shadow-xl">
              <div className="mb-4">
                <h3 className="text-2xl font-bold text-white mb-2">{definition.title}</h3>
                <div className="h-1 w-32 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full" />
              </div>
              <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700">
                <p className="text-slate-200 text-lg leading-relaxed">
                  {definition.description}
                </p>
              </div>
            </div>

            {scoreCalc && (
              <div className="mt-8 bg-gradient-to-br from-blue-900/30 to-cyan-900/20 border-2 border-blue-400/60 rounded-2xl p-8 shadow-xl shadow-blue-500/20">
                <div className="flex items-center gap-4 mb-6">
                  <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 shadow-lg shadow-blue-500/50">
                    <Calculator className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-white">Score Calculation Logic</h3>
                    <div className="h-1 w-24 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full mt-2" />
                  </div>
                </div>
                <div className="bg-slate-800/60 rounded-xl p-6 border border-blue-400/30">
                  <p className="text-slate-200 text-lg leading-relaxed">
                    {scoreCalc}
                  </p>
                </div>
              </div>
            )}
          </>
        );
      })()}
    </div>
  );
}
