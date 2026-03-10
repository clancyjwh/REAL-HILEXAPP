import { useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft, TrendingUp, TrendingDown, Activity } from 'lucide-react';
import { cleanMarkdown } from '../utils/textUtils';

export default function MarketAnalysisPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { symbol, name, newsSummary, sentiment } = location.state || {};

  if (!newsSummary) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-slate-400">No market analysis available</div>
      </div>
    );
  }

  const getSentimentColor = () => {
    if (sentiment?.toLowerCase().includes('bullish')) {
      return 'text-green-300';
    } else if (sentiment?.toLowerCase().includes('bearish')) {
      return 'text-red-300';
    }
    return 'text-slate-300';
  };

  const getSentimentIcon = () => {
    if (sentiment?.toLowerCase().includes('bullish')) {
      return <TrendingUp className="w-8 h-8 text-green-400" />;
    } else if (sentiment?.toLowerCase().includes('bearish')) {
      return <TrendingDown className="w-8 h-8 text-red-400" />;
    }
    return <Activity className="w-8 h-8 text-slate-400" />;
  };

  const getBackgroundGradient = () => {
    if (sentiment?.toLowerCase().includes('bullish')) {
      return 'bg-gradient-to-br from-green-900/40 to-green-800/30 border-green-600/50';
    } else if (sentiment?.toLowerCase().includes('bearish')) {
      return 'bg-gradient-to-br from-red-900/40 to-red-800/30 border-red-600/50';
    }
    return 'bg-gradient-to-br from-slate-900/40 to-slate-800/30 border-slate-600/50';
  };

  return (
    <div className="min-h-screen pb-12">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-slate-400 hover:text-white mb-6 transition-colors"
      >
        <ArrowLeft className="w-5 h-5" />
        <span>Back</span>
      </button>

      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <h1 className="text-4xl font-bold text-white">Market Analysis</h1>
        </div>
        <p className="text-slate-400 text-lg">
          {symbol} - {name}
        </p>
      </div>

      <div className={`rounded-2xl p-8 shadow-xl border-2 ${getBackgroundGradient()}`}>
        <div className="flex items-center gap-3 mb-6">
          {getSentimentIcon()}
          <div>
            <h2 className="text-2xl font-bold text-white">Market Sentiment:</h2>
            <span className={`text-xl font-bold ${getSentimentColor()}`}>
              {sentiment}
            </span>
          </div>
        </div>

        <div className="text-slate-200 leading-relaxed space-y-6">
          {cleanMarkdown(newsSummary).split('\n\n').map((paragraph: string, idx: number) => {
            let formattedParagraph = paragraph;

            formattedParagraph = formattedParagraph.replace(
              /Sentiment\s*=\s*/gi,
              '\nMarket Sentiment: '
            );
            formattedParagraph = formattedParagraph.replace(
              /Confidence\s*=\s*/gi,
              '\nConfidence: '
            );
            formattedParagraph = formattedParagraph.replace(
              /Reason\s*=\s*/gi,
              '\nReason: '
            );

            // Skip empty paragraphs
            if (!formattedParagraph.trim()) return null;

            return (
              <p key={idx} className="text-slate-200 whitespace-pre-line text-base">
                {formattedParagraph}
              </p>
            );
          })}
        </div>
      </div>
    </div>
  );
}
