import { TrendingUp, TrendingDown, BarChart3 } from 'lucide-react';

interface RelativeValueData {
  Result?: number | string;
  result?: number | string;
  'Asset Return'?: number | string;
  asset_return?: number | string;
  assetReturn?: number | string;
  'Index Return'?: number | string;
  index_return?: number | string;
  indexReturn?: number | string;
  Summary?: string;
  summary?: string;
  Exchange?: string;
  exchange?: string;
}

interface RelativeValueSectionProps {
  data: RelativeValueData | null;
  symbol: string;
}

const getPercentageColors = (percentage: number) => {
  if (percentage >= 20) return { bg: 'bg-green-500', border: 'border-green-400', text: 'text-white' };
  if (percentage >= 10) return { bg: 'bg-green-600', border: 'border-green-500', text: 'text-white' };
  if (percentage >= 5) return { bg: 'bg-green-700', border: 'border-green-600', text: 'text-white' };
  if (percentage > -5) return { bg: 'bg-slate-700', border: 'border-slate-600', text: 'text-white' };
  if (percentage >= -10) return { bg: 'bg-orange-600', border: 'border-orange-500', text: 'text-white' };
  if (percentage >= -20) return { bg: 'bg-red-700', border: 'border-red-600', text: 'text-white' };
  return { bg: 'bg-red-800', border: 'border-red-700', text: 'text-white' };
};

export default function RelativeValueSection({ data, symbol }: RelativeValueSectionProps) {
  if (!data) return null;

  // Parse relative value data from the structure
  let parsedData = data;

  // If data is a string, parse it
  if (typeof data === 'string') {
    try {
      parsedData = JSON.parse(data);
    } catch (e) {
      console.error('Error parsing relative value data:', e);
      return null;
    }
  }

  // If data has a nested 'relative_value' key, use that
  if (parsedData.relative_value && typeof parsedData.relative_value === 'object') {
    parsedData = parsedData.relative_value;
  }

  // Extract the numerical Result - try multiple possible field names and formats
  let resultValue = 0;
  if (parsedData.Result !== undefined && parsedData.Result !== null && parsedData.Result !== '') {
    resultValue = parseFloat(String(parsedData.Result));
  } else if (parsedData.result !== undefined && parsedData.result !== null && parsedData.result !== '') {
    resultValue = parseFloat(String(parsedData.result));
  }

  // If resultValue is still 0 or NaN, try to extract from summary text
  if (isNaN(resultValue) || resultValue === 0) {
    const rawSummaryText = parsedData.Summary || parsedData.summary || '';
    const percentMatch = rawSummaryText.match(/by\s+([-+]?\d+\.?\d*)\s*%/);
    if (percentMatch) {
      const extractedValue = parseFloat(percentMatch[1]);
      // Determine if it's positive (outperformed) or negative (underperformed)
      if (rawSummaryText.toLowerCase().includes('outperformed')) {
        resultValue = Math.abs(extractedValue);
      } else if (rawSummaryText.toLowerCase().includes('underperformed')) {
        resultValue = -Math.abs(extractedValue);
      } else {
        resultValue = extractedValue;
      }
    }
  }

  const assetReturn = parseFloat(String(parsedData['Asset Return'] || parsedData.asset_return || parsedData.assetReturn || 0));
  const indexReturn = parseFloat(String(parsedData['Index Return'] || parsedData.index_return || parsedData.indexReturn || 0));
  const rawSummary = parsedData.Summary || parsedData.summary || 'No summary available';
  const exchange = parsedData.Exchange || parsedData.exchange || null;

  const summary = exchange
    ? rawSummary.replace(/\bindex\b/gi, exchange).replace(/\bthe the\b/gi, 'the')
    : rawSummary;

  const isPositive = resultValue >= 0;

  // Result box: Green if outperformed (positive), Red if underperformed (negative)
  const resultColors = isPositive
    ? { bg: 'bg-green-700', border: 'border-green-600', text: 'text-white' }
    : { bg: 'bg-red-700', border: 'border-red-600', text: 'text-white' };

  // Asset and Index returns: Green if positive, Red if negative
  const assetColors = assetReturn >= 0
    ? { bg: 'bg-green-700', border: 'border-green-600', text: 'text-white' }
    : { bg: 'bg-red-700', border: 'border-red-600', text: 'text-white' };
  const indexColors = indexReturn >= 0
    ? { bg: 'bg-green-700', border: 'border-green-600', text: 'text-white' }
    : { bg: 'bg-red-700', border: 'border-red-600', text: 'text-white' };

  return (
    <div className="mb-8">
      <div className="mb-6 flex items-center gap-3">
        <BarChart3 className="w-8 h-8 text-blue-400" />
        <div>
          <h2 className="text-3xl font-bold text-white">Relative Value Backtest: 7 Days</h2>
          {exchange && (
            <p className="text-sm text-slate-400 mt-1">Exchange: {exchange}</p>
          )}
        </div>
      </div>

      <div className="space-y-6">
        <div className={`${resultColors.bg} ${resultColors.border} border-2 rounded-xl p-6 shadow-lg`}>
          <div className="flex items-center gap-2 mb-4">
            {isPositive ? (
              <TrendingUp className="w-5 h-5 text-white" />
            ) : (
              <TrendingDown className="w-5 h-5 text-white" />
            )}
            <h3 className="text-xl font-bold text-white">Result</h3>
          </div>

          <div className="mb-4">
            <div className={`text-5xl font-bold mb-3 ${resultColors.text}`}>
              {isPositive && '+'}
              {resultValue.toFixed(2)}%
            </div>
            <p className="text-white/90 text-base leading-relaxed">{summary.replace(/\*/g, '')}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className={`${assetColors.bg} ${assetColors.border} border-2 rounded-xl p-5 shadow-lg`}>
            <h4 className="text-base font-semibold text-white/80 mb-2">Asset Return</h4>
            <div className={`text-3xl font-bold ${assetColors.text}`}>
              {assetReturn >= 0 && '+'}
              {assetReturn.toFixed(2)}%
            </div>
          </div>

          <div className={`${indexColors.bg} ${indexColors.border} border-2 rounded-xl p-5 shadow-lg`}>
            <h4 className="text-base font-semibold text-white/80 mb-2">Index Return</h4>
            <div className={`text-3xl font-bold ${indexColors.text}`}>
              {indexReturn >= 0 && '+'}
              {indexReturn.toFixed(2)}%
            </div>
          </div>
        </div>

        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6 mt-6">
          <p className="text-slate-300 text-sm leading-relaxed">
            <span className="font-semibold text-slate-200">Relative Value to the Index:</span> Compare {symbol}'s historical price movements against a selected index to observe how closely they have moved together in the past. This is historical observation only and does not predict future correlation or performance.
          </p>
        </div>
      </div>
    </div>
  );
}
