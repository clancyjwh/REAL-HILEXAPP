import { BookText, ArrowLeft, Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';

interface Definition {
  term: string;
  definition: string;
  category: 'Technical Indicators' | 'Chart Patterns' | 'Platform Terms' | 'Market Concepts' | 'Analysis Methods' | 'Signals';
  beginnerSummary?: string;
  fullDetails?: string;
  isSignal?: boolean;
}

const definitions: Definition[] = [
  {
    term: 'Signals — Overview',
    definition: 'A signal is just a moment where an indicator hits one of its key levels and gets counted for review.',
    beginnerSummary: 'A signal is just a moment where an indicator hits one of its key levels and gets counted for review.',
    fullDetails: 'A signal is simply a moment when an indicator reaches one of its predefined conditions. These conditions mark points in time where the indicator showed a meaningful change in its reading. Signals are used only for historical analysis to see how often these conditions lined up with later price movement.',
    category: 'Signals',
    isSignal: true,
  },
  {
    term: 'SMA Signals',
    definition: 'SMA creates a signal when the short-term line moves clearly above or below the long-term line.',
    beginnerSummary: 'SMA creates a signal when the short-term line moves clearly above or below the long-term line.',
    fullDetails: 'SMA signals occur when the short-term moving average moves noticeably above or below the long-term moving average. A rising crossover forms a "buy-type" signal, while a falling crossover forms a "sell-type" signal. Signals are spaced apart by a minimum number of price bars so repeated moves are not counted multiple times.',
    category: 'Signals',
    isSignal: true,
  },
  {
    term: 'RSI Signals',
    definition: 'RSI creates a signal when it drops into its low zone or rises into its high zone.',
    beginnerSummary: 'RSI creates a signal when it drops into its low zone or rises into its high zone.',
    fullDetails: 'RSI signals occur when the RSI value enters its established low or high zones. Readings in the lower zone generate "buy-type" signals, while readings in the upper zone generate "sell-type" signals. Neutral levels between these zones do not produce signals.',
    category: 'Signals',
    isSignal: true,
  },
  {
    term: 'Bollinger Band Signals',
    definition: 'Bollinger Bands create a signal when the price moves close to the upper or lower band.',
    beginnerSummary: 'Bollinger Bands create a signal when the price moves close to the upper or lower band.',
    fullDetails: 'Bollinger Band signals occur when price touches or moves near the upper or lower band. Prices near the lower band create "buy-type" signals, while prices near the upper band create "sell-type" signals. Price movements in the middle of the bands do not generate signals.',
    category: 'Signals',
    isSignal: true,
  },
  {
    term: 'CCI Signals',
    definition: 'CCI creates a signal when its value becomes very high or very low relative to recent prices.',
    beginnerSummary: 'CCI creates a signal when its value becomes very high or very low relative to recent prices.',
    fullDetails: 'CCI signals form when the CCI value moves beyond its normal range. Values well below the midline generate "buy-type" signals, and values well above it generate "sell-type" signals. Moderate readings inside the usual band do not produce signals.',
    category: 'Signals',
    isSignal: true,
  },
  {
    term: 'MACD Signals',
    definition: 'MACD creates a signal when the two MACD lines cross each other.',
    beginnerSummary: 'MACD creates a signal when the two MACD lines cross each other.',
    fullDetails: 'MACD signals occur when the MACD line crosses above or below its signal line. An upward crossover creates a "buy-type" signal, while a downward crossover creates a "sell-type" signal. Periods with no crossover generate no signal.',
    category: 'Signals',
    isSignal: true,
  },
  {
    term: 'ROC Signals',
    definition: 'ROC creates a signal when momentum moves sharply up or down.',
    beginnerSummary: 'ROC creates a signal when momentum moves sharply up or down.',
    fullDetails: 'ROC signals are created when momentum changes strongly compared with a previous period. Large negative momentum produces "buy-type" signals, while large positive momentum produces "sell-type" signals. Mild or sideways changes generate no signal.',
    category: 'Signals',
    isSignal: true,
  },
  {
    term: 'Bar',
    definition: 'A period of time on a chart. Hilex uses one bar to represent one day of trading activity.',
    category: 'Chart Patterns',
  },
  {
    term: 'SMA (Simple Moving Average)',
    definition: 'A technical indicator that calculates the average price of an asset over a specific number of periods. It smooths out price data to identify trends by reducing the impact of random price fluctuations.',
    category: 'Technical Indicators',
  },
  {
    term: 'EMA (Exponential Moving Average)',
    definition: 'A type of moving average that gives more weight to recent prices, making it more responsive to new information than a simple moving average.',
    category: 'Technical Indicators',
  },
  {
    term: 'RSI (Relative Strength Index)',
    definition: 'A momentum oscillator that measures the speed and magnitude of recent price changes to evaluate overbought or oversold conditions. Values range from 0 to 100.',
    category: 'Technical Indicators',
  },
  {
    term: 'MACD (Moving Average Convergence Divergence)',
    definition: 'A trend-following momentum indicator that shows the relationship between two moving averages of prices. It consists of the MACD line, signal line, and histogram.',
    category: 'Technical Indicators',
  },
  {
    term: 'Bollinger Bands',
    definition: 'A volatility indicator consisting of three lines: a middle band (SMA) and two outer bands that are standard deviations away from the middle band. Used to identify overbought/oversold conditions and volatility.',
    category: 'Technical Indicators',
  },
  {
    term: 'CCI (Commodity Channel Index)',
    definition: 'A momentum-based oscillator used to help determine when an asset is reaching a condition of being overbought or oversold. Values above +100 suggest overbought conditions, while values below -100 suggest oversold conditions.',
    category: 'Technical Indicators',
  },
  {
    term: 'ROC (Rate of Change)',
    definition: 'A momentum indicator that measures the percentage change in price between the current price and the price a certain number of periods ago.',
    category: 'Technical Indicators',
  },
  {
    term: 'Oversold',
    definition: 'A condition where an asset has been traded at a lower price and has the potential for a price bounce. Typically identified when RSI is below 30 or CCI is below -100.',
    category: 'Market Concepts',
  },
  {
    term: 'Overbought',
    definition: 'A condition where an asset has been traded at a higher price and has the potential for a price decline. Typically identified when RSI is above 70 or CCI is above +100.',
    category: 'Market Concepts',
  },
  {
    term: 'Signal',
    definition: 'On Hilex, a numerical score ranging from -10 to +10 that represents the combined historical analysis of multiple technical indicators for an asset. Positive values suggest historically bullish patterns, negative values suggest historically bearish patterns.',
    category: 'Platform Terms',
  },
  {
    term: 'Backtest',
    definition: 'The process of testing an indicator or trading strategy on historical data to see how it would have performed in the past. Hilex runs backtests across 12-15 months of historical data.',
    category: 'Analysis Methods',
  },
  {
    term: 'Parameter',
    definition: 'A variable setting used in calculating technical indicators. For example, the "period" in a 20-day SMA is a parameter. Different parameters can produce different indicator values.',
    category: 'Technical Indicators',
  },
  {
    term: 'Optimization',
    definition: 'The process of finding the best-performing parameter settings for an indicator by testing multiple combinations against historical data.',
    category: 'Analysis Methods',
  },
  {
    term: 'Historically Best-Performing Parameters',
    definition: 'The parameter configuration that achieved the highest accuracy rate in predicting directional price movements during the historical evaluation period (typically 12-15 months).',
    category: 'Platform Terms',
  },
  {
    term: '10-Day Outcome Window',
    definition: 'The period Hilex uses to evaluate how prices moved after an indicator signal. By examining the average price over the next 10 days, the platform can assess whether historical signals were directionally correct.',
    category: 'Platform Terms',
  },
  {
    term: 'Bespoke Project',
    definition: 'A custom analysis engagement where Hilex applies its proprietary analysis model to client-provided data or specialized datasets. Can be applied to any industry including real estate, private equity, or commodities.',
    category: 'Platform Terms',
  },
  {
    term: 'Analytical Score',
    definition: 'The overall signal value generated by combining multiple technical indicators with weighted contributions based on their historical performance for a specific asset.',
    category: 'Platform Terms',
  },
  {
    term: 'Horizon Analysis',
    definition: 'An evaluation method that examines how different time horizons (10-day, 20-day, 30-day periods) affect the historical accuracy of indicator signals.',
    category: 'Analysis Methods',
  },
  {
    term: 'Trade-by-Trade Evaluation',
    definition: 'A backtest method that examines 100-200 specific historical moments where an indicator meets its signal criteria, treating each as a separate "trade" to assess directional accuracy.',
    category: 'Analysis Methods',
  },
  {
    term: 'Monthly Rewind',
    definition: 'A backtest evaluation that checks indicator behavior at the start of each of the last 12 months, providing a month-by-month historical snapshot of signal accuracy.',
    category: 'Analysis Methods',
  },
  {
    term: 'Resistance Level',
    definition: 'A price point where selling pressure has historically prevented prices from rising further. Acts as a ceiling that price struggles to break through.',
    category: 'Chart Patterns',
  },
  {
    term: 'Support Level',
    definition: 'A price point where buying pressure has historically prevented prices from falling further. Acts as a floor that price struggles to break below.',
    category: 'Chart Patterns',
  },
  {
    term: 'Stop Signal',
    definition: 'A specific type of signal on Hilex that suggests historical patterns indicate a potential pause or reversal in the current price trend.',
    category: 'Platform Terms',
  },
  {
    term: 'Cumulative Performance',
    definition: 'The aggregate result of multiple indicator signals over time, showing the total historical directional accuracy across all evaluated periods.',
    category: 'Analysis Methods',
  },
  {
    term: 'Relative Value Analysis',
    definition: 'A comparative evaluation tool that measures how an asset\'s current technical indicators compare to its historical ranges and peer assets.',
    category: 'Analysis Methods',
  },
  {
    term: 'Correlation Index',
    definition: 'A measure of how closely two assets or indicators move in relation to each other. High correlation means they tend to move together, low or negative correlation means they move independently or inversely.',
    category: 'Market Concepts',
  },
  {
    term: 'Interest Rate Sensitivity',
    definition: 'The degree to which an asset\'s price is affected by changes in interest rates. Some assets are more sensitive to rate changes than others.',
    category: 'Market Concepts',
  },
  {
    term: 'Volatility',
    definition: 'The degree of variation in an asset\'s price over time. High volatility means large price swings, low volatility means more stable prices.',
    category: 'Market Concepts',
  },
  {
    term: 'Momentum',
    definition: 'The rate of acceleration of price changes. Assets with strong momentum continue moving in the same direction, while weakening momentum may signal a potential reversal.',
    category: 'Market Concepts',
  },
  {
    term: 'Trend',
    definition: 'The general direction in which an asset\'s price is moving. Can be upward (bullish), downward (bearish), or sideways (neutral).',
    category: 'Chart Patterns',
  },
  {
    term: 'Bullish',
    definition: 'A market condition or sentiment characterized by rising prices or the expectation that prices will rise. Optimistic about price growth.',
    category: 'Market Concepts',
  },
  {
    term: 'Bearish',
    definition: 'A market condition or sentiment characterized by falling prices or the expectation that prices will fall. Pessimistic about price growth.',
    category: 'Market Concepts',
  },
  {
    term: 'Divergence',
    definition: 'When an indicator moves in the opposite direction of price. For example, price making new highs while RSI fails to make new highs can signal potential reversal.',
    category: 'Chart Patterns',
  },
  {
    term: 'Convergence',
    definition: 'When two or more indicators or moving averages move toward each other, often signaling a potential change in trend or momentum.',
    category: 'Chart Patterns',
  },
  {
    term: 'Crossover',
    definition: 'When one indicator line crosses above or below another line. For example, when a fast SMA crosses above a slow SMA, it may signal a bullish trend.',
    category: 'Chart Patterns',
  },
  {
    term: 'Market Sentiment',
    definition: 'The overall attitude or mood of investors toward a particular asset or market, often measured through technical indicators and price action.',
    category: 'Market Concepts',
  },
  {
    term: 'Top Picks',
    definition: 'Assets identified by Hilex\'s analysis as showing particularly strong or weak historical signal patterns, ranked by analytical score.',
    category: 'Platform Terms',
  },
  {
    term: 'Market Movers',
    definition: 'Assets that have experienced significant price changes or signal shifts in recent periods, indicating increased activity or changing market conditions.',
    category: 'Platform Terms',
  },
  {
    term: 'Watchlist',
    definition: 'A personalized collection of assets that users can track and monitor, with automated updates showing current signals and historical analysis.',
    category: 'Platform Terms',
  },
  {
    term: 'Live Prices',
    definition: 'Real-time or near-real-time price data for assets, updated continuously to reflect current market values.',
    category: 'Platform Terms',
  },
  {
    term: 'Asset Class',
    definition: 'A category of similar investments. Hilex covers multiple asset classes including stocks, cryptocurrencies, forex, and commodities.',
    category: 'Market Concepts',
  },
  {
    term: 'Historical Accuracy',
    definition: 'The percentage of times an indicator\'s signal correctly predicted the direction of price movement over the evaluation period. Not predictive of future performance.',
    category: 'Analysis Methods',
  },
  {
    term: 'AI Pattern Weighting',
    definition: 'Hilex\'s adaptive system that adjusts indicator contributions based on which indicators have historically tracked each specific asset most consistently.',
    category: 'Platform Terms',
  },
  {
    term: 'News Sentiment Analysis',
    definition: 'The process of analyzing news articles and media to determine whether coverage is positive, negative, or neutral toward an asset or market.',
    category: 'Analysis Methods',
  },
  {
    term: 'Indicator Signal Strength',
    definition: 'A measure of how definitively an indicator is suggesting a particular direction, often based on how far the indicator value is from neutral zones.',
    category: 'Technical Indicators',
  },
];

export default function DefinitionsPage() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  const categories = ['All', 'Signals', 'Technical Indicators', 'Chart Patterns', 'Platform Terms', 'Market Concepts', 'Analysis Methods'];

  const filteredDefinitions = definitions
    .filter(def => {
      const matchesSearch = def.term.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           def.definition.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === 'All' || def.category === selectedCategory;
      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => a.term.localeCompare(b.term));

  const handleSignalClick = (signalTerm: string) => {
    const signalId = signalTerm.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    navigate(`/documentation/signal/${signalId}`, { state: { signalTerm } });
  };

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
        <div className="p-4 bg-gradient-to-br from-slate-500 to-zinc-600 rounded-2xl shadow-lg shadow-slate-500/50">
          <BookText className="w-10 h-10 text-white" />
        </div>
        <div>
          <h1 className="text-4xl font-bold text-white">Definitions & Glossary</h1>
          <p className="text-slate-400 mt-2 text-lg">
            Comprehensive index of all terms, indicators, and concepts
          </p>
        </div>
      </div>

      <div className="mb-8 space-y-4">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search definitions..."
            className="w-full pl-12 pr-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-transparent"
          />
        </div>

        <div className="flex flex-wrap gap-2">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                selectedCategory === category
                  ? 'bg-slate-500 text-white shadow-lg shadow-slate-500/50'
                  : 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-slate-300'
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      <div className="text-sm text-slate-400 mb-6">
        Showing {filteredDefinitions.length} of {definitions.length} definitions
      </div>

      <div className="space-y-4">
        {filteredDefinitions.map((def, index) => {
          const isClickable = def.isSignal;
          const CardWrapper = isClickable ? 'button' : 'div';

          return (
            <CardWrapper
              key={index}
              onClick={isClickable ? () => handleSignalClick(def.term) : undefined}
              className={`group relative bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-xl rounded-xl p-6 border-2 border-slate-400/60 shadow-xl shadow-slate-500/50 hover:shadow-2xl transition-all duration-300 hover:scale-[1.01] w-full text-left ${isClickable ? 'cursor-pointer' : ''}`}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-slate-500 to-zinc-600 opacity-0 group-hover:opacity-5 rounded-xl transition-opacity duration-300"></div>

              <div className="relative">
                <div className="flex items-start justify-between mb-3">
                  <h3 className="text-2xl font-bold text-white">{def.term}</h3>
                  <span className="text-xs font-semibold px-3 py-1 rounded-full bg-slate-700 text-slate-300 whitespace-nowrap">
                    {def.category}
                  </span>
                </div>

                <p className="text-slate-300 text-base leading-relaxed">
                  {def.beginnerSummary || def.definition}
                </p>

                {isClickable && (
                  <div className="mt-4 text-sm text-cyan-400 group-hover:text-cyan-300 font-semibold">
                    Click to read more →
                  </div>
                )}
              </div>
            </CardWrapper>
          );
        })}
      </div>

      {filteredDefinitions.length === 0 && (
        <div className="text-center py-16">
          <BookText className="w-16 h-16 text-slate-600 mx-auto mb-4" />
          <p className="text-slate-400 text-lg">No definitions found matching your search.</p>
          <p className="text-slate-500 text-sm mt-2">Try adjusting your search terms or category filter.</p>
        </div>
      )}

      <div className="mt-12 bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 border border-slate-700/50">
        <p className="text-slate-300 text-sm leading-relaxed text-center">
          All definitions and methodologies are based on historical analysis and educational purposes only.
          Nothing on this platform constitutes financial advice or trading recommendations.
        </p>
      </div>
    </div>
  );
}
