import { useLocation, useNavigate } from 'react-router-dom';
import { BarChart3, TrendingUp, TrendingDown, ArrowLeft } from 'lucide-react';
import { useEffect } from 'react';

const getPercentageColors = (percentage: number) => {
  if (percentage > 0) {
    if (percentage >= 20) return { bg: 'bg-green-500', border: 'border-green-400', text: 'text-white' };
    if (percentage >= 10) return { bg: 'bg-green-600', border: 'border-green-500', text: 'text-white' };
    if (percentage >= 5) return { bg: 'bg-green-700', border: 'border-green-600', text: 'text-white' };
    return { bg: 'bg-green-800', border: 'border-green-700', text: 'text-white' };
  } else if (percentage < 0) {
    if (percentage <= -20) return { bg: 'bg-red-800', border: 'border-red-700', text: 'text-white' };
    if (percentage <= -10) return { bg: 'bg-red-700', border: 'border-red-600', text: 'text-white' };
    if (percentage <= -5) return { bg: 'bg-red-600', border: 'border-red-500', text: 'text-white' };
    return { bg: 'bg-red-500', border: 'border-red-400', text: 'text-white' };
  }
  return { bg: 'bg-slate-700', border: 'border-slate-600', text: 'text-white' };
};

export default function RelativeValueResultPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { result, ticker, exchange, timeframe } = location.state || {};

  useEffect(() => {
    if (!result) {
      navigate('/tools/relative-value-index');
    }
  }, [result, navigate]);

  if (!result) {
    return null;
  }

  const resultValue = parseFloat(result.Result || result.result || 0);
  const assetReturn = parseFloat(result['Asset Return'] || result.asset_return || result.assetReturn || 0);
  const indexReturn = parseFloat(result['Index Return'] || result.index_return || result.indexReturn || 0);
  const summary = result.Summary || result.summary || 'No summary available';

  const isPositive = resultValue >= 0;
  const resultColors = getPercentageColors(resultValue);
  const assetColors = getPercentageColors(assetReturn);
  const indexColors = getPercentageColors(indexReturn);

  return (
    <div className="min-h-screen pb-12">
      <div className="mb-8">
        <button
          onClick={() => navigate('/tools/relative-value-index')}
          className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-6"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Search
        </button>

        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-500/10 rounded-lg">
            <BarChart3 className="w-6 h-6 text-blue-500" />
          </div>
          <div>
            <h1 className="text-4xl font-bold text-white">Relative Value Analysis</h1>
            <p className="text-slate-400">
              {ticker} vs {exchange} over {timeframe} days
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-4xl space-y-6">
        <div className={`${resultColors.bg} ${resultColors.border} border-2 rounded-xl p-8 shadow-lg`}>
          <div className="flex items-center gap-3 mb-6">
            {isPositive ? (
              <TrendingUp className="w-6 h-6 text-white" />
            ) : (
              <TrendingDown className="w-6 h-6 text-white" />
            )}
            <h2 className="text-2xl font-bold text-white">Result</h2>
          </div>

          <div className="mb-6">
            <div className={`text-6xl font-bold mb-4 ${resultColors.text}`}>
              {isPositive && '+'}
              {resultValue.toFixed(2)}%
            </div>
            <p className="text-white/90 text-lg leading-relaxed">{summary.replace(/\*/g, '')}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className={`${assetColors.bg} ${assetColors.border} border-2 rounded-xl p-6 shadow-lg`}>
            <h3 className="text-lg font-semibold text-white/80 mb-3">Asset Return</h3>
            <div className={`text-4xl font-bold ${assetColors.text}`}>
              {assetReturn >= 0 && '+'}
              {assetReturn.toFixed(2)}%
            </div>
          </div>

          <div className={`${indexColors.bg} ${indexColors.border} border-2 rounded-xl p-6 shadow-lg`}>
            <h3 className="text-lg font-semibold text-white/80 mb-3">Index Return</h3>
            <div className={`text-4xl font-bold ${indexColors.text}`}>
              {indexReturn >= 0 && '+'}
              {indexReturn.toFixed(2)}%
            </div>
          </div>
        </div>

        <div className="bg-slate-800/50 border border-slate-600 rounded-xl p-6 mt-6">
          <p className="text-slate-400 text-sm leading-relaxed text-center">
            This comparison shows historical relative performance during the selected time period only. Past relative performance does not predict future results and should not be used as the sole basis for investment decisions.
          </p>
        </div>
      </div>
    </div>
  );
}
