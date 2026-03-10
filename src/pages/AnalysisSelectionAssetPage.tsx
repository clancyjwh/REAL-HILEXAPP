import { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, TrendingUp, Activity, BarChart3, TrendingDown, Zap, LineChart } from 'lucide-react';

type IndicatorType = 'RSI' | 'SMA' | 'Boll' | 'MACD' | 'ROC' | 'CCI';

interface Indicator {
  id: IndicatorType;
  name: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
}

const indicators: Indicator[] = [
  {
    id: 'RSI',
    name: 'Relative Strength Index',
    description: 'Measure momentum and identify overbought/oversold conditions',
    icon: Zap,
    color: 'cyan',
  },
  {
    id: 'SMA',
    name: 'Simple Moving Average',
    description: 'Track price trends and identify support/resistance levels',
    icon: TrendingUp,
    color: 'blue',
  },
  {
    id: 'Boll',
    name: 'Bollinger Bands',
    description: 'Analyze volatility and potential price breakouts',
    icon: BarChart3,
    color: 'green',
  },
  {
    id: 'MACD',
    name: 'Moving Average Convergence Divergence',
    description: 'Identify trend direction, momentum, and potential reversals',
    icon: Activity,
    color: 'teal',
  },
  {
    id: 'ROC',
    name: 'Rate of Change',
    description: 'Measure the percentage change in price over time',
    icon: TrendingDown,
    color: 'amber',
  },
  {
    id: 'CCI',
    name: 'Commodity Channel Index',
    description: 'Identify cyclical trends and overbought/oversold levels',
    icon: LineChart,
    color: 'sky',
  },
];

const assetClassInfo: Record<string, string> = {
  cryptocurrency: 'Cryptocurrency',
  stock: 'Stock',
  forex: 'Forex Pair',
  commodity: 'Commodity',
};

export default function AnalysisSelectionAssetPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { assetClass } = useParams<{ assetClass: string }>();
  const [selectedIndicators, setSelectedIndicators] = useState<Set<IndicatorType>>(new Set());

  useEffect(() => {
    if (location.state?.preselectedIndicator) {
      const indicator = location.state.preselectedIndicator as IndicatorType;
      setSelectedIndicators(new Set([indicator]));
    }
  }, [location.state]);

  const toggleIndicator = (id: IndicatorType) => {
    const newSelected = new Set(selectedIndicators);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedIndicators(newSelected);
  };

  const selectAll = () => {
    if (selectedIndicators.size === indicators.length) {
      setSelectedIndicators(new Set());
    } else {
      setSelectedIndicators(new Set(indicators.map(i => i.id)));
    }
  };

  const handleContinue = () => {
    if (selectedIndicators.size > 0) {
      const indicatorsList = Array.from(selectedIndicators).join(',');
      navigate(`/tools/analysis/${assetClass}/search?indicators=${indicatorsList}`);
    }
  };

  return (
    <>
      <div className="mb-8">
        <button
          onClick={() => navigate('/tools/analysis')}
          className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-4"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Asset Classes
        </button>
        <div className="flex items-center gap-3">
          <div className="p-2 bg-amber-500/10 rounded-lg">
            <TrendingUp className="w-6 h-6 text-amber-500" />
          </div>
          <div>
            <h1 className="text-4xl font-bold text-white">Analysis - {assetClassInfo[assetClass || 'stock']}</h1>
            <p className="text-slate-400">Select indicators to analyze assets</p>
            <p className="text-slate-500 text-sm mt-1">Generate current technical analysis based on historical trends</p>
            <p className="text-slate-500 text-xs mt-2 leading-relaxed max-w-2xl">
              This tool provides technical analysis based on historical data and current market indicators.
              It is for informational and educational purposes only and does not constitute financial advice.
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-5xl">
        <div className="flex items-center justify-between mb-6">
          <p className="text-slate-300">
            Select the indicators you want to analyze
          </p>
          <button
            onClick={selectAll}
            className="px-4 py-2 text-sm bg-slate-800 hover:bg-slate-700 border border-slate-600 text-white rounded-lg transition-colors"
          >
            {selectedIndicators.size === indicators.length ? 'Deselect All' : 'Select All'}
          </button>
        </div>

        <div className="space-y-4 mb-8">
          {indicators.map((indicator) => {
            const Icon = indicator.icon;
            const isSelected = selectedIndicators.has(indicator.id);

            const colorClasses = {
              cyan: {
                border: isSelected ? 'border-cyan-500' : 'border-slate-700',
                shadow: isSelected ? 'shadow-lg shadow-cyan-500/20' : '',
                hoverBg: 'hover:bg-gradient-to-br hover:from-cyan-950/30 hover:to-slate-900',
                iconBg: isSelected ? 'bg-cyan-500/20' : 'bg-cyan-500/10',
                iconColor: 'text-cyan-400',
                checkBg: 'bg-cyan-500 border-cyan-500',
              },
              blue: {
                border: isSelected ? 'border-blue-500' : 'border-slate-700',
                shadow: isSelected ? 'shadow-lg shadow-blue-500/20' : '',
                hoverBg: 'hover:bg-gradient-to-br hover:from-blue-950/30 hover:to-slate-900',
                iconBg: isSelected ? 'bg-blue-500/20' : 'bg-blue-500/10',
                iconColor: 'text-blue-400',
                checkBg: 'bg-blue-500 border-blue-500',
              },
              green: {
                border: isSelected ? 'border-green-500' : 'border-slate-700',
                shadow: isSelected ? 'shadow-lg shadow-green-500/20' : '',
                hoverBg: 'hover:bg-gradient-to-br hover:from-green-950/30 hover:to-slate-900',
                iconBg: isSelected ? 'bg-green-500/20' : 'bg-green-500/10',
                iconColor: 'text-green-400',
                checkBg: 'bg-green-500 border-green-500',
              },
              teal: {
                border: isSelected ? 'border-teal-500' : 'border-slate-700',
                shadow: isSelected ? 'shadow-lg shadow-teal-500/20' : '',
                hoverBg: 'hover:bg-gradient-to-br hover:from-teal-950/30 hover:to-slate-900',
                iconBg: isSelected ? 'bg-teal-500/20' : 'bg-teal-500/10',
                iconColor: 'text-teal-400',
                checkBg: 'bg-teal-500 border-teal-500',
              },
              amber: {
                border: isSelected ? 'border-amber-500' : 'border-slate-700',
                shadow: isSelected ? 'shadow-lg shadow-amber-500/20' : '',
                hoverBg: 'hover:bg-gradient-to-br hover:from-amber-950/30 hover:to-slate-900',
                iconBg: isSelected ? 'bg-amber-500/20' : 'bg-amber-500/10',
                iconColor: 'text-amber-400',
                checkBg: 'bg-amber-500 border-amber-500',
              },
              sky: {
                border: isSelected ? 'border-sky-500' : 'border-slate-700',
                shadow: isSelected ? 'shadow-lg shadow-sky-500/20' : '',
                hoverBg: 'hover:bg-gradient-to-br hover:from-sky-950/30 hover:to-slate-900',
                iconBg: isSelected ? 'bg-sky-500/20' : 'bg-sky-500/10',
                iconColor: 'text-sky-400',
                checkBg: 'bg-sky-500 border-sky-500',
              },
            }[indicator.color];

            return (
              <button
                key={indicator.id}
                onClick={() => toggleIndicator(indicator.id)}
                className={`w-full group relative overflow-hidden rounded-xl bg-gradient-to-br from-slate-800 to-slate-900 border-2 p-6 text-left transition-all duration-300 ${colorClasses.border} ${colorClasses.shadow} ${colorClasses.hoverBg}`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className={`p-3 ${colorClasses.iconBg} rounded-lg transition-colors`}>
                      <Icon className={`w-6 h-6 ${colorClasses.iconColor}`} />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-white mb-1">
                        {indicator.name}
                      </h3>
                      <p className="text-slate-400 text-sm">
                        {indicator.description}
                      </p>
                    </div>
                  </div>
                  <div className={`w-6 h-6 rounded border-2 flex items-center justify-center transition-all ${
                    isSelected
                      ? colorClasses.checkBg
                      : 'border-slate-600 bg-slate-900'
                  }`}>
                    {isSelected && (
                      <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        <button
          onClick={handleContinue}
          disabled={selectedIndicators.size === 0}
          className="w-full px-6 py-4 bg-amber-600 hover:bg-amber-700 disabled:bg-slate-700 disabled:cursor-not-allowed text-white font-medium text-lg rounded-lg transition-colors"
        >
          Continue ({selectedIndicators.size} selected)
        </button>
      </div>
    </>
  );
}
