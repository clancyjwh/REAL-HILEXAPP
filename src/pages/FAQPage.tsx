import { ArrowLeft, HelpCircle, Brain, Star } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface FAQ {
  question: string;
  answer: string;
}

const faqs: FAQ[] = [
  {
    question: 'What does this platform actually do?',
    answer: 'It analyzes historical price data for various assets and shows what patterns appeared in the past. Each indicator is examined across previous market conditions using structured 10-day historical windows.',
  },
  {
    question: 'Does this provide financial advice?',
    answer: 'No. All information reflects past price behaviour only. It is strictly educational and informational. Nothing on the platform is a recommendation or a signal to trade.',
  },
  {
    question: 'How are indicators evaluated?',
    answer: 'Each indicator is tested across many historically used parameter settings. The system rewinds the chart to multiple points within the last 12–15 months, records the indicator\'s reading at that time, and then examines how prices moved over the following 10 days.',
  },
  {
    question: 'Why do some indicators show more "tests" than others?',
    answer: 'Different indicators have different numbers of commonly used parameter combinations. Indicators with a small set of settings produce fewer historical evaluations, while indicators like MACD (which have many standard combinations) generate a higher test count.',
  },
  {
    question: 'What is a "10-day outcome window"?',
    answer: 'When the platform rewinds to a past date, it reviews the average price over the next 10 days. This provides a consistent way to compare how historical market movement followed each indicator reading.',
  },
  {
    question: 'Why do some assets show higher historical accuracy than others?',
    answer: 'Some assets form clearer, more persistent trends within a 12-month window, which naturally aligns more often with indicators like SMA and RSI. Other assets—especially those with rapidly shifting sentiment or highly unpredictable news cycles—show more variable behaviour, which results in lower historical accuracy scores. The platform simply reports how well each indicator setting lined up with past movements for that specific asset; the underlying behaviour of the asset itself drives the difference.',
  },
  {
    question: 'Does the AI learn from itself?',
    answer: 'Yes, but only through historical pattern weighting, not prediction. Before generating a score for an asset, the system checks which indicator tended to track that asset\'s past movements the most consistently. If one indicator historically aligned more often (for example, SMA matching past movement in 11 of the last 12 months), its contribution may be weighted slightly higher for that specific asset. This adjustment happens each time a new score is generated.',
  },
];

export default function FAQPage() {
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
        <div className="p-4 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl shadow-lg shadow-emerald-500/50">
          <HelpCircle className="w-10 h-10 text-white" />
        </div>
        <div>
          <h1 className="text-4xl font-bold text-white">Frequently Asked Questions</h1>
          <p className="text-slate-400 mt-2 text-lg">
            Common questions about the platform and how it works
          </p>
        </div>
      </div>

      <div className="space-y-6">
        {faqs.map((faq, index) => (
          <div
            key={index}
            className="group relative bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-xl rounded-2xl p-6 border-2 border-emerald-400/60 shadow-xl shadow-emerald-500/50 hover:shadow-2xl transition-all duration-300 hover:scale-[1.01]"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500 to-teal-600 opacity-0 group-hover:opacity-5 rounded-2xl transition-opacity duration-300"></div>

            <div className="relative">
              <div className="flex items-start gap-3 mb-4">
                <div className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 shadow-lg shadow-emerald-500/50 flex-shrink-0">
                  <span className="text-white font-bold text-lg">Q</span>
                </div>
                <h3 className="text-xl font-bold text-white pt-1">{faq.question}</h3>
              </div>

              <div className="ml-13 bg-slate-900/30 rounded-lg p-4 border-l-4 border-emerald-400">
                <p className="text-slate-300 text-base leading-relaxed">{faq.answer}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-16 mb-8">
        <div className="flex items-center gap-4 mb-6">
          <div className="p-3 bg-gradient-to-br from-violet-500 to-fuchsia-600 rounded-xl shadow-lg shadow-violet-500/50">
            <Brain className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-3xl font-bold text-white">AI Self Learning Feature</h2>
        </div>

        <div className="space-y-6">
          <div className="group relative bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-xl rounded-2xl p-6 border-2 border-violet-400/60 shadow-xl shadow-violet-500/50 hover:shadow-2xl transition-all duration-300 hover:scale-[1.01]">
            <div className="absolute inset-0 bg-gradient-to-br from-violet-500 to-fuchsia-600 opacity-0 group-hover:opacity-5 rounded-2xl transition-opacity duration-300"></div>

            <div className="relative">
              <div className="flex items-center gap-3 mb-4">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-600 shadow-lg shadow-violet-500/50">
                  <Star className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-white">Adaptive Weighting Overview</h3>
              </div>

              <div className="ml-15 space-y-4">
                <p className="text-slate-300 text-base leading-relaxed">
                  The platform reviews how each indicator aligned with historical movement for <span className="font-semibold text-violet-300">the selected asset</span> over roughly 12–15 months. If one indicator demonstrated steadier historical alignment across multiple months for <span className="font-semibold text-violet-300">that specific asset</span>, the system can give that indicator a slightly higher influence in the combined score.
                </p>
                <div className="bg-violet-900/20 rounded-lg p-4 border border-violet-400/40">
                  <p className="text-violet-200 text-sm font-medium mb-2">
                    Asset-Specific Weighting
                  </p>
                  <p className="text-slate-300 text-sm">
                    The AI uses stored asset information to review and adjust indicator weighting independently for each asset. What works best for one asset may differ from another, and the system adapts accordingly.
                  </p>
                </div>
                <div className="bg-slate-900/50 rounded-lg p-4 border-l-4 border-violet-400">
                  <p className="text-slate-300 text-sm italic">
                    This adjustment is based entirely on past data, and it does not predict future results.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="group relative bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-xl rounded-2xl p-6 border-2 border-fuchsia-400/60 shadow-xl shadow-fuchsia-500/50 hover:shadow-2xl transition-all duration-300 hover:scale-[1.01]">
            <div className="absolute inset-0 bg-gradient-to-br from-violet-500 to-fuchsia-600 opacity-0 group-hover:opacity-5 rounded-2xl transition-opacity duration-300"></div>

            <div className="relative">
              <div className="flex items-center gap-3 mb-4">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-fuchsia-500 to-violet-600 shadow-lg shadow-fuchsia-500/50">
                  <Star className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-white">How the System "Self-Learns" From History</h3>
              </div>

              <div className="ml-15 space-y-4">
                <p className="text-slate-300 text-base leading-relaxed">
                  Before generating the current score, the system checks each indicator's month-by-month historical alignment <span className="font-semibold text-fuchsia-300">for the specific asset being analyzed</span>. Indicators that matched past movement more often for that asset receive a small weight increase (for example, SMA shifting from 35% to 37%).
                </p>
                <p className="text-slate-300 text-base leading-relaxed">
                  This process runs fresh every time the score is calculated, ensuring the combined weighting reflects what historically lined up best for that specific asset.
                </p>
                <div className="bg-fuchsia-900/20 rounded-lg p-4 border border-fuchsia-400/40">
                  <p className="text-fuchsia-200 text-sm font-medium mb-2">
                    Unique to Each Asset
                  </p>
                  <p className="text-slate-300 text-sm">
                    The weighting adjustments vary from asset to asset. The AI analyzes stored historical data for each individual asset to determine which indicators have been most reliable for that particular market or security.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-12 bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 border border-slate-700/50">
        <p className="text-slate-300 text-sm leading-relaxed text-center">
          All information on this platform is strictly educational and reflects historical price behaviour only.
          Nothing presented here should be construed as financial advice or a recommendation to trade.
        </p>
      </div>
    </div>
  );
}
