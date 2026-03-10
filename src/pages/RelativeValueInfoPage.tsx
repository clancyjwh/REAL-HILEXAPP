import { ArrowLeft, Star, Settings, BarChart3, Lightbulb, BookOpen } from 'lucide-react';
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
    title: 'Relative Value to the Index',
    icon: Star,
    gradient: 'from-amber-500 to-orange-600',
    borderColor: 'border-amber-400/60',
    shadowColor: 'shadow-amber-500/50',
    content: (
      <div className="space-y-4">
        <p className="text-slate-300 text-base leading-relaxed">
          This tool shows how an asset's price movement compared to a chosen benchmark index over a user-selected timeframe (for example, the past 7, 30, or 90 days).
        </p>
        <p className="text-slate-300 text-base leading-relaxed">
          It answers the neutral question:
        </p>
        <div className="bg-slate-900/50 rounded-lg p-4 border-l-4 border-emerald-400">
          <p className="text-slate-200 text-base italic">
            "How did this asset's recent price change compare with the index's price change over the same period?"
          </p>
        </div>
        <p className="text-slate-300 text-base leading-relaxed">
          All values come directly from historical percentage changes.
        </p>
      </div>
    ),
  },
  {
    title: 'How It Works',
    icon: Settings,
    gradient: 'from-cyan-500 to-blue-600',
    borderColor: 'border-cyan-400/60',
    shadowColor: 'shadow-cyan-500/50',
    content: (
      <div className="space-y-4">
        <ul className="space-y-3">
          <li className="flex items-start gap-3">
            <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-cyan-500/20 text-cyan-400 font-semibold text-sm flex-shrink-0 mt-0.5">
              1
            </span>
            <p className="text-slate-300 text-base leading-relaxed">
              You choose a timeframe (e.g., 7 days).
            </p>
          </li>
          <li className="flex items-start gap-3">
            <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-cyan-500/20 text-cyan-400 font-semibold text-sm flex-shrink-0 mt-0.5">
              2
            </span>
            <p className="text-slate-300 text-base leading-relaxed">
              The system calculates the asset's percentage change over that window.
            </p>
          </li>
          <li className="flex items-start gap-3">
            <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-cyan-500/20 text-cyan-400 font-semibold text-sm flex-shrink-0 mt-0.5">
              3
            </span>
            <p className="text-slate-300 text-base leading-relaxed">
              It calculates the index's percentage change over the same window.
            </p>
          </li>
          <li className="flex items-start gap-3">
            <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-cyan-500/20 text-cyan-400 font-semibold text-sm flex-shrink-0 mt-0.5">
              4
            </span>
            <p className="text-slate-300 text-base leading-relaxed">
              It places the two values side-by-side.
            </p>
          </li>
          <li className="flex items-start gap-3">
            <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-cyan-500/20 text-cyan-400 font-semibold text-sm flex-shrink-0 mt-0.5">
              5
            </span>
            <p className="text-slate-300 text-base leading-relaxed">
              It shows the difference between them, expressed simply as a comparison.
            </p>
          </li>
        </ul>
        <p className="text-slate-300 text-base leading-relaxed mt-4">
          This provides a clear view of how the asset and index moved relative to one another during that period.
        </p>
      </div>
    ),
  },
  {
    title: 'What the Dashboard Shows',
    icon: BarChart3,
    gradient: 'from-emerald-500 to-teal-600',
    borderColor: 'border-emerald-400/60',
    shadowColor: 'shadow-emerald-500/50',
    content: (
      <div className="space-y-4">
        <ul className="space-y-3">
          <li className="flex items-start gap-3">
            <span className="text-emerald-400 text-lg flex-shrink-0 mt-1">•</span>
            <p className="text-slate-300 text-base leading-relaxed">
              The asset's percentage change (e.g., +4.2% over 7 days)
            </p>
          </li>
          <li className="flex items-start gap-3">
            <span className="text-emerald-400 text-lg flex-shrink-0 mt-1">•</span>
            <p className="text-slate-300 text-base leading-relaxed">
              The index's percentage change over the same window
            </p>
          </li>
          <li className="flex items-start gap-3">
            <span className="text-emerald-400 text-lg flex-shrink-0 mt-1">•</span>
            <p className="text-slate-300 text-base leading-relaxed">
              The difference between the two changes (e.g., +1.7% relative difference)
            </p>
          </li>
          <li className="flex items-start gap-3">
            <span className="text-emerald-400 text-lg flex-shrink-0 mt-1">•</span>
            <p className="text-slate-300 text-base leading-relaxed">
              A brief, neutral interpretation describing whether the asset's movement was higher, lower, or similar to the index during the selected timeframe
            </p>
          </li>
        </ul>
        <div className="bg-slate-900/50 rounded-lg p-4 border-l-4 border-orange-400 mt-4">
          <p className="text-slate-300 text-sm italic">
            This is strictly a comparison of past price changes and does not describe performance quality or future expectations.
          </p>
        </div>
      </div>
    ),
  },
  {
    title: 'Why This Is Useful',
    icon: Lightbulb,
    gradient: 'from-violet-500 to-purple-600',
    borderColor: 'border-violet-400/60',
    shadowColor: 'shadow-violet-500/50',
    content: (
      <div className="space-y-4">
        <p className="text-slate-300 text-base leading-relaxed">
          A relative comparison helps highlight:
        </p>
        <ul className="space-y-3">
          <li className="flex items-start gap-3">
            <span className="text-violet-400 text-lg flex-shrink-0 mt-1">•</span>
            <p className="text-slate-300 text-base leading-relaxed">
              When an asset's price has moved more or less than the index during the same window
            </p>
          </li>
          <li className="flex items-start gap-3">
            <span className="text-violet-400 text-lg flex-shrink-0 mt-1">•</span>
            <p className="text-slate-300 text-base leading-relaxed">
              Whether recent behaviour between the two has been similar or different
            </p>
          </li>
          <li className="flex items-start gap-3">
            <span className="text-violet-400 text-lg flex-shrink-0 mt-1">•</span>
            <p className="text-slate-300 text-base leading-relaxed">
              How an asset's recent movement sits in context with general market movement
            </p>
          </li>
        </ul>
        <p className="text-slate-300 text-base leading-relaxed">
          All insights come purely from historical price differences.
        </p>
      </div>
    ),
  },
  {
    title: 'Definitions',
    icon: BookOpen,
    gradient: 'from-pink-500 to-rose-600',
    borderColor: 'border-pink-400/60',
    shadowColor: 'shadow-pink-500/50',
    content: (
      <div className="space-y-4">
        <div className="space-y-4">
          <div>
            <h4 className="text-white font-semibold text-lg mb-2">Timeframe</h4>
            <p className="text-slate-300 text-base leading-relaxed">
              The number of past days selected for comparison (e.g., 7, 30, 90).
            </p>
          </div>
          <div>
            <h4 className="text-white font-semibold text-lg mb-2">Percentage Change</h4>
            <p className="text-slate-300 text-base leading-relaxed">
              The percent movement in price over the selected window.
            </p>
          </div>
          <div>
            <h4 className="text-white font-semibold text-lg mb-2">Index</h4>
            <p className="text-slate-300 text-base leading-relaxed">
              A benchmark used for comparison (e.g., S&P 500, NASDAQ, a sector index, etc.).
            </p>
          </div>
          <div>
            <h4 className="text-white font-semibold text-lg mb-2">Relative Difference</h4>
            <p className="text-slate-300 text-base leading-relaxed">
              The numerical difference between the asset's percentage change and the index's percentage change.
            </p>
          </div>
          <div>
            <h4 className="text-white font-semibold text-lg mb-2">Higher / Lower / Similar Movement</h4>
            <p className="text-slate-300 text-base leading-relaxed">
              Neutral descriptions indicating whether the asset's percentage change was numerically above, below, or close to the index's change.
            </p>
          </div>
        </div>
      </div>
    ),
  },
];

export default function RelativeValueInfoPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen pb-12">
      <button
        onClick={() => navigate('/documentation/analysis-tools')}
        className="group flex items-center gap-2 text-cyan-400 hover:text-cyan-300 transition-colors mb-8"
      >
        <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
        <span className="text-sm font-medium">Back to Analysis Tools</span>
      </button>

      <div className="flex items-center gap-4 mb-8">
        <div className="p-4 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl shadow-lg shadow-emerald-500/50">
          <BarChart3 className="w-10 h-10 text-white" />
        </div>
        <div>
          <h1 className="text-4xl font-bold text-white">Relative Value Index</h1>
          <p className="text-slate-400 mt-2 text-lg">
            Compare asset price movements against benchmark indices
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
          The Relative Value Index enables neutral comparison of asset price movements against benchmark indices.
          All methods are based strictly on historical price behavior and do not predict or guarantee future performance.
        </p>
      </div>
    </div>
  );
}
