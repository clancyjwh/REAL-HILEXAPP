import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, DollarSign, TrendingUp, TrendingDown, Target, Shield, X } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface StrikeData {
  type: string;
  strike: number;
  volume: number;
  popularity: number;
  open_interest: number;
}

interface AnalysisResult {
  id: string;
  symbol: string;
  bias?: string;
  spot_price?: number;
  top_strikes?: StrikeData[];
  put_wall_strike?: number;
  call_wall_strike?: number;
  put_wall_distance?: number;
  call_wall_distance?: number;
  created_at: string;
}

const DEFINITIONS: Record<string, { title: string; description: string }> = {
  marketBias: {
    title: "Market Bias",
    description: "This shows whether today's options positioning leans more bullish, bearish, or neutral based on where traders are concentrating activity. \"Upside tilt\" means calls above the current price are more active than puts below it, suggesting a mild upward bias in positioning rather than a guaranteed move."
  },
  spotPrice: {
    title: "Spot Price",
    description: "This is the most recent traded price of the underlying asset. All strike levels, walls, and distances are measured relative to this number."
  },
  putWall: {
    title: "Put Wall",
    description: "The put wall is a price level below the current market price where a large number of put options are concentrated. When price moves toward this level, the heavy positioning there can sometimes slow further declines or make it less likely that price moves significantly lower in the short term."
  },
  callWall: {
    title: "Call Wall",
    description: "The call wall is a price level above the current market price where a large number of call options are concentrated. When price moves toward this level, the heavy positioning there can sometimes slow further gains or make it less likely that price moves significantly higher in the short term."
  },
  distanceFromSpot: {
    title: "Distance from Spot",
    description: "This shows how far the wall strike is from the current price, in percentage terms. A large negative value means the wall is far below current price and may be less relevant for very short-term moves. A large positive value means the wall sits well above current levels and may only matter if price moves significantly higher."
  },
  topStrikePrices: {
    title: "Top Strike Prices",
    description: "These are the most active strike levels for today's options, ranked by a \"popularity\" score that blends trading volume and open interest. Higher popularity means more trader attention and positioning at that level."
  },
  callVsPut: {
    title: "Call vs Put",
    description: "A call option is generally used to express upside exposure (benefits if price goes up), while a put option is generally used to express downside protection or bearish exposure (benefits if price goes down)."
  },
  volume: {
    title: "Volume",
    description: "Volume is the number of contracts traded today at this strike. High volume means a lot of new activity or interest at that level during this session."
  },
  openInterest: {
    title: "Open Interest",
    description: "Open interest is the number of contracts that are currently open and have not been closed or expired. It reflects how much existing positioning is sitting at this strike, not just today's trades."
  },
  popularity: {
    title: "Popularity Score",
    description: "Popularity is a 0–100 style score combining today's trading volume and total open interest at this strike. A higher value means the strike is more central to current options positioning and may be more important for short-term behavior."
  }
};

export default function StrikePricesDetailPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedDefinition, setSelectedDefinition] = useState<string | null>(null);

  useEffect(() => {
    const id = searchParams.get('id');

    if (!id) {
      navigate('/tools/zero-day-options');
      return;
    }

    const fetchResult = async () => {
      try {
        const { data, error } = await supabase
          .from('zero_day_options_results')
          .select('id, symbol, bias, spot_price, top_strikes, put_wall_strike, call_wall_strike, put_wall_distance, call_wall_distance, created_at')
          .eq('id', id)
          .maybeSingle();

        if (error) throw error;

        if (!data) {
          navigate('/tools/zero-day-options');
          return;
        }

        setResult(data);
      } catch (error) {
        console.error('Failed to fetch result:', error);
        navigate('/tools/zero-day-options');
      } finally {
        setLoading(false);
      }
    };

    fetchResult();
  }, [searchParams, navigate]);

  if (loading || !result) {
    return null;
  }

  const formatPercent = (value: number) => {
    return value.toFixed(2);
  };

  const formatPrice = (value: number) => {
    return value.toFixed(2);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const year = date.getFullYear();
    return `${month}/${day}/${year}`;
  };

  return (
    <>
      <div className="mb-8">
        <button
          onClick={() => navigate(`/tools/zero-day-options/result?id=${result.id}`)}
          className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-6"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back to Analysis Results</span>
        </button>

        <div className="flex items-center gap-3">
          <div className="p-2 bg-amber-500/10 rounded-lg">
            <DollarSign className="w-6 h-6 text-amber-500" />
          </div>
          <div>
            <h1 className="text-4xl font-bold text-white">{result.symbol} Strike Prices</h1>
            <p className="text-slate-400">Options Strike Price Analysis</p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          {result.bias && (
            <div
              onClick={() => setSelectedDefinition('marketBias')}
              className="bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 rounded-xl p-4 shadow-xl cursor-pointer hover:border-slate-600 transition-colors"
            >
              <div className="flex items-center gap-2 mb-3">
                <div className="p-2 bg-blue-500/10 rounded-lg">
                  <Target className="w-5 h-5 text-blue-500" />
                </div>
                <h3 className="text-base font-semibold text-slate-300">Market Bias</h3>
              </div>
              <p className="text-xl font-bold text-white capitalize">
                {result.bias.replace(/_/g, ' ')}
              </p>
            </div>
          )}

          {result.spot_price !== undefined && result.spot_price !== null && (
            <div
              onClick={() => setSelectedDefinition('spotPrice')}
              className="bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 rounded-xl p-4 shadow-xl cursor-pointer hover:border-slate-600 transition-colors"
            >
              <div className="flex items-center gap-2 mb-3">
                <div className="p-2 bg-emerald-500/10 rounded-lg">
                  <DollarSign className="w-5 h-5 text-emerald-500" />
                </div>
                <h3 className="text-base font-semibold text-slate-300">Spot Price</h3>
              </div>
              <p className="text-2xl font-bold text-white">
                ${formatPrice(result.spot_price)}
              </p>
            </div>
          )}

          {result.put_wall_strike !== undefined && result.put_wall_strike !== null && (
            <div
              onClick={() => setSelectedDefinition('putWall')}
              className="bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 rounded-xl p-4 shadow-xl cursor-pointer hover:border-slate-600 transition-colors"
            >
              <div className="flex items-center gap-2 mb-3">
                <div className="p-2 bg-red-500/10 rounded-lg">
                  <Shield className="w-5 h-5 text-red-500" />
                </div>
                <h3 className="text-base font-semibold text-slate-300">Put Wall Strike</h3>
              </div>
              <p className="text-2xl font-bold text-white">
                ${formatPrice(result.put_wall_strike)}
              </p>
              {result.put_wall_distance !== undefined && result.put_wall_distance !== null && (
                <p
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedDefinition('distanceFromSpot');
                  }}
                  className="text-xs text-red-400 mt-2 hover:text-red-300 cursor-pointer underline decoration-dotted"
                >
                  {formatPercent(result.put_wall_distance)}% from spot
                </p>
              )}
            </div>
          )}

          {result.call_wall_strike !== undefined && result.call_wall_strike !== null && (
            <div
              onClick={() => setSelectedDefinition('callWall')}
              className="bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 rounded-xl p-4 shadow-xl cursor-pointer hover:border-slate-600 transition-colors"
            >
              <div className="flex items-center gap-2 mb-3">
                <div className="p-2 bg-emerald-500/10 rounded-lg">
                  <Shield className="w-5 h-5 text-emerald-500" />
                </div>
                <h3 className="text-base font-semibold text-slate-300">Call Wall Strike</h3>
              </div>
              <p className="text-2xl font-bold text-white">
                ${formatPrice(result.call_wall_strike)}
              </p>
              {result.call_wall_distance !== undefined && result.call_wall_distance !== null && (
                <p
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedDefinition('distanceFromSpot');
                  }}
                  className="text-xs text-emerald-400 mt-2 hover:text-emerald-300 cursor-pointer underline decoration-dotted"
                >
                  {formatPercent(result.call_wall_distance)}% from spot
                </p>
              )}
            </div>
          )}
        </div>

        {result.top_strikes && result.top_strikes.length > 0 && (
          <div className="bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 rounded-xl p-6 shadow-xl">
            <div className="flex items-center justify-between mb-6">
              <div
                onClick={() => setSelectedDefinition('topStrikePrices')}
                className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition-opacity"
              >
                <div className="p-2 bg-amber-500/10 rounded-lg">
                  <DollarSign className="w-6 h-6 text-amber-500" />
                </div>
                <div>
                  <h3 className="text-2xl font-semibold text-white">Top Strike Prices</h3>
                  <p className="text-sm text-slate-400 mt-1">Analysis for: {formatDate(result.created_at)}</p>
                </div>
              </div>
              <p className="text-sm text-slate-400">Ranked by popularity score</p>
            </div>

            <div className="space-y-4">
              {result.top_strikes.map((strike, index) => (
                <div
                  key={index}
                  className="bg-slate-900/50 border border-slate-700 rounded-lg p-5 hover:border-slate-600 transition-colors"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div
                      onClick={() => setSelectedDefinition('callVsPut')}
                      className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition-opacity"
                    >
                      {strike.type === 'call' ? (
                        <div className="p-2 bg-emerald-500/10 rounded-lg">
                          <TrendingUp className="w-5 h-5 text-emerald-500" />
                        </div>
                      ) : (
                        <div className="p-2 bg-red-500/10 rounded-lg">
                          <TrendingDown className="w-5 h-5 text-red-500" />
                        </div>
                      )}
                      <div>
                        <p className={`text-lg font-bold ${strike.type === 'call' ? 'text-emerald-400' : 'text-red-400'}`}>
                          {strike.type.toUpperCase()}
                        </p>
                        <p className="text-2xl font-bold text-white">
                          ${formatPrice(strike.strike)}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div
                      onClick={() => setSelectedDefinition('volume')}
                      className="cursor-pointer hover:bg-slate-800/50 rounded-lg p-2 -m-2 transition-colors"
                    >
                      <p className="text-sm text-slate-400 mb-1">Volume</p>
                      <p className="text-lg font-semibold text-white">
                        {strike.volume.toLocaleString()}
                      </p>
                    </div>
                    <div
                      onClick={() => setSelectedDefinition('popularity')}
                      className="cursor-pointer hover:bg-slate-800/50 rounded-lg p-2 -m-2 transition-colors"
                    >
                      <p className="text-sm text-slate-400 mb-1">Popularity</p>
                      <p className="text-lg font-semibold text-white">
                        {(strike.popularity * 100).toFixed(1)}%
                      </p>
                    </div>
                    <div
                      onClick={() => setSelectedDefinition('openInterest')}
                      className="cursor-pointer hover:bg-slate-800/50 rounded-lg p-2 -m-2 transition-colors"
                    >
                      <p className="text-sm text-slate-400 mb-1">Open Interest</p>
                      <p className="text-lg font-semibold text-white">
                        {strike.open_interest.toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="mt-6 flex justify-center">
          <button
            onClick={() => navigate(`/tools/zero-day-options/result?id=${result.id}`)}
            className="px-6 py-3 bg-gradient-to-r from-amber-600 to-yellow-600 hover:from-amber-500 hover:to-yellow-500 text-white font-semibold rounded-lg transition-all duration-300 shadow-lg hover:shadow-amber-500/20"
          >
            Back to Results
          </button>
        </div>
      </div>

      {selectedDefinition && DEFINITIONS[selectedDefinition] && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedDefinition(null)}
        >
          <div
            className="bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 rounded-xl p-6 max-w-2xl w-full shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-white">
                {DEFINITIONS[selectedDefinition].title}
              </h2>
              <button
                onClick={() => setSelectedDefinition(null)}
                className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
              >
                <X className="w-6 h-6 text-slate-400 hover:text-white" />
              </button>
            </div>
            <div className="text-slate-300 leading-relaxed">
              {DEFINITIONS[selectedDefinition].description}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
