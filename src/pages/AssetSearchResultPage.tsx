import { useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft, TrendingUp, TrendingDown, Info, FileText, ChevronDown, ChevronUp } from 'lucide-react';
import { useEffect, useState } from 'react';

interface SearchResult {
  Asset?: string;
  asset?: string;
  Price?: number | string;
  price?: number | string;
  Currency?: string;
  currency?: string;
  Description?: string;
  description?: string;
}

export default function AssetSearchResultPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { result } = location.state as { result: SearchResult } || {};
  const [showContent, setShowContent] = useState(false);
  const [priceChange] = useState(() => (Math.random() - 0.5) * 10);
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);

  useEffect(() => {
    setShowContent(true);
  }, []);

  if (!result) {
    navigate('/live-prices');
    return null;
  }

  const asset = result.Asset || result.asset || '';
  const priceValue = typeof result.Price === 'number' ? result.Price :
                     typeof result.price === 'number' ? result.price :
                     parseFloat(String(result.Price || result.price || 0));
  const currency = result.Currency || result.currency;
  const description = result.Description || result.description || '';

  const isPositive = priceChange >= 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a1628] via-[#0f1b2e] to-[#1a2332] pb-12">
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        @keyframes pulse-glow {
          0%, 100% {
            text-shadow: 0 0 20px rgba(59, 130, 246, 0.3),
                         0 0 40px rgba(59, 130, 246, 0.2);
          }
          50% {
            text-shadow: 0 0 30px rgba(59, 130, 246, 0.5),
                         0 0 60px rgba(59, 130, 246, 0.3);
          }
        }
        @keyframes shine {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        @keyframes border-glow-green {
          0%, 100% {
            box-shadow: 0 0 20px rgba(34, 197, 94, 0.3),
                        0 0 40px rgba(34, 197, 94, 0.1),
                        inset 0 0 20px rgba(34, 197, 94, 0.05);
          }
          50% {
            box-shadow: 0 0 30px rgba(34, 197, 94, 0.5),
                        0 0 60px rgba(34, 197, 94, 0.2),
                        inset 0 0 30px rgba(34, 197, 94, 0.1);
          }
        }
        @keyframes border-glow-red {
          0%, 100% {
            box-shadow: 0 0 20px rgba(239, 68, 68, 0.3),
                        0 0 40px rgba(239, 68, 68, 0.1),
                        inset 0 0 20px rgba(239, 68, 68, 0.05);
          }
          50% {
            box-shadow: 0 0 30px rgba(239, 68, 68, 0.5),
                        0 0 60px rgba(239, 68, 68, 0.2),
                        inset 0 0 30px rgba(239, 68, 68, 0.1);
          }
        }
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes price-flash {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.7; transform: scale(1.02); }
        }
        .float-animation { animation: float 3s ease-in-out infinite; }
        .pulse-glow { animation: pulse-glow 2s ease-in-out infinite; }
        .border-glow-green { animation: border-glow-green 2s ease-in-out infinite; }
        .border-glow-red { animation: border-glow-red 2s ease-in-out infinite; }
        .fade-in { animation: fade-in 0.6s ease-out forwards; }
        .price-flash { animation: price-flash 0.5s ease-out; }
        .shine-effect {
          position: relative;
          overflow: hidden;
        }
        .shine-effect::after {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
          animation: shine 3s infinite;
        }
      `}</style>

      <button
        onClick={() => navigate('/')}
        className="mb-8 flex items-center gap-2 text-slate-400 hover:text-white transition-all duration-300 hover:translate-x-1"
      >
        <ArrowLeft className="w-5 h-5" />
        <span className="font-medium">Back to Home</span>
      </button>

      <div className="max-w-4xl mx-auto space-y-6">
        <div className={`float-animation bg-gradient-to-br backdrop-blur-xl border rounded-2xl p-8 shadow-2xl ${showContent ? 'fade-in' : 'opacity-0'} ${
          isPositive
            ? 'from-green-900/80 to-green-800/60 border-green-500/30 border-glow-green'
            : 'from-red-900/80 to-red-800/60 border-red-500/30 border-glow-red'
        }`}>
          <div className="flex items-start justify-between mb-8">
            <div>
              <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Asset</div>
              <div className="text-5xl font-bold text-white" style={{ textShadow: '0 2px 10px rgba(0,0,0,0.3)' }}>
                {asset}
              </div>
              {priceChange !== 0 && (
                <div className={`inline-flex items-center gap-1.5 mt-3 px-3 py-1.5 rounded-full text-sm font-semibold ${
                  isPositive ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                } animate-pulse`}>
                  {isPositive ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                  {isPositive ? '+' : ''}{priceChange.toFixed(2)}%
                </div>
              )}
            </div>
            <div className="text-right">
              <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Price</div>
              <div className="shine-effect price-flash pulse-glow text-7xl font-bold bg-gradient-to-br from-white via-blue-100 to-blue-200 bg-clip-text text-transparent">
                ${priceValue.toFixed(2)}{currency === 'CAD' && ' (CAD)'}
              </div>
            </div>
          </div>

          <div
            className="bg-slate-900/60 backdrop-blur-sm rounded-xl p-6 border border-slate-700/50 shadow-inner fade-in cursor-pointer hover:bg-slate-900/70 transition-all duration-200"
            style={{ animationDelay: '0.2s' }}
            onClick={() => setIsDescriptionExpanded(!isDescriptionExpanded)}
          >
            <div className="flex items-center justify-between text-sm font-semibold text-slate-300 mb-4">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-blue-400" />
                Description
              </div>
              {isDescriptionExpanded ? (
                <ChevronUp className="w-5 h-5 text-slate-400" />
              ) : (
                <ChevronDown className="w-5 h-5 text-slate-400" />
              )}
            </div>
            <div className={`text-base text-slate-200 leading-relaxed transition-all duration-300 ${
              isDescriptionExpanded ? '' : 'line-clamp-2'
            }`}>
              {description}
            </div>
            {!isDescriptionExpanded && description.length > 150 && (
              <div className="text-xs text-slate-400 mt-2 italic">
                Click to read more...
              </div>
            )}
          </div>
        </div>

        <div className="bg-slate-900/40 backdrop-blur-sm border border-slate-700/50 rounded-xl p-5 fade-in" style={{ animationDelay: '0.4s' }}>
          <div className="flex items-start gap-3">
            <Info className="w-5 h-5 text-slate-500 flex-shrink-0 mt-0.5" />
            <p className="text-slate-400 text-sm leading-relaxed">
              This information is provided for educational purposes only and does not constitute financial advice
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
