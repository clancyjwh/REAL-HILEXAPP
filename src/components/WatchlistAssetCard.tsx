import { TrendingUp, TrendingDown, Activity } from 'lucide-react';
import { calculateMarketSentiment } from '../utils/marketSentiment';

interface WatchlistAssetCardProps {
  symbol: string;
  name: string;
  score?: number | null;
  sentiment?: string | null;
  lastUpdated?: string | null;
  detailedSignalData?: any;
  onClick?: () => void;
  rank?: number;
}

const getSignalColors = (signal: number) => {
  if (signal >= 9) return { bg: 'bg-[linear-gradient(145deg,#FFFDF5_0%,#FFF3CC_35%,#EBD48E_70%,#C9A43B_100%)] bg-[length:200%_200%] animate-[shimmer_4s_linear_infinite] shadow-[0_0_20px_rgba(201,164,59,0.8),0_0_40px_rgba(235,212,142,0.4),0_0_60px_rgba(255,253,245,0.2)]', border: 'border-yellow-400', text: 'text-black' };
  if (signal >= 7) return { bg: 'bg-green-900', border: 'border-green-700', text: 'text-green-300' };
  if (signal >= 4) return { bg: 'bg-green-700', border: 'border-green-600', text: 'text-green-200' };
  if (signal >= 1) return { bg: 'bg-green-500', border: 'border-green-400', text: 'text-green-100' };
  if (signal > -1) return { bg: 'bg-slate-600', border: 'border-slate-500', text: 'text-slate-200' };
  if (signal >= -4) return { bg: 'bg-orange-500', border: 'border-orange-400', text: 'text-orange-100' };
  if (signal >= -7) return { bg: 'bg-red-600', border: 'border-red-500', text: 'text-red-100' };
  if (signal <= -9) return { bg: 'bg-gradient-to-br from-red-900 to-red-950', border: 'border-red-600', text: 'text-red-200' };
  return { bg: 'bg-red-900', border: 'border-red-700', text: 'text-red-300' };
};

const formatTimeAgo = (timestamp: string): string => {
  const now = new Date();
  const updated = new Date(timestamp);
  const diffMs = now.getTime() - updated.getTime();
  const diffMins = Math.floor(diffMs / 60000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays}d ago`;
};

const extractSignalScore = (detailedSignalData: any, fallbackScore?: number | null): number => {
  if (!detailedSignalData) {
    return fallbackScore ?? 0;
  }

  try {
    if (typeof detailedSignalData === 'string') {
      const parsed = JSON.parse(detailedSignalData);
      return extractSignalScore(parsed, fallbackScore);
    }

    if (detailedSignalData['JSON 1']) {
      const json1Data = typeof detailedSignalData['JSON 1'] === 'string'
        ? JSON.parse(detailedSignalData['JSON 1'])
        : detailedSignalData['JSON 1'];

      if (json1Data['CUMULATIVE SCORE']) {
        const cumulativeScore = typeof json1Data['CUMULATIVE SCORE'] === 'string'
          ? JSON.parse(json1Data['CUMULATIVE SCORE'])
          : json1Data['CUMULATIVE SCORE'];

        if (cumulativeScore.blended !== undefined) {
          return parseFloat(cumulativeScore.blended);
        }
        if (cumulativeScore.normalized !== undefined) {
          return parseFloat(cumulativeScore.normalized);
        }
        if (cumulativeScore.weighted !== undefined) {
          return parseFloat(cumulativeScore.weighted);
        }
      }
    }

    return fallbackScore ?? 0;
  } catch (error) {
    console.error('Error parsing signal score:', error);
    return fallbackScore ?? 0;
  }
};

export default function WatchlistAssetCard({
  symbol,
  name,
  score,
  sentiment,
  lastUpdated,
  detailedSignalData,
  onClick,
  rank = 0
}: WatchlistAssetCardProps) {
  const displayScore = extractSignalScore(detailedSignalData, score);
  const colors = getSignalColors(displayScore);
  const sentimentData = calculateMarketSentiment(displayScore);
  const signalPosition = ((displayScore + 10) / 20) * 100;

  return (
    <button
      onClick={onClick}
      className={`${colors.bg} ${colors.border} border-2 rounded-xl p-6 shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 text-left w-full h-48 flex flex-col`}
    >
      <div className="flex items-start justify-between mb-4">
        <div>
          {rank > 0 && <div className={`${displayScore >= 9 ? 'text-black/70' : 'text-white/60'} text-sm font-bold mb-1`}>#{rank}</div>}
          <div className={`${displayScore >= 9 ? 'text-black' : 'text-white'} text-2xl font-bold`}>{symbol}</div>
          <div className={`${displayScore >= 9 ? 'text-black/80' : 'text-white/80'} text-sm`}>{name}</div>
        </div>
        <div className={`p-2 ${displayScore >= 9 ? 'bg-black/20' : 'bg-white/20'} rounded-full`}>
          {displayScore > 0 ? (
            <TrendingUp className={`w-6 h-6 ${displayScore >= 9 ? 'text-black' : 'text-white'}`} />
          ) : displayScore < 0 ? (
            <TrendingDown className={`w-6 h-6 ${displayScore >= 9 ? 'text-black' : 'text-white'}`} />
          ) : (
            <Activity className={`w-6 h-6 ${displayScore >= 9 ? 'text-black' : 'text-white'}`} />
          )}
        </div>
      </div>

      <div className="text-center mb-4">
        <div className={`text-5xl font-bold ${colors.text}`}>
          {displayScore > 0 ? '+' : ''}{displayScore.toFixed(1)}
        </div>
        <div className={`${displayScore >= 9 ? 'text-black' : 'text-white/70'} text-sm mt-1 font-semibold`}>{sentimentData.label}</div>
      </div>

      <div className="mb-4">
        <div className="relative h-8 bg-gradient-to-r from-red-500 via-slate-400 to-green-500 rounded-full overflow-hidden">
          <div
            className="absolute top-0 bottom-0 w-1 bg-black"
            style={{ left: `${signalPosition}%` }}
          />
        </div>
        <div className={`flex justify-between ${displayScore >= 9 ? 'text-black/70' : 'text-white/60'} text-xs mt-1 font-medium`}>
          <span>-10</span>
          <span>0</span>
          <span>+10</span>
        </div>
      </div>

      {lastUpdated && (
        <div className={`${displayScore >= 9 ? 'text-black/60' : 'text-white/50'} text-xs text-center`}>
          Last updated: {formatTimeAgo(lastUpdated)}
        </div>
      )}
    </button>
  );
}
