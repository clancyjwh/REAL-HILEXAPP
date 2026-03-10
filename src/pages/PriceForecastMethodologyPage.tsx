import { ArrowLeft, TrendingUp, Target, BarChart3, AlertTriangle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function PriceForecastMethodologyPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen pb-12">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-6"
      >
        <ArrowLeft className="w-5 h-5" />
        <span>Back</span>
      </button>

      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-orange-500/10 rounded-lg">
            <TrendingUp className="w-6 h-6 text-orange-500" />
          </div>
          <div>
            <h1 className="text-4xl font-bold text-white">Price Forecasting</h1>
            <p className="text-slate-400">Estimate short-term price direction using historical price patterns</p>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        <div className="bg-slate-900 border border-slate-700 rounded-xl p-8">
          <h2 className="text-2xl font-bold text-white mb-4">Price Forecasting</h2>
          <div className="text-slate-300 space-y-4">
            <p>
              This tool focuses on short-term price direction over the next 10 days. It looks at how an asset (like BTC/USD, ETH/USD, or a stock) has moved over the last 10 days, then searches history for times when the market behaved in a similar way.
            </p>
            <p>
              For each similar stretch in the past, it checks what happened over the next 10 days and uses those outcomes to estimate:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>How often price went up vs down</li>
              <li>The typical size of the move</li>
              <li>The worst-case and best-case scenarios seen in similar conditions</li>
            </ul>
            <p>
              All of this is condensed into a directional score from -10 to +10, where negative values lean toward "down," positive values lean toward "up," and values near zero reflect a mixed or uncertain outlook.
            </p>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-700 rounded-xl p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-blue-500/10 rounded-lg">
              <BarChart3 className="w-6 h-6 text-blue-500" />
            </div>
            <h2 className="text-2xl font-bold text-white">How It Works</h2>
          </div>
          <div className="space-y-6">
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center font-bold">
                1
              </div>
              <div className="text-slate-300">
                The system takes the last 10 days of price action for the asset and converts it into a pattern (for example, day-to-day percentage changes rather than raw prices).
              </div>
            </div>
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center font-bold">
                2
              </div>
              <div className="text-slate-300">
                It scans the asset's historical data and finds past 10-day stretches where the pattern of moves looks similar to what is happening now.
              </div>
            </div>
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center font-bold">
                3
              </div>
              <div className="text-slate-300">
                For each similar stretch in the past, it looks at the next 10 days after that point and records what happened: whether price ended higher or lower and by how much.
              </div>
            </div>
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center font-bold">
                4
              </div>
              <div className="text-slate-300">
                It aggregates those outcomes into a set of statistics, such as the probability of price rising or falling, the average 10-day return, and the worst and best 10% of outcomes seen in those historical matches.
              </div>
            </div>
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center font-bold">
                5
              </div>
              <div className="text-slate-300">
                Those statistics are then summarized into a single score from -10 to +10, along with a yes/no directional lean (UP / DOWN / MIXED), a model 10-day price estimate, and a short explanation of the reasoning.
              </div>
            </div>
          </div>
          <div className="mt-6 p-4 bg-slate-800 border border-slate-700 rounded-lg">
            <p className="text-slate-300 text-sm">
              The entire process is based on historical price behavior only. It does not look at news, fundamentals, or order-book data directly; it focuses on "when price has looked like this before, what usually happened next?"
            </p>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-700 rounded-xl p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-green-500/10 rounded-lg">
              <Target className="w-6 h-6 text-green-500" />
            </div>
            <h2 className="text-2xl font-bold text-white">Why This Can Be Useful</h2>
          </div>
          <div className="text-slate-300 space-y-4">
            <p>Price forecasts can help you:</p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>See whether similar past conditions tended to lead to up moves, down moves, or mixed outcomes</li>
              <li>Understand the balance of risk and reward over the next 10 days (typical move vs. extremes)</li>
              <li>Compare different assets by their short-term directional bias and expected move</li>
              <li>Add structure to your short-term view instead of relying on a single chart pattern or gut feeling</li>
              <li>Track how the 10-day outlook changes as new price data comes in each day</li>
            </ul>
            <div className="mt-6 p-4 bg-amber-500/10 border border-amber-500/30 rounded-lg flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
              <p className="text-slate-300 text-sm">
                This is a decision-support tool, not a trading signal or investment recommendation.
              </p>
            </div>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-700 rounded-xl p-8">
          <h2 className="text-2xl font-bold text-white mb-6">Definitions</h2>
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-white mb-2">Price Forecast (10-Day)</h3>
              <p className="text-slate-300">
                An estimate of where price is likely to move over the next 10 days, based on how similar price patterns resolved in the past.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-white mb-2">Price Score (-10 to +10)</h3>
              <p className="text-slate-300">
                A single number summarizing the short-term directional bias. Higher positive values indicate stronger historical support for upward moves, more negative values indicate stronger support for downward moves, and values near zero indicate mixed or weak signals.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-white mb-2">Direction (UP / DOWN / MIXED)</h3>
              <p className="text-slate-300 mb-2">A simplified interpretation of the score.</p>
              <ul className="list-disc list-inside space-y-1 ml-4 text-slate-300">
                <li><span className="font-semibold text-green-400">UP:</span> Historical matches more often led to gains.</li>
                <li><span className="font-semibold text-red-400">DOWN:</span> Historical matches more often led to losses.</li>
                <li><span className="font-semibold text-slate-400">MIXED:</span> Past outcomes were roughly balanced, or the signal is weak.</li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-white mb-2">Probability Up / Probability Down</h3>
              <p className="text-slate-300">
                The share of similar past 10-day patterns where the next 10 days ended higher (up) versus lower (down). For example, "54% up / 46% down" means that out of the most similar historical cases, 54% finished higher over the following 10 days.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-white mb-2">Model Price Estimate (10 Days)</h3>
              <p className="text-slate-300">
                An estimated price in 10 days created by applying the average 10-day return from similar historical cases to the current price.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-white mb-2">Similar Scenarios / Pattern Match</h3>
              <p className="text-slate-300">
                Historical 10-day stretches where the shape and behavior of price (for example, sequence of up/down days and size of moves) closely resembles the last 10 days.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-white mb-2">Tail Outcomes (Worst / Best 10%)</h3>
              <p className="text-slate-300">
                The most negative and most positive 10-day returns seen among the similar scenarios. These give a rough sense of downside and upside extremes that have occurred under comparable conditions.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
