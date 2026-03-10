import { Clock, Scale, Percent, ArrowRight, ArrowLeft, Zap, TrendingUp, LineChart } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface AnalysisTool {
  name: string;
  icon: React.ElementType;
  gradient: string;
  borderColor: string;
  shadowColor: string;
  route: string;
}

const analysisTools: AnalysisTool[] = [
  {
    name: 'Horizon Optimizer',
    icon: Clock,
    gradient: 'from-cyan-500 to-blue-600',
    borderColor: 'border-cyan-400/60',
    shadowColor: 'shadow-cyan-500/50',
    route: '/tools/horizon-optimizer',
  },
  {
    name: 'Relative Value Index',
    icon: Scale,
    gradient: 'from-emerald-500 to-teal-600',
    borderColor: 'border-emerald-400/60',
    shadowColor: 'shadow-emerald-500/50',
    route: '/tools/relative-value-info',
  },
  {
    name: 'Interest Rate Comparison',
    icon: Percent,
    gradient: 'from-orange-500 to-red-600',
    borderColor: 'border-orange-400/60',
    shadowColor: 'shadow-orange-500/50',
    route: '/tools/interest-rate-info',
  },
  {
    name: 'Zero Day Options',
    icon: Zap,
    gradient: 'from-yellow-500 to-amber-600',
    borderColor: 'border-yellow-400/60',
    shadowColor: 'shadow-yellow-500/50',
    route: '/documentation/zero-day-options',
  },
  {
    name: 'Event Forecasting',
    icon: TrendingUp,
    gradient: 'from-blue-500 to-cyan-600',
    borderColor: 'border-blue-400/60',
    shadowColor: 'shadow-blue-500/50',
    route: '/documentation/event-forecasting',
  },
  {
    name: 'Price Direction Forecast',
    icon: LineChart,
    gradient: 'from-purple-500 to-pink-600',
    borderColor: 'border-purple-400/60',
    shadowColor: 'shadow-purple-500/50',
    route: '/documentation/price-forecast-methodology',
  },
];

export default function AnalysisToolsPage() {
  const navigate = useNavigate();

  const handleToolClick = (route: string) => {
    navigate(route);
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
        <div className="inline-flex items-center justify-center p-5 bg-gradient-to-br from-cyan-500/20 via-emerald-500/20 to-orange-500/20 rounded-3xl mb-8 backdrop-blur-sm border-2 border-cyan-400/40 shadow-2xl shadow-cyan-500/30 animate-pulse">
          <Scale className="w-16 h-16 text-cyan-400" />
        </div>
        <h1 className="text-5xl md:text-6xl font-extrabold text-white mb-6 bg-gradient-to-r from-cyan-400 via-emerald-400 to-orange-400 bg-clip-text text-transparent leading-tight">
          Analysis Tools
        </h1>
        <p className="text-xl md:text-2xl text-slate-300 max-w-4xl mx-auto font-medium">
          Select a tool to explore our advanced market analysis features
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto px-4 mb-12">
        {analysisTools.map((tool) => {
          const Icon = tool.icon;
          return (
            <button
              key={tool.name}
              onClick={() => handleToolClick(tool.route)}
              className={`group relative bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-xl rounded-2xl p-8 border-2 ${tool.borderColor} shadow-xl ${tool.shadowColor} hover:shadow-2xl transition-all duration-300 hover:scale-105 hover:-translate-y-2 text-left`}
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${tool.gradient} opacity-0 group-hover:opacity-10 rounded-2xl transition-opacity duration-300`}></div>

              <div className="relative">
                <div className={`inline-flex items-center justify-center w-16 h-16 mb-6 rounded-xl bg-gradient-to-br ${tool.gradient} shadow-lg ${tool.shadowColor} group-hover:scale-110 transition-transform duration-300`}>
                  <Icon className="w-8 h-8 text-white" />
                </div>

                <h3 className="text-2xl font-bold text-white mb-6 group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:bg-clip-text group-hover:from-white group-hover:to-slate-300 transition-all duration-300">
                  {tool.name}
                </h3>

                <div className={`inline-flex items-center text-sm font-semibold text-transparent bg-gradient-to-r ${tool.gradient} bg-clip-text group-hover:translate-x-2 transition-transform duration-300`}>
                  Learn More →
                </div>
              </div>
            </button>
          );
        })}
      </div>

      <div className="flex justify-center">
        <button
          onClick={() => navigate('/tools')}
          className="group relative px-8 py-4 bg-gradient-to-r from-orange-500 to-red-600 rounded-xl font-semibold text-white text-lg shadow-xl shadow-orange-500/50 hover:shadow-2xl hover:shadow-orange-500/70 transition-all duration-300 hover:scale-105 flex items-center gap-3"
        >
          <span>See Analysis Tools in Action</span>
          <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-200" />
        </button>
      </div>
    </div>
  );
}
