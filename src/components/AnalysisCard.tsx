import { TrendingUp, TrendingDown, Activity, AlertCircle, Info } from 'lucide-react';

interface ParsedAnalysis {
  asset: string;
  strategy?: string;
  signal?: string;
  signalNumeric?: number;
  allFields: { label: string; value: string }[];
  summary?: string;
}

interface AnalysisCardProps {
  indicator: string;
  result: string;
}

const parseAnalysisText = (text: string): ParsedAnalysis | null => {
  try {
    // Try to parse as JSON first
    const jsonData = JSON.parse(text);
    const parsed: ParsedAnalysis = {
      asset: jsonData.Asset || '',
      allFields: [],
      summary: jsonData.Summary || jsonData.Reason || undefined,
    };

    // Extract Signal (main signal value) - prioritize "Analytical Score" over "Signal" and "Trade Signal"
    if (jsonData['Analytical Score'] !== undefined) {
      parsed.signalNumeric = parseFloat(jsonData['Analytical Score']);
    } else if (jsonData.Signal !== undefined) {
      parsed.signalNumeric = parseFloat(jsonData.Signal);
    } else if (jsonData['Trade Signal'] !== undefined) {
      parsed.signalNumeric = parseFloat(jsonData['Trade Signal']);
    }

    // Map all fields except Analytical Score, Signal, Trade Signal, Asset, Summary, and Reason
    Object.entries(jsonData).forEach(([key, value]) => {
      if (key !== 'Analytical Score' && key !== 'Signal' && key !== 'Trade Signal' && key !== 'Asset' && key !== 'Summary' && key !== 'Reason') {
        parsed.allFields.push({
          label: key,
          value: String(value),
        });
      }
    });

    return parsed;
  } catch (jsonError) {
    // Fall back to text parsing
    try {
      const lines = text.split('\n').filter(line => line.trim());
      const parsed: ParsedAnalysis = {
        asset: '',
        allFields: [],
      };

      let summaryStartIndex = -1;

      for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();

        if (line.toLowerCase().includes('summary:')) {
          summaryStartIndex = i;
          break;
        }

        if (line.includes(':')) {
          const colonIndex = line.indexOf(':');
          const label = line.substring(0, colonIndex).trim();
          const value = line.substring(colonIndex + 1).trim();

          if (label && value) {
            const cleanLabel = label.replace(/\*/g, '').trim();
            const lowerLabel = cleanLabel.toLowerCase();

            if (lowerLabel === 'asset') {
              parsed.asset = value;
            } else if (lowerLabel === 'strategy') {
              parsed.strategy = value;
            } else if (lowerLabel === 'signal score') {
              const cleanValue = value.replace(/\*/g, '').trim();
              const numericValue = parseFloat(cleanValue);
              if (!isNaN(numericValue)) {
                parsed.signalNumeric = numericValue;
              }
            } else if (lowerLabel === 'signal' && !lowerLabel.includes('score') && !lowerLabel.includes('correlation')) {
              parsed.signal = value;
            }

            parsed.allFields.push({ label, value });
          }
        }
      }

      if (summaryStartIndex !== -1) {
        const summaryLines = lines.slice(summaryStartIndex + 1);
        parsed.summary = summaryLines.join(' ').trim();
      }

      return parsed;
    } catch (error) {
      console.error('Error parsing analysis:', error);
      return null;
    }
  }
};

const inferSignalFromText = (text: string): number => {
  const cleaned = text.toLowerCase().replace(/\*/g, '').trim();

  if (cleaned.includes('strong buy') || cleaned.includes('very bullish')) return 8.8;
  if (cleaned === 'buy' || cleaned.includes('bullish')) return 6.5;
  if (cleaned.includes('slightly bullish') || cleaned.includes('weak buy')) return 3;
  if (cleaned.includes('neutral') || cleaned.includes('hold')) return 0;
  if (cleaned.includes('slightly bearish') || cleaned.includes('weak sell')) return -3;
  if (cleaned === 'sell' || cleaned.includes('bearish')) return -6.5;
  if (cleaned.includes('strong sell') || cleaned.includes('very bearish')) return -8.8;

  return 0;
};

const getSignalLabel = (value: number): string => {
  if (value >= 7) return 'Highly Positive';
  if (value >= 4) return 'Positive';
  if (value >= 1) return 'Slightly Positive';
  if (value > -1) return 'Neutral';
  if (value >= -4) return 'Slightly Negative';
  if (value >= -7) return 'Negative';
  return 'Highly Negative';
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

const formatFieldLabel = (label: string): string => {
  let formatted = label
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');

  // Replace "Best" with "Top Performing"
  formatted = formatted.replace(/\bBest\b/g, 'Top Performing');

  // Remove fields that contain "Return" or "Weight"
  if (formatted.toLowerCase().includes('return') || formatted.toLowerCase().includes('weight')) {
    return '';
  }

  return formatted;
};

const isNumericField = (value: string): boolean => {
  const cleaned = value.replace(/[,%$]/g, '');
  return !isNaN(parseFloat(cleaned)) && isFinite(parseFloat(cleaned));
};

export default function AnalysisCard({ indicator, result }: AnalysisCardProps) {
  console.log('AnalysisCard received result:', result);
  const parsed = parseAnalysisText(result);
  console.log('Parsed analysis:', parsed);

  if (!parsed) {
    return (
      <div className="bg-slate-900 border border-slate-700 rounded-xl p-6">
        <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <Activity className="w-5 h-5 text-amber-500" />
          {indicator}
        </h2>
        <div className="bg-slate-800 rounded-lg p-4">
          <pre className="text-slate-300 whitespace-pre-wrap break-words text-sm">
            {result}
          </pre>
        </div>
      </div>
    );
  }

  let signalValue = parsed.signalNumeric !== undefined ? parsed.signalNumeric : 0;

  if (signalValue === 0 && parsed.signal) {
    signalValue = inferSignalFromText(parsed.signal);
  }

  const colors = getSignalColors(signalValue);
  const signalLabel = getSignalLabel(signalValue);
  const signalPosition = ((signalValue + 10) / 20) * 100;

  const mainFields = parsed.allFields.filter(f =>
    !f.label.toLowerCase().includes('asset') &&
    !f.label.toLowerCase().includes('strategy') &&
    !f.label.toLowerCase().includes('summary') &&
    !f.label.toLowerCase().includes('return')
  );

  const isGold = signalValue >= 9;

  return (
    <div className={`${colors.bg} ${colors.border} border-2 rounded-xl p-6 shadow-lg transition-all duration-300`}>
      <div className="flex items-start justify-between mb-4">
        <div className={`${isGold ? 'text-black/60' : 'text-white/60'} text-sm font-bold`}>{indicator}</div>
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
        <div className={`${isGold ? 'text-black/70' : 'text-white/70'} text-sm`}>{parsed.signal || signalLabel}</div>
      </div>

      <div className="mb-4">
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

      {parsed.summary && (
        <div className={`${isGold ? 'bg-black/10' : 'bg-white/10'} rounded-lg p-3 mb-4`}>
          <div className="flex items-start gap-2">
            <AlertCircle className={`w-4 h-4 ${isGold ? 'text-black/70' : 'text-white/70'} mt-0.5 flex-shrink-0`} />
            <p className={`${isGold ? 'text-black/90' : 'text-white/90'} text-sm leading-relaxed`}>{parsed.summary.replace(/\*/g, '')}</p>
          </div>
        </div>
      )}

      {mainFields.length > 0 && (
        <div className={`${isGold ? 'bg-black/10' : 'bg-white/10'} rounded-lg p-4`}>
          <div className={`flex items-center gap-2 ${isGold ? 'text-black/90' : 'text-white/90'} text-xs font-bold mb-3 uppercase tracking-wide`}>
            <Info className="w-4 h-4" />
            <span>Analysis Details</span>
          </div>
          <div className="space-y-2.5">
            {mainFields.map((field, index) => {
              const formattedLabel = formatFieldLabel(field.label);
              if (!formattedLabel) return null;
              return (
                <div key={index} className="flex justify-between items-center gap-4">
                  <span className={`${isGold ? 'text-black/70' : 'text-white/70'} text-sm`}>{formattedLabel}</span>
                  <span className={`${isGold ? 'text-black' : 'text-white'} font-semibold text-sm ${
                    isNumericField(field.value) ? 'font-mono' : ''
                  }`}>
                    {field.value}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
