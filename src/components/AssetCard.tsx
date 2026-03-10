import { TrendingUp, TrendingDown, LucideIcon, Activity } from 'lucide-react';
import { Asset } from '../types/market';
import { calculateMarketSentiment } from '../utils/marketSentiment';

interface AssetCardProps {
  asset: Asset;
  icon: LucideIcon;
  iconColor: string;
  signalStrength?: number | null;
}

export default function AssetCard({ asset, icon: Icon, iconColor, signalStrength }: AssetCardProps) {
  const isPositive = (asset.change ?? 0) >= 0;
  const TrendIcon = isPositive ? TrendingUp : TrendingDown;
  const sentiment = calculateMarketSentiment(signalStrength);
  const isGoldSignal = signalStrength !== null && signalStrength !== undefined && signalStrength >= 9;

  const formatPrice = (price: number | null): string => {
    if (price === null) return '-';
    return price.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  const formatChange = (change: number | null): string => {
    if (change === null) return '-';
    const sign = change >= 0 ? '+' : '';
    return `${sign}${change.toFixed(2)}%`;
  };

  const getGradientClasses = () => {
    const change = asset.change ?? 0;
    const absChange = Math.abs(change);

    if (change === 0) {
      return 'bg-slate-800/50 border-slate-700';
    }

    if (change > 0) {
      if (absChange >= 5) {
        return 'bg-gradient-to-br from-green-800/80 to-green-900/60 border-green-500/70';
      } else if (absChange >= 2) {
        return 'bg-gradient-to-br from-green-800/60 to-green-900/50 border-green-500/60';
      } else if (absChange >= 0.5) {
        return 'bg-gradient-to-br from-green-900/50 to-slate-800/50 border-green-600/50';
      } else {
        return 'bg-gradient-to-br from-green-900/35 to-slate-800/50 border-green-700/40';
      }
    } else {
      if (absChange >= 5) {
        return 'bg-gradient-to-br from-red-800/80 to-red-900/60 border-red-500/70';
      } else if (absChange >= 2) {
        return 'bg-gradient-to-br from-red-800/60 to-red-900/50 border-red-500/60';
      } else if (absChange >= 0.5) {
        return 'bg-gradient-to-br from-red-900/50 to-slate-800/50 border-red-600/50';
      } else {
        return 'bg-gradient-to-br from-red-900/35 to-slate-800/50 border-red-700/40';
      }
    }
  };

  return (
    <div className={`backdrop-blur-sm border rounded-xl p-6 hover:border-slate-600 transition-all duration-300 hover:shadow-lg hover:shadow-slate-900/50 ${isGoldSignal ? 'bg-[linear-gradient(145deg,#FFFDF5_0%,#FFF3CC_35%,#EBD48E_70%,#C9A43B_100%)] bg-[length:200%_200%] animate-[shimmer_4s_linear_infinite] shadow-[0_0_20px_rgba(201,164,59,0.8),0_0_40px_rgba(235,212,142,0.4),0_0_60px_rgba(255,253,245,0.2)] border-yellow-400' : getGradientClasses()}`}>
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg ${isGoldSignal ? 'bg-black/20' : iconColor}`}>
            <Icon className={`w-5 h-5 ${isGoldSignal ? 'text-black' : ''}`} />
          </div>
          <div>
            <h3 className={`font-bold text-lg ${isGoldSignal ? 'text-black' : 'text-white'}`}>{asset.symbol}</h3>
            <p className={`text-sm ${isGoldSignal ? 'text-black/60' : 'text-slate-400'}`}>{asset.name}</p>
          </div>
        </div>
      </div>

      {asset.loading ? (
        <div className="space-y-2">
          <div className={`h-8 rounded animate-pulse ${isGoldSignal ? 'bg-black/20' : 'bg-slate-700/50'}`}></div>
          <div className={`h-6 rounded w-24 animate-pulse ${isGoldSignal ? 'bg-black/20' : 'bg-slate-700/50'}`}></div>
        </div>
      ) : (
        <>
          <div className={`text-3xl font-bold mb-3 ${isGoldSignal ? 'text-black' : 'text-white'}`}>
            ${formatPrice(asset.price)}
          </div>

          <div className="flex items-center justify-between gap-3 mb-2">
            <div className="flex items-center gap-2">
              <TrendIcon
                className={`w-4 h-4 ${isGoldSignal ? 'text-black' : isPositive ? 'text-green-500' : 'text-red-500'}`}
              />
              <span
                className={`font-semibold ${
                  isGoldSignal ? 'text-black' : isPositive ? 'text-green-500' : 'text-red-500'
                }`}
              >
                {formatChange(asset.change)}
              </span>
              <span className={`text-xs ${isGoldSignal ? 'text-black/60' : 'text-slate-500'}`}>24h</span>
            </div>
          </div>

          {signalStrength !== null && signalStrength !== undefined && (
            <div className={`mt-3 px-3 py-2 rounded-lg border-2 ${isGoldSignal ? 'bg-black/10 border-black/30' : `${sentiment.bgColor} ${sentiment.borderColor}`}`}>
              <div className="flex items-center justify-between mb-1">
                <div className={`text-xs ${isGoldSignal ? 'text-black/70' : 'text-slate-400'}`}>Analytical Score</div>
                {signalStrength > 0 ? (
                  <TrendingUp className={`w-4 h-4 ${isGoldSignal ? 'text-black' : sentiment.color}`} />
                ) : signalStrength < 0 ? (
                  <TrendingDown className={`w-4 h-4 ${isGoldSignal ? 'text-black' : sentiment.color}`} />
                ) : (
                  <Activity className={`w-4 h-4 ${isGoldSignal ? 'text-black' : sentiment.color}`} />
                )}
              </div>
              <div className={`text-2xl font-bold mb-1 ${isGoldSignal ? 'text-black' : sentiment.color}`}>
                {signalStrength > 0 ? '+' : ''}{signalStrength.toFixed(1)}
              </div>
              <div className={`text-xs font-bold uppercase ${isGoldSignal ? 'text-black/80' : 'text-slate-400'}`}>
                {asset.indicator || sentiment.label}
              </div>
              <div className="mt-2">
                <div className={`h-2 ${isGoldSignal ? 'bg-yellow-600/30' : 'bg-slate-700'} rounded-full overflow-hidden`}>
                  <div
                    className={`h-full ${isGoldSignal ? 'bg-yellow-600' : sentiment.color === 'text-green-400' ? 'bg-green-500' : sentiment.color === 'text-red-400' ? 'bg-red-500' : 'bg-slate-500'} transition-all duration-500`}
                    style={{ width: `${((signalStrength + 10) / 20) * 100}%` }}
                  />
                </div>
                <div className={`flex justify-between text-xs mt-1 ${isGoldSignal ? 'text-black/60' : 'text-slate-500'}`}>
                  <span>-10</span>
                  <span>0</span>
                  <span>+10</span>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
