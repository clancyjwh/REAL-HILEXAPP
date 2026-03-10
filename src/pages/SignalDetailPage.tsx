import { ArrowLeft, Radio } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

interface SignalData {
  term: string;
  beginnerSummary: string;
  fullDetails: string;
  icon: string;
}

const signalDetails: Record<string, SignalData> = {
  'signals-overview': {
    term: 'Signals — Overview',
    beginnerSummary: 'A signal is just a moment where an indicator hits one of its key levels and gets counted for review.',
    fullDetails: 'A signal is simply a moment when an indicator reaches one of its predefined conditions. These conditions mark points in time where the indicator showed a meaningful change in its reading. Signals are used only for historical analysis to see how often these conditions lined up with later price movement.',
    icon: '📘',
  },
  'sma-signals': {
    term: 'SMA Signals',
    beginnerSummary: 'SMA creates a signal when the short-term line moves clearly above or below the long-term line.',
    fullDetails: 'SMA signals occur when the short-term moving average moves noticeably above or below the long-term moving average. A rising crossover forms a "buy-type" signal, while a falling crossover forms a "sell-type" signal. Signals are spaced apart by a minimum number of price bars so repeated moves are not counted multiple times.',
    icon: '📗',
  },
  'rsi-signals': {
    term: 'RSI Signals',
    beginnerSummary: 'RSI creates a signal when it drops into its low zone or rises into its high zone.',
    fullDetails: 'RSI signals occur when the RSI value enters its established low or high zones. Readings in the lower zone generate "buy-type" signals, while readings in the upper zone generate "sell-type" signals. Neutral levels between these zones do not produce signals.',
    icon: '📘',
  },
  'bollinger-band-signals': {
    term: 'Bollinger Band Signals',
    beginnerSummary: 'Bollinger Bands create a signal when the price moves close to the upper or lower band.',
    fullDetails: 'Bollinger Band signals occur when price touches or moves near the upper or lower band. Prices near the lower band create "buy-type" signals, while prices near the upper band create "sell-type" signals. Price movements in the middle of the bands do not generate signals.',
    icon: '📙',
  },
  'cci-signals': {
    term: 'CCI Signals',
    beginnerSummary: 'CCI creates a signal when its value becomes very high or very low relative to recent prices.',
    fullDetails: 'CCI signals form when the CCI value moves beyond its normal range. Values well below the midline generate "buy-type" signals, and values well above it generate "sell-type" signals. Moderate readings inside the usual band do not produce signals.',
    icon: '📕',
  },
  'macd-signals': {
    term: 'MACD Signals',
    beginnerSummary: 'MACD creates a signal when the two MACD lines cross each other.',
    fullDetails: 'MACD signals occur when the MACD line crosses above or below its signal line. An upward crossover creates a "buy-type" signal, while a downward crossover creates a "sell-type" signal. Periods with no crossover generate no signal.',
    icon: '📒',
  },
  'roc-signals': {
    term: 'ROC Signals',
    beginnerSummary: 'ROC creates a signal when momentum moves sharply up or down.',
    fullDetails: 'ROC signals are created when momentum changes strongly compared with a previous period. Large negative momentum produces "buy-type" signals, while large positive momentum produces "sell-type" signals. Mild or sideways changes generate no signal.',
    icon: '📔',
  },
};

export default function SignalDetailPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { signalTerm } = location.state || {};

  const signalId = signalTerm?.toLowerCase().replace(/[^a-z0-9]+/g, '-') || '';
  const signal = signalDetails[signalId];

  if (!signal) {
    navigate('/documentation/definitions');
    return null;
  }

  return (
    <div className="min-h-screen pb-12">
      <button
        onClick={() => navigate('/documentation/definitions')}
        className="group flex items-center gap-2 text-cyan-400 hover:text-cyan-300 transition-colors mb-8"
      >
        <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
        <span className="text-sm font-medium">Back to Definitions</span>
      </button>

      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-6 mb-12">
          <div className="text-7xl">{signal.icon}</div>
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-slate-700 rounded-full mb-3">
              <Radio className="w-4 h-4 text-cyan-400" />
              <span className="text-sm font-semibold text-slate-300">Signal</span>
            </div>
            <h1 className="text-5xl font-bold text-white mb-2">{signal.term}</h1>
          </div>
        </div>

        <div className="space-y-8">
          <div className="bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-xl rounded-2xl p-8 border-2 border-cyan-400/60 shadow-xl shadow-cyan-500/50">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl shadow-lg shadow-cyan-500/50">
                <Radio className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-white">Beginner Summary</h2>
            </div>
            <p className="text-slate-300 text-lg leading-relaxed">
              {signal.beginnerSummary}
            </p>
          </div>

          <div className="bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-xl rounded-2xl p-8 border-2 border-slate-400/60 shadow-xl shadow-slate-500/50">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-gradient-to-br from-slate-500 to-zinc-600 rounded-xl shadow-lg shadow-slate-500/50">
                <Radio className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-white">Full Details</h2>
            </div>
            <div className="space-y-4">
              <p className="text-slate-300 text-base leading-relaxed">
                {signal.fullDetails}
              </p>
            </div>
          </div>

          <div className="bg-gradient-to-br from-amber-900/30 to-orange-900/30 backdrop-blur-xl rounded-2xl p-6 border-2 border-amber-500/40 shadow-xl">
            <h3 className="text-lg font-semibold text-amber-300 mb-3">Important Note</h3>
            <p className="text-amber-100/80 text-sm leading-relaxed">
              All signal information is based on historical analysis only. Signals represent past conditions where indicators reached specific levels, and are used to review how often these conditions aligned with subsequent price movements. They do not predict or guarantee future performance.
            </p>
          </div>
        </div>

        <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-6">
          <button
            onClick={() => navigate('/documentation/definitions')}
            className="flex items-center justify-center gap-2 px-6 py-4 bg-slate-800 hover:bg-slate-700 text-white rounded-xl transition-all shadow-lg border border-slate-700 font-semibold"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>View All Definitions</span>
          </button>

          <button
            onClick={() => navigate('/documentation')}
            className="flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white rounded-xl transition-all shadow-lg font-semibold"
          >
            <span>Back to Documentation</span>
          </button>
        </div>
      </div>
    </div>
  );
}
