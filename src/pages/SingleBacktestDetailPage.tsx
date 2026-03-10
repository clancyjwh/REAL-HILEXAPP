import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft, Home, TrendingUp, TrendingDown, CheckCircle, XCircle, Settings } from 'lucide-react';

interface TimeHorizonData {
  Result: string;
  Signal: string;
  Correct: string;
  Daysback: string;
  Prediction: string;
}

interface LocationState {
  backtestData: Record<string, string>;
  symbol: string;
  category: string;
  assetName?: string;
  analysis?: string;
  parameters?: string;
}

export default function SingleBacktestDetailPage() {
  const { days } = useParams<{ days: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const state = location.state as LocationState;

  if (!state || !state.backtestData || !days) {
    return (
      <div className="min-h-screen pb-12">
        <div className="text-center py-12">
          <p className="text-slate-400 text-lg">No backtest data available</p>
          <button
            onClick={() => navigate('/')}
            className="mt-4 px-6 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg transition-colors"
          >
            Go Home
          </button>
        </div>
      </div>
    );
  }

  const horizonDataString = state.backtestData[days];
  if (!horizonDataString) {
    return (
      <div className="min-h-screen pb-12">
        <div className="text-center py-12">
          <p className="text-slate-400 text-lg">Data not found for {days} days</p>
          <button
            onClick={() => navigate(-1)}
            className="mt-4 px-6 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  let horizonData: TimeHorizonData;
  try {
    horizonData = JSON.parse(horizonDataString);
  } catch {
    return (
      <div className="min-h-screen pb-12">
        <div className="text-center py-12">
          <p className="text-slate-400 text-lg">Invalid data format</p>
          <button
            onClick={() => navigate(-1)}
            className="mt-4 px-6 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const signal = parseFloat(horizonData.Signal);
  const isCorrect = horizonData.Correct === 'true';
  const resultIsUp = horizonData.Result.toUpperCase().includes('UP');

  const formatResult = (result: string): string => {
    const isUp = result.toUpperCase().includes('UP');
    const isDown = result.toUpperCase().includes('DOWN');

    const match = result.match(/[-+]?\d*\.?\d+/);
    if (!match) return result;

    let value = parseFloat(match[0]);
    value = Math.round(value * 100) / 100;

    if (value === 0) {
      if (isUp) {
        value = 0.01;
      } else if (isDown) {
        value = -0.01;
      }
    }

    const direction = isUp ? 'UP' : isDown ? 'DOWN' : '';
    const absValue = Math.abs(value).toFixed(2);

    return `${direction} ${absValue}$`;
  };

  const formattedResult = formatResult(horizonData.Result);

  const getSignalColors = (value: number) => {
    if (value >= 9) return { bg: 'bg-[linear-gradient(145deg,#FFFDF5_0%,#FFF3CC_35%,#EBD48E_70%,#C9A43B_100%)]', border: 'border-yellow-400', text: 'text-black' };
    if (value >= 7) return { bg: 'bg-green-900', border: 'border-green-700', text: 'text-green-300' };
    if (value >= 4) return { bg: 'bg-green-700', border: 'border-green-600', text: 'text-green-200' };
    if (value >= 1) return { bg: 'bg-green-500', border: 'border-green-400', text: 'text-green-100' };
    if (value > -1) return { bg: 'bg-slate-600', border: 'border-slate-500', text: 'text-slate-200' };
    if (value >= -4) return { bg: 'bg-orange-500', border: 'border-orange-400', text: 'text-orange-100' };
    if (value >= -7) return { bg: 'bg-red-600', border: 'border-red-500', text: 'text-red-100' };
    return { bg: 'bg-red-900', border: 'border-red-700', text: 'text-red-300' };
  };

  const getSignalLabel = (value: number): string => {
    if (value >= 7) return 'Highly Positive';
    if (value >= 4) return 'Positive';
    if (value >= 1) return 'Slightly Positive';
    if (value > -1) return 'Neutral';
    if (value >= -4) return 'Slightly Negative';
    if (value >= -7) return 'Negative';
    return 'Very Bearish';
  };

  const signalColors = getSignalColors(signal);
  const signalLabel = getSignalLabel(signal);
  const signalPercent = ((signal + 10) / 20) * 100;

  return (
    <div className="min-h-screen pb-12">
      <div className="flex items-start justify-between mb-8">
        <div className="flex-1">
          <h1 className="text-5xl font-bold text-white mb-2">{state.symbol}</h1>
          <div className="text-2xl text-slate-400 mb-4">{state.assetName || state.symbol}</div>
          <div className="flex items-center gap-3">
            <span className="bg-slate-800 px-3 py-1 rounded-lg text-sm text-slate-300">
              {days} Day Backtest
            </span>
            {state.analysis && (
              <span className="bg-blue-900/50 border border-blue-600/50 px-3 py-1 rounded-lg text-sm text-blue-300">
                {state.analysis}
              </span>
            )}
          </div>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => navigate(-1)}
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
        <div className={`${signalColors.bg} ${signalColors.border} border-2 rounded-2xl p-8 shadow-xl`}>
          <div className="flex items-center justify-between mb-6">
            <h2 className={`text-2xl font-bold ${signal >= 9 ? 'text-black' : 'text-white'}`}>Analytical Score</h2>
            {signal > 0 ? (
              <TrendingUp className={`w-6 h-6 ${signal >= 9 ? 'text-black' : 'text-white'}`} />
            ) : signal < 0 ? (
              <TrendingDown className={`w-6 h-6 ${signal >= 9 ? 'text-black' : 'text-white'}`} />
            ) : null}
          </div>

          <div className="text-center mb-6">
            <div className={`text-7xl font-bold ${signalColors.text} mb-2`}>
              {signal > 0 ? '+' : ''}{signal.toFixed(2)}
            </div>
            <div className={`${signal >= 9 ? 'text-black' : 'text-white/80'} text-lg font-semibold`}>{signalLabel}</div>
          </div>

          <div className="space-y-2">
            <div className={`h-4 ${signal >= 9 ? 'bg-yellow-600/30' : 'bg-slate-700'} rounded-full overflow-hidden`}>
              <div
                className={`h-full ${signalColors.bg} transition-all duration-500`}
                style={{ width: `${signalPercent}%` }}
              />
            </div>
            <div className={`flex justify-between ${signal >= 9 ? 'text-black/70' : 'text-white/60'} text-xs font-medium`}>
              <span>-10</span>
              <span>0</span>
              <span>+10</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className={`${
            isCorrect
              ? 'bg-gradient-to-br from-green-900/40 to-green-800/30 border-green-600/50'
              : 'bg-gradient-to-br from-red-900/40 to-red-800/30 border-red-600/50'
          } border-2 rounded-2xl p-8 shadow-xl`}>
            <div className="flex items-center gap-3 mb-4">
              {isCorrect ? (
                <CheckCircle className="w-8 h-8 text-green-400" />
              ) : (
                <XCircle className="w-8 h-8 text-red-400" />
              )}
              <h3 className="text-2xl font-bold text-white">Prediction</h3>
            </div>
            <div className={`text-5xl font-bold ${isCorrect ? 'text-green-400' : 'text-red-400'} mb-2`}>
              {isCorrect ? 'Accurate' : 'Inaccurate'}
            </div>
            <div className="text-slate-300 text-lg">
              Predicted: <span className="font-semibold">{horizonData.Prediction}</span>
            </div>
          </div>

          <div className={`${
            resultIsUp
              ? 'bg-gradient-to-br from-green-900/40 to-green-800/30 border-green-600/50'
              : 'bg-gradient-to-br from-red-900/40 to-red-800/30 border-red-600/50'
          } border-2 rounded-2xl p-8 shadow-xl`}>
            <div className="flex items-center gap-3 mb-4">
              {resultIsUp ? (
                <TrendingUp className="w-8 h-8 text-green-400" />
              ) : (
                <TrendingDown className="w-8 h-8 text-red-400" />
              )}
              <h3 className="text-2xl font-bold text-white">Result</h3>
            </div>
            <div className={`text-5xl font-bold ${resultIsUp ? 'text-green-400' : 'text-red-400'} mb-2`}>
              {formattedResult}
            </div>
            <div className="text-slate-300 text-lg">
              Market Movement
            </div>
          </div>
        </div>

        {state.parameters && (
          <div className="bg-slate-900 border-2 border-slate-700 rounded-2xl p-8 shadow-xl">
            <div className="flex items-center gap-3 mb-4">
              <Settings className="w-6 h-6 text-blue-400" />
              <h3 className="text-2xl font-bold text-white">Parameters Used</h3>
            </div>
            <div className="text-3xl font-bold text-blue-400 font-mono">
              {state.parameters}
            </div>
            <div className="text-slate-400 text-sm mt-2">
              Parameters for this analysis
            </div>
          </div>
        )}
      </div>

      <div className="mt-8 bg-slate-800/50 border border-slate-600 rounded-xl p-6">
        <p className="text-slate-400 text-sm leading-relaxed">
          This tool analyzes historical data to identify which parameter combinations showed the strongest past performance. Past performance does not guarantee future results. This analysis is for informational purposes only and does not constitute investment advice.
        </p>
      </div>
    </div>
  );
}
