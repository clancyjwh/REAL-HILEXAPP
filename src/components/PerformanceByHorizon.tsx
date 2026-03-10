import { Activity } from 'lucide-react';
import { useParams } from 'react-router-dom';
import CompactHorizonCard from './CompactHorizonCard';

interface BacktestReport {
  Horizon_30d?: HorizonData;
  Horizon_60d?: HorizonData;
  Horizon_90d?: HorizonData;
  Horizon_120d?: HorizonData;
  Horizon_150d?: HorizonData;
  Horizon_180d?: HorizonData;
  '30d'?: HorizonDataLowercase;
  '60d'?: HorizonDataLowercase;
  '90d'?: HorizonDataLowercase;
  '120d'?: HorizonDataLowercase;
  '150d'?: HorizonDataLowercase;
  '180d'?: HorizonDataLowercase;
  horizons?: Array<TradingBacktestHorizon> | {
    '30d'?: HorizonDataLowercase;
    '60d'?: HorizonDataLowercase;
    '90d'?: HorizonDataLowercase;
    '120d'?: HorizonDataLowercase;
    '150d'?: HorizonDataLowercase;
    '180d'?: HorizonDataLowercase;
  };
  Summary?: {
    Cumulative_Result?: {
      Total_Value?: string;
      Net_Gain?: string;
    };
    Best_Timeframe?: string;
  };
  summary?: {
    cumulative_result?: string;
    best_timeframe?: string;
    '30d'?: string;
    '60d'?: string;
    '90d'?: string;
    '120d'?: string;
    '150d'?: string;
    '180d'?: string;
    suggested_improvements?: string[];
  };
  cumulative_result?: {
    total_value?: string;
    net_gain?: string;
  };
  best_timeframe?: string;
  title?: string;
  Cumulative_Result?: string;
  Best_Timeframe?: string;
  Suggested_Improvements?: string[];
}

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

interface TradingBacktestHorizon {
  Horizon: string;
  Outcome: string;
  Original_Signal: string;
  Confidence: number;
  Ideal_Setup: string;
  Performance: string;
}

interface RateOfChange {
  Score?: number;
  Rate_of_change?: number;
  Best_Bullish?: number;
  Best_Bearish?: number;
  Bullish_Correlation?: number;
  Summary?: string;
}

interface PerformanceByHorizonProps {
  data: BacktestReport | string;
  assetName: string;
  rateOfChange?: RateOfChange;
}


const parseMarkdownBacktestReport = (markdown: string): BacktestReport => {
  const result: BacktestReport = {};

  const horizonPatterns = [
    /###\s*Horizon:\s*(\d+)d\s*\n\*\*Outcome:\*\*\s*(.+?)\n\*\*Original Signal:\*\*\s*(.+?)\n\*\*Confidence:\*\*\s*([\d.]+)\s*\n\*\*Ideal Setup:\*\*\s*(.+?)\n\*\*Performance:\*\*\s*(.+?)(?=\n---|\n###|$)/gis,
    /###\s*Horizon:\s*(\d+)d.*?\n.*?Outcome:?\*?\*?\s*(.+?)\n.*?Original Signal:?\*?\*?\s*(.+?)\n.*?Confidence:?\*?\*?\s*([\d.]+).*?\n.*?Ideal Setup:?\*?\*?\s*(.+?)\n.*?Performance:?\*?\*?\s*(.+?)(?=\n---|\n###|$)/gis,
    /Horizon[:\s]+(\d+)d.*?Outcome[:\s]+(.+?)(?:\n|$).*?Original Signal[:\s]+(.+?)(?:\n|$).*?Confidence[:\s]+([\d.]+).*?Ideal Setup[:\s]+(.+?)(?:\n|$).*?Performance[:\s]+(.+?)(?=\n---|\n###|Horizon|$)/gis,
  ];

  for (const horizonPattern of horizonPatterns) {
    let match;
    horizonPattern.lastIndex = 0;
    while ((match = horizonPattern.exec(markdown)) !== null) {
      const [, days, outcome, signal, confidence, setup, performance] = match;
      const horizonKey = `${days}d` as '30d' | '60d' | '90d' | '120d' | '150d' | '180d';

      if (!result[horizonKey]) {
        result[horizonKey] = {
          outcome: outcome.trim(),
          original_signal: signal.trim(),
          confidence: parseFloat(confidence),
          ideal_setup: setup.trim(),
          performance: performance.trim(),
        };
      }
    }
  }

  const cumulativeMatch = markdown.match(/\*\*Cumulative Result.*?\*\*\s*\n(.+?)(?=\n\n|\*\*Best)/is);
  if (cumulativeMatch) {
    result.summary = {
      cumulative_result: cumulativeMatch[1].trim(),
    };
  }

  const bestTimeframeMatch = markdown.match(/\*\*Best Timeframe:\*\*\s*(.+?)(?=\n\n|\*\*Suggested|$)/is);
  if (bestTimeframeMatch && result.summary) {
    result.summary.best_timeframe = bestTimeframeMatch[1].trim();
  }

  return result;
};

const parseOptimizedParametersFormat = (data: any): BacktestReport => {
  const result: BacktestReport = {};

  const horizonKeys = ['30', '60', '90', '120', '150', '180'];

  horizonKeys.forEach(days => {
    if (data[days]) {
      try {
        const horizonData = typeof data[days] === 'string' ? JSON.parse(data[days]) : data[days];

        const resultField = horizonData['Result 30'] || horizonData['result 30'] || horizonData.result || horizonData.Result || '';
        const predictionField = horizonData['Prediction 30'] || horizonData['prediction 30'] || horizonData.prediction || horizonData.Prediction || '';
        const signalField = horizonData['Signal 30'] || horizonData['signal 30'] || horizonData.signal || horizonData.Signal || 0;

        console.log(`Parsing ${days}d horizon:`, { resultField, predictionField, signalField, allKeys: Object.keys(horizonData) });

        const outcomeMatch = resultField.match(/(UP|DOWN)\s+([+-]?[\d.]+)/);
        const outcome = outcomeMatch ? `${outcomeMatch[1]} ${outcomeMatch[2]}%` : resultField;

        const predictionDirection = predictionField.toString().toUpperCase().trim();
        const resultDirection = outcomeMatch ? outcomeMatch[1].toUpperCase().trim() : '';

        let isCorrect = false;
        if (resultDirection && predictionDirection) {
          if (predictionDirection === 'BUY' && resultDirection === 'UP') {
            isCorrect = true;
          } else if (predictionDirection === 'SELL' && resultDirection === 'DOWN') {
            isCorrect = true;
          } else {
            isCorrect = false;
          }
        }

        result[`${days}d` as '30d' | '60d' | '90d' | '120d' | '150d' | '180d'] = {
          outcome: outcome,
          original_signal: predictionField,
          prediction_accuracy: isCorrect ? 'Accurate ✓' : 'Inaccurate',
          confidence: typeof signalField === 'number' ? Math.abs(signalField) * 10 : 0,
          ideal_setup: '',
          performance: '',
        };
      } catch (e) {
        console.error(`Error parsing horizon ${days}:`, e);
      }
    }
  });

  return result;
};

const convertTradingBacktestToStandard = (data: BacktestReport): BacktestReport => {
  if (!Array.isArray(data.horizons)) return data;

  const result: BacktestReport = {};

  data.horizons.forEach((horizon: TradingBacktestHorizon) => {
    const days = horizon.Horizon;
    result[days as '30d' | '60d' | '90d' | '120d' | '150d' | '180d'] = {
      outcome: horizon.Outcome,
      original_signal: horizon.Original_Signal,
      confidence: horizon.Confidence,
      ideal_setup: horizon.Ideal_Setup,
      performance: horizon.Performance,
    };
  });

  if (data.Cumulative_Result || data.Best_Timeframe) {
    result.summary = {
      cumulative_result: data.Cumulative_Result,
      best_timeframe: data.Best_Timeframe,
    };
  }

  return result;
};

export default function PerformanceByHorizon({ data, assetName, rateOfChange }: PerformanceByHorizonProps) {
  const { category, symbol } = useParams<{ category: string; symbol: string }>();

  let parsedData: BacktestReport = typeof data === 'string' ? parseMarkdownBacktestReport(data) : data;

  if (parsedData['30'] || parsedData['60'] || parsedData['90'] || parsedData['120'] || parsedData['150'] || parsedData['180']) {
    parsedData = parseOptimizedParametersFormat(parsedData);
  } else if (Array.isArray(parsedData.horizons)) {
    parsedData = convertTradingBacktestToStandard(parsedData);
  }

  const horizons = [
    { key: '30d', label: '30d', data: parsedData['30d'] || parsedData.Horizon_30d || parsedData.horizons?.['30d'] },
    { key: '60d', label: '60d', data: parsedData['60d'] || parsedData.Horizon_60d || parsedData.horizons?.['60d'] },
    { key: '90d', label: '90d', data: parsedData['90d'] || parsedData.Horizon_90d || parsedData.horizons?.['90d'] },
    { key: '120d', label: '120d', data: parsedData['120d'] || parsedData.Horizon_120d || parsedData.horizons?.['120d'] },
    { key: '150d', label: '150d', data: parsedData['150d'] || parsedData.Horizon_150d || parsedData.horizons?.['150d'] },
    { key: '180d', label: '180d', data: parsedData['180d'] || parsedData.Horizon_180d || parsedData.horizons?.['180d'] },
  ].filter(h => h.data);

  if (horizons.length === 0) return null;

  const summary = parsedData.Summary || {
    Cumulative_Result: parsedData.cumulative_result ? {
      Total_Value: parsedData.cumulative_result.total_value,
      Net_Gain: parsedData.cumulative_result.net_gain,
    } : parsedData.summary?.cumulative_result ? {
      Total_Value: parsedData.summary.cumulative_result,
      Net_Gain: undefined,
    } : undefined,
    Best_Timeframe: parsedData.best_timeframe || parsedData.summary?.best_timeframe,
  };

  return (
    <div className="mb-8">
      <div className="mb-6 flex items-center gap-3">
        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center">
          <Activity className="w-6 h-6 text-white" />
        </div>
        <h2 className="text-3xl font-bold text-white">Performance by Horizon</h2>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4 mb-6">
        {horizons.map(({ key, label, data: horizonData }) => {
          if (!horizonData || !category || !symbol) return null;

          return (
            <CompactHorizonCard
              key={key}
              horizonLabel={label}
              horizonKey={key}
              data={horizonData as any}
              category={category}
              symbol={symbol}
            />
          );
        })}
      </div>

      {summary && (summary.Cumulative_Result || summary.Best_Timeframe) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {summary.Cumulative_Result && (
            <div className="bg-gradient-to-br from-blue-900/30 to-blue-800/30 border-2 border-blue-500/50 rounded-2xl p-6 shadow-xl">
              <h3 className="text-2xl font-bold text-blue-300 mb-3">Cumulative Result</h3>
              <div className="space-y-2">
                {summary.Cumulative_Result.Total_Value && (
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">Total Value:</span>
                    <span className="text-white font-bold text-xl">
                      {summary.Cumulative_Result.Total_Value}
                    </span>
                  </div>
                )}
                {summary.Cumulative_Result.Net_Gain && (
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">Net Gain:</span>
                    <span
                      className={`font-bold text-xl ${
                        summary.Cumulative_Result.Net_Gain.startsWith('+') ||
                        summary.Cumulative_Result.Net_Gain.startsWith('$') && !summary.Cumulative_Result.Net_Gain.includes('-')
                          ? 'text-green-400'
                          : summary.Cumulative_Result.Net_Gain.includes('-')
                          ? 'text-red-400'
                          : 'text-white'
                      }`}
                    >
                      {summary.Cumulative_Result.Net_Gain}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          {summary.Best_Timeframe && (
            <div className="bg-gradient-to-br from-green-900/30 to-green-800/30 border-2 border-green-500/50 rounded-2xl p-6 shadow-xl">
              <h3 className="text-2xl font-bold text-green-300 mb-3">Top Performing Timeframe</h3>
              <p className="text-slate-300 leading-relaxed">{summary.Best_Timeframe.replace(/\*/g, '')}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
