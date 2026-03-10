import { useNavigate } from 'react-router-dom';
import { ArrowLeft, TrendingUp, Bitcoin, DollarSign, Boxes } from 'lucide-react';

interface AssetClass {
  id: string;
  name: string;
  icon: React.ElementType;
  gradient: string;
  borderColor: string;
  shadowColor: string;
  description: string;
  available: boolean;
}

const assetClasses: AssetClass[] = [
  {
    id: 'cryptocurrency',
    name: 'Cryptocurrency',
    icon: Bitcoin,
    gradient: 'from-orange-500 to-amber-600',
    borderColor: 'border-orange-400/60',
    shadowColor: 'shadow-orange-500/50',
    description: 'Analyze crypto assets',
    available: true,
  },
  {
    id: 'stock',
    name: 'Stock',
    icon: TrendingUp,
    gradient: 'from-blue-500 to-cyan-600',
    borderColor: 'border-blue-400/60',
    shadowColor: 'shadow-blue-500/50',
    description: 'Analyze asset tickers',
    available: true,
  },
  {
    id: 'forex',
    name: 'Forex Pair',
    icon: DollarSign,
    gradient: 'from-green-500 to-emerald-600',
    borderColor: 'border-green-400/60',
    shadowColor: 'shadow-green-500/50',
    description: 'Analyze forex pairs',
    available: true,
  },
  {
    id: 'commodity',
    name: 'Commodity',
    icon: Boxes,
    gradient: 'from-amber-500 to-yellow-600',
    borderColor: 'border-amber-400/60',
    shadowColor: 'shadow-amber-500/50',
    description: 'Analyze commodities',
    available: true,
  },
];

export default function AnalysisAssetClassPage() {
  const navigate = useNavigate();

  const handleAssetClassClick = (assetClassId: string) => {
    navigate(`/tools/analysis/${assetClassId}`);
  };

  return (
    <>
      <div className="mb-8">
        <button
          onClick={() => navigate('/tools')}
          className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-4"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Tools
        </button>
        <div className="flex items-center gap-3">
          <div className="p-2 bg-amber-500/10 rounded-lg">
            <TrendingUp className="w-6 h-6 text-amber-500" />
          </div>
          <div>
            <h1 className="text-4xl font-bold text-white">Analysis</h1>
            <p className="text-slate-400">Select an asset class to analyze</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6 max-w-4xl">
        {assetClasses.map((assetClass) => {
          const Icon = assetClass.icon;
          return (
            <button
              key={assetClass.id}
              onClick={() => handleAssetClassClick(assetClass.id)}
              disabled={!assetClass.available}
              className={`group relative bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-xl rounded-2xl p-8 border-2 ${assetClass.borderColor} shadow-xl ${assetClass.shadowColor} hover:shadow-2xl transition-all duration-300 hover:scale-105 text-left ${
                !assetClass.available ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${assetClass.gradient} opacity-0 group-hover:opacity-10 rounded-2xl transition-opacity duration-300`}></div>

              <div className="relative">
                <div className={`inline-flex items-center justify-center w-16 h-16 mb-6 rounded-xl bg-gradient-to-br ${assetClass.gradient} shadow-lg ${assetClass.shadowColor} group-hover:scale-110 transition-transform duration-300`}>
                  <Icon className="w-8 h-8 text-white" />
                </div>

                <h3 className="text-2xl font-bold text-white mb-3 group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:bg-clip-text group-hover:from-white group-hover:to-slate-300 transition-all duration-300">
                  {assetClass.name}
                </h3>

                <p className="text-slate-400 text-sm leading-relaxed group-hover:text-slate-300 transition-colors duration-300">
                  {assetClass.description}
                </p>

                {assetClass.available && (
                  <div className={`mt-6 inline-flex items-center text-sm font-semibold text-transparent bg-gradient-to-r ${assetClass.gradient} bg-clip-text group-hover:translate-x-2 transition-transform duration-300`}>
                    Select →
                  </div>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </>
  );
}
