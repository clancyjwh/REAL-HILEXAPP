import { CheckCircle, XCircle } from 'lucide-react';

interface BacktestCardsProps {
  backtestData: Record<string, string>;
  onCardClick?: (days: string) => void;
}

interface TimeHorizonData {
  Result: string;
  Signal: string;
  Correct: string;
  Daysback: string;
  Prediction: string;
}

export default function BacktestCards({ backtestData, onCardClick }: BacktestCardsProps) {
  const parseHorizonData = (jsonString: string): TimeHorizonData | null => {
    try {
      return JSON.parse(jsonString);
    } catch {
      return null;
    }
  };

  const timeHorizons = ['30', '60', '90', '120', '150', '180', '210', '240', '270', '300', '330', '360'];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {timeHorizons.map((days) => {
        const horizonDataString = backtestData[days];
        if (!horizonDataString || typeof horizonDataString !== 'string') {
          return (
            <div
              key={days}
              className="bg-slate-900/50 border-2 border-slate-700 rounded-xl p-6 flex flex-col items-center justify-center opacity-50"
            >
              <div className="text-3xl font-bold text-slate-500">{days}</div>
              <div className="text-slate-500 text-sm mt-1">days</div>
              <div className="text-sm font-semibold text-slate-500 mt-2">No Data</div>
            </div>
          );
        }

        const horizonData = parseHorizonData(horizonDataString);
        if (!horizonData) {
          return (
            <div
              key={days}
              className="bg-slate-900/50 border-2 border-slate-700 rounded-xl p-6 flex flex-col items-center justify-center opacity-50"
            >
              <div className="text-3xl font-bold text-slate-500">{days}</div>
              <div className="text-slate-500 text-sm mt-1">days</div>
              <div className="text-sm font-semibold text-slate-500 mt-2">Invalid Data</div>
            </div>
          );
        }

        const isCorrect = horizonData.Correct === 'true';
        const bgColor = isCorrect ? 'bg-green-900/40' : 'bg-red-900/40';
        const borderColor = isCorrect ? 'border-green-600/50' : 'border-red-600/50';
        const textColor = isCorrect ? 'text-green-400' : 'text-red-400';

        return (
          <div
            key={days}
            onClick={() => onCardClick?.(days)}
            className={`${bgColor} border-2 ${borderColor} rounded-xl p-6 flex flex-col items-center justify-center ${
              onCardClick ? 'cursor-pointer hover:scale-105 transition-transform duration-200' : ''
            }`}
          >
            <div className="flex items-center justify-center w-full mb-2">
              {isCorrect ? (
                <CheckCircle className="w-5 h-5 text-green-400" />
              ) : (
                <XCircle className="w-5 h-5 text-red-400" />
              )}
            </div>
            <div className={`text-4xl font-bold ${textColor}`}>{days}</div>
            <div className="text-slate-400 text-sm mt-1">days</div>
            <div className={`text-lg font-semibold ${textColor} mt-2`}>
              {isCorrect ? 'Accurate' : 'Inaccurate'}
            </div>
          </div>
        );
      })}
    </div>
  );
}
