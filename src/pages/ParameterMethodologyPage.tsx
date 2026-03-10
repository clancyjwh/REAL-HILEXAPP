import { Settings, TrendingUp, BarChart3, Calendar, ArrowLeft, Award } from 'lucide-react';
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
    title: 'How We Evaluate Indicator Settings',
    icon: Settings,
    gradient: 'from-cyan-500 to-blue-600',
    borderColor: 'border-cyan-400/60',
    shadowColor: 'shadow-cyan-500/50',
    content: (
      <div className="space-y-4">
        <p className="text-slate-300 text-base leading-relaxed font-semibold">
          (Historically Optimized Parameters)
        </p>
        <p className="text-slate-300 text-base leading-relaxed">
          Each indicator can be calculated using different parameter settings. To understand how these settings behaved in the past, we test all commonly used options across 12–15 months of historical data.
        </p>
        <p className="text-slate-300 text-base leading-relaxed">
          For every setting, we rewind the chart to many different points, note the indicator's value on that day, and then look at how prices moved over the next 10 days. This shows which settings formed steady, repeatable patterns across different historical market conditions.
        </p>
        <p className="text-slate-400 text-sm italic">
          All results reflect past behavior only.
        </p>
      </div>
    ),
  },
  {
    title: 'What This Process Does',
    icon: TrendingUp,
    gradient: 'from-emerald-500 to-teal-600',
    borderColor: 'border-emerald-400/60',
    shadowColor: 'shadow-emerald-500/50',
    content: (
      <div className="space-y-3">
        <ul className="text-slate-300 text-sm space-y-2">
          <li className="flex items-start gap-2">
            <span className="text-emerald-400 mt-1">•</span>
            <span>Runs each indicator with a wide range of commonly used parameter settings</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-emerald-400 mt-1">•</span>
            <span>Applies every setting across hundreds of points within the 12–15 month window</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-emerald-400 mt-1">•</span>
            <span>Checks how prices moved in the following 10-day period</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-emerald-400 mt-1">•</span>
            <span>Identifies which settings showed the most consistent historical structure</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-emerald-400 mt-1">•</span>
            <span>Displays those settings on the dashboard for reference</span>
          </li>
        </ul>
        <p className="text-slate-400 text-xs italic mt-4">
          This simply helps interpret how each version of the indicator behaved historically.
        </p>
      </div>
    ),
  },
  {
    title: 'Why Test Counts Differ Between Indicators',
    icon: BarChart3,
    gradient: 'from-purple-500 to-pink-600',
    borderColor: 'border-purple-400/60',
    shadowColor: 'shadow-purple-500/50',
    content: (
      <div className="space-y-4">
        <p className="text-slate-300 text-sm leading-relaxed">
          Different indicators have different numbers of widely used settings:
        </p>
        <div className="space-y-3">
          <div className="bg-slate-900/50 rounded-lg p-3">
            <p className="text-slate-300 text-sm">
              <span className="text-white font-semibold">SMA and Bollinger Bands</span> test a few dozen variations
            </p>
          </div>
          <div className="bg-slate-900/50 rounded-lg p-3">
            <p className="text-slate-300 text-sm">
              <span className="text-white font-semibold">RSI and ROC</span> test broader ranges
            </p>
          </div>
          <div className="bg-slate-900/50 rounded-lg p-3">
            <p className="text-slate-300 text-sm">
              <span className="text-white font-semibold">MACD</span> tests the widest range, so it naturally produces the highest number of historical evaluations
            </p>
          </div>
        </div>
        <p className="text-slate-400 text-xs italic">
          Test counts come entirely from how many parameter settings an indicator typically uses.
        </p>
      </div>
    ),
  },
  {
    title: 'Important Notes',
    icon: Settings,
    gradient: 'from-orange-500 to-red-600',
    borderColor: 'border-orange-400/60',
    shadowColor: 'shadow-orange-500/50',
    content: (
      <div className="space-y-3">
        <ul className="text-slate-300 text-sm space-y-2">
          <li className="flex items-start gap-2">
            <span className="text-orange-400 mt-1">•</span>
            <span>This analysis reviews historical behavior only</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-orange-400 mt-1">•</span>
            <span>It does not predict or imply future results</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-orange-400 mt-1">•</span>
            <span>Highlighted settings reflect past consistency, not expectations</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-orange-400 mt-1">•</span>
            <span>Results vary by asset and by time period</span>
          </li>
        </ul>
      </div>
    ),
  },
  {
    title: 'Trade-by-Trade Evaluation',
    icon: TrendingUp,
    gradient: 'from-blue-500 to-indigo-600',
    borderColor: 'border-blue-400/60',
    shadowColor: 'shadow-blue-500/50',
    content: (
      <div className="space-y-4">
        <p className="text-slate-300 text-base leading-relaxed font-semibold">
          (Individual Historical Events)
        </p>
        <p className="text-slate-300 text-base leading-relaxed">
          This method looks at 100–200 specific historical moments where an indicator meets its usual signal criteria. Each moment is treated as a separate "historical trade," and the system checks how prices moved afterward.
        </p>
        <div className="bg-slate-900/50 rounded-lg p-4 mt-4">
          <h4 className="text-white font-semibold mb-3 text-sm">When a historical trade is counted</h4>
          <p className="text-slate-300 text-sm mb-3">
            A trade is included when the indicator shows a clear historical condition, such as:
          </p>
          <ul className="text-slate-300 text-xs space-y-2">
            <li className="flex items-start gap-2">
              <span className="text-blue-400 mt-1">•</span>
              <span>SMA fast line diverging from the slow line</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-400 mt-1">•</span>
              <span>RSI entering common oversold/overbought zones</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-400 mt-1">•</span>
              <span>Bollinger price touching or nearing a band</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-400 mt-1">•</span>
              <span>MACD crossing above or below its signal line</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-400 mt-1">•</span>
              <span>CCI moving above +100 or below –100</span>
            </li>
          </ul>
        </div>
        <div className="bg-slate-900/50 rounded-lg p-4">
          <h4 className="text-white font-semibold mb-3 text-sm">For each trade, we record:</h4>
          <ul className="text-slate-300 text-xs space-y-2">
            <li className="flex items-start gap-2">
              <span className="text-blue-400 mt-1">•</span>
              <span>The indicator reading on that day</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-400 mt-1">•</span>
              <span>The implied direction (up, down, or neutral)</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-400 mt-1">•</span>
              <span>The historical price movement over the next 10 days</span>
            </li>
          </ul>
        </div>
        <p className="text-slate-300 text-sm leading-relaxed">
          A trade is marked historically correct if the 10-day average price moved in the same direction the indicator suggested.
        </p>
        <p className="text-slate-400 text-xs italic">
          All observations come strictly from past behavior.
        </p>
      </div>
    ),
  },
  {
    title: 'Monthly Rewind Evaluation',
    icon: Calendar,
    gradient: 'from-fuchsia-500 to-violet-600',
    borderColor: 'border-fuchsia-400/60',
    shadowColor: 'shadow-fuchsia-500/50',
    content: (
      <div className="space-y-4">
        <p className="text-slate-300 text-base leading-relaxed font-semibold">
          (Month-by-Month Historical Snapshot)
        </p>
        <p className="text-slate-300 text-base leading-relaxed">
          This method checks how indicators behaved at the start of each of the last 12 months, offering a clean, monthly view of historical structure.
        </p>
        <div className="bg-slate-900/50 rounded-lg p-4 mt-4">
          <h4 className="text-white font-semibold mb-3 text-sm">How each rewind works</h4>
          <p className="text-slate-300 text-sm mb-3">
            For each of the last 12 months:
          </p>
          <ul className="text-slate-300 text-xs space-y-2">
            <li className="flex items-start gap-2">
              <span className="text-fuchsia-400 mt-1">•</span>
              <span>Rewind the chart to the first trading day of that month</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-fuchsia-400 mt-1">•</span>
              <span>Read the indicator on that day</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-fuchsia-400 mt-1">•</span>
              <span>Determine the implied historical direction (up, down, or neutral)</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-fuchsia-400 mt-1">•</span>
              <span>Look at the average price over the next 10 days</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-fuchsia-400 mt-1">•</span>
              <span>Mark the month as historically correct if price moved in the same direction</span>
            </li>
          </ul>
        </div>
        <p className="text-slate-300 text-sm leading-relaxed">
          This provides a simple, month-by-month record of how each indicator behaved across a range of historical environments.
        </p>
        <p className="text-slate-400 text-xs italic">
          All results reflect past behavior only.
        </p>
      </div>
    ),
  },
  {
    title: 'Best Historically Performing Parameters',
    icon: Award,
    gradient: 'from-green-500 to-emerald-600',
    borderColor: 'border-green-400/60',
    shadowColor: 'shadow-green-500/50',
    content: (
      <div className="space-y-4">
        <p className="text-slate-300 text-base leading-relaxed">
          After evaluating all parameter combinations through the backtest process, the system identifies which setting demonstrated the highest accuracy rate in predicting directional price movements over the historical evaluation period.
        </p>
        <div className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 rounded-lg p-4 border border-green-500/30">
          <p className="text-slate-200 text-base leading-relaxed">
            The parameter configuration that achieved the most historically correct signals becomes designated as the <span className="text-green-400 font-semibold">"Best Historically Performing Parameters"</span> for that specific asset and indicator combination.
          </p>
        </div>
        <p className="text-slate-300 text-base leading-relaxed">
          This designation simply highlights which parameter setting showed the strongest historical consistency during the evaluation window. It represents observed past behavior and does not predict or guarantee future performance.
        </p>
        <div className="bg-slate-900/50 rounded-lg p-4">
          <h4 className="text-white font-semibold mb-3 text-sm">Selection Criteria:</h4>
          <ul className="text-slate-300 text-sm space-y-2">
            <li className="flex items-start gap-2">
              <span className="text-green-400 mt-1">•</span>
              <span>Highest percentage of historically correct directional predictions</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-400 mt-1">•</span>
              <span>Evaluated across the full 12–15 month historical window</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-400 mt-1">•</span>
              <span>Tested against hundreds of historical data points</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-400 mt-1">•</span>
              <span>Reflects pattern consistency within the specific time period analyzed</span>
            </li>
          </ul>
        </div>
        <p className="text-slate-400 text-sm italic">
          These parameters are recalculated periodically as new historical data becomes available, ensuring the analysis reflects recent market behavior.
        </p>
      </div>
    ),
  },
];

export default function ParameterMethodologyPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen pb-12">
      <button
        onClick={() => navigate('/documentation')}
        className="group flex items-center gap-2 px-4 py-2 mb-6 text-slate-300 hover:text-white transition-colors duration-200"
      >
        <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform duration-200" />
        <span className="text-sm font-medium">Back to Education Centre</span>
      </button>

      <div className="flex items-center gap-4 mb-8">
        <div className="p-4 bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl shadow-lg shadow-amber-500/50">
          <Settings className="w-10 h-10 text-white" />
        </div>
        <div>
          <h1 className="text-4xl font-bold text-white">Historically Best-Performing Parameters</h1>
          <p className="text-slate-400 mt-2 text-lg">
            Understanding how we evaluate and optimize indicator settings
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
          All parameter optimization and evaluation methods are based strictly on historical price behavior.
          These methodologies help interpret past patterns but do not predict or guarantee future performance.
        </p>
      </div>
    </div>
  );
}
