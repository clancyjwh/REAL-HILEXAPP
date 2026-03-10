import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, LineChart, TrendingUp, TrendingDown, Target, Database, Activity, X } from 'lucide-react';

interface ScenarioData {
  start_time: string;
  end_time: string;
  future_end_time: string;
  future_return_pct: number;
  distance: number;
}

interface LocationState {
  ticker: string;
  assetClass: string;
  symbol: string;
  cumulativeScore: number;
  scenariosCompared: ScenarioData[];
  expectedReturnPercentage: string;
  currentPrice: string;
  tenDayPriceForecast: string;
  upwardMovementProbability: string;
  downwardMovementProbability: string;
}

interface MetricDefinition {
  title: string;
  definition: string;
}

const metricDefinitions: Record<string, MetricDefinition> = {
  'Scenarios Compared': {
    title: 'Scenarios Compared',
    definition: 'A list of specific past periods where the last 10 days of price action closely matched the current pattern. Each entry shows when that pattern occurred, what the 10-day return was afterward, and how close the match was.',
  },
  'Expected Return': {
    title: 'Expected Return',
    definition: 'The predicted 10-day return based on the analysis of all similar historical scenarios. This represents the most likely outcome given the current price pattern and market conditions.',
  },
  'Current Price': {
    title: 'Current Price',
    definition: 'The most recent trading price of the asset at the time of analysis. This is the baseline used to calculate the 10-day price forecast.',
  },
  '10-Day Price Forecast': {
    title: '10-Day Price Forecast',
    definition: 'The estimated price 10 days from now, calculated by applying the predicted 10-day return to the current price. This reflects where the asset is likely to trade based on similar historical patterns, not a guaranteed target.',
  },
  'Upward Movement Probability': {
    title: 'Upward Movement Probability',
    definition: 'The proportion of similar past scenarios where price was higher after the 10-day horizon. It represents the historical probability of an upward move following a pattern like the current one.',
  },
  'Downward Movement Probability': {
    title: 'Downward Movement Probability',
    definition: 'The proportion of similar past scenarios where price was lower after the 10-day horizon. It represents the historical probability of a downward move following a pattern like the current one.',
  },
  'Historical Pattern Matches': {
    title: 'Historical Pattern Matches',
    definition: 'These rows show past 10-day periods where the price moved similarly to the last 10 days, and what happened in the following 10 days after each of those periods.\n\nHilex scans the full price history for this asset and identifies the 10-day period that most closely resembles the most recent 10 days on the chart. For each close match, we then show: when that pattern occurred, what the next 10 days did afterwards, and how similar the pattern was to today.',
  },
  'Start Date': {
    title: 'Start Date',
    definition: 'The first day of the 10-day historical pattern that looks similar to the last 10 days.\n\nExample: 2022-02-17 means the pattern runs from Feb 17, 2022 through the End Date below.',
  },
  'End Date': {
    title: 'End Date',
    definition: 'The last day of that 10-day historical pattern (the day the "look-alike" period ends and the forecast window begins).\n\nExample: 2022-03-03 means the similar pattern covers Feb 17–Mar 3, 2022.',
  },
  'Future End': {
    title: 'Future End',
    definition: 'The end of the 10-day window after the pattern finishes — this is the date where we measure the outcome.\n\nExample: If End Date is 2022-03-03 and Future End is 2022-03-17, we\'re looking at the price move from Mar 3 to Mar 17, 2022.\n\nNote: "10 days" here means 10 trading sessions, not calendar days. This means the dates can span more than 10 calendar days, because weekends and holidays are skipped.',
  },
  'Return': {
    title: 'Return',
    definition: 'The percentage price change over the 10 days after the pattern ended, from End Date → Future End.\n\n• Positive = the asset went up\n• Negative = the asset went down\n\nExample: +30.10% means the price was about 30% higher 10 days after that similar pattern. -12.90% means it was about 13% lower 10 days later.',
  },
  'Similarity': {
    title: 'Similarity',
    definition: 'How closely this historical 10-day pattern matches the most recent 10 days in shape.\n\nLower numbers = more similar (closer pattern match).\n\nExample: 7.64% is a very close match to the current pattern, while 11.68% is still similar but not as close.',
  },
  'What This Means': {
    title: 'What This Means',
    definition: 'These examples show "what happened next" after past periods that most closely resembled the current price action, giving context for the Expected Return and direction forecast.\n\nNote: these are the 5 most similar scenarios out of the 50 that were tested.',
  },
};

export default function PriceForecastingResultPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as LocationState;
  const [selectedMetric, setSelectedMetric] = useState<MetricDefinition | null>(null);

  console.log('RESULTS PAGE RECEIVED STATE:', state);

  if (!state) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="text-slate-400 text-xl mb-4">No forecast data available</div>
          <button
            onClick={() => navigate('/tools/price-forecasting')}
            className="px-6 py-3 bg-orange-600 hover:bg-orange-500 text-white rounded-lg transition-colors"
          >
            New Forecast
          </button>
        </div>
      </div>
    );
  }

  const upwardProb = parseFloat(state.upwardMovementProbability);
  const downwardProb = parseFloat(state.downwardMovementProbability);
  const expectedReturn = parseFloat(state.expectedReturnPercentage);

  const getReturnColor = (value: number) => {
    if (value > 0) return 'text-emerald-400';
    if (value < 0) return 'text-red-400';
    return 'text-slate-400';
  };

  const getProbabilityColor = (value: number) => {
    if (value >= 60) return 'text-emerald-400';
    if (value >= 50) return 'text-cyan-400';
    if (value >= 40) return 'text-slate-400';
    return 'text-orange-400';
  };

  const getSignalColor = (signal: number) => {
    if (signal >= 7) return 'text-emerald-400';
    if (signal >= 4) return 'text-emerald-300';
    if (signal >= 1) return 'text-green-300';
    if (signal > -1) return 'text-slate-300';
    if (signal >= -4) return 'text-orange-400';
    if (signal >= -7) return 'text-red-400';
    return 'text-red-500';
  };

  const getHeatmapPosition = (value: number) => {
    return ((value + 10) / 20) * 100;
  };

  const formatPriceWithCommas = (value: string | number) => {
    const num = typeof value === 'string' ? parseFloat(value) : value;
    return num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  return (
    <>
      {selectedMetric && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 max-w-2xl w-full relative">
            <button
              onClick={() => setSelectedMetric(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
            <h3 className="text-2xl font-bold text-white mb-4">{selectedMetric.title}</h3>
            <p className="text-slate-300 leading-relaxed whitespace-pre-line">{selectedMetric.definition}</p>
          </div>
        </div>
      )}

      <div className="mb-8">
        <button
          onClick={() => navigate('/tools/price-forecasting')}
          className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-6"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>New Forecast</span>
        </button>

        <div className="flex items-center gap-3">
          <div className="p-2 bg-orange-500/10 rounded-lg">
            <LineChart className="w-6 h-6 text-orange-500" />
          </div>
          <div>
            <h1 className="text-4xl font-bold text-white">{state.symbol}</h1>
            <p className="text-slate-400">10-Day Price Forecast</p>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto space-y-8">
        <div className="bg-gradient-to-br from-slate-800/80 to-slate-900/60 border-2 border-slate-700 rounded-2xl p-8 shadow-xl">
          <div className="flex items-center gap-4 mb-6">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-xl bg-gradient-to-br from-orange-500 to-amber-500 shadow-lg shadow-orange-500/50">
              <Activity className="w-8 h-8 text-white" />
            </div>
            <div>
              <h2 className="text-3xl font-bold text-white">Cumulative Score</h2>
              <p className="text-slate-400 text-sm mt-1">Overall forecast strength from -10 to +10</p>
            </div>
          </div>
          <div className="text-center">
            <div className={`text-7xl font-bold ${getSignalColor(state.cumulativeScore)} mb-8`}>
              {state.cumulativeScore > 0 ? '+' : ''}{state.cumulativeScore.toFixed(2)}
            </div>
            <div className="relative h-6 rounded-lg overflow-visible mt-6">
              <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-red-500 via-orange-500 via-slate-500 via-cyan-500 to-emerald-500"></div>
              <div
                className="absolute top-1/2 h-10 w-10 bg-white rounded-full shadow-xl border-4 border-slate-800"
                style={{
                  left: `${getHeatmapPosition(state.cumulativeScore)}%`,
                  transform: 'translate(-50%, -50%)',
                }}
              />
            </div>
            <div className="flex justify-between text-slate-400 text-sm mt-3">
              <span>-10</span>
              <span>0</span>
              <span>+10</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <button
            onClick={() => setSelectedMetric(metricDefinitions['Current Price'])}
            className="bg-slate-800 border border-slate-700 rounded-xl p-6 text-left hover:border-orange-500 transition-all group"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-blue-500/10 rounded-lg group-hover:bg-blue-500/20 transition-colors">
                <Database className="w-6 h-6 text-blue-500" />
              </div>
              <h3 className="text-lg font-bold text-white">Current Price</h3>
            </div>
            <div className="text-3xl font-bold text-white mb-2">
              ${formatPriceWithCommas(state.currentPrice)}
            </div>
            <p className="text-sm text-slate-400">Latest trading price</p>
          </button>

          <button
            onClick={() => setSelectedMetric(metricDefinitions['10-Day Price Forecast'])}
            className="bg-slate-800 border border-slate-700 rounded-xl p-6 text-left hover:border-orange-500 transition-all group"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-cyan-500/10 rounded-lg group-hover:bg-cyan-500/20 transition-colors">
                <Target className="w-6 h-6 text-cyan-500" />
              </div>
              <h3 className="text-lg font-bold text-white">10-Day Price Forecast</h3>
            </div>
            <div className="text-3xl font-bold text-cyan-400 mb-2">
              ${formatPriceWithCommas(state.tenDayPriceForecast)}
            </div>
            <p className="text-sm text-slate-400">Model Price Estimate (10 Days)</p>
          </button>

          <button
            onClick={() => setSelectedMetric(metricDefinitions['Expected Return'])}
            className="bg-slate-800 border border-slate-700 rounded-xl p-6 text-left hover:border-orange-500 transition-all group"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-orange-500/10 rounded-lg group-hover:bg-orange-500/20 transition-colors">
                <Target className="w-6 h-6 text-orange-500" />
              </div>
              <h3 className="text-lg font-bold text-white">Expected Return</h3>
            </div>
            <div className={`text-3xl font-bold mb-2 ${getReturnColor(expectedReturn)}`}>
              {expectedReturn > 0 ? '+' : ''}{expectedReturn}%
            </div>
            <p className="text-sm text-slate-400">Predicted 10-day return</p>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <button
            onClick={() => setSelectedMetric(metricDefinitions['Upward Movement Probability'])}
            className="bg-slate-800 border border-slate-700 rounded-xl p-6 text-left hover:border-orange-500 transition-all group"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-emerald-500/10 rounded-lg group-hover:bg-emerald-500/20 transition-colors">
                <TrendingUp className="w-6 h-6 text-emerald-500" />
              </div>
              <h3 className="text-lg font-bold text-white">Upward Probability</h3>
            </div>
            <div className={`text-3xl font-bold mb-2 ${getProbabilityColor(upwardProb)}`}>
              {upwardProb.toFixed(0)}%
            </div>
            <p className="text-sm text-slate-400">Chance of price increase</p>
          </button>

          <button
            onClick={() => setSelectedMetric(metricDefinitions['Downward Movement Probability'])}
            className="bg-slate-800 border border-slate-700 rounded-xl p-6 text-left hover:border-orange-500 transition-all group"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-red-500/10 rounded-lg group-hover:bg-red-500/20 transition-colors">
                <TrendingDown className="w-6 h-6 text-red-500" />
              </div>
              <h3 className="text-lg font-bold text-white">Downward Probability</h3>
            </div>
            <div className={`text-3xl font-bold mb-2 ${getProbabilityColor(downwardProb)}`}>
              {downwardProb.toFixed(0)}%
            </div>
            <p className="text-sm text-slate-400">Chance of price decrease</p>
          </button>
        </div>

        {state.scenariosCompared && state.scenariosCompared.length > 0 && (
          <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
            <div className="flex items-start justify-between mb-4">
              <button
                onClick={() => setSelectedMetric(metricDefinitions['Historical Pattern Matches'])}
                className="text-xl font-bold text-white hover:text-orange-400 transition-colors text-left"
              >
                Historical Pattern Matches
              </button>
              <button
                onClick={() => setSelectedMetric(metricDefinitions['What This Means'])}
                className="px-4 py-2 bg-orange-500/10 hover:bg-orange-500/20 border border-orange-500/30 rounded-lg text-orange-400 text-sm font-medium transition-colors"
              >
                What this means
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-700">
                    <th className="text-left py-3 px-4">
                      <button
                        onClick={() => setSelectedMetric(metricDefinitions['Start Date'])}
                        className="text-slate-400 hover:text-orange-400 font-medium transition-colors"
                      >
                        Start Date
                      </button>
                    </th>
                    <th className="text-left py-3 px-4">
                      <button
                        onClick={() => setSelectedMetric(metricDefinitions['End Date'])}
                        className="text-slate-400 hover:text-orange-400 font-medium transition-colors"
                      >
                        End Date
                      </button>
                    </th>
                    <th className="text-left py-3 px-4">
                      <button
                        onClick={() => setSelectedMetric(metricDefinitions['Future End'])}
                        className="text-slate-400 hover:text-orange-400 font-medium transition-colors"
                      >
                        Future End
                      </button>
                    </th>
                    <th className="text-right py-3 px-4">
                      <button
                        onClick={() => setSelectedMetric(metricDefinitions['Return'])}
                        className="text-slate-400 hover:text-orange-400 font-medium transition-colors w-full text-right"
                      >
                        Return
                      </button>
                    </th>
                    <th className="text-right py-3 px-4">
                      <button
                        onClick={() => setSelectedMetric(metricDefinitions['Similarity'])}
                        className="text-slate-400 hover:text-orange-400 font-medium transition-colors w-full text-right"
                      >
                        Similarity
                      </button>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {state.scenariosCompared.map((scenario, index) => (
                    <tr key={index} className="border-b border-slate-800 last:border-b-0 hover:bg-slate-700/50">
                      <td className="py-3 px-4 text-slate-300">{scenario.start_time}</td>
                      <td className="py-3 px-4 text-slate-300">{scenario.end_time}</td>
                      <td className="py-3 px-4 text-slate-300">{scenario.future_end_time}</td>
                      <td className={`py-3 px-4 text-right font-medium ${getReturnColor(scenario.future_return_pct)}`}>
                        {scenario.future_return_pct > 0 ? '+' : ''}{scenario.future_return_pct.toFixed(2)}%
                      </td>
                      <td className="py-3 px-4 text-right text-slate-300">
                        {(scenario.distance * 100).toFixed(2)}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4">
          <p className="text-slate-400 text-sm text-center">
            Because this tool uses pattern-matching on 10-day forward returns, its outlook may differ from other Hilex analyses that rely on indicators, different horizons, or combined signals.
          </p>
        </div>
      </div>
    </>
  );
}
