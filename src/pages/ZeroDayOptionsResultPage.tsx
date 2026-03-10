import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Zap, TrendingUp, TrendingDown, Target, BarChart3, FileText, Minus, X, DollarSign } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface AnalysisResult {
  id: string;
  ticker: string;
  horizon: number;
  symbol: string;
  summary: string;
  direction: string;
  probability_up: number;
  probability_down: number;
  confidence_label: string;
  confidence_score: number;
  scenarios_tested: number;
  expected_move: number;
  average_historical_move: number;
  bias?: string;
  spot_price?: number;
  top_strikes?: any;
  put_wall_strike?: number;
  call_wall_strike?: number;
  put_wall_distance?: number;
  call_wall_distance?: number;
  created_at: string;
}

const DEFINITIONS: Record<string, { title: string; description: string }> = {
  direction: {
    title: "Direction",
    description: "This shows whether the model's overall bias is for the price to move up, down, or stay neutral over the next period. It's based on which side (up vs. down) happened more often in similar past situations.\n\nExample: \"Direction: UP\" means that, among similar past setups, upward moves happened more often than downward ones."
  },
  probabilityUp: {
    title: "Probability Up",
    description: "This is the model's estimate of how often similar past situations moved up over the chosen time horizon. It's expressed as a percentage between 0% and 100%.\n\nExample: \"Probability Up: 57.50%\" means that in similar past scenarios, price went up about 58% of the time."
  },
  probabilityDown: {
    title: "Probability Down",
    description: "This is the estimated share of similar past situations where the price moved down over the time horizon. It tells you how often a downward move occurred in the historical analogs.\n\nExample: \"Probability Down: 37.50%\" means that in comparable setups, the price dropped about 38% of the time."
  },
  probabilityFlat: {
    title: "Probability Flat",
    description: "This is the chance that price barely moves at all, staying roughly flat instead of making a clear up or down move. It captures all those \"nothing really happened\" scenarios.\n\nExample: \"Probability Flat: 5.00%\" means that about 1 in 20 similar past cases showed no meaningful move either way."
  },
  expectedMove: {
    title: "Expected Move",
    description: "This is the typical size of the move, in percent, in the predicted direction over the chosen horizon. It's usually based on the median move from similar past cases, so it ignores extreme outliers.\n\nExample: \"Expected Move: 0.25957%\" means the model expects about a 0.26% move in the indicated direction over the next 5 minutes.\n\nNext 5 minutes: This tells you the time horizon the prediction applies to—how far ahead the model is looking. All probabilities and expected moves are calculated for that specific window."
  },
  scenariosTested: {
    title: "Scenarios Tested",
    description: "This is how many historical examples the model found that were similar enough to compare against. More scenarios generally mean a more statistically stable signal.\n\nExample: \"Scenarios Tested: 80\" means the model based its estimates on 80 past situations that looked like the current one."
  }
};

export default function ZeroDayOptionsResultPage() {
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
          .select('*')
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
    return (value * 100).toFixed(2);
  };

  const formatPercentThreeDecimals = (value: number) => {
    return (value * 100).toFixed(3);
  };

  const formatPercentAlreadyInPercent = (value: number) => {
    return value.toFixed(5);
  };

  const formatDecimal = (value: number) => {
    return value.toFixed(2);
  };

  const isPositiveDirection = result.direction.toLowerCase() === 'up';

  const probabilityFlat = 1 - (result.probability_up + result.probability_down);
  const showProbabilityFlat = probabilityFlat >= 0.01;

  return (
    <>
      <div className="mb-8">
        <button
          onClick={() => navigate('/tools/zero-day-options')}
          className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-6"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back to Zero Day Options</span>
        </button>

        <div className="flex items-center gap-3">
          <div className="p-2 bg-emerald-500/10 rounded-lg">
            <Zap className="w-6 h-6 text-emerald-500" />
          </div>
          <div>
            <h1 className="text-4xl font-bold text-white">{result.symbol} Analysis</h1>
            <p className="text-slate-400">Zero Day Options Results</p>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div
            onClick={() => setSelectedDefinition('direction')}
            className="bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 rounded-xl p-6 shadow-xl cursor-pointer hover:border-slate-600 transition-colors"
          >
            <div className="flex items-center gap-3 mb-4">
              {isPositiveDirection ? (
                <div className="p-2 bg-emerald-500/10 rounded-lg">
                  <TrendingUp className="w-6 h-6 text-emerald-500" />
                </div>
              ) : (
                <div className="p-2 bg-red-500/10 rounded-lg">
                  <TrendingDown className="w-6 h-6 text-red-500" />
                </div>
              )}
              <h3 className="text-lg font-semibold text-slate-300">Direction</h3>
            </div>
            <p className={`text-3xl font-bold ${isPositiveDirection ? 'text-emerald-400' : 'text-red-400'}`}>
              {result.direction.toUpperCase()}
            </p>
          </div>

          <div
            onClick={() => setSelectedDefinition('probabilityUp')}
            className="bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 rounded-xl p-6 shadow-xl cursor-pointer hover:border-slate-600 transition-colors"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-emerald-500/10 rounded-lg">
                <TrendingUp className="w-6 h-6 text-emerald-500" />
              </div>
              <h3 className="text-lg font-semibold text-slate-300">Probability Up</h3>
            </div>
            <p className="text-3xl font-bold text-white">
              {formatPercent(result.probability_up)}%
            </p>
          </div>

          <div
            onClick={() => setSelectedDefinition('probabilityDown')}
            className="bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 rounded-xl p-6 shadow-xl cursor-pointer hover:border-slate-600 transition-colors"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-red-500/10 rounded-lg">
                <TrendingDown className="w-6 h-6 text-red-500" />
              </div>
              <h3 className="text-lg font-semibold text-slate-300">Probability Down</h3>
            </div>
            <p className="text-3xl font-bold text-white">
              {formatPercent(result.probability_down)}%
            </p>
          </div>

          {showProbabilityFlat && (
            <div
              onClick={() => setSelectedDefinition('probabilityFlat')}
              className="bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 rounded-xl p-6 shadow-xl cursor-pointer hover:border-slate-600 transition-colors"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-slate-500/10 rounded-lg">
                  <Minus className="w-6 h-6 text-slate-400" />
                </div>
                <h3 className="text-lg font-semibold text-slate-300">Probability Flat</h3>
              </div>
              <p className="text-3xl font-bold text-white">
                {formatPercent(probabilityFlat)}%
              </p>
            </div>
          )}

          <div
            onClick={() => setSelectedDefinition('expectedMove')}
            className="bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 rounded-xl p-6 shadow-xl cursor-pointer hover:border-slate-600 transition-colors"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-blue-500/10 rounded-lg">
                <Target className="w-6 h-6 text-blue-500" />
              </div>
              <h3 className="text-lg font-semibold text-slate-300">Expected Move</h3>
            </div>
            <p className="text-3xl font-bold text-white">
              {formatPercentAlreadyInPercent(result.expected_move)}%
            </p>
            <p className="text-sm text-slate-400 mt-1">Next {result.horizon} {result.horizon === 1 ? 'minute' : 'minutes'}</p>
          </div>

          <div
            onClick={() => setSelectedDefinition('scenariosTested')}
            className="bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 rounded-xl p-6 shadow-xl cursor-pointer hover:border-slate-600 transition-colors"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-cyan-500/10 rounded-lg">
                <BarChart3 className="w-6 h-6 text-cyan-500" />
              </div>
              <h3 className="text-lg font-semibold text-slate-300">Scenarios Tested</h3>
            </div>
            <p className="text-3xl font-bold text-white">
              {result.scenarios_tested}
            </p>
          </div>
        </div>

        {result.summary && (
          <div className="mt-8 bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 rounded-xl p-6 shadow-xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-blue-500/10 rounded-lg">
                <FileText className="w-6 h-6 text-blue-500" />
              </div>
              <h3 className="text-lg font-semibold text-white">Summary</h3>
            </div>
            <p className="text-slate-300 leading-relaxed">
              {result.summary}
            </p>
          </div>
        )}

        {result.top_strikes && (
          <div className="mt-6 flex justify-center">
            <button
              onClick={() => navigate(`/tools/zero-day-options/strike-prices?id=${result.id}`)}
              className="bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 rounded-xl px-6 py-4 shadow-xl hover:border-amber-500 transition-all duration-300 group"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 bg-amber-500/10 rounded-lg group-hover:bg-amber-500/20 transition-colors">
                  <DollarSign className="w-5 h-5 text-amber-500" />
                </div>
                <div className="text-left">
                  <h3 className="text-base font-semibold text-slate-300 group-hover:text-white transition-colors">Strike Prices</h3>
                  <p className="text-sm font-semibold text-amber-400">
                    View Details →
                  </p>
                </div>
              </div>
            </button>
          </div>
        )}

        <div className="mt-4 bg-slate-800/50 border border-slate-700/50 rounded-lg p-4">
          <p className="text-sm text-slate-400 text-center">
            Note: Pricing for this analysis updates on a one-minute delay
          </p>
        </div>

        <div className="mt-6 flex justify-center">
          <button
            onClick={() => navigate('/tools/zero-day-options')}
            className="px-6 py-3 bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-500 hover:to-green-500 text-white font-semibold rounded-lg transition-all duration-300 shadow-lg hover:shadow-emerald-500/20"
          >
            Run Another Analysis
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
            <div className="text-slate-300 leading-relaxed whitespace-pre-line">
              {DEFINITIONS[selectedDefinition].description}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
