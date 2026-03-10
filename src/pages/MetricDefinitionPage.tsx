import { ArrowLeft, BookOpen, Home, Info } from 'lucide-react';
import { useNavigate, useSearchParams, useLocation } from 'react-router-dom';

interface MetricDefinition {
  title: string;
  description: string;
  interpretation?: string[];
  note?: string;
}

const metricDefinitions: Record<string, MetricDefinition> = {
  'parameters': {
    title: 'Top Historical Parameter: Trade-by-Trade',
    description: 'Out of all the parameter combinations tested, these settings had the highest historical accuracy percentage when applied to this asset\'s historical price movements.',
    note: 'Trade-by-trade and monthly accuracy can differ because they use different measurement methods. Trade-by-trade checks each signal, while monthly accuracy samples from the first trading day of each month over a ten-day period. Different starting points and sampling methods may produce different top-scoring parameters.'
  },
  'parameters-monthly': {
    title: 'Top Historical Parameter: Monthly Snapshots',
    description: 'This backtests by checking monthly points in history and measuring how prices moved over the following ten days compared to the rule\'s direction. This is strictly historical and does not indicate future results.',
    note: 'Trade-by-trade and monthly parameters can differ due to different measurement methods. Trade-by-trade evaluates every signal, while monthly sampling checks prices from the first trading day of each month. Different approaches may yield different optimal parameters.'
  },
  'historical-accuracy-percentage': {
    title: 'Historical Accuracy Percentage',
    description: 'This percentage shows how often signals from these parameters moved in the expected direction during the backtest period.',
    interpretation: [
      '90-100%: Exceptional historical performance',
      '70-89%: Strong historical performance',
      '50-69%: Moderate historical performance',
      'Below 50%: Weak historical performance',
      'Past performance does not guarantee future results'
    ]
  },
  score: {
    title: 'Score',
    description: 'An overall quality rating (0-3+) that combines win rate with average move strength - higher scores indicate more reliable levels. Scores above 0.6 are considered strong; below 0.5 are weak.',
    interpretation: [
      'Score > 0.6: Strong, reliable level',
      'Score 0.5-0.6: Moderate reliability',
      'Score < 0.5: Weak, less reliable level'
    ]
  },
  'average-move': {
    title: 'Average Move',
    description: 'How much the price typically moved (in %) after touching this level - positive numbers for support show upward bounces, negative numbers for resistance show downward rejections. Larger absolute values indicate stronger reactions.',
    interpretation: [
      'For Support: Positive % = Average bounce strength',
      'For Resistance: Negative % = Average rejection strength',
      'Larger absolute values = Stronger price reactions'
    ]
  },
  distance: {
    title: 'Distance (%)',
    description: 'How far away the level is from the current price - levels closer to current price (lower %) are more immediately relevant for trading decisions, while distant levels may take time to reach.',
    interpretation: [
      'Lower % = Level is closer to current price',
      'Higher % = Level is further from current price',
      'Closer levels are more immediately actionable'
    ]
  },
  'historical-accuracy': {
    title: 'Historical Accuracy Rate',
    description: 'This shows how many times the price reacted correctly when it reached this level in the past. For support levels, 100% means every time the price dropped down to that level, it bounced back up instead of breaking through. For resistance levels, 100% means every time the price rose up to that level, it was rejected and fell back down instead of breaking through. A 50% rate indicates the level worked half the time and failed half the time, suggesting low reliability.',
    interpretation: [
      '100%: Perfect historical performance',
      '75-99%: Strong reliability',
      '50-74%: Moderate reliability',
      '< 50%: Low reliability'
    ]
  },
  'support-price': {
    title: 'Support Price',
    description: 'A price level where buying pressure has historically been strong enough to prevent the price from falling further. When the price drops to this level, it tends to "bounce" back up as buyers step in.',
    interpretation: [
      'Acts as a floor for the price',
      'Buyers become active at this level',
      'Breaking below may signal weakness'
    ]
  },
  'resistance-price': {
    title: 'Resistance Price',
    description: 'A price level where selling pressure has historically been strong enough to prevent the price from rising further. When the price rises to this level, it tends to get "rejected" and fall back down as sellers step in.',
    interpretation: [
      'Acts as a ceiling for the price',
      'Sellers become active at this level',
      'Breaking above may signal strength'
    ]
  }
};

export default function MetricDefinitionPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const metricKey = searchParams.get('metric') || 'score';
  const indicator = location.state?.indicator;

  const definition = metricDefinitions[metricKey] || metricDefinitions.score;

  const signalDefinitions: Record<string, { fullDetails: string; summary: string }> = {
    CCI: {
      fullDetails: 'CCI signals form when the CCI value moves beyond its normal range. Values well below the midline generate "buy-type" signals, and values well above it generate "sell-type" signals. Moderate readings inside the usual band do not produce signals.',
      summary: 'CCI creates a signal when its value becomes very high or very low relative to recent prices.',
    },
    RSI: {
      fullDetails: 'RSI signals occur when the RSI value enters its established low or high zones. Readings in the lower zone generate "buy-type" signals, while readings in the upper zone generate "sell-type" signals. Neutral levels between these zones do not produce signals.',
      summary: 'RSI creates a signal when it drops into its low zone or rises into its high zone.',
    },
    SMA: {
      fullDetails: 'SMA signals occur when the short-term moving average moves noticeably above or below the long-term moving average. A rising crossover forms a "buy-type" signal, while a falling crossover forms a "sell-type" signal. Signals are spaced apart by a minimum number of price bars so repeated moves are not counted multiple times.',
      summary: 'SMA creates a signal when the short-term line moves clearly above or below the long-term line.',
    },
    BOLL: {
      fullDetails: 'Bollinger Band signals occur when price touches or moves near the upper or lower band. Prices near the lower band create "buy-type" signals, while prices near the upper band create "sell-type" signals. Price movements in the middle of the bands do not generate signals.',
      summary: 'Bollinger Bands create a signal when the price moves close to the upper or lower band.',
    },
    Bollinger: {
      fullDetails: 'Bollinger Band signals occur when price touches or moves near the upper or lower band. Prices near the lower band create "buy-type" signals, while prices near the upper band create "sell-type" signals. Price movements in the middle of the bands do not generate signals.',
      summary: 'Bollinger Bands create a signal when the price moves close to the upper or lower band.',
    },
    MACD: {
      fullDetails: 'MACD signals occur when the MACD line crosses above or below its signal line. An upward crossover creates a "buy-type" signal, while a downward crossover creates a "sell-type" signal. Periods with no crossover generate no signal.',
      summary: 'MACD creates a signal when the two MACD lines cross each other.',
    },
    ROC: {
      fullDetails: 'ROC signals are created when momentum changes strongly compared with a previous period. Large negative momentum produces "buy-type" signals, while large positive momentum produces "sell-type" signals. Mild or sideways changes generate no signal.',
      summary: 'ROC creates a signal when momentum moves sharply up or down.',
    },
  };

  const signalDef = indicator ? signalDefinitions[indicator] : null;

  const handleBack = () => {
    const from = location.state?.from;
    const returnToSR = location.state?.returnToSupportResistance;

    if (from) {
      navigate(from, { state: { returnToSupportResistance: returnToSR } });
      if (returnToSR) {
        setTimeout(() => {
          const section = document.getElementById('support-resistance-section');
          if (section) {
            section.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }
        }, 100);
      }
    } else {
      navigate(-1);
    }
  };

  return (
    <div className="min-h-screen pb-12">
      <button
        onClick={handleBack}
        className="flex items-center gap-2 text-slate-400 hover:text-white mb-8 transition-colors"
      >
        <ArrowLeft className="w-5 h-5" />
        <span>Back</span>
      </button>

        <div className="bg-gradient-to-br from-slate-900/80 to-slate-800/60 border-2 border-slate-700 rounded-2xl p-10 shadow-xl">
          <div className="flex items-start gap-4 mb-8">
            <div className="p-3 bg-cyan-500/10 rounded-xl flex-shrink-0">
              <BookOpen className="w-8 h-8 text-cyan-500" />
            </div>
            <h1 className="text-3xl font-bold text-white">{definition.title}</h1>
          </div>

          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold text-slate-300 mb-3">Definition</h2>
              <p className="text-slate-400 text-base leading-relaxed">
                {definition.description}
              </p>
            </div>

            {definition.interpretation && (
              <div>
                <h2 className="text-xl font-semibold text-slate-300 mb-3">Interpretation Guide</h2>
                <ul className="space-y-2">
                  {definition.interpretation.map((item, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-cyan-500 rounded-full mt-2 flex-shrink-0"></div>
                      <span className="text-slate-400 text-base">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>

        {metricKey === 'historical-accuracy-percentage' && signalDef && (
          <div className="mt-6 bg-gradient-to-br from-emerald-900/40 to-teal-900/30 border-2 border-emerald-400/60 rounded-2xl p-8 shadow-xl shadow-emerald-500/20">
            <div className="flex items-center gap-4 mb-6">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 shadow-lg shadow-emerald-500/50">
                <BookOpen className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-white">What is a Signal?</h3>
                <div className="h-1 w-32 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full mt-1" />
              </div>
            </div>
            <div className="bg-slate-800/60 rounded-xl p-6 border border-emerald-400/30 mb-4">
              <p className="text-slate-200 text-base leading-relaxed">
                {signalDef.fullDetails}
              </p>
            </div>
            <div className="bg-gradient-to-br from-emerald-500/10 to-teal-500/10 rounded-xl p-5 border-2 border-emerald-400/40">
              <h4 className="text-sm font-bold text-emerald-300 mb-2 uppercase tracking-wide">Summary</h4>
              <p className="text-white text-base leading-relaxed">
                {signalDef.summary}
              </p>
            </div>
          </div>
        )}

        {metricKey === 'parameters' && (
          <div className="mt-6 bg-gradient-to-br from-slate-900/80 to-slate-800/60 border-2 border-slate-700 rounded-2xl p-10 shadow-xl">
            <div className="flex items-start gap-4 mb-8">
              <div className="p-3 bg-cyan-500/10 rounded-xl flex-shrink-0">
                <BookOpen className="w-8 h-8 text-cyan-500" />
              </div>
              <h1 className="text-3xl font-bold text-white">Historical Accuracy Percentage</h1>
            </div>

            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-semibold text-slate-300 mb-3">Definition</h2>
                <p className="text-slate-400 text-base leading-relaxed">
                  This percentage shows how often signals from these parameters moved in the expected direction during the backtest period.
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="mt-6 bg-amber-900/20 border border-amber-600/30 rounded-xl p-5">
          <p className="text-amber-400 text-sm leading-relaxed">
            <span className="font-semibold">Note:</span> These metrics are based on historical data and should be used as one part of your trading analysis, not as the sole decision-making factor.
          </p>
      </div>
    </div>
  );
}
