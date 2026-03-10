import { useParams, useNavigate } from 'react-router-dom';
import { Activity, Settings, TrendingUp, BarChart3, Database, Play, ArrowLeft, Zap, BookOpen, Maximize2, GitMerge, AlertCircle, Gauge, TrendingDown } from 'lucide-react';

const analysisNames: Record<string, string> = {
  rsi: 'Relative Strength Index',
  sma: 'Simple Moving Average',
  macd: 'Moving Average Convergence Divergence',
  boll: 'Bollinger Bands',
  cci: 'Commodity Channel Index',
  roc: 'Rate of Change',
};

interface InfoCard {
  title: string;
  icon: React.ElementType;
  gradient: string;
  borderColor: string;
  shadowColor: string;
  content: React.ReactNode;
}

const smaCards: InfoCard[] = [
  {
    title: 'Overview',
    icon: Activity,
    gradient: 'from-cyan-500 to-blue-600',
    borderColor: 'border-cyan-400/60',
    shadowColor: 'shadow-cyan-500/50',
    content: (
      <div className="space-y-3">
        <p className="text-slate-300 text-base leading-relaxed">
          This tool compares short-term and long-term Simple Moving Averages to reveal how an asset's recent price behavior aligns with its longer-term trend.
        </p>
        <p className="text-slate-300 text-base leading-relaxed">
          SMAs help identify trend direction and momentum based on historical price data.
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
        <div>
          <h4 className="text-white font-semibold mb-2">What is an SMA?</h4>
          <p className="text-slate-300 text-sm leading-relaxed">
            An SMA is the average closing price over a chosen number of periods. For example, a 10-period SMA averages the last 10 closing prices.
          </p>
        </div>
        <div>
          <h4 className="text-white font-semibold mb-2">Divergence Detection</h4>
          <ul className="text-slate-300 text-sm space-y-2">
            <li className="flex items-start gap-2">
              <span className="text-emerald-400 mt-1">•</span>
              <span>Fast SMA more than 2.0% above slow SMA → positive divergence</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-emerald-400 mt-1">•</span>
              <span>Fast SMA more than 2.0% below slow SMA → negative divergence</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-emerald-400 mt-1">•</span>
              <span>5-bar spacing rule prevents repeated events</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-emerald-400 mt-1">•</span>
              <span>All calculations use the last 500 days of price data</span>
            </li>
          </ul>
        </div>
      </div>
    ),
  },
  {
    title: 'Parameter Settings',
    icon: Settings,
    gradient: 'from-purple-500 to-pink-600',
    borderColor: 'border-purple-400/60',
    shadowColor: 'shadow-purple-500/50',
    content: (
      <div className="space-y-4">
        <p className="text-slate-300 text-sm leading-relaxed">
          These SMA periods are widely used in market analysis.
        </p>
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-slate-900/50 rounded-lg p-4">
            <h4 className="text-white font-semibold mb-3 text-sm">Fast SMA Periods</h4>
            <div className="flex flex-wrap gap-2">
              {[5, 8, 10, 12, 15, 20, 25, 30].map(period => (
                <span key={period} className="px-2 py-1 bg-purple-500/20 text-purple-300 rounded text-xs font-medium">
                  {period}
                </span>
              ))}
            </div>
          </div>
          <div className="bg-slate-900/50 rounded-lg p-4">
            <h4 className="text-white font-semibold mb-3 text-sm">Slow SMA Periods</h4>
            <div className="flex flex-wrap gap-2">
              {[40, 50, 75, 100, 150, 200, 250].map(period => (
                <span key={period} className="px-2 py-1 bg-pink-500/20 text-pink-300 rounded text-xs font-medium">
                  {period}
                </span>
              ))}
            </div>
          </div>
        </div>
        <div className="bg-slate-900/50 rounded-lg p-3">
          <p className="text-slate-300 text-sm">
            <span className="text-white font-semibold">56 total combinations</span> tested, all within the 1.2×–12× ratio commonly used for trend comparison.
          </p>
        </div>
      </div>
    ),
  },
  {
    title: 'Calculation Scale',
    icon: Database,
    gradient: 'from-orange-500 to-red-600',
    borderColor: 'border-orange-400/60',
    shadowColor: 'shadow-orange-500/50',
    content: (
      <div className="space-y-4">
        <p className="text-slate-300 text-sm leading-relaxed">
          Each fast/slow pair is checked across all usable bars in the 500-day window. After accounting for SMA lookback and the 10-bar evaluation window, each pair has roughly 240 bars available for testing.
        </p>
        <div className="bg-slate-900/50 rounded-lg p-4 border-l-4 border-orange-500">
          <div className="text-center">
            <div className="text-4xl font-bold text-white mb-2">~13,000</div>
            <div className="text-slate-400 text-sm">Individual SMA calculations per asset</div>
            <div className="text-xs text-slate-500 mt-2">56 combinations × ~240 bars</div>
          </div>
        </div>
      </div>
    ),
  },
  {
    title: 'Signal Strength',
    icon: TrendingUp,
    gradient: 'from-blue-500 to-indigo-600',
    borderColor: 'border-blue-400/60',
    shadowColor: 'shadow-blue-500/50',
    content: (
      <div className="space-y-4">
        <p className="text-slate-300 text-sm leading-relaxed">
          We convert the gap between fast and slow SMAs into a simple score from –10 to +10:
        </p>
        <div className="space-y-2">
          <div className="flex items-center justify-between bg-emerald-500/10 rounded-lg p-3 border border-emerald-500/30">
            <span className="text-emerald-300 font-semibold text-sm">+8 to +10</span>
            <span className="text-slate-300 text-sm">Large positive gap</span>
          </div>
          <div className="flex items-center justify-between bg-teal-500/10 rounded-lg p-3 border border-teal-500/30">
            <span className="text-teal-300 font-semibold text-sm">+3 to +7</span>
            <span className="text-slate-300 text-sm">Moderate positive gap</span>
          </div>
          <div className="flex items-center justify-between bg-cyan-500/10 rounded-lg p-3 border border-cyan-500/30">
            <span className="text-cyan-300 font-semibold text-sm">+0.1 to +2.9</span>
            <span className="text-slate-300 text-sm">Small positive gap</span>
          </div>
          <div className="flex items-center justify-between bg-slate-500/10 rounded-lg p-3 border border-slate-500/30">
            <span className="text-slate-300 font-semibold text-sm">0</span>
            <span className="text-slate-300 text-sm">No gap</span>
          </div>
          <div className="flex items-center justify-between bg-amber-500/10 rounded-lg p-3 border border-amber-500/30">
            <span className="text-amber-300 font-semibold text-sm">–0.1 to –2.9</span>
            <span className="text-slate-300 text-sm">Small negative gap</span>
          </div>
          <div className="flex items-center justify-between bg-orange-500/10 rounded-lg p-3 border border-orange-500/30">
            <span className="text-orange-300 font-semibold text-sm">–3 to –7</span>
            <span className="text-slate-300 text-sm">Moderate negative gap</span>
          </div>
          <div className="flex items-center justify-between bg-red-500/10 rounded-lg p-3 border border-red-500/30">
            <span className="text-red-300 font-semibold text-sm">–8 to –10</span>
            <span className="text-slate-300 text-sm">Large negative gap</span>
          </div>
        </div>
      </div>
    ),
  },
  {
    title: 'Historical Performance',
    icon: BarChart3,
    gradient: 'from-fuchsia-500 to-violet-600',
    borderColor: 'border-fuchsia-400/60',
    shadowColor: 'shadow-fuchsia-500/50',
    content: (
      <div className="space-y-4">
        <p className="text-slate-300 text-sm leading-relaxed">
          For each fast/slow pair, the system checks how price moved over the next 10 periods historically after a divergence event.
        </p>
        <div className="space-y-3">
          <div className="bg-slate-900/50 rounded-lg p-3">
            <h4 className="text-white font-semibold mb-1 text-sm">Historical Accuracy</h4>
            <p className="text-slate-400 text-xs">How often price moved in the same direction after divergences</p>
          </div>
          <div className="bg-slate-900/50 rounded-lg p-3">
            <h4 className="text-white font-semibold mb-1 text-sm">Event Count</h4>
            <p className="text-slate-400 text-xs">How many divergence events occurred</p>
          </div>
          <div className="bg-slate-900/50 rounded-lg p-3">
            <h4 className="text-white font-semibold mb-1 text-sm">Average Movement</h4>
            <p className="text-slate-400 text-xs">Average price change during the 10-period window</p>
          </div>
        </div>
        <p className="text-slate-400 text-xs italic">
          These metrics describe past movement only.
        </p>
      </div>
    ),
  },
  {
    title: 'Model Weight',
    icon: TrendingUp,
    gradient: 'from-yellow-500 to-amber-600',
    borderColor: 'border-yellow-400/60',
    shadowColor: 'shadow-yellow-500/50',
    content: (
      <div className="space-y-3">
        <div className="text-center bg-slate-900/50 rounded-lg p-6 border-l-4 border-yellow-500">
          <div className="text-5xl font-bold text-white mb-2">~35%</div>
          <div className="text-slate-300 text-sm">Base contribution to overall score</div>
          <div className="text-slate-500 text-xs mt-2">Weight varies by asset</div>
        </div>
        <p className="text-slate-300 text-sm leading-relaxed">
          The weight adjusts based on historical backtesting results for each asset. When SMA signals have shown stronger historical alignment with subsequent price movements, the weight increases. When historical alignment is weaker, the weight decreases accordingly.
        </p>
        <p className="text-slate-400 text-xs italic">
          All weights are based on past performance patterns and do not guarantee future results.
        </p>
      </div>
    ),
  },
];

const rsiCards: InfoCard[] = [
  {
    title: 'Overview',
    icon: Zap,
    gradient: 'from-cyan-500 to-blue-600',
    borderColor: 'border-cyan-400/60',
    shadowColor: 'shadow-cyan-500/50',
    content: (
      <div className="space-y-3">
        <p className="text-slate-300 text-base leading-relaxed">
          This tool uses Wilder's Relative Strength Index (RSI) to show how strongly price has moved up or down in the recent past.
        </p>
        <p className="text-slate-300 text-base leading-relaxed">
          RSI helps describe short-term momentum using historical data only.
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
      <div className="space-y-3">
        <p className="text-slate-300 text-sm leading-relaxed">
          RSI measures the balance of recent gains versus recent losses.
        </p>
        <ul className="text-slate-300 text-sm space-y-2">
          <li className="flex items-start gap-2">
            <span className="text-emerald-400 mt-1">•</span>
            <span>Low RSI values indicate historically weak recent momentum</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-emerald-400 mt-1">•</span>
            <span>High RSI values indicate historically strong recent momentum</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-emerald-400 mt-1">•</span>
            <span>±5 point tolerance band softens the edges of oversold/overbought levels</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-emerald-400 mt-1">•</span>
            <span>10-period historical window checks how price behaved afterward</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-emerald-400 mt-1">•</span>
            <span>All analysis uses the last 500 days of price data</span>
          </li>
        </ul>
      </div>
    ),
  },
  {
    title: 'Parameters Tested',
    icon: Settings,
    gradient: 'from-purple-500 to-pink-600',
    borderColor: 'border-purple-400/60',
    shadowColor: 'shadow-purple-500/50',
    content: (
      <div className="space-y-4">
        <p className="text-slate-300 text-sm leading-relaxed">
          These RSI settings are commonly referenced in market analysis.
        </p>
        <div className="grid grid-cols-1 gap-4">
          <div className="bg-slate-900/50 rounded-lg p-4">
            <h4 className="text-white font-semibold mb-3 text-sm">RSI Periods</h4>
            <div className="flex flex-wrap gap-2">
              {[7, 10, 14, 21].map(period => (
                <span key={period} className="px-3 py-1 bg-purple-500/20 text-purple-300 rounded text-xs font-medium">
                  {period}
                </span>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-slate-900/50 rounded-lg p-4">
              <h4 className="text-white font-semibold mb-3 text-sm">Oversold Levels</h4>
              <div className="flex flex-wrap gap-2">
                {[20, 25, 30, 35, 40].map(level => (
                  <span key={level} className="px-2 py-1 bg-pink-500/20 text-pink-300 rounded text-xs font-medium">
                    {level}
                  </span>
                ))}
              </div>
            </div>
            <div className="bg-slate-900/50 rounded-lg p-4">
              <h4 className="text-white font-semibold mb-3 text-sm">Overbought Levels</h4>
              <div className="flex flex-wrap gap-2">
                {[60, 65, 70, 75, 80].map(level => (
                  <span key={level} className="px-2 py-1 bg-pink-500/20 text-pink-300 rounded text-xs font-medium">
                    {level}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
        <div className="bg-slate-900/50 rounded-lg p-3">
          <p className="text-slate-300 text-sm">
            <span className="text-white font-semibold">~100 total combinations</span> tested (invalid pairs where oversold ≥ overbought are removed automatically)
          </p>
        </div>
      </div>
    ),
  },
  {
    title: 'Calculation Scale',
    icon: Database,
    gradient: 'from-orange-500 to-red-600',
    borderColor: 'border-orange-400/60',
    shadowColor: 'shadow-orange-500/50',
    content: (
      <div className="space-y-4">
        <p className="text-slate-300 text-sm leading-relaxed">
          After RSI warm-up is complete, each valid combination runs across almost all bars within the 500-day window. On average, ~450 valid bars per combination.
        </p>
        <div className="bg-slate-900/50 rounded-lg p-4 border-l-4 border-orange-500">
          <div className="text-center">
            <div className="text-4xl font-bold text-white mb-2">~45,000</div>
            <div className="text-slate-400 text-sm">Individual RSI calculations per asset</div>
            <div className="text-xs text-slate-500 mt-2">~100 combinations × ~450 bars</div>
          </div>
        </div>
      </div>
    ),
  },
  {
    title: 'Signal Score',
    icon: TrendingUp,
    gradient: 'from-blue-500 to-indigo-600',
    borderColor: 'border-blue-400/60',
    shadowColor: 'shadow-blue-500/50',
    content: (
      <div className="space-y-4">
        <p className="text-slate-300 text-sm leading-relaxed">
          The system converts the latest RSI value into a simple score from –10 to +10:
        </p>
        <div className="space-y-2">
          <div className="flex items-center justify-between bg-emerald-500/10 rounded-lg p-3 border border-emerald-500/30">
            <span className="text-emerald-300 font-semibold text-sm">+5 to +10</span>
            <span className="text-slate-300 text-sm">Historically low RSI (oversold region)</span>
          </div>
          <div className="flex items-center justify-between bg-slate-500/10 rounded-lg p-3 border border-slate-500/30">
            <span className="text-slate-300 font-semibold text-sm">–5 to +5</span>
            <span className="text-slate-300 text-sm">Neutral region</span>
          </div>
          <div className="flex items-center justify-between bg-red-500/10 rounded-lg p-3 border border-red-500/30">
            <span className="text-red-300 font-semibold text-sm">–5 to –10</span>
            <span className="text-slate-300 text-sm">Historically high RSI (overbought region)</span>
          </div>
        </div>
        <p className="text-slate-400 text-xs italic mt-3">
          This score describes where RSI sits within its thresholds, based only on historical positioning.
        </p>
      </div>
    ),
  },
  {
    title: 'Historical Performance',
    icon: BarChart3,
    gradient: 'from-fuchsia-500 to-violet-600',
    borderColor: 'border-fuchsia-400/60',
    shadowColor: 'shadow-fuchsia-500/50',
    content: (
      <div className="space-y-4">
        <p className="text-slate-300 text-sm leading-relaxed">
          For every valid RSI parameter set, the system checks the next 10 periods historically after each signal.
        </p>
        <div className="space-y-3">
          <div className="bg-slate-900/50 rounded-lg p-3">
            <h4 className="text-white font-semibold mb-1 text-sm">Historical Accuracy</h4>
            <p className="text-slate-400 text-xs">How often price moved in the expected direction</p>
          </div>
          <div className="bg-slate-900/50 rounded-lg p-3">
            <h4 className="text-white font-semibold mb-1 text-sm">Number of Signals</h4>
            <p className="text-slate-400 text-xs">How many RSI signals occurred</p>
          </div>
          <div className="bg-slate-900/50 rounded-lg p-3">
            <h4 className="text-white font-semibold mb-1 text-sm">Average Movement</h4>
            <p className="text-slate-400 text-xs">Average price change during the 10-period window</p>
          </div>
        </div>
        <p className="text-slate-400 text-xs italic">
          These values describe past market behavior only.
        </p>
      </div>
    ),
  },
  {
    title: 'Model Weight',
    icon: TrendingUp,
    gradient: 'from-yellow-500 to-amber-600',
    borderColor: 'border-yellow-400/60',
    shadowColor: 'shadow-yellow-500/50',
    content: (
      <div className="space-y-3">
        <div className="text-center bg-slate-900/50 rounded-lg p-6 border-l-4 border-yellow-500">
          <div className="text-5xl font-bold text-white mb-2">~30%</div>
          <div className="text-slate-300 text-sm">Base contribution to overall score</div>
          <div className="text-slate-500 text-xs mt-2">Weight varies by asset</div>
        </div>
        <p className="text-slate-300 text-sm leading-relaxed">
          RSI captures short-term momentum patterns from historical data. The weight adjusts based on historical backtesting results for each asset, balancing with slower-moving long-term indicators.
        </p>
        <p className="text-slate-400 text-xs italic">
          All weights are based on past performance patterns and do not guarantee future results.
        </p>
      </div>
    ),
  },
  {
    title: 'Key Terms',
    icon: BookOpen,
    gradient: 'from-slate-600 to-slate-700',
    borderColor: 'border-slate-500/60',
    shadowColor: 'shadow-slate-500/50',
    content: (
      <div className="space-y-3">
        <div className="bg-slate-900/50 rounded-lg p-3">
          <h4 className="text-white font-semibold mb-1 text-sm">RSI (Relative Strength Index)</h4>
          <p className="text-slate-400 text-xs">A number from 0 to 100 showing how strong recent price gains or losses have been compared to each other</p>
        </div>
        <div className="bg-slate-900/50 rounded-lg p-3">
          <h4 className="text-white font-semibold mb-1 text-sm">Overbought (High RSI)</h4>
          <p className="text-slate-400 text-xs">A region where RSI is historically high, meaning recent price movements have been strong compared to recent pullbacks</p>
        </div>
        <div className="bg-slate-900/50 rounded-lg p-3">
          <h4 className="text-white font-semibold mb-1 text-sm">Oversold (Low RSI)</h4>
          <p className="text-slate-400 text-xs">A region where RSI is historically low, meaning recent price movements have been weak compared to recent gains</p>
        </div>
        <div className="bg-slate-900/50 rounded-lg p-3">
          <h4 className="text-white font-semibold mb-1 text-sm">RSI Period</h4>
          <p className="text-slate-400 text-xs">How many bars are used in the RSI calculation. Shorter periods move quickly; longer periods move slowly</p>
        </div>
        <div className="bg-slate-900/50 rounded-lg p-3">
          <h4 className="text-white font-semibold mb-1 text-sm">Tolerance Band (±5)</h4>
          <p className="text-slate-400 text-xs">A buffer around oversold/overbought levels to avoid signals based on very small fluctuations</p>
        </div>
        <div className="bg-slate-900/50 rounded-lg p-3">
          <h4 className="text-white font-semibold mb-1 text-sm">Horizon (10 periods)</h4>
          <p className="text-slate-400 text-xs">The number of periods checked after each historical signal to calculate past accuracy and movement</p>
        </div>
      </div>
    ),
  },
];

const smaDefinitionsCard: InfoCard = {
  title: 'Key Terms',
  icon: BookOpen,
  gradient: 'from-slate-600 to-slate-700',
  borderColor: 'border-slate-500/60',
  shadowColor: 'shadow-slate-500/50',
  content: (
    <div className="space-y-3">
      <div className="bg-slate-900/50 rounded-lg p-3">
        <h4 className="text-white font-semibold mb-1 text-sm">Simple Moving Average (SMA)</h4>
        <p className="text-slate-400 text-xs">The average closing price over a chosen number of periods. Example: a 10-period SMA is the average of the last 10 closes</p>
      </div>
      <div className="bg-slate-900/50 rounded-lg p-3">
        <h4 className="text-white font-semibold mb-1 text-sm">Fast SMA</h4>
        <p className="text-slate-400 text-xs">A shorter-period SMA (e.g., 5–30). Moves quickly and reflects more recent price behavior</p>
      </div>
      <div className="bg-slate-900/50 rounded-lg p-3">
        <h4 className="text-white font-semibold mb-1 text-sm">Slow SMA</h4>
        <p className="text-slate-400 text-xs">A longer-period SMA (e.g., 40–250). Moves slowly and shows long-term trend behavior</p>
      </div>
      <div className="bg-slate-900/50 rounded-lg p-3">
        <h4 className="text-white font-semibold mb-1 text-sm">Divergence (Gap Between SMAs)</h4>
        <p className="text-slate-400 text-xs">The percentage difference between the fast and slow SMA</p>
      </div>
      <div className="bg-slate-900/50 rounded-lg p-3">
        <h4 className="text-white font-semibold mb-1 text-sm">2% Threshold</h4>
        <p className="text-slate-400 text-xs">The fast SMA must be more than 2.0% above or below the slow SMA for a divergence event</p>
      </div>
      <div className="bg-slate-900/50 rounded-lg p-3">
        <h4 className="text-white font-semibold mb-1 text-sm">Cooldown (5 bars)</h4>
        <p className="text-slate-400 text-xs">A spacing rule to prevent repeated events too close together</p>
      </div>
      <div className="bg-slate-900/50 rounded-lg p-3">
        <h4 className="text-white font-semibold mb-1 text-sm">500-Day Window</h4>
        <p className="text-slate-400 text-xs">The amount of historical price data used for all calculations</p>
      </div>
    </div>
  ),
};

const bollingerCards: InfoCard[] = [
  {
    title: 'Overview',
    icon: Maximize2,
    gradient: 'from-cyan-500 to-blue-600',
    borderColor: 'border-cyan-400/60',
    shadowColor: 'shadow-cyan-500/50',
    content: (
      <div className="space-y-3">
        <p className="text-slate-300 text-base leading-relaxed">
          This tool uses Bollinger Bands to show how far price has moved above or below its recent average over time.
        </p>
        <p className="text-slate-300 text-base leading-relaxed">
          Bollinger Bands help describe historical volatility and relative price extremes, based only on past data.
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
      <div className="space-y-3">
        <ul className="text-slate-300 text-sm space-y-2">
          <li className="flex items-start gap-2">
            <span className="text-emerald-400 mt-1">•</span>
            <span>The middle band is the average of recent prices</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-emerald-400 mt-1">•</span>
            <span>Upper and lower bands show how far price has historically moved away from that average</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-emerald-400 mt-1">•</span>
            <span>Price near the lower band means it has been lower than usual compared to recent history</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-emerald-400 mt-1">•</span>
            <span>Price near the upper band means it has been higher than usual compared to recent history</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-emerald-400 mt-1">•</span>
            <span>15% tolerance zone near each band edge captures "approaching band" behavior</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-emerald-400 mt-1">•</span>
            <span>10-period historical window checks how price behaved afterward</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-emerald-400 mt-1">•</span>
            <span>All calculations use the last 500 days of price data</span>
          </li>
        </ul>
      </div>
    ),
  },
  {
    title: 'Parameters Tested',
    icon: Settings,
    gradient: 'from-purple-500 to-pink-600',
    borderColor: 'border-purple-400/60',
    shadowColor: 'shadow-purple-500/50',
    content: (
      <div className="space-y-4">
        <p className="text-slate-300 text-sm leading-relaxed">
          These settings are widely used in market analysis.
        </p>
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-slate-900/50 rounded-lg p-4">
            <h4 className="text-white font-semibold mb-3 text-sm">Periods</h4>
            <div className="flex flex-wrap gap-2">
              {[10, 14, 20, 30, 40].map(period => (
                <span key={period} className="px-3 py-1 bg-purple-500/20 text-purple-300 rounded text-xs font-medium">
                  {period}
                </span>
              ))}
            </div>
          </div>
          <div className="bg-slate-900/50 rounded-lg p-4">
            <h4 className="text-white font-semibold mb-3 text-sm">Multipliers</h4>
            <div className="flex flex-wrap gap-2">
              {[1.5, 2.0, 2.5, 3.0].map(mult => (
                <span key={mult} className="px-3 py-1 bg-pink-500/20 text-pink-300 rounded text-xs font-medium">
                  {mult}
                </span>
              ))}
            </div>
          </div>
        </div>
        <div className="bg-slate-900/50 rounded-lg p-3">
          <p className="text-slate-300 text-sm">
            <span className="text-white font-semibold">20 total combinations</span> (5 periods × 4 multipliers × 1 horizon)
          </p>
        </div>
      </div>
    ),
  },
  {
    title: 'Calculation Scale',
    icon: Database,
    gradient: 'from-orange-500 to-red-600',
    borderColor: 'border-orange-400/60',
    shadowColor: 'shadow-orange-500/50',
    content: (
      <div className="space-y-4">
        <p className="text-slate-300 text-sm leading-relaxed">
          After warm-up, each valid combination runs across most bars in the 500-day window. Approximately ~450 usable bars per combination across 20 combinations.
        </p>
        <div className="bg-slate-900/50 rounded-lg p-4 border-l-4 border-orange-500">
          <div className="text-center">
            <div className="text-4xl font-bold text-white mb-2">~9,000</div>
            <div className="text-slate-400 text-sm">Individual Bollinger tests per asset</div>
            <div className="text-xs text-slate-500 mt-2">20 combinations × ~450 bars</div>
          </div>
        </div>
      </div>
    ),
  },
  {
    title: 'Signal Score',
    icon: TrendingUp,
    gradient: 'from-blue-500 to-indigo-600',
    borderColor: 'border-blue-400/60',
    shadowColor: 'shadow-blue-500/50',
    content: (
      <div className="space-y-4">
        <p className="text-slate-300 text-sm leading-relaxed">
          This score shows where the latest price sits relative to the bands:
        </p>
        <div className="space-y-2">
          <div className="flex items-center justify-between bg-emerald-500/10 rounded-lg p-3 border border-emerald-500/30">
            <span className="text-emerald-300 font-semibold text-sm">+5 to +10</span>
            <span className="text-slate-300 text-sm">Price near the lower band</span>
          </div>
          <div className="flex items-center justify-between bg-slate-500/10 rounded-lg p-3 border border-slate-500/30">
            <span className="text-slate-300 font-semibold text-sm">–5 to +5</span>
            <span className="text-slate-300 text-sm">Price near the middle band</span>
          </div>
          <div className="flex items-center justify-between bg-red-500/10 rounded-lg p-3 border border-red-500/30">
            <span className="text-red-300 font-semibold text-sm">–5 to –10</span>
            <span className="text-slate-300 text-sm">Price near the upper band</span>
          </div>
        </div>
        <p className="text-slate-400 text-xs italic mt-3">
          This scale reflects historical positioning only and does not indicate future outcomes.
        </p>
      </div>
    ),
  },
  {
    title: 'Historical Performance',
    icon: BarChart3,
    gradient: 'from-fuchsia-500 to-violet-600',
    borderColor: 'border-fuchsia-400/60',
    shadowColor: 'shadow-fuchsia-500/50',
    content: (
      <div className="space-y-4">
        <p className="text-slate-300 text-sm leading-relaxed">
          For each combination, the system checks the next 10 periods historically after each signal.
        </p>
        <div className="space-y-3">
          <div className="bg-slate-900/50 rounded-lg p-3">
            <h4 className="text-white font-semibold mb-1 text-sm">Historical Accuracy</h4>
            <p className="text-slate-400 text-xs">How often price moved in the expected direction</p>
          </div>
          <div className="bg-slate-900/50 rounded-lg p-3">
            <h4 className="text-white font-semibold mb-1 text-sm">Number of Detected Signals</h4>
            <p className="text-slate-400 text-xs">How many band proximity signals occurred</p>
          </div>
          <div className="bg-slate-900/50 rounded-lg p-3">
            <h4 className="text-white font-semibold mb-1 text-sm">Average Movement</h4>
            <p className="text-slate-400 text-xs">Average price change during the 10-period window</p>
          </div>
        </div>
        <p className="text-slate-400 text-xs italic">
          These values describe past price behavior only.
        </p>
      </div>
    ),
  },
  {
    title: 'Model Weight',
    icon: TrendingUp,
    gradient: 'from-yellow-500 to-amber-600',
    borderColor: 'border-yellow-400/60',
    shadowColor: 'shadow-yellow-500/50',
    content: (
      <div className="space-y-3">
        <div className="text-center bg-slate-900/50 rounded-lg p-6 border-l-4 border-yellow-500">
          <div className="text-5xl font-bold text-white mb-2">~20%</div>
          <div className="text-slate-300 text-sm">Base contribution to overall score</div>
          <div className="text-slate-500 text-xs mt-2">Weight varies by asset</div>
        </div>
        <p className="text-slate-300 text-sm leading-relaxed">
          Bollinger Bands highlight how far price has moved relative to its recent average and volatility. The weight adjusts based on historical backtesting results for each asset.
        </p>
        <p className="text-slate-400 text-xs italic">
          All weights are based on past performance patterns and do not guarantee future results.
        </p>
      </div>
    ),
  },
  {
    title: 'Key Terms',
    icon: BookOpen,
    gradient: 'from-slate-600 to-slate-700',
    borderColor: 'border-slate-500/60',
    shadowColor: 'shadow-slate-500/50',
    content: (
      <div className="space-y-3">
        <div className="bg-slate-900/50 rounded-lg p-3">
          <h4 className="text-white font-semibold mb-1 text-sm">Bollinger Bands</h4>
          <p className="text-slate-400 text-xs">A set of three lines showing how far price has moved above or below its recent average</p>
        </div>
        <div className="bg-slate-900/50 rounded-lg p-3">
          <h4 className="text-white font-semibold mb-1 text-sm">Middle Band</h4>
          <p className="text-slate-400 text-xs">The average (mean) of recent prices, usually calculated over 10–40 periods</p>
        </div>
        <div className="bg-slate-900/50 rounded-lg p-3">
          <h4 className="text-white font-semibold mb-1 text-sm">Upper and Lower Bands</h4>
          <p className="text-slate-400 text-xs">Lines above and below the middle band. The distance between them widens or narrows based on how volatile the recent price movements have been</p>
        </div>
        <div className="bg-slate-900/50 rounded-lg p-3">
          <h4 className="text-white font-semibold mb-1 text-sm">Multiplier</h4>
          <p className="text-slate-400 text-xs">Controls how far the upper and lower bands sit from the middle band. Higher multipliers → wider bands</p>
        </div>
        <div className="bg-slate-900/50 rounded-lg p-3">
          <h4 className="text-white font-semibold mb-1 text-sm">Volatility</h4>
          <p className="text-slate-400 text-xs">How much price has been moving up and down in recent periods. Bigger moves = higher volatility = wider bands</p>
        </div>
        <div className="bg-slate-900/50 rounded-lg p-3">
          <h4 className="text-white font-semibold mb-1 text-sm">15% Tolerance Zone</h4>
          <p className="text-slate-400 text-xs">A buffer near each band edge used to detect when price is approaching the band, even if it hasn't touched it</p>
        </div>
        <div className="bg-slate-900/50 rounded-lg p-3">
          <h4 className="text-white font-semibold mb-1 text-sm">Horizon (10 periods)</h4>
          <p className="text-slate-400 text-xs">The number of periods checked after each historical signal to calculate accuracy and movement</p>
        </div>
      </div>
    ),
  },
];

const macdCards: InfoCard[] = [
  {
    title: 'Overview',
    icon: GitMerge,
    gradient: 'from-cyan-500 to-blue-600',
    borderColor: 'border-cyan-400/60',
    shadowColor: 'shadow-cyan-500/50',
    content: (
      <div className="space-y-3">
        <p className="text-slate-300 text-base leading-relaxed font-semibold">
          MACD helps you see if an asset's momentum is speeding up or slowing down by comparing two different speed measurements.
        </p>
        <p className="text-slate-300 text-base leading-relaxed">
          MACD compares recent price momentum against longer-term momentum to spot when trends might be shifting.
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
      <div className="space-y-3">
        <ul className="text-slate-300 text-sm space-y-2">
          <li className="flex items-start gap-2">
            <span className="text-emerald-400 mt-1">•</span>
            <span>A Fast EMA follows recent price changes</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-emerald-400 mt-1">•</span>
            <span>A Slow EMA tracks longer-term movement</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-emerald-400 mt-1">•</span>
            <span>The MACD Line is the difference between these EMAs</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-emerald-400 mt-1">•</span>
            <span>Crossovers show when momentum changed direction in the past</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-emerald-400 mt-1">•</span>
            <span>10-period historical window evaluates past behavior</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-emerald-400 mt-1">•</span>
            <span>All calculations use the latest ~500 data points</span>
          </li>
        </ul>
      </div>
    ),
  },
  {
    title: 'Why So Many Tests?',
    icon: AlertCircle,
    gradient: 'from-amber-500 to-orange-600',
    borderColor: 'border-amber-400/60',
    shadowColor: 'shadow-amber-500/50',
    content: (
      <div className="space-y-4">
        <p className="text-slate-300 text-sm leading-relaxed">
          MACD appears unusual because its total tests jump from ~9,000 (Bollinger) and ~48,000 (RSI) all the way into the millions.
        </p>
        <div className="bg-slate-900/50 rounded-lg p-4">
          <h4 className="text-white font-semibold mb-3 text-sm">Parameter Grid Comparison</h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-slate-400">Bollinger:</span>
              <span className="text-white font-medium">20 combinations</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">SMA:</span>
              <span className="text-white font-medium">~38 combinations</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">RSI:</span>
              <span className="text-white font-medium">100 combinations</span>
            </div>
            <div className="flex justify-between border-t border-slate-700 pt-2">
              <span className="text-slate-400">MACD:</span>
              <span className="text-amber-400 font-bold">7,865 combinations</span>
            </div>
          </div>
        </div>
        <p className="text-slate-300 text-sm">
          MACD tests <span className="text-amber-400 font-semibold">80× more parameter combinations</span> than Bollinger and RSI. Once multiplied by ~430 bars, the numbers naturally rise into the millions.
        </p>
        <p className="text-slate-400 text-xs italic">
          There is nothing unusual happening — MACD just has a much larger search space.
        </p>
      </div>
    ),
  },
  {
    title: 'Parameters Tested',
    icon: Settings,
    gradient: 'from-purple-500 to-pink-600',
    borderColor: 'border-purple-400/60',
    shadowColor: 'shadow-purple-500/50',
    content: (
      <div className="space-y-4">
        <p className="text-slate-300 text-sm leading-relaxed">
          A wide range of commonly referenced settings are evaluated:
        </p>
        <div className="grid grid-cols-1 gap-4">
          <div className="bg-slate-900/50 rounded-lg p-4">
            <h4 className="text-white font-semibold mb-3 text-sm">Fast EMA</h4>
            <div className="flex items-center gap-2">
              <span className="text-purple-300 text-xs">5–20 periods</span>
            </div>
          </div>
          <div className="bg-slate-900/50 rounded-lg p-4">
            <h4 className="text-white font-semibold mb-3 text-sm">Slow EMA</h4>
            <div className="flex items-center gap-2">
              <span className="text-pink-300 text-xs">15–60 periods</span>
            </div>
          </div>
          <div className="bg-slate-900/50 rounded-lg p-4">
            <h4 className="text-white font-semibold mb-3 text-sm">Signal EMA</h4>
            <div className="flex items-center gap-2">
              <span className="text-purple-300 text-xs">5–15 periods</span>
            </div>
          </div>
        </div>
        <div className="bg-slate-900/50 rounded-lg p-3">
          <p className="text-slate-300 text-sm">
            <span className="text-white font-semibold">7,865 valid combinations</span>
          </p>
          <p className="text-slate-400 text-xs mt-1">Only combinations where Fast EMA &lt; Slow EMA are used</p>
        </div>
      </div>
    ),
  },
  {
    title: 'Calculation Scale',
    icon: Database,
    gradient: 'from-orange-500 to-red-600',
    borderColor: 'border-orange-400/60',
    shadowColor: 'shadow-orange-500/50',
    content: (
      <div className="space-y-4">
        <p className="text-slate-300 text-sm leading-relaxed">
          After the setup period (the indicator needs time to stabilize), there are approximately ~430 usable bars in a 500-day window.
        </p>
        <div className="bg-slate-900/50 rounded-lg p-4 border-l-4 border-orange-500">
          <div className="text-center">
            <div className="text-4xl font-bold text-white mb-2">3.3M</div>
            <div className="text-slate-400 text-sm">Historical momentum tests per asset</div>
            <div className="text-xs text-slate-500 mt-2">7,865 combinations × ~430 bars</div>
          </div>
        </div>
        <p className="text-slate-400 text-xs">
          If some combinations are skipped due to insufficient data, the count may fall to 2.5–3.0 million. Both ranges are normal depending on the dataset.
        </p>
      </div>
    ),
  },
  {
    title: 'Signal Score',
    icon: TrendingUp,
    gradient: 'from-blue-500 to-indigo-600',
    borderColor: 'border-blue-400/60',
    shadowColor: 'shadow-blue-500/50',
    content: (
      <div className="space-y-4">
        <p className="text-slate-300 text-sm leading-relaxed">
          A simple score reflects the distance between the MACD Line and Signal Line:
        </p>
        <div className="space-y-2">
          <div className="flex items-center justify-between bg-emerald-500/10 rounded-lg p-3 border border-emerald-500/30">
            <span className="text-emerald-300 font-semibold text-sm">+10</span>
            <span className="text-slate-300 text-sm">Recent momentum is much stronger than average</span>
          </div>
          <div className="flex items-center justify-between bg-slate-500/10 rounded-lg p-3 border border-slate-500/30">
            <span className="text-slate-300 font-semibold text-sm">0</span>
            <span className="text-slate-300 text-sm">Momentum is neutral</span>
          </div>
          <div className="flex items-center justify-between bg-red-500/10 rounded-lg p-3 border border-red-500/30">
            <span className="text-red-300 font-semibold text-sm">–10</span>
            <span className="text-slate-300 text-sm">Recent momentum is weaker than average</span>
          </div>
        </div>
        <p className="text-slate-400 text-xs italic mt-3">
          This represents historical momentum positioning only.
        </p>
      </div>
    ),
  },
  {
    title: 'Historical Performance',
    icon: BarChart3,
    gradient: 'from-fuchsia-500 to-violet-600',
    borderColor: 'border-fuchsia-400/60',
    shadowColor: 'shadow-fuchsia-500/50',
    content: (
      <div className="space-y-4">
        <p className="text-slate-300 text-sm leading-relaxed">
          For every parameter combination, the module evaluates the next 10 periods historically after each crossover.
        </p>
        <div className="space-y-3">
          <div className="bg-slate-900/50 rounded-lg p-3">
            <h4 className="text-white font-semibold mb-1 text-sm">Historical Accuracy</h4>
            <p className="text-slate-400 text-xs">How often price moved in the expected direction</p>
          </div>
          <div className="bg-slate-900/50 rounded-lg p-3">
            <h4 className="text-white font-semibold mb-1 text-sm">Number of Momentum Events</h4>
            <p className="text-slate-400 text-xs">How many MACD crossovers occurred</p>
          </div>
          <div className="bg-slate-900/50 rounded-lg p-3">
            <h4 className="text-white font-semibold mb-1 text-sm">Average Movement</h4>
            <p className="text-slate-400 text-xs">Average price change during the 10-period window</p>
          </div>
        </div>
        <p className="text-slate-400 text-xs italic">
          These describe past behavior only.
        </p>
      </div>
    ),
  },
  {
    title: 'Key Terms',
    icon: BookOpen,
    gradient: 'from-slate-600 to-slate-700',
    borderColor: 'border-slate-500/60',
    shadowColor: 'shadow-slate-500/50',
    content: (
      <div className="space-y-3">
        <div className="bg-slate-900/50 rounded-lg p-3">
          <h4 className="text-white font-semibold mb-1 text-sm">EMA (Exponential Moving Average)</h4>
          <p className="text-slate-400 text-xs">A moving average that reacts more quickly to recent prices</p>
        </div>
        <div className="bg-slate-900/50 rounded-lg p-3">
          <h4 className="text-white font-semibold mb-1 text-sm">Fast EMA</h4>
          <p className="text-slate-400 text-xs">Short-term momentum measure (5–20 periods)</p>
        </div>
        <div className="bg-slate-900/50 rounded-lg p-3">
          <h4 className="text-white font-semibold mb-1 text-sm">Slow EMA</h4>
          <p className="text-slate-400 text-xs">Long-term momentum measure (15–60 periods)</p>
        </div>
        <div className="bg-slate-900/50 rounded-lg p-3">
          <h4 className="text-white font-semibold mb-1 text-sm">MACD Line</h4>
          <p className="text-slate-400 text-xs">The difference between the Fast EMA and Slow EMA</p>
        </div>
        <div className="bg-slate-900/50 rounded-lg p-3">
          <h4 className="text-white font-semibold mb-1 text-sm">Signal Line</h4>
          <p className="text-slate-400 text-xs">A smoothed EMA of the MACD Line</p>
        </div>
        <div className="bg-slate-900/50 rounded-lg p-3">
          <h4 className="text-white font-semibold mb-1 text-sm">Histogram</h4>
          <p className="text-slate-400 text-xs">The difference between the MACD Line and Signal Line</p>
        </div>
        <div className="bg-slate-900/50 rounded-lg p-3">
          <h4 className="text-white font-semibold mb-1 text-sm">MACD Crossover</h4>
          <p className="text-slate-400 text-xs">When the MACD Line moves above or below the Signal Line</p>
        </div>
        <div className="bg-slate-900/50 rounded-lg p-3">
          <h4 className="text-white font-semibold mb-1 text-sm">Horizon (10 periods)</h4>
          <p className="text-slate-400 text-xs">The historical window used to evaluate price behavior after a crossover</p>
        </div>
      </div>
    ),
  },
];

const cciCards: InfoCard[] = [
  {
    title: 'Overview',
    icon: Gauge,
    gradient: 'from-cyan-500 to-blue-600',
    borderColor: 'border-cyan-400/60',
    shadowColor: 'shadow-cyan-500/50',
    content: (
      <div className="space-y-3">
        <p className="text-slate-300 text-base leading-relaxed">
          CCI observes how far an asset's recent typical prices have moved above or below their longer-term average.
        </p>
        <p className="text-slate-300 text-base leading-relaxed">
          It is commonly used to identify historical "overheated" or "over-extended" conditions.
        </p>
        <p className="text-slate-300 text-base leading-relaxed">
          This analysis is based on the latest ~500 days of historical data.
        </p>
      </div>
    ),
  },
  {
    title: 'How We Analyze CCI',
    icon: Settings,
    gradient: 'from-emerald-500 to-teal-600',
    borderColor: 'border-emerald-400/60',
    shadowColor: 'shadow-emerald-500/50',
    content: (
      <div className="space-y-3">
        <ul className="text-slate-300 text-sm space-y-2">
          <li className="flex items-start gap-2">
            <span className="text-emerald-400 mt-1">•</span>
            <span>Each price point is converted into a "typical price" (average of high, low, and close)</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-emerald-400 mt-1">•</span>
            <span>Multiple commonly referenced CCI period settings are calculated</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-emerald-400 mt-1">•</span>
            <span>Historical moments where CCI moved above +100 or below –100 are identified</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-emerald-400 mt-1">•</span>
            <span>For each of those moments, the next 10 days of historical price behavior are evaluated</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-emerald-400 mt-1">•</span>
            <span>The period setting that showed the clearest historical structure is displayed</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-emerald-400 mt-1">•</span>
            <span>All observations come strictly from historical data</span>
          </li>
        </ul>
      </div>
    ),
  },
  {
    title: 'Parameters Evaluated',
    icon: Settings,
    gradient: 'from-purple-500 to-pink-600',
    borderColor: 'border-purple-400/60',
    shadowColor: 'shadow-purple-500/50',
    content: (
      <div className="space-y-4">
        <p className="text-slate-300 text-sm leading-relaxed">
          We test several CCI periods that traders frequently watch:
        </p>
        <div className="bg-slate-900/50 rounded-lg p-4">
          <h4 className="text-white font-semibold mb-3 text-sm">CCI Period Options</h4>
          <div className="flex flex-wrap gap-2">
            {[10, 14, 20, 30, 40, 50].map(period => (
              <span key={period} className="px-3 py-1 bg-purple-500/20 text-purple-300 rounded text-xs font-medium">
                {period}
              </span>
            ))}
          </div>
        </div>
        <div className="bg-slate-900/50 rounded-lg p-3">
          <p className="text-slate-300 text-sm">
            <span className="text-white font-semibold">Outcome Window:</span> 10-day average horizon
          </p>
        </div>
        <div className="bg-slate-900/50 rounded-lg p-3">
          <p className="text-slate-300 text-sm">
            <span className="text-white font-semibold">6 total parameter combinations</span>
          </p>
        </div>
      </div>
    ),
  },
  {
    title: 'Calculation Scale',
    icon: Database,
    gradient: 'from-orange-500 to-red-600',
    borderColor: 'border-orange-400/60',
    shadowColor: 'shadow-orange-500/50',
    content: (
      <div className="space-y-4">
        <p className="text-slate-300 text-sm leading-relaxed">
          Every parameter setting is applied across the full price history. With ~500 data points and multiple qualifying bars for each setting:
        </p>
        <div className="bg-slate-900/50 rounded-lg p-4 border-l-4 border-orange-500">
          <div className="text-center">
            <div className="text-4xl font-bold text-white mb-2">2,000–3,000</div>
            <div className="text-slate-400 text-sm">CCI evaluations overall</div>
          </div>
        </div>
        <p className="text-slate-400 text-xs">
          This reflects how many times past CCI readings were able to be checked against the 10-day historical window.
        </p>
      </div>
    ),
  },
  {
    title: 'Signal Score',
    icon: TrendingUp,
    gradient: 'from-blue-500 to-indigo-600',
    borderColor: 'border-blue-400/60',
    shadowColor: 'shadow-blue-500/50',
    content: (
      <div className="space-y-4">
        <p className="text-slate-300 text-sm leading-relaxed">
          The CCI score reflects how the latest CCI value compares to common thresholds:
        </p>
        <div className="space-y-2">
          <div className="flex items-center justify-between bg-emerald-500/10 rounded-lg p-3 border border-emerald-500/30">
            <span className="text-emerald-300 font-semibold text-sm">Below –100</span>
            <span className="text-slate-300 text-sm">Positive score (historically far below avg)</span>
          </div>
          <div className="flex items-center justify-between bg-slate-500/10 rounded-lg p-3 border border-slate-500/30">
            <span className="text-slate-300 font-semibold text-sm">–100 to +100</span>
            <span className="text-slate-300 text-sm">Neutral range</span>
          </div>
          <div className="flex items-center justify-between bg-red-500/10 rounded-lg p-3 border border-red-500/30">
            <span className="text-red-300 font-semibold text-sm">Above +100</span>
            <span className="text-slate-300 text-sm">Negative score (historically far above avg)</span>
          </div>
        </div>
        <p className="text-slate-400 text-xs italic mt-3">
          The score simply summarizes the latest CCI position on this scale.
        </p>
      </div>
    ),
  },
  {
    title: 'Model Weight',
    icon: TrendingUp,
    gradient: 'from-amber-500 to-orange-600',
    borderColor: 'border-amber-400/60',
    shadowColor: 'shadow-amber-500/50',
    content: (
      <div className="space-y-4">
        <div className="bg-slate-900/50 rounded-lg p-4 border-l-4 border-amber-500">
          <div className="text-center">
            <div className="text-4xl font-bold text-white mb-2">~15%</div>
            <div className="text-slate-400 text-sm">Base contribution to overall score</div>
            <div className="text-xs text-slate-500 mt-2">Weight varies by asset</div>
          </div>
        </div>
        <p className="text-slate-300 text-sm leading-relaxed">
          CCI highlights historical over-extended or over-compressed price conditions rather than long-term trend direction.
        </p>
        <p className="text-slate-300 text-sm leading-relaxed">
          Because CCI often reacts sharply to short-term deviations, it contributes a smaller portion of the combined score to balance against steadier indicators such as SMA and RSI.
        </p>
        <p className="text-slate-400 text-xs italic">
          All weights are based on past performance patterns and do not guarantee future results.
        </p>
      </div>
    ),
  },
  {
    title: 'Dashboard Overview',
    icon: BarChart3,
    gradient: 'from-fuchsia-500 to-violet-600',
    borderColor: 'border-fuchsia-400/60',
    shadowColor: 'shadow-fuchsia-500/50',
    content: (
      <div className="space-y-4">
        <p className="text-slate-300 text-sm leading-relaxed">
          What you'll see on the dashboard:
        </p>
        <div className="space-y-3">
          <div className="bg-slate-900/50 rounded-lg p-3">
            <h4 className="text-white font-semibold mb-1 text-sm">CCI Period</h4>
            <p className="text-slate-400 text-xs">The period that showed a clear historical pattern</p>
          </div>
          <div className="bg-slate-900/50 rounded-lg p-3">
            <h4 className="text-white font-semibold mb-1 text-sm">Latest CCI Reading</h4>
            <p className="text-slate-400 text-xs">Current CCI value for the selected period</p>
          </div>
          <div className="bg-slate-900/50 rounded-lg p-3">
            <h4 className="text-white font-semibold mb-1 text-sm">CCI Score (–10 to +10)</h4>
            <p className="text-slate-400 text-xs">Normalized score based on CCI position</p>
          </div>
          <div className="bg-slate-900/50 rounded-lg p-3">
            <h4 className="text-white font-semibold mb-1 text-sm">Territory Classification</h4>
            <p className="text-slate-400 text-xs">Overbought, oversold, or neutral based on historical thresholds</p>
          </div>
          <div className="bg-slate-900/50 rounded-lg p-3">
            <h4 className="text-white font-semibold mb-1 text-sm">Historical Performance</h4>
            <p className="text-slate-400 text-xs">Accuracy, total movement, and average movement for that period</p>
          </div>
        </div>
        <p className="text-slate-400 text-xs italic">
          All observations relate strictly to past price behavior.
        </p>
      </div>
    ),
  },
  {
    title: 'Key Terms',
    icon: BookOpen,
    gradient: 'from-slate-600 to-slate-700',
    borderColor: 'border-slate-500/60',
    shadowColor: 'shadow-slate-500/50',
    content: (
      <div className="space-y-3">
        <div className="bg-slate-900/50 rounded-lg p-3">
          <h4 className="text-white font-semibold mb-1 text-sm">Typical Price</h4>
          <p className="text-slate-400 text-xs">Average of high, low, and close (an alternative to using only the closing price)</p>
        </div>
        <div className="bg-slate-900/50 rounded-lg p-3">
          <h4 className="text-white font-semibold mb-1 text-sm">CCI (Commodity Channel Index)</h4>
          <p className="text-slate-400 text-xs">Shows how far the current typical price sits above or below its recent average</p>
        </div>
        <div className="bg-slate-900/50 rounded-lg p-3">
          <h4 className="text-white font-semibold mb-1 text-sm">Oversold (below –100)</h4>
          <p className="text-slate-400 text-xs">Historically associated with prices moving well below their recent average</p>
        </div>
        <div className="bg-slate-900/50 rounded-lg p-3">
          <h4 className="text-white font-semibold mb-1 text-sm">Overbought (above +100)</h4>
          <p className="text-slate-400 text-xs">Historically associated with prices moving well above their recent average</p>
        </div>
        <div className="bg-slate-900/50 rounded-lg p-3">
          <h4 className="text-white font-semibold mb-1 text-sm">Mean Deviation</h4>
          <p className="text-slate-400 text-xs">Average of how far prices deviate from the moving average over the selected period</p>
        </div>
        <div className="bg-slate-900/50 rounded-lg p-3">
          <h4 className="text-white font-semibold mb-1 text-sm">Period (10–50)</h4>
          <p className="text-slate-400 text-xs">Number of bars used to calculate CCI</p>
        </div>
        <div className="bg-slate-900/50 rounded-lg p-3">
          <h4 className="text-white font-semibold mb-1 text-sm">Horizon (10 days)</h4>
          <p className="text-slate-400 text-xs">How far ahead historical price movements are examined</p>
        </div>
        <div className="bg-slate-900/50 rounded-lg p-3">
          <h4 className="text-white font-semibold mb-1 text-sm">Warm-Up Period</h4>
          <p className="text-slate-400 text-xs">The portion of historical data required before CCI can be calculated</p>
        </div>
      </div>
    ),
  },
];

const rocCards: InfoCard[] = [
  {
    title: 'Overview',
    icon: TrendingDown,
    gradient: 'from-cyan-500 to-blue-600',
    borderColor: 'border-cyan-400/60',
    shadowColor: 'shadow-cyan-500/50',
    content: (
      <div className="space-y-3">
        <p className="text-slate-300 text-base leading-relaxed">
          Rate of Change measures how quickly an asset's price has moved compared to a past point in time.
        </p>
        <p className="text-slate-300 text-base leading-relaxed">
          It reflects short bursts of acceleration or deceleration in historical momentum, but by itself tends to be noisy and inconsistent across most assets.
        </p>
        <p className="text-slate-300 text-base leading-relaxed">
          This analysis is based on the latest ~500 days of historical data.
        </p>
      </div>
    ),
  },
  {
    title: 'How We Analyze ROC',
    icon: Settings,
    gradient: 'from-emerald-500 to-teal-600',
    borderColor: 'border-emerald-400/60',
    shadowColor: 'shadow-emerald-500/50',
    content: (
      <div className="space-y-3">
        <ul className="text-slate-300 text-sm space-y-2">
          <li className="flex items-start gap-2">
            <span className="text-emerald-400 mt-1">•</span>
            <span>Each price is compared to its value a set number of periods earlier</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-emerald-400 mt-1">•</span>
            <span>ROC values are calculated for a wide range of commonly referenced period settings (5–25 days)</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-emerald-400 mt-1">•</span>
            <span>Historical moments where ROC moved above +2% or below –2% are identified</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-emerald-400 mt-1">•</span>
            <span>For each of those moments, the next 10 days of historical price behavior are evaluated</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-emerald-400 mt-1">•</span>
            <span>The period with the clearest historical pattern is displayed</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-emerald-400 mt-1">•</span>
            <span>All observations reflect past momentum only</span>
          </li>
        </ul>
      </div>
    ),
  },
  {
    title: 'Parameters Evaluated',
    icon: Settings,
    gradient: 'from-purple-500 to-pink-600',
    borderColor: 'border-purple-400/60',
    shadowColor: 'shadow-purple-500/50',
    content: (
      <div className="space-y-4">
        <p className="text-slate-300 text-sm leading-relaxed">
          We analyze ROC over a wide range of short-term momentum windows:
        </p>
        <div className="bg-slate-900/50 rounded-lg p-4">
          <h4 className="text-white font-semibold mb-3 text-sm">ROC Period Options</h4>
          <div className="flex flex-wrap gap-2">
            {Array.from({ length: 21 }, (_, i) => i + 5).map(period => (
              <span key={period} className="px-3 py-1 bg-purple-500/20 text-purple-300 rounded text-xs font-medium">
                {period}
              </span>
            ))}
          </div>
          <p className="text-slate-400 text-xs mt-3">(21 total)</p>
        </div>
        <div className="bg-slate-900/50 rounded-lg p-3">
          <p className="text-slate-300 text-sm">
            <span className="text-white font-semibold">Outcome Window:</span> 10-day average horizon
          </p>
        </div>
        <div className="bg-slate-900/50 rounded-lg p-3">
          <p className="text-slate-300 text-sm">
            <span className="text-white font-semibold">21 total parameter combinations</span>
          </p>
        </div>
      </div>
    ),
  },
  {
    title: 'Calculation Scale',
    icon: Database,
    gradient: 'from-orange-500 to-red-600',
    borderColor: 'border-orange-400/60',
    shadowColor: 'shadow-orange-500/50',
    content: (
      <div className="space-y-4">
        <p className="text-slate-300 text-sm leading-relaxed">
          Each ROC setting is applied across the full historical dataset. With ~500 data points and many qualifying bars per setting:
        </p>
        <div className="bg-slate-900/50 rounded-lg p-4 border-l-4 border-orange-500">
          <div className="text-center">
            <div className="text-4xl font-bold text-white mb-2">5,000–10,000</div>
            <div className="text-slate-400 text-sm">total ROC evaluations</div>
          </div>
        </div>
        <p className="text-slate-400 text-xs">
          This reflects how many times past ROC readings could be compared against the 10-day historical window.
        </p>
      </div>
    ),
  },
  {
    title: 'Signal Score',
    icon: TrendingUp,
    gradient: 'from-blue-500 to-indigo-600',
    borderColor: 'border-blue-400/60',
    shadowColor: 'shadow-blue-500/50',
    content: (
      <div className="space-y-4">
        <p className="text-slate-300 text-sm leading-relaxed">
          ROC signals reflect how the latest momentum compares to historical extremes:
        </p>
        <div className="space-y-2">
          <div className="flex items-center justify-between bg-emerald-500/10 rounded-lg p-3 border border-emerald-500/30">
            <span className="text-emerald-300 font-semibold text-sm">Below –2%</span>
            <span className="text-slate-300 text-sm">Positive score (momentum historically turning upward)</span>
          </div>
          <div className="flex items-center justify-between bg-slate-500/10 rounded-lg p-3 border border-slate-500/30">
            <span className="text-slate-300 font-semibold text-sm">–2% to +2%</span>
            <span className="text-slate-300 text-sm">Neutral historical range</span>
          </div>
          <div className="flex items-center justify-between bg-red-500/10 rounded-lg p-3 border border-red-500/30">
            <span className="text-red-300 font-semibold text-sm">Above +2%</span>
            <span className="text-slate-300 text-sm">Negative score (momentum historically slowing)</span>
          </div>
        </div>
        <p className="text-slate-400 text-xs italic mt-3">
          The score is simply a summarized snapshot of the latest ROC position.
        </p>
      </div>
    ),
  },
  {
    title: 'Dashboard Overview',
    icon: BarChart3,
    gradient: 'from-fuchsia-500 to-violet-600',
    borderColor: 'border-fuchsia-400/60',
    shadowColor: 'shadow-fuchsia-500/50',
    content: (
      <div className="space-y-4">
        <p className="text-slate-300 text-sm leading-relaxed">
          What you'll see on the dashboard:
        </p>
        <div className="space-y-3">
          <div className="bg-slate-900/50 rounded-lg p-3">
            <h4 className="text-white font-semibold mb-1 text-sm">ROC Period</h4>
            <p className="text-slate-400 text-xs">The period that showed the clearest historical structure</p>
          </div>
          <div className="bg-slate-900/50 rounded-lg p-3">
            <h4 className="text-white font-semibold mb-1 text-sm">Latest ROC Reading</h4>
            <p className="text-slate-400 text-xs">Current ROC value for the selected period</p>
          </div>
          <div className="bg-slate-900/50 rounded-lg p-3">
            <h4 className="text-white font-semibold mb-1 text-sm">ROC Score (–10 to +10)</h4>
            <p className="text-slate-400 text-xs">Normalized score based on ROC position</p>
          </div>
          <div className="bg-slate-900/50 rounded-lg p-3">
            <h4 className="text-white font-semibold mb-1 text-sm">Territory Classification</h4>
            <p className="text-slate-400 text-xs">Whether current momentum sits in historical positive / negative / neutral territory</p>
          </div>
          <div className="bg-slate-900/50 rounded-lg p-3">
            <h4 className="text-white font-semibold mb-1 text-sm">Historical Performance</h4>
            <p className="text-slate-400 text-xs">Accuracy, total movement, and average movement for that period</p>
          </div>
        </div>
        <p className="text-slate-400 text-xs italic">
          All observations relate strictly to past price behavior.
        </p>
      </div>
    ),
  },
  {
    title: 'Model Weight',
    icon: AlertCircle,
    gradient: 'from-red-500 to-rose-600',
    borderColor: 'border-red-400/60',
    shadowColor: 'shadow-red-500/50',
    content: (
      <div className="space-y-4">
        <div className="bg-slate-900/50 rounded-lg p-4 border-l-4 border-red-500">
          <div className="text-center">
            <div className="text-4xl font-bold text-white mb-2">Not included</div>
            <div className="text-slate-400 text-sm">in the combined model score</div>
            <div className="text-xs text-slate-500 mt-2">ROC is not part of the weighted indicator blend</div>
          </div>
        </div>
        <p className="text-slate-300 text-sm leading-relaxed">
          ROC often reacts sharply to tiny price fluctuations and tends to generate inconsistent historical patterns across different assets.
        </p>
        <p className="text-slate-300 text-sm leading-relaxed">
          Because of its high noise level and limited predictive structure, ROC is excluded from the weighted multi-indicator score and is instead shown separately as an optional historical momentum reference.
        </p>
        <p className="text-slate-400 text-xs italic">
          All weights and scores are based solely on past price behavior and do not guarantee future performance.
        </p>
      </div>
    ),
  },
  {
    title: 'Key Terms',
    icon: BookOpen,
    gradient: 'from-slate-600 to-slate-700',
    borderColor: 'border-slate-500/60',
    shadowColor: 'shadow-slate-500/50',
    content: (
      <div className="space-y-3">
        <div className="bg-slate-900/50 rounded-lg p-3">
          <h4 className="text-white font-semibold mb-1 text-sm">Rate of Change (ROC)</h4>
          <p className="text-slate-400 text-xs">Percentage difference between today's price and the price a set number of periods earlier</p>
        </div>
        <div className="bg-slate-900/50 rounded-lg p-3">
          <h4 className="text-white font-semibold mb-1 text-sm">Positive Momentum (ROC &gt; 0)</h4>
          <p className="text-slate-400 text-xs">Price is historically higher than it was X days ago</p>
        </div>
        <div className="bg-slate-900/50 rounded-lg p-3">
          <h4 className="text-white font-semibold mb-1 text-sm">Negative Momentum (ROC &lt; 0)</h4>
          <p className="text-slate-400 text-xs">Price is historically lower than it was X days ago</p>
        </div>
        <div className="bg-slate-900/50 rounded-lg p-3">
          <h4 className="text-white font-semibold mb-1 text-sm">Momentum Acceleration</h4>
          <p className="text-slate-400 text-xs">When ROC rises sharply over short periods</p>
        </div>
        <div className="bg-slate-900/50 rounded-lg p-3">
          <h4 className="text-white font-semibold mb-1 text-sm">Momentum Deceleration</h4>
          <p className="text-slate-400 text-xs">When ROC drops sharply over short periods</p>
        </div>
        <div className="bg-slate-900/50 rounded-lg p-3">
          <h4 className="text-white font-semibold mb-1 text-sm">Period (5–25)</h4>
          <p className="text-slate-400 text-xs">Number of bars used to compute ROC</p>
        </div>
        <div className="bg-slate-900/50 rounded-lg p-3">
          <h4 className="text-white font-semibold mb-1 text-sm">Horizon (10 days)</h4>
          <p className="text-slate-400 text-xs">How far ahead historical price movements are examined</p>
        </div>
        <div className="bg-slate-900/50 rounded-lg p-3">
          <h4 className="text-white font-semibold mb-1 text-sm">Warm-Up Period</h4>
          <p className="text-slate-400 text-xs">Number of bars required before ROC can be calculated</p>
        </div>
      </div>
    ),
  },
];

export default function AnalysisTypeDetailPage() {
  const { type } = useParams<{ type: string }>();
  const navigate = useNavigate();
  const analysisName = type ? analysisNames[type.toLowerCase()] || type.toUpperCase() : 'Unknown';
  const typeKey = type?.toLowerCase();
  const isSMA = typeKey === 'sma';
  const isRSI = typeKey === 'rsi';
  const isBOLL = typeKey === 'boll';
  const isMACD = typeKey === 'macd';
  const isCCI = typeKey === 'cci';
  const isROC = typeKey === 'roc';
  const hasContent = isSMA || isRSI || isBOLL || isMACD || isCCI || isROC;

  const handleSeeHowItWorks = () => {
    const indicatorMap: Record<string, string> = {
      'sma': 'SMA',
      'rsi': 'RSI',
      'boll': 'BOLL',
      'macd': 'MACD',
      'cci': 'CCI',
      'roc': 'ROC',
    };
    const indicator = typeKey ? indicatorMap[typeKey] : '';
    navigate('/tools/analysis', { state: { preselectedIndicator: indicator } });
  };

  if (!hasContent) {
    return (
      <div className="min-h-screen">
        <h1 className="text-3xl font-bold text-white">{analysisName}</h1>
        <p className="text-slate-400 mt-4">Documentation coming soon...</p>
      </div>
    );
  }

  const cards = isROC ? rocCards : isCCI ? cciCards : isMACD ? macdCards : isBOLL ? bollingerCards : isRSI ? rsiCards : [...smaCards, smaDefinitionsCard];
  const iconMap = {
    'sma': Activity,
    'rsi': Zap,
    'boll': Maximize2,
    'macd': GitMerge,
    'cci': Gauge,
    'roc': TrendingDown,
  };
  const HeaderIcon = typeKey ? iconMap[typeKey as keyof typeof iconMap] : Activity;
  const subtitle = isROC
    ? 'Understanding momentum acceleration and deceleration through ROC analysis'
    : isCCI
    ? 'Understanding price extremes and overextended conditions through CCI analysis'
    : isMACD
    ? 'Understanding momentum convergence and divergence through MACD analysis'
    : isBOLL
    ? 'Understanding volatility and price extremes through Bollinger Bands'
    : isRSI
    ? 'Understanding short-term momentum through RSI analysis'
    : 'Understanding trend direction through moving average analysis';

  return (
    <div className="min-h-screen pb-12">
      <button
        onClick={() => navigate('/documentation/indicators')}
        className="group flex items-center gap-2 px-4 py-2 mb-6 text-slate-300 hover:text-white transition-colors duration-200"
      >
        <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform duration-200" />
        <span className="text-sm font-medium">Back to Indicators</span>
      </button>

      <div className="text-center mb-16 pt-8">
        <div className="inline-flex items-center justify-center p-5 bg-gradient-to-br from-emerald-500/20 via-cyan-500/20 to-blue-500/20 rounded-3xl mb-8 backdrop-blur-sm border-2 border-emerald-400/40 shadow-2xl shadow-emerald-500/30 animate-pulse">
          <HeaderIcon className="w-16 h-16 text-emerald-400" />
        </div>
        <h1 className="text-5xl md:text-6xl font-extrabold text-white mb-6 bg-gradient-to-r from-emerald-400 via-cyan-400 to-blue-400 bg-clip-text text-transparent leading-tight">
          {analysisName}
        </h1>
        <p className="text-xl md:text-2xl text-slate-300 max-w-4xl mx-auto font-medium">
          {subtitle}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-7xl mx-auto px-4 mb-12">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.title}
              className={`group relative bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-xl rounded-2xl p-6 border-2 ${card.borderColor} shadow-xl ${card.shadowColor} hover:shadow-2xl transition-all duration-300`}
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${card.gradient} opacity-0 group-hover:opacity-5 rounded-2xl transition-opacity duration-300`}></div>

              <div className="relative">
                <div className="flex items-center gap-4 mb-4">
                  <div className={`inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br ${card.gradient} shadow-lg ${card.shadowColor} flex-shrink-0`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-white">
                    {card.title}
                  </h3>
                </div>

                <div className="pl-16">
                  {card.content}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="max-w-7xl mx-auto px-4 mb-12">
        <div className="bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-xl rounded-2xl p-6 border-2 border-slate-700/60 shadow-xl">
          <div className="flex items-start gap-4">
            <div className="w-2 h-full bg-gradient-to-b from-yellow-500 to-amber-600 rounded-full"></div>
            <div className="flex-1">
              <h3 className="text-xl font-bold text-white mb-3">Important Notice</h3>
              <p className="text-slate-300 text-sm leading-relaxed">
                This tool analyzes historical price data only. All values, scores, and statistics describe past behavior and do not predict or guarantee future trends or performance.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-center">
        <button
          onClick={handleSeeHowItWorks}
          className="group relative px-8 py-4 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-xl font-semibold text-white text-lg shadow-xl shadow-emerald-500/50 hover:shadow-2xl hover:shadow-emerald-500/70 transition-all duration-300 hover:scale-105 flex items-center gap-3"
        >
          <Play className="w-5 h-5" />
          <span>See How It Works</span>
        </button>
      </div>
    </div>
  );
}
