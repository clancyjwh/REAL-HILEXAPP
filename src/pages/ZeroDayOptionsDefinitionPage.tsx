import { Zap, TrendingUp, TrendingDown, Target, BarChart3, Clock, ArrowLeft, Info } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface InfoCard {
  title: string;
  icon: React.ElementType;
  gradient: string;
  borderColor: string;
  shadowColor: string;
  content: React.ReactNode;
}

const cards: InfoCard[] = [
  {
    title: 'Zero-Day Price Forecasts',
    icon: Zap,
    gradient: 'from-yellow-500 to-amber-600',
    borderColor: 'border-yellow-400/60',
    shadowColor: 'shadow-yellow-500/50',
    content: (
      <div className="space-y-4">
        <p className="text-slate-300 text-base leading-relaxed">
          This tool focuses on ultra-short-term price behavior, such as the next 5 minutes, instead of days or weeks. It looks at current market conditions, compares them to similar situations in the past, and estimates whether price is more likely to drift up, drift down, or stay roughly flat over that window.
        </p>
        <p className="text-slate-300 text-base leading-relaxed">
          Behind the scenes, the system analyzes recent intraday moves, volatility, time of day, and how far price is from recent highs and lows. It then finds past scenarios that looked similar and summarizes how those scenarios usually resolved into a clear directional bias, probabilities, and a typical expected move.
        </p>
      </div>
    ),
  },
  {
    title: 'How It Works',
    icon: Clock,
    gradient: 'from-cyan-500 to-blue-600',
    borderColor: 'border-cyan-400/60',
    shadowColor: 'shadow-cyan-500/50',
    content: (
      <div className="space-y-4">
        <div className="space-y-3">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-cyan-500/20 flex items-center justify-center text-cyan-400 font-bold text-sm">
              1
            </div>
            <p className="text-slate-300 text-sm leading-relaxed">
              You choose an asset (for example, AAPL or BTC) and a short time horizon (such as the next 5 minutes).
            </p>
          </div>
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-cyan-500/20 flex items-center justify-center text-cyan-400 font-bold text-sm">
              2
            </div>
            <p className="text-slate-300 text-sm leading-relaxed">
              The system reads the latest intraday price data and builds a snapshot of the current market setup.
            </p>
          </div>
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-cyan-500/20 flex items-center justify-center text-cyan-400 font-bold text-sm">
              3
            </div>
            <p className="text-slate-300 text-sm leading-relaxed">
              It searches historical intraday data for past situations that looked similar to the current setup.
            </p>
          </div>
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-cyan-500/20 flex items-center justify-center text-cyan-400 font-bold text-sm">
              4
            </div>
            <p className="text-slate-300 text-sm leading-relaxed">
              It counts how often those past cases moved up, down, or stayed flat, and measures the typical size of the move.
            </p>
          </div>
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-cyan-500/20 flex items-center justify-center text-cyan-400 font-bold text-sm">
              5
            </div>
            <p className="text-slate-300 text-sm leading-relaxed">
              It converts that into a simple forecast: direction (up / down / neutral), probabilities for each outcome, a typical expected move in percent, and the number of scenarios tested.
            </p>
          </div>
        </div>
        <p className="text-slate-400 text-xs italic">
          All of this is based on historical patterns; nothing here places trades or guarantees outcomes.
        </p>
      </div>
    ),
  },
  {
    title: 'Why This Can Be Useful',
    icon: Info,
    gradient: 'from-green-500 to-emerald-600',
    borderColor: 'border-green-400/60',
    shadowColor: 'shadow-green-500/50',
    content: (
      <div className="space-y-4">
        <p className="text-slate-300 text-base leading-relaxed">
          Zero-day forecasts can help you:
        </p>
        <ul className="text-slate-300 text-sm space-y-2">
          <li className="flex items-start gap-2">
            <span className="text-green-400 mt-1">•</span>
            <span>See whether a short-term setup has a measurable edge or is basically noise</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-green-400 mt-1">•</span>
            <span>Understand if the immediate risk is more skewed toward an uptick, a downtick, or a flat period</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-green-400 mt-1">•</span>
            <span>Compare multiple assets to see which one currently shows the stronger short-term signal</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-green-400 mt-1">•</span>
            <span>Add structure to intraday decisions instead of relying only on gut feeling</span>
          </li>
        </ul>
        <p className="text-slate-300 text-base leading-relaxed">
          This is designed as a decision-support tool, not an automatic trading system.
        </p>
      </div>
    ),
  },
  {
    title: 'Definitions',
    icon: BarChart3,
    gradient: 'from-blue-500 to-cyan-600',
    borderColor: 'border-blue-400/60',
    shadowColor: 'shadow-blue-500/50',
    content: (
      <div className="space-y-4">
        <div className="bg-slate-900/50 rounded-lg p-4">
          <h4 className="text-white font-semibold mb-2 text-sm">Zero-Day Forecast</h4>
          <p className="text-slate-300 text-sm leading-relaxed">
            An estimate of how price is likely to move over a very short horizon (for example, the next 5 minutes) based on similar past intraday scenarios.
          </p>
        </div>
        <div className="bg-slate-900/50 rounded-lg p-4">
          <h4 className="text-white font-semibold mb-2 text-sm">Direction</h4>
          <p className="text-slate-300 text-sm leading-relaxed">
            The model's overall bias for the next period: up, down, or neutral, based on how often similar historical cases moved in each direction.
          </p>
        </div>
        <div className="bg-slate-900/50 rounded-lg p-4">
          <h4 className="text-white font-semibold mb-2 text-sm">Probability Up / Down / Flat</h4>
          <p className="text-slate-300 text-sm leading-relaxed">
            The percentage of similar past scenarios that went up, went down, or stayed roughly flat over the chosen horizon.
          </p>
        </div>
        <div className="bg-slate-900/50 rounded-lg p-4">
          <h4 className="text-white font-semibold mb-2 text-sm">Expected Move (%)</h4>
          <p className="text-slate-300 text-sm leading-relaxed">
            The typical size of the move, in percentage terms, in the predicted direction over the selected time window (for example, "about 0.3% in the next 5 minutes").
          </p>
        </div>
        <div className="bg-slate-900/50 rounded-lg p-4">
          <h4 className="text-white font-semibold mb-2 text-sm">Scenarios Tested</h4>
          <p className="text-slate-300 text-sm leading-relaxed">
            The number of historical situations the system found that were similar enough to use when building the forecast.
          </p>
        </div>
      </div>
    ),
  },
];

export default function ZeroDayOptionsDefinitionPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen pb-12">
      <button
        onClick={() => navigate('/documentation/analysis-tools')}
        className="group flex items-center gap-2 text-yellow-400 hover:text-yellow-300 transition-colors mb-8"
      >
        <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
        <span className="text-sm font-medium">Back to Analysis Tools</span>
      </button>

      <div className="flex items-center gap-4 mb-8">
        <div className="p-4 bg-gradient-to-br from-yellow-500 to-amber-600 rounded-2xl shadow-lg shadow-yellow-500/50">
          <Zap className="w-10 h-10 text-white" />
        </div>
        <div>
          <h1 className="text-4xl font-bold text-white">Zero Day Options</h1>
          <p className="text-slate-400 mt-2 text-lg">
            Ultra-short-term price forecasts based on similar historical intraday scenarios
          </p>
        </div>
      </div>

      <div className="space-y-6">
        {cards.map((card, index) => {
          const Icon = card.icon;
          return (
            <div
              key={index}
              className={`group relative bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-xl rounded-2xl p-6 border-2 ${card.borderColor} shadow-xl ${card.shadowColor} hover:shadow-2xl transition-all duration-300 hover:scale-[1.02]`}
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${card.gradient} opacity-0 group-hover:opacity-5 rounded-2xl transition-opacity duration-300`}></div>

              <div className="relative">
                <div className="flex items-center gap-3 mb-4">
                  <div className={`inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br ${card.gradient} shadow-lg ${card.shadowColor}`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-white">{card.title}</h3>
                </div>

                <div className="ml-15">
                  {card.content}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-12 bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 border border-slate-700/50">
        <p className="text-slate-300 text-sm leading-relaxed text-center">
          Zero Day Options provides ultra-short-term price forecasts based on historical pattern analysis.
          All forecasts are based strictly on historical behavior and do not predict or guarantee future performance.
          This tool is provided for informational and educational use only.
        </p>
      </div>
    </div>
  );
}
