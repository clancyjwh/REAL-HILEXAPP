import { TrendingUp, Activity, BarChart3, Waves, Target, Zap, ArrowRight, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface AnalysisType {
  code: string;
  name: string;
  icon: React.ElementType;
  gradient: string;
  borderColor: string;
  shadowColor: string;
  description: string;
}

const analysisTypes: AnalysisType[] = [
  {
    code: 'RSI',
    name: 'Relative Strength Index',
    icon: TrendingUp,
    gradient: 'from-cyan-500 to-blue-600',
    borderColor: 'border-cyan-400/60',
    shadowColor: 'shadow-cyan-500/50',
    description: 'Momentum oscillator measuring speed and magnitude of price changes',
  },
  {
    code: 'SMA',
    name: 'Simple Moving Average',
    icon: Activity,
    gradient: 'from-emerald-500 to-teal-600',
    borderColor: 'border-emerald-400/60',
    shadowColor: 'shadow-emerald-500/50',
    description: 'Average price over a specific time period for trend identification',
  },
  {
    code: 'MACD',
    name: 'Moving Average Convergence Divergence',
    icon: BarChart3,
    gradient: 'from-purple-500 to-pink-600',
    borderColor: 'border-purple-400/60',
    shadowColor: 'shadow-purple-500/50',
    description: 'Trend-following momentum indicator showing relationship between moving averages',
  },
  {
    code: 'BOLL',
    name: 'Bollinger Bands',
    icon: Waves,
    gradient: 'from-orange-500 to-red-600',
    borderColor: 'border-orange-400/60',
    shadowColor: 'shadow-orange-500/50',
    description: 'Volatility indicator with upper and lower bands around a moving average',
  },
  {
    code: 'CCI',
    name: 'Commodity Channel Index',
    icon: Target,
    gradient: 'from-yellow-500 to-amber-600',
    borderColor: 'border-yellow-400/60',
    shadowColor: 'shadow-yellow-500/50',
    description: 'Oscillator identifying cyclical trends in commodities and other assets',
  },
  {
    code: 'ROC',
    name: 'Rate of Change',
    icon: Zap,
    gradient: 'from-fuchsia-500 to-violet-600',
    borderColor: 'border-fuchsia-400/60',
    shadowColor: 'shadow-fuchsia-500/50',
    description: 'Momentum indicator measuring percentage change in price over time',
  },
];

export default function AnalysisTypesPage() {
  const navigate = useNavigate();

  const handleAnalysisClick = (code: string) => {
    navigate(`/documentation/indicators/${code.toLowerCase()}`);
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

      <div className="text-center mb-16 pt-8">
        <div className="inline-flex items-center justify-center p-5 bg-gradient-to-br from-cyan-500/20 via-purple-500/20 to-pink-500/20 rounded-3xl mb-8 backdrop-blur-sm border-2 border-cyan-400/40 shadow-2xl shadow-cyan-500/30 animate-pulse">
          <TrendingUp className="w-16 h-16 text-cyan-400" />
        </div>
        <h1 className="text-5xl md:text-6xl font-extrabold text-white mb-6 bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent leading-tight">
          Indicators
        </h1>
        <p className="text-xl md:text-2xl text-slate-300 max-w-4xl mx-auto font-medium">
          Select an indicator to learn about its methodology and application
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto px-4 mb-12">
        {analysisTypes.map((type) => {
          const Icon = type.icon;
          return (
            <button
              key={type.code}
              onClick={() => handleAnalysisClick(type.code)}
              className={`group relative bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-xl rounded-2xl p-8 border-2 ${type.borderColor} shadow-xl ${type.shadowColor} hover:shadow-2xl transition-all duration-300 hover:scale-105 hover:-translate-y-2 text-left`}
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${type.gradient} opacity-0 group-hover:opacity-10 rounded-2xl transition-opacity duration-300`}></div>

              <div className="relative">
                <div className={`inline-flex items-center justify-center w-16 h-16 mb-6 rounded-xl bg-gradient-to-br ${type.gradient} shadow-lg ${type.shadowColor} group-hover:scale-110 transition-transform duration-300`}>
                  <Icon className="w-8 h-8 text-white" />
                </div>

                <div className={`inline-block px-3 py-1 rounded-lg bg-gradient-to-r ${type.gradient} text-white font-bold text-sm mb-3`}>
                  {type.code}
                </div>
                <h3 className="text-2xl font-bold text-white mb-6 group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:bg-clip-text group-hover:from-white group-hover:to-slate-300 transition-all duration-300">
                  {type.name}
                </h3>

                <div className={`inline-flex items-center text-sm font-semibold text-transparent bg-gradient-to-r ${type.gradient} bg-clip-text group-hover:translate-x-2 transition-transform duration-300`}>
                  Learn More →
                </div>
              </div>
            </button>
          );
        })}
      </div>

      <div className="flex justify-center">
        <button
          onClick={() => navigate('/tools/analysis')}
          className="group relative px-8 py-4 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-xl font-semibold text-white text-lg shadow-xl shadow-cyan-500/50 hover:shadow-2xl hover:shadow-cyan-500/70 transition-all duration-300 hover:scale-105 flex items-center gap-3"
        >
          <span>See Indicators in Action</span>
          <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-200" />
        </button>
      </div>
    </div>
  );
}
