import { TrendingUp, Info, Settings, BarChart3, AlertCircle, Target, ArrowLeft } from 'lucide-react';
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
    title: 'Event Forecasting',
    icon: TrendingUp,
    gradient: 'from-blue-500 to-cyan-600',
    borderColor: 'border-blue-400/60',
    shadowColor: 'shadow-blue-500/50',
    content: (
      <div className="space-y-4">
        <p className="text-slate-300 text-base leading-relaxed">
          This tool focuses on yes/no questions about real-world outcomes, such as "Will this party win the election?", "Will this team win tonight?", or "Will this ETF be approved by March?". It can be used across politics, sports, crypto and markets, weather events, tech and product launches, legal or regulatory decisions, and pop-culture or media events.
        </p>
        <p className="text-slate-300 text-base leading-relaxed">
          When you submit a question, the system builds a snapshot of the situation using recent information and historical context. It then turns that into a single score from -10 to +10, where negative scores lean toward "no," positive scores lean toward "yes," and values near zero indicate mixed or uncertain conditions.
        </p>
      </div>
    ),
  },
  {
    title: 'How It Works',
    icon: Settings,
    gradient: 'from-emerald-500 to-teal-600',
    borderColor: 'border-emerald-400/60',
    shadowColor: 'shadow-emerald-500/50',
    content: (
      <div className="space-y-4">
        <div className="space-y-3">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400 font-bold text-sm">
              1
            </div>
            <p className="text-slate-300 text-sm leading-relaxed">
              You ask a yes/no question about a specific event and timeframe (for example, "Will X team win tonight?" or "Will Y law pass this year?").
            </p>
          </div>
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400 font-bold text-sm">
              2
            </div>
            <p className="text-slate-300 text-sm leading-relaxed">
              The system gathers relevant, up-to-date information from trusted news, data, and analysis sources related to that event.
            </p>
          </div>
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400 font-bold text-sm">
              3
            </div>
            <p className="text-slate-300 text-sm leading-relaxed">
              It converts that information into a set of signals, such as recent momentum, expert and analyst views, news tone, historical parallels, structural advantages, and how timing or deadlines affect the outcome.
            </p>
          </div>
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400 font-bold text-sm">
              4
            </div>
            <p className="text-slate-300 text-sm leading-relaxed">
              Those signals are combined into a single event score from -10 to +10, along with an overall lean (YES / NO / UNCERTAIN).
            </p>
          </div>
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400 font-bold text-sm">
              5
            </div>
            <p className="text-slate-300 text-sm leading-relaxed">
              You see the final score, a short explanation of the reasoning, and a breakdown of which signals contributed most to the forecast.
            </p>
          </div>
        </div>
        <p className="text-slate-400 text-xs italic">
          All of this is based on publicly available information and historical patterns; the system does not place bets or guarantee outcomes.
        </p>
      </div>
    ),
  },
  {
    title: 'Why This Can Be Useful',
    icon: Info,
    gradient: 'from-pink-500 to-rose-600',
    borderColor: 'border-pink-400/60',
    shadowColor: 'shadow-pink-500/50',
    content: (
      <div className="space-y-4">
        <p className="text-slate-300 text-base leading-relaxed">
          Event forecasts can help you:
        </p>
        <ul className="text-slate-300 text-sm space-y-2">
          <li className="flex items-start gap-2">
            <span className="text-pink-400 mt-1">•</span>
            <span>Quickly understand how the balance of information leans on a given question (toward "yes," "no," or genuinely unclear)</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-pink-400 mt-1">•</span>
            <span>See how different factors (momentum, news, expert opinion, history, structure, timing) are pulling the outcome in different directions</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-pink-400 mt-1">•</span>
            <span>Track how a forecast changes over time as new information and headlines appear</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-pink-400 mt-1">•</span>
            <span>Bring structure and consistency to your own reasoning instead of relying only on scattered articles or gut feeling</span>
          </li>
        </ul>
        <p className="text-slate-300 text-base leading-relaxed">
          This is intended as a decision-support and research tool, not as a betting or investment recommendation.
        </p>
      </div>
    ),
  },
  {
    title: 'Definitions',
    icon: BarChart3,
    gradient: 'from-orange-500 to-red-600',
    borderColor: 'border-orange-400/60',
    shadowColor: 'shadow-orange-500/50',
    content: (
      <div className="space-y-4">
        <div className="bg-slate-900/50 rounded-lg p-4">
          <h4 className="text-white font-semibold mb-2 text-sm">Event Forecast</h4>
          <p className="text-slate-300 text-sm leading-relaxed">
            An estimate of how a specific yes/no question is likely to resolve, expressed as a score from -10 (strongly no) to +10 (strongly yes).
          </p>
        </div>
        <div className="bg-slate-900/50 rounded-lg p-4">
          <h4 className="text-white font-semibold mb-2 text-sm">Event Score (-10 to +10)</h4>
          <p className="text-slate-300 text-sm leading-relaxed">
            A single number summarizing how strongly the available signals lean toward "yes" or "no." Higher positive values indicate stronger support for "yes," more negative values indicate stronger support for "no," and values near zero indicate mixed or weak signals.
          </p>
        </div>
        <div className="bg-slate-900/50 rounded-lg p-4">
          <h4 className="text-white font-semibold mb-2 text-sm">Direction (YES / NO / UNCERTAIN)</h4>
          <p className="text-slate-300 text-sm leading-relaxed">
            The simplified interpretation of the score: YES for clearly positive scores, NO for clearly negative scores, and UNCERTAIN when the signals do not clearly favor either side.
          </p>
        </div>
        <div className="bg-slate-900/50 rounded-lg p-4">
          <h4 className="text-white font-semibold mb-2 text-sm">Signals</h4>
          <p className="text-slate-300 text-sm leading-relaxed">
            The underlying building blocks used to form the forecast, such as recent momentum, expert consensus, news and sentiment, historical pattern match, structural edge (for example, incumbency or home-field advantage), and time-pressure effects.
          </p>
        </div>
        <div className="bg-slate-900/50 rounded-lg p-4">
          <h4 className="text-white font-semibold mb-2 text-sm">Risk & Uncertainty</h4>
          <p className="text-slate-300 text-sm leading-relaxed">
            An assessment of how stable or fragile the forecast is, based on how many similar cases were found, how consistent the signals are, and how easily new information could change the picture.
          </p>
        </div>
      </div>
    ),
  },
  {
    title: 'Important Notes',
    icon: AlertCircle,
    gradient: 'from-amber-500 to-yellow-600',
    borderColor: 'border-amber-400/60',
    shadowColor: 'shadow-amber-500/50',
    content: (
      <div className="space-y-3">
        <p className="text-slate-300 text-base leading-relaxed">
          The Event Forecasting tool summarizes how current information, expert views, and historical patterns line up on a given yes/no question, so you can see the overall lean, the strength of the signal, and the key factors driving it.
        </p>
        <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-4">
          <p className="text-slate-200 text-sm leading-relaxed">
            It is based on publicly available information and is provided for informational and educational use only.
          </p>
        </div>
        <ul className="text-slate-300 text-sm space-y-2">
          <li className="flex items-start gap-2">
            <span className="text-amber-400 mt-1">•</span>
            <span>This analysis reviews current information and historical patterns only</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-amber-400 mt-1">•</span>
            <span>It does not predict or guarantee outcomes</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-amber-400 mt-1">•</span>
            <span>Forecasts can change as new information becomes available</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-amber-400 mt-1">•</span>
            <span>Results should be used for research and educational purposes only</span>
          </li>
        </ul>
      </div>
    ),
  },
];

export default function EventForecastingDefinitionPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen pb-12">
      <button
        onClick={() => navigate('/documentation/analysis-tools')}
        className="group flex items-center gap-2 text-blue-400 hover:text-blue-300 transition-colors mb-8"
      >
        <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
        <span className="text-sm font-medium">Back to Analysis Tools</span>
      </button>

      <div className="flex items-center gap-4 mb-8">
        <div className="p-4 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-2xl shadow-lg shadow-blue-500/50">
          <TrendingUp className="w-10 h-10 text-white" />
        </div>
        <div>
          <h1 className="text-4xl font-bold text-white">Event Forecasting</h1>
          <p className="text-slate-400 mt-2 text-lg">
            Predict real-world outcomes with data-driven yes/no analysis
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
          Event Forecasting analyzes yes/no questions about real-world outcomes using current information, expert views, and historical patterns.
          All forecasts are provided for informational and educational use only and do not predict or guarantee outcomes.
        </p>
      </div>
    </div>
  );
}
