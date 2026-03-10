import { useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft, TrendingUp, TrendingDown, Activity, Info, Clock, Layers } from 'lucide-react';

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

const getSignalLabel = (value: number): string => {
  if (value >= 7) return 'Highly Positive';
  if (value >= 4) return 'Positive';
  if (value >= 1) return 'Slightly Positive';
  if (value > -1) return 'Neutral';
  if (value >= -4) return 'Slightly Negative';
  if (value >= -7) return 'Negative';
  return 'Highly Negative';
};

const getSignalColors = (value: number) => {
  if (value >= 9) return { bg: 'bg-[linear-gradient(145deg,#FFFDF5_0%,#FFF3CC_35%,#EBD48E_70%,#C9A43B_100%)] bg-[length:200%_200%] animate-[shimmer_4s_linear_infinite] shadow-[0_0_20px_rgba(201,164,59,0.8),0_0_40px_rgba(235,212,142,0.4),0_0_60px_rgba(255,253,245,0.2)]', border: 'border-yellow-400', text: 'text-black' };
  if (value >= 7) return { bg: 'bg-green-900', border: 'border-green-700', text: 'text-green-300' };
  if (value >= 4) return { bg: 'bg-green-700', border: 'border-green-600', text: 'text-green-200' };
  if (value >= 1) return { bg: 'bg-green-500', border: 'border-green-400', text: 'text-green-100' };
  if (value > -1) return { bg: 'bg-slate-600', border: 'border-slate-500', text: 'text-slate-200' };
  if (value >= -4) return { bg: 'bg-orange-500', border: 'border-orange-400', text: 'text-orange-100' };
  if (value >= -7) return { bg: 'bg-red-600', border: 'border-red-500', text: 'text-red-100' };
  if (value <= -9) return { bg: 'bg-gradient-to-br from-red-900 to-red-950', border: 'border-red-600', text: 'text-red-200' };
  return { bg: 'bg-red-900', border: 'border-red-700', text: 'text-red-300' };
};

export default function CumulativeDetailPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { cumulativeSignal, ticker, returnState } = location.state || {};

  if (!cumulativeSignal) {
    navigate('/tools/analysis');
    return null;
  }

  const handleBack = () => {
    if (returnState) {
      const currentParams = new URLSearchParams(window.location.search);
      const indicatorsParam = currentParams.get('indicators');
      const searchUrl = indicatorsParam
        ? `/tools/analysis/search?indicators=${indicatorsParam}`
        : '/tools/analysis/search';
      navigate(searchUrl, { state: returnState });
    } else {
      navigate(-1);
    }
  };

  const signal = cumulativeSignal as CumulativeSignal;
  const colors = getSignalColors(signal.value);
  const signalLabel = getSignalLabel(signal.value);
  const signalPosition = ((signal.value + 10) / 20) * 100;
  const isGold = signal.value >= 9;

  return (
    <div className="min-h-screen pb-12">
      <button
        onClick={handleBack}
        className="flex items-center gap-2 text-slate-400 hover:text-white mb-8 transition-colors"
      >
        <ArrowLeft className="w-5 h-5" />
        <span>Back to Analysis</span>
      </button>

      <div className="mb-4">
        <h1 className="text-4xl font-bold text-white mb-2">Cumulative Analytical Score</h1>
        {ticker && <p className="text-slate-400 text-lg">{ticker}</p>}
      </div>

      <div className={`${colors.bg} ${colors.border} border-2 rounded-xl p-8 shadow-lg mb-6`}>
        <div className="flex items-start justify-between mb-6">
          <div className={`${isGold ? 'text-black/60' : 'text-white/60'} text-sm font-bold uppercase tracking-wide`}>
            Combined Score
          </div>
          <div className={`p-3 ${isGold ? 'bg-black/20' : 'bg-white/20'} rounded-full`}>
            {signal.value > 0 ? (
              <TrendingUp className={`w-8 h-8 ${isGold ? 'text-black' : 'text-white'}`} />
            ) : signal.value < 0 ? (
              <TrendingDown className={`w-8 h-8 ${isGold ? 'text-black' : 'text-white'}`} />
            ) : (
              <Activity className={`w-8 h-8 ${isGold ? 'text-black' : 'text-white'}`} />
            )}
          </div>
        </div>

        <div className="text-center mb-6">
          <div className={`text-8xl font-bold ${colors.text} mb-3`}>
            {signal.value > 0 ? '+' : ''}{signal.value.toFixed(1)}
          </div>
          <div className={`${isGold ? 'text-black/70' : 'text-white/70'} text-lg`}>{signalLabel}</div>
        </div>

        <div className="mb-6">
          <div className="relative h-10 bg-gradient-to-r from-red-500 via-slate-400 to-green-500 rounded-full overflow-hidden">
            <div
              className="absolute top-0 bottom-0 w-1.5 bg-black shadow-lg"
              style={{ left: `${signalPosition}%` }}
            />
          </div>
          <div className={`flex justify-between ${isGold ? 'text-black/60' : 'text-white/60'} text-sm mt-2`}>
            <span>-10</span>
            <span>0</span>
            <span>+10</span>
          </div>
        </div>

        <div className={`${isGold ? 'bg-black/10' : 'bg-white/10'} rounded-lg p-4`}>
          <p className={`${isGold ? 'text-black/90' : 'text-white/90'} text-base leading-relaxed text-center`}>
            Weighted average of SMA ({(signal.weights.SMA * 100).toFixed(0)}%), RSI ({(signal.weights.RSI * 100).toFixed(0)}%), Bollinger Bands ({(signal.weights.Boll * 100).toFixed(0)}%), and CCI ({(signal.weights.CCI * 100).toFixed(0)}%)
          </p>
        </div>
      </div>

      <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-slate-800 border border-cyan-500/20 rounded-xl p-8 mb-6 shadow-[0_0_15px_rgba(6,182,212,0.1)]">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-cyan-500/10 rounded-lg border border-cyan-500/30">
              <Layers className="w-5 h-5 text-cyan-400" />
            </div>
            <span className="text-white text-lg font-bold uppercase tracking-wider">Component Scores</span>
          </div>
          <div className="flex items-center gap-2 text-slate-500 text-xs">
            <Clock className="w-3 h-3" />
            <span>Updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</span>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="group">
            <div className="flex justify-between items-center gap-6 py-4">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-purple-400 group-hover:shadow-[0_0_8px_rgba(192,132,252,0.6)] transition-shadow"></div>
                <span className="text-slate-300 text-base">SMA</span>
              </div>
              <span className="text-purple-400 font-bold text-base font-mono tracking-wide">
                {signal.SMA > 0 ? '+' : ''}{signal.SMA.toFixed(1)}
              </span>
            </div>
            <div className="relative h-[1px]">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-purple-500/30 to-transparent"></div>
            </div>
          </div>
          <div className="group">
            <div className="flex justify-between items-center gap-6 py-4">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-cyan-400 group-hover:shadow-[0_0_8px_rgba(34,211,238,0.6)] transition-shadow"></div>
                <span className="text-slate-300 text-base">RSI</span>
              </div>
              <span className="text-cyan-400 font-bold text-base font-mono tracking-wide">
                {signal.RSI > 0 ? '+' : ''}{signal.RSI.toFixed(1)}
              </span>
            </div>
            <div className="relative h-[1px]">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-cyan-500/30 to-transparent"></div>
            </div>
          </div>
          <div className="group">
            <div className="flex justify-between items-center gap-6 py-4">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-green-400 group-hover:shadow-[0_0_8px_rgba(74,222,128,0.6)] transition-shadow"></div>
                <span className="text-slate-300 text-base">Bollinger Bands</span>
              </div>
              <span className="text-green-400 font-bold text-base font-mono tracking-wide">
                {signal.Boll > 0 ? '+' : ''}{signal.Boll.toFixed(1)}
              </span>
            </div>
            <div className="relative h-[1px] md:hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-green-500/30 to-transparent"></div>
            </div>
          </div>
          <div className="group">
            <div className="flex justify-between items-center gap-6 py-4">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-yellow-400 group-hover:shadow-[0_0_8px_rgba(250,204,21,0.6)] transition-shadow"></div>
                <span className="text-slate-300 text-base">CCI</span>
              </div>
              <span className="text-yellow-400 font-bold text-base font-mono tracking-wide">
                {signal.CCI > 0 ? '+' : ''}{signal.CCI.toFixed(1)}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-slate-800 border border-slate-600 rounded-xl p-6">
        <div className="flex items-start gap-3">
          <Info className="w-5 h-5 text-slate-400 mt-0.5 flex-shrink-0" />
          <div>
            <h3 className="text-slate-300 font-semibold mb-2">Historical Accuracy Percentage:</h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              This percentage shows how often signals from the highlighted parameters moved in the expected direction during the backtest. This is historical data only and does not indicate future results.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
