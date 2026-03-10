import { TrendingUp, TrendingDown, Activity } from 'lucide-react';

interface CompactAnalysisCardProps {
  indicator: string;
  result: string;
  onClick: () => void;
}

const parseAnalysisText = (text: string): { signalNumeric?: number } => {
  try {
    const jsonData = JSON.parse(text);

    if (jsonData['Analytical Score'] !== undefined) {
      return { signalNumeric: parseFloat(jsonData['Analytical Score']) };
    } else if (jsonData.Signal !== undefined) {
      return { signalNumeric: parseFloat(jsonData.Signal) };
    } else if (jsonData['Trade Signal'] !== undefined) {
      return { signalNumeric: parseFloat(jsonData['Trade Signal']) };
    }
  } catch (error) {
    console.error('Error parsing analysis:', error);
  }

  return {};
};

const getSignalColors = (value: number) => {
  if (value >= 9) return { bg: 'bg-[linear-gradient(145deg,#FFFDF5_0%,#FFF3CC_35%,#EBD48E_70%,#C9A43B_100%)] bg-[length:200%_200%] animate-[shimmer_4s_linear_infinite] shadow-[0_0_20px_rgba(201,164,59,0.8),0_0_40px_rgba(235,212,142,0.4),0_0_60px_rgba(255,253,245,0.2)]', border: 'border-yellow-400', text: 'text-black' };
  if (value >= 7) return { bg: 'bg-green-900', border: 'border-green-700', text: 'text-green-300' };
  if (value >= 4) return { bg: 'bg-green-700', border: 'border-green-600', text: 'text-green-200' };
  if (value >= 1) return { bg: 'bg-green-500', border: 'border-green-400', text: 'text-green-100' };
  if (value > -1) return { bg: 'bg-slate-600', border: 'border-slate-500', text: 'text-slate-200' };
  if (value >= -4) return { bg: 'bg-orange-500', border: 'border-orange-400', text: 'text-orange-100' };
  if (value >= -7) return { bg: 'bg-red-600', border: 'border-red-500', text: 'text-red-100' };
  if (value <= -9) return { bg: 'bg-gradient-to-br from-red-900 to-red-950', border: 'border-red-600', text: 'text-red-200' };
  return { bg: 'bg-red-900', border: 'border-red-700', text: 'text-red-300' };
};

export default function CompactAnalysisCard({ indicator, result, onClick }: CompactAnalysisCardProps) {
  const parsed = parseAnalysisText(result);
  const signalValue = parsed.signalNumeric ?? 0;
  const colors = getSignalColors(signalValue);
  const signalPosition = ((signalValue + 10) / 20) * 100;
  const isGold = signalValue >= 9;

  return (
    <button
      onClick={onClick}
      className={`${colors.bg} ${colors.border} border-2 rounded-xl p-6 shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-xl w-full text-left cursor-pointer`}
    >
      <div className="flex items-start justify-between mb-4">
        <div className={`${isGold ? 'text-black/60' : 'text-white/60'} text-sm font-bold`}>
          {indicator}
        </div>
        <div className={`p-2 ${isGold ? 'bg-black/20' : 'bg-white/20'} rounded-full`}>
          {signalValue > 0 ? (
            <TrendingUp className={`w-6 h-6 ${isGold ? 'text-black' : 'text-white'}`} />
          ) : signalValue < 0 ? (
            <TrendingDown className={`w-6 h-6 ${isGold ? 'text-black' : 'text-white'}`} />
          ) : (
            <Activity className={`w-6 h-6 ${isGold ? 'text-black' : 'text-white'}`} />
          )}
        </div>
      </div>

      <div className="text-center mb-4">
        <div className={`text-6xl font-bold ${colors.text} mb-2`}>
          {signalValue > 0 ? '+' : ''}{signalValue.toFixed(1)}
        </div>
      </div>

      <div className="mb-2">
        <div className="relative h-8 bg-gradient-to-r from-red-500 via-slate-400 to-green-500 rounded-full overflow-hidden">
          <div
            className="absolute top-0 bottom-0 w-1 bg-black shadow-lg"
            style={{ left: `${signalPosition}%` }}
          />
        </div>
        <div className={`flex justify-between ${isGold ? 'text-black/60' : 'text-white/60'} text-xs mt-1`}>
          <span>-10</span>
          <span>0</span>
          <span>+10</span>
        </div>
      </div>
    </button>
  );
}
