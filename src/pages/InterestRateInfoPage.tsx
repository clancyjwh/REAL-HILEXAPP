import { ArrowLeft, Star, Settings, Lightbulb, BookOpen } from 'lucide-react';
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
    title: 'Interest Rate Comparison',
    icon: Star,
    gradient: 'from-amber-500 to-orange-600',
    borderColor: 'border-amber-400/60',
    shadowColor: 'shadow-amber-500/50',
    content: (
      <div className="space-y-4">
        <p className="text-slate-300 text-base leading-relaxed">
          This tool lets you compare the official interest rates of different countries over any timeframe you choose.
        </p>
        <p className="text-slate-300 text-base leading-relaxed">
          All interest rate data comes directly from the Federal Reserve Bank of St. Louis, which publishes reliable global economic statistics through its public database.
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
              You choose two countries (or central banks).
            </p>
          </li>
          <li className="flex items-start gap-3">
            <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-cyan-500/20 text-cyan-400 font-semibold text-sm flex-shrink-0 mt-0.5">
              2
            </span>
            <p className="text-slate-300 text-base leading-relaxed">
              The system retrieves each country's published policy rate.
            </p>
          </li>
          <li className="flex items-start gap-3">
            <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-cyan-500/20 text-cyan-400 font-semibold text-sm flex-shrink-0 mt-0.5">
              3
            </span>
            <p className="text-slate-300 text-base leading-relaxed">
              It shows the most recent available rate for each one.
            </p>
          </li>
          <li className="flex items-start gap-3">
            <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-cyan-500/20 text-cyan-400 font-semibold text-sm flex-shrink-0 mt-0.5">
              4
            </span>
            <p className="text-slate-300 text-base leading-relaxed">
              It displays the numerical difference between the two rates.
            </p>
          </li>
        </ul>
        <p className="text-slate-300 text-base leading-relaxed mt-4">
          Everything shown is purely a comparison of published interest rate values.
        </p>
      </div>
    ),
  },
  {
    title: 'Why This Can Be Useful',
    icon: Lightbulb,
    gradient: 'from-emerald-500 to-teal-600',
    borderColor: 'border-emerald-400/60',
    shadowColor: 'shadow-emerald-500/50',
    content: (
      <div className="space-y-4">
        <p className="text-slate-300 text-base leading-relaxed">
          Comparing policy rates can help illustrate:
        </p>
        <ul className="space-y-3">
          <li className="flex items-start gap-3">
            <span className="text-emerald-400 text-lg flex-shrink-0 mt-1">•</span>
            <p className="text-slate-300 text-base leading-relaxed">
              Differences in borrowing environments between countries
            </p>
          </li>
          <li className="flex items-start gap-3">
            <span className="text-emerald-400 text-lg flex-shrink-0 mt-1">•</span>
            <p className="text-slate-300 text-base leading-relaxed">
              How central banks have moved rates over time
            </p>
          </li>
          <li className="flex items-start gap-3">
            <span className="text-emerald-400 text-lg flex-shrink-0 mt-1">•</span>
            <p className="text-slate-300 text-base leading-relaxed">
              The size of the gap between two economies' interest rate levels
            </p>
          </li>
        </ul>
        <div className="bg-slate-900/50 rounded-lg p-4 border-l-4 border-orange-400 mt-4">
          <p className="text-slate-300 text-sm italic">
            This is historical information only and does not imply future changes.
          </p>
        </div>
      </div>
    ),
  },
  {
    title: 'Definitions',
    icon: BookOpen,
    gradient: 'from-orange-500 to-red-600',
    borderColor: 'border-orange-400/60',
    shadowColor: 'shadow-orange-500/50',
    content: (
      <div className="space-y-4">
        <div className="space-y-4">
          <div>
            <h4 className="text-white font-semibold text-lg mb-2">Policy Rate</h4>
            <p className="text-slate-300 text-base leading-relaxed">
              The main interest rate set by a country's central bank (e.g., Bank of Canada, Federal Reserve).
            </p>
          </div>
          <div>
            <h4 className="text-white font-semibold text-lg mb-2">Federal Reserve Bank of St. Louis</h4>
            <p className="text-slate-300 text-base leading-relaxed">
              A U.S. central bank branch that publishes global economic and financial statistics.
            </p>
          </div>
          <div>
            <h4 className="text-white font-semibold text-lg mb-2">Interest Rate Gap</h4>
            <p className="text-slate-300 text-base leading-relaxed">
              The numerical difference between two countries' policy rates.
            </p>
          </div>
          <div>
            <h4 className="text-white font-semibold text-lg mb-2">Timeframe</h4>
            <p className="text-slate-300 text-base leading-relaxed">
              The historical window (e.g., 6 months, 1 year) used to display how rates have changed.
            </p>
          </div>
        </div>
      </div>
    ),
  },
];

export default function InterestRateInfoPage() {
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
        <div className="p-4 bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl shadow-lg shadow-orange-500/50">
          <Settings className="w-10 h-10 text-white" />
        </div>
        <div>
          <h1 className="text-4xl font-bold text-white">Interest Rate Comparison</h1>
          <p className="text-slate-400 mt-2 text-lg">
            Compare official interest rates across different countries and timeframes
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
          The Interest Rate Comparison tool provides neutral comparisons of official policy rates from different countries.
          All data is sourced from the Federal Reserve Bank of St. Louis and reflects historical information only.
        </p>
      </div>
    </div>
  );
}
