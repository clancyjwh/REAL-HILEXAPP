import { Database, ExternalLink, ArrowLeft, Search, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface AssetDataCard {
  title: string;
  icon: React.ElementType;
  gradient: string;
  borderColor: string;
  shadowColor: string;
  content: React.ReactNode;
}

const assetDataCards: AssetDataCard[] = [
  {
    title: 'Supported Asset Classes',
    icon: Database,
    gradient: 'from-cyan-500 to-blue-600',
    borderColor: 'border-cyan-400/60',
    shadowColor: 'shadow-cyan-500/50',
    content: (
      <div>
        <p className="text-slate-300 text-base leading-relaxed mb-4">
          Currently supported:
        </p>
        <div className="inline-block px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-lg text-white font-bold text-lg mb-4">
          Stocks
        </div>
        <p className="text-slate-400 text-sm leading-relaxed italic">
          Note: Crypto, Commodities, Foreign Exchange and other assets will be ready and included once beta testing is complete.
        </p>
      </div>
    ),
  },
  {
    title: 'Sources',
    icon: ExternalLink,
    gradient: 'from-emerald-500 to-teal-600',
    borderColor: 'border-emerald-400/60',
    shadowColor: 'shadow-emerald-500/50',
    content: (
      <p className="text-slate-300 text-base leading-relaxed">
        All of our price data is pulled from the Twelve Data API, and is publicly accessible.
        This data is used in our backtest calculations, to pull live prices, and is the basis of most of our analyses.
        Our live prices in the watchlist are pulled from Finnhub, another reliable source.
      </p>
    ),
  },
  {
    title: 'Asset Refresh Rate',
    icon: Clock,
    gradient: 'from-purple-500 to-violet-600',
    borderColor: 'border-purple-400/60',
    shadowColor: 'shadow-purple-500/50',
    content: (
      <p className="text-slate-300 text-base leading-relaxed">
        Assets in your watchlist and on the home page are updated every 6-12 hours based on your subscription tier,
        ensuring you have access to fresh data while optimizing performance and resource usage.
      </p>
    ),
  },
];

export default function AssetDataPage() {
  const navigate = useNavigate();

  const handleGetLivePrice = () => {
    window.dispatchEvent(new Event('expandGlobalSearch'));
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
        <div className="inline-flex items-center justify-center p-5 bg-gradient-to-br from-cyan-500/20 via-emerald-500/20 to-teal-500/20 rounded-3xl mb-8 backdrop-blur-sm border-2 border-cyan-400/40 shadow-2xl shadow-cyan-500/30 animate-pulse">
          <Database className="w-16 h-16 text-cyan-400" />
        </div>
        <h1 className="text-5xl md:text-6xl font-extrabold text-white mb-6 bg-gradient-to-r from-cyan-400 via-emerald-400 to-teal-400 bg-clip-text text-transparent leading-tight">
          Asset Data
        </h1>
        <p className="text-xl md:text-2xl text-slate-300 max-w-4xl mx-auto font-medium">
          Learn about the asset classes we support and where our data comes from
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-6xl mx-auto px-4 mb-12">
        {assetDataCards.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.title}
              className={`group relative bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-xl rounded-2xl p-8 border-2 ${card.borderColor} shadow-xl ${card.shadowColor} hover:shadow-2xl transition-all duration-300 hover:scale-105 hover:-translate-y-2`}
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${card.gradient} opacity-0 group-hover:opacity-10 rounded-2xl transition-opacity duration-300`}></div>

              <div className="relative">
                <div className="flex items-start gap-6 mb-6">
                  <div className={`inline-flex items-center justify-center w-16 h-16 rounded-xl bg-gradient-to-br ${card.gradient} shadow-lg ${card.shadowColor} group-hover:scale-110 transition-transform duration-300 flex-shrink-0`}>
                    <Icon className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h3 className="text-3xl font-bold text-white group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:bg-clip-text group-hover:from-white group-hover:to-slate-300 transition-all duration-300">
                      {card.title}
                    </h3>
                  </div>
                </div>

                <div className="group-hover:text-slate-200 transition-colors duration-300">
                  {card.content}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex justify-center">
        <button
          onClick={handleGetLivePrice}
          className="group relative px-8 py-4 bg-gradient-to-r from-emerald-600 to-teal-600 rounded-xl font-semibold text-white text-lg shadow-xl shadow-emerald-500/50 hover:shadow-2xl hover:shadow-emerald-500/70 transition-all duration-300 hover:scale-105 flex items-center gap-3"
        >
          <Search className="w-5 h-5" />
          <span>Get a Live Price</span>
        </button>
      </div>
    </div>
  );
}
