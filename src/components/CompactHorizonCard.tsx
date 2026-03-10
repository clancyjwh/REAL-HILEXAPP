import { CheckCircle, XCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface HorizonData {
  Outcome: string;
  Original_Signal: string;
  Prediction_Accuracy?: string;
  Confidence: number;
  Ideal_Setup: string;
  Performance: string;
}

interface HorizonDataLowercase {
  outcome: string;
  original_signal: string;
  prediction_accuracy?: string;
  confidence: number;
  ideal_setup: string;
  performance: string;
}

interface CompactHorizonCardProps {
  horizonLabel: string;
  horizonKey: string;
  data: HorizonData | HorizonDataLowercase;
  category: string;
  symbol: string;
}

const normalizeHorizonData = (data: HorizonData | HorizonDataLowercase): HorizonData => {
  const lower = data as HorizonDataLowercase;
  const anyData = data as any;

  let outcome = anyData.Outcome || lower.outcome || anyData.outcome || '';
  const confidence = anyData.Confidence || lower.confidence || anyData.confidence || 0;

  if (outcome && !outcome.includes('%') && confidence) {
    outcome = `${outcome} ${confidence > 0 ? '+' : ''}${confidence}%`;
  }

  return {
    Outcome: outcome,
    Original_Signal: anyData.Original_Signal || lower.original_signal || anyData.original_signal || anyData.signal || anyData.Signal || '',
    Prediction_Accuracy: anyData.Prediction_Accuracy || lower.prediction_accuracy || anyData.prediction_accuracy || anyData['Prediction Accuracy'] || undefined,
    Confidence: confidence,
    Ideal_Setup: anyData.Ideal_Setup || lower.ideal_setup || anyData.ideal_setup || anyData.setup || '',
    Performance: anyData.Performance || lower.performance || anyData.performance || '',
  };
};

const parseOutcome = (outcome: string) => {
  const upMatch = outcome.match(/UP\s+\+?([\d.]+)%/i);
  const downMatch = outcome.match(/DOWN\s+[−\u2212\-]?([\d.]+)%/i);

  if (upMatch) {
    return {
      direction: 'UP' as const,
      percentage: parseFloat(upMatch[1]),
    };
  }

  if (downMatch) {
    return {
      direction: 'DOWN' as const,
      percentage: parseFloat(downMatch[1]),
    };
  }

  return null;
};

const extractSignalDirection = (signal: string): 'UP' | 'DOWN' | null => {
  if (!signal || typeof signal !== 'string') return null;

  const normalized = signal.toUpperCase().trim();

  if (normalized.includes('DOWN') || normalized.includes('SELL') || normalized.includes('BEARISH')) {
    return 'DOWN';
  }

  if (normalized.includes('UP') || normalized.includes('BUY') || normalized.includes('BULLISH')) {
    return 'UP';
  }

  return null;
};

export default function CompactHorizonCard({ horizonLabel, horizonKey, data, category, symbol }: CompactHorizonCardProps) {
  const navigate = useNavigate();
  const normalized = normalizeHorizonData(data as any);
  const outcomeData = parseOutcome(normalized.Outcome);
  const signalDirection = extractSignalDirection(normalized.Original_Signal);

  const predictionAccuracy = normalized.Prediction_Accuracy;
  const isCorrect = predictionAccuracy?.toLowerCase().includes('correct') || predictionAccuracy?.toLowerCase().includes('accurate');
  const isIncorrect = predictionAccuracy?.toLowerCase().includes('incorrect') || predictionAccuracy?.toLowerCase().includes('inaccurate');

  const handleClick = () => {
    navigate(`/top-picks/${category}/${symbol}/horizon/${horizonKey}`);
  };

  const getBoxColor = () => {
    if (isCorrect) {
      return 'bg-slate-900/50 border-cyan-500/50';
    } else if (isIncorrect) {
      return 'bg-slate-900/50 border-cyan-500/50';
    }
    return 'bg-slate-900/50 border-cyan-500/50';
  };

  return (
    <button
      onClick={handleClick}
      className={`rounded-xl border-2 p-5 shadow-lg transition-all hover:shadow-xl hover:scale-105 cursor-pointer text-left ${getBoxColor()}`}
    >
      <div className="mb-4 pb-3 border-b border-cyan-500/30">
        <h3 className="text-3xl font-bold text-white">{horizonLabel}</h3>
        <div className="text-xs text-cyan-400 uppercase tracking-wider font-semibold">Backtest Horizon</div>
      </div>

      <div className="space-y-3">
        <div>
          <div className="text-xs text-cyan-400 mb-1 uppercase tracking-wider font-semibold">Outcome</div>
          {outcomeData ? (
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0" />
              <span className="font-bold text-base text-green-400">
                {outcomeData.direction}
              </span>
            </div>
          ) : (
            <div className="text-slate-500 text-sm italic">N/A</div>
          )}
        </div>

        <div>
          <div className="text-xs text-cyan-400 mb-1 uppercase tracking-wider font-semibold">Original Signal</div>
          {signalDirection ? (
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0" />
              <span className="text-base font-bold text-green-400">
                {signalDirection}
              </span>
            </div>
          ) : (
            <div className="text-slate-500 text-sm italic">N/A</div>
          )}
        </div>

        {predictionAccuracy && (
          <div>
            <div className="text-xs text-cyan-400 mb-1 uppercase tracking-wider font-semibold">Prediction Accuracy</div>
            <div className="flex items-center gap-2">
              {isCorrect ? (
                <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
              ) : isIncorrect ? (
                <XCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
              ) : null}
              <span
                className={`font-bold text-base ${
                  isCorrect ? 'text-green-400' : isIncorrect ? 'text-red-400' : 'text-slate-300'
                }`}
              >
                {predictionAccuracy}
              </span>
            </div>
          </div>
        )}
      </div>
    </button>
  );
}
