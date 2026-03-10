import { useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft, TrendingUp, TrendingDown, Activity, AlertCircle, Info, Clock } from 'lucide-react';

interface ParsedAnalysis {
  asset: string;
  strategy?: string;
  signal?: string;
  signalNumeric?: number;
  allFields: { label: string; value: string }[];
  summary?: string;
}

const parseAnalysisText = (text: string): ParsedAnalysis | null => {
  try {
    const jsonData = JSON.parse(text);
    const parsed: ParsedAnalysis = {
      asset: jsonData.Asset || '',
      allFields: [],
      summary: jsonData.Summary || jsonData.Reason || undefined,
    };

    if (jsonData['Analytical Score'] !== undefined) {
      parsed.signalNumeric = parseFloat(jsonData['Analytical Score']);
    } else if (jsonData.Signal !== undefined) {
      parsed.signalNumeric = parseFloat(jsonData.Signal);
    } else if (jsonData['Trade Signal'] !== undefined) {
      parsed.signalNumeric = parseFloat(jsonData['Trade Signal']);
    }

    Object.entries(jsonData).forEach(([key, value]) => {
      if (key !== 'Analytical Score' && key !== 'Signal' && key !== 'Trade Signal' && key !== 'Asset' && key !== 'Summary' && key !== 'Reason') {
        parsed.allFields.push({
          label: key,
          value: String(value),
        });
      }
    });

    return parsed;
  } catch (error) {
    console.error('Error parsing analysis:', error);
    return null;
  }
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

  formatted = formatted.replace(/\bBest\b/g, 'Top Performing');

  if (formatted.toLowerCase().includes('return') || formatted.toLowerCase().includes('weight')) {
    return '';
  }

  return formatted;
};

const isNumericField = (value: string): boolean => {
  const cleaned = value.replace(/[,%$]/g, '');
  return !isNaN(parseFloat(cleaned)) && isFinite(parseFloat(cleaned));
};

const getFieldColor = (label: string, value: string): { label: string; value: string } => {
  const lowerLabel = label.toLowerCase();

  if (lowerLabel.includes('rsi')) return { label: 'text-cyan-300', value: 'text-cyan-400' };
  if (lowerLabel.includes('price')) return { label: 'text-emerald-300', value: 'text-emerald-400' };
  if (lowerLabel.includes('test') && lowerLabel.includes('count')) return { label: 'text-blue-300', value: 'text-blue-400' };
  if (lowerLabel.includes('current') && lowerLabel.includes('oversold')) return { label: 'text-orange-300', value: 'text-orange-400' };
  if (lowerLabel.includes('current') && lowerLabel.includes('overbought')) return { label: 'text-rose-300', value: 'text-rose-400' };
  if (lowerLabel.includes('accuracy') || lowerLabel.includes('percentage')) return { label: 'text-green-300', value: 'text-green-400' };
  if (lowerLabel.includes('top performing') && lowerLabel.includes('oversold')) return { label: 'text-amber-300', value: 'text-amber-400' };
  if (lowerLabel.includes('top performing') && lowerLabel.includes('overbought')) return { label: 'text-pink-300', value: 'text-pink-400' };
  if (lowerLabel.includes('top performing') && lowerLabel.includes('period')) return { label: 'text-violet-300', value: 'text-violet-400' };
  if (lowerLabel.includes('sma') || lowerLabel.includes('moving average')) return { label: 'text-purple-300', value: 'text-purple-400' };
  if (lowerLabel.includes('horizon') || lowerLabel.includes('period')) return { label: 'text-indigo-300', value: 'text-indigo-400' };
  if (lowerLabel.includes('depth') || lowerLabel.includes('backtest')) return { label: 'text-sky-300', value: 'text-sky-400' };
  if (lowerLabel.includes('trend') || lowerLabel.includes('strength')) return { label: 'text-teal-300', value: 'text-teal-400' };
  if (lowerLabel.includes('level')) return { label: 'text-fuchsia-300', value: 'text-fuchsia-400' };

  return { label: 'text-slate-300', value: 'text-white' };
};

export default function AnalysisDetailPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { indicator, result, ticker, returnState, searchParams } = location.state || {};

  if (!indicator || !result) {
    navigate('/tools/analysis');
    return null;
  }

  const handleBack = () => {
    if (returnState) {
      const currentParams = new URLSearchParams(window.location.search);
      const indicatorsParam = currentParams.get('indicators');
      const searchUrl = indicatorsParam
        ? `/tools/analysis/search?indicators=${indicatorsParam}`
        : '/tools/analysis/search';
      navigate(searchUrl, { state: returnState });
    } else {
      navigate(-1);
    }
  };

  const parsed = parseAnalysisText(result);

  if (!parsed) {
    return (
      <div className="min-h-screen pb-12">
        <button
          onClick={handleBack}
          className="flex items-center gap-2 text-slate-400 hover:text-white mb-8 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back</span>
        </button>
        <div className="bg-slate-900 border border-slate-700 rounded-xl p-6">
          <p className="text-slate-300">Unable to parse analysis data</p>
        </div>
      </div>
    );
  }

  const signalValue = parsed.signalNumeric ?? 0;
  const colors = getSignalColors(signalValue);
  const signalLabel = getSignalLabel(signalValue);
  const signalPosition = ((signalValue + 10) / 20) * 100;
  const isGold = signalValue >= 9;

  const mainFields = parsed.allFields.filter(f =>
    !f.label.toLowerCase().includes('asset') &&
    !f.label.toLowerCase().includes('strategy') &&
    !f.label.toLowerCase().includes('summary') &&
    !f.label.toLowerCase().includes('return')
  );

  return (
    <div className="min-h-screen pb-12">
      <button
        onClick={handleBack}
        className="flex items-center gap-2 text-slate-400 hover:text-white mb-8 transition-colors"
      >
        <ArrowLeft className="w-5 h-5" />
        <span>Back to Analysis</span>
      </button>

      <div className="mb-4">
        <h1 className="text-4xl font-bold text-white mb-2">{indicator}</h1>
        {ticker && <p className="text-slate-400 text-lg">{ticker}</p>}
      </div>

      <div className={`${colors.bg} ${colors.border} border-2 rounded-xl p-8 shadow-lg mb-6`}>
        <div className="flex items-start justify-between mb-6">
          <div className={`${isGold ? 'text-black/60' : 'text-white/60'} text-sm font-bold uppercase tracking-wide`}>
            Analytical Score
          </div>
          <div className={`p-3 ${isGold ? 'bg-black/20' : 'bg-white/20'} rounded-full`}>
            {signalValue > 0 ? (
              <TrendingUp className={`w-8 h-8 ${isGold ? 'text-black' : 'text-white'}`} />
            ) : signalValue < 0 ? (
              <TrendingDown className={`w-8 h-8 ${isGold ? 'text-black' : 'text-white'}`} />
            ) : (
              <Activity className={`w-8 h-8 ${isGold ? 'text-black' : 'text-white'}`} />
            )}
          </div>
        </div>

        <div className="text-center mb-6">
          <div className={`text-8xl font-bold ${colors.text} mb-3`}>
            {signalValue > 0 ? '+' : ''}{signalValue.toFixed(1)}
          </div>
          <div className={`${isGold ? 'text-black/70' : 'text-white/70'} text-lg`}>{parsed.signal || signalLabel}</div>
        </div>

        <div className="mb-6">
          <div className="relative h-10 bg-gradient-to-r from-red-500 via-slate-400 to-green-500 rounded-full overflow-hidden">
            <div
              className="absolute top-0 bottom-0 w-1.5 bg-black shadow-lg"
              style={{ left: `${signalPosition}%` }}
            />
          </div>
          <div className={`flex justify-between ${isGold ? 'text-black/60' : 'text-white/60'} text-sm mt-2`}>
            <span>-10</span>
            <span>0</span>
            <span>+10</span>
          </div>
        </div>

        {parsed.summary && (
          <div className={`${isGold ? 'bg-black/10' : 'bg-white/10'} rounded-lg p-4`}>
            <div className="flex items-start gap-3">
              <AlertCircle className={`w-5 h-5 ${isGold ? 'text-black/70' : 'text-white/70'} mt-0.5 flex-shrink-0`} />
              <p className={`${isGold ? 'text-black/90' : 'text-white/90'} text-base leading-relaxed`}>
                {parsed.summary.replace(/\*/g, '')}
              </p>
            </div>
          </div>
        )}
      </div>

      {mainFields.length > 0 && (
        <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-slate-800 border border-cyan-500/20 rounded-xl p-8 mb-6 shadow-[0_0_15px_rgba(6,182,212,0.1)]">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-cyan-500/10 rounded-lg border border-cyan-500/30">
                <Info className="w-5 h-5 text-cyan-400" />
              </div>
              <span className="text-white text-lg font-bold uppercase tracking-wider">Analysis Details</span>
            </div>
            <div className="flex items-center gap-2 text-slate-500 text-xs">
              <Clock className="w-3 h-3" />
              <span>Updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</span>
            </div>
          </div>
          <div className="space-y-0">
            {mainFields.map((field, index) => {
              const formattedLabel = formatFieldLabel(field.label);
              if (!formattedLabel) return null;
              const colors = getFieldColor(field.label, field.value);
              return (
                <div key={index}>
                  <div className="flex justify-between items-center gap-6 py-4 group">
                    <span className={`${colors.label} text-base`}>{formattedLabel}</span>
                    <span className={`${colors.value} font-bold text-base ${
                      isNumericField(field.value) ? 'font-mono' : ''
                    } tracking-wide`}>
                      {field.value}
                    </span>
                  </div>
                  {index < mainFields.length - 1 && (
                    <div className="relative h-[1px] my-0">
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-cyan-500/30 to-transparent"></div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="bg-slate-800 border border-slate-600 rounded-xl p-6">
        <div className="flex items-start gap-3">
          <Info className="w-5 h-5 text-slate-400 mt-0.5 flex-shrink-0" />
          <div>
            <h3 className="text-slate-300 font-semibold mb-2">Historical Accuracy Percentage:</h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              This percentage shows how often signals from the highlighted parameters moved in the expected direction during the backtest. This is historical data only and does not indicate future results.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
