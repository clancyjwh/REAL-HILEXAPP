import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Newspaper, AlertTriangle } from 'lucide-react';
import Disclaimer from '../components/Disclaimer';
import AssetSearchInput from '../components/AssetSearchInput';
import { checkRateLimit } from '../utils/rateLimiting';

type SearchMode = 'quick' | 'balanced' | 'deep';

export default function AINewsfeedToolPage() {
  const navigate = useNavigate();
  const [keywords, setKeywords] = useState('');
  const [searchMode, setSearchMode] = useState<SearchMode>('balanced');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [rateLimitError, setRateLimitError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!keywords.trim() || isSubmitting) return;

    setRateLimitError(null);
    setIsSubmitting(true);

    const rateLimitResult = await checkRateLimit('ai-newsfeed');

    if (!rateLimitResult.allowed) {
      setRateLimitError(rateLimitResult.message || 'Rate limit exceeded. Please try again later.');
      setIsSubmitting(false);
      return;
    }

    navigate('/tools/ai-newsfeed/results', {
      state: {
        input: keywords.trim(),
        type: searchMode,
      },
    });
  };

  const handleMarketScan = async (market: string) => {
    if (isSubmitting) return;

    setRateLimitError(null);
    setIsSubmitting(true);

    const rateLimitResult = await checkRateLimit('ai-newsfeed');

    if (!rateLimitResult.allowed) {
      setRateLimitError(rateLimitResult.message || 'Rate limit exceeded. Please try again later.');
      setIsSubmitting(false);
      return;
    }

    navigate('/tools/ai-newsfeed/results', {
      state: {
        input: `${market} general market scan`,
        type: searchMode,
      },
    });
  };

  const handleKeywordSearch = async (keyword: string) => {
    if (isSubmitting) return;

    setRateLimitError(null);
    setIsSubmitting(true);

    const rateLimitResult = await checkRateLimit('ai-newsfeed');

    if (!rateLimitResult.allowed) {
      setRateLimitError(rateLimitResult.message || 'Rate limit exceeded. Please try again later.');
      setIsSubmitting(false);
      return;
    }

    navigate('/tools/ai-newsfeed/results', {
      state: {
        input: keyword,
        type: searchMode,
      },
    });
  };

  return (
    <>
      <div className="mb-8">
        <button
          onClick={() => navigate('/tools')}
          className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-4"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Tools
        </button>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-cyan-500/10 rounded-lg">
              <Newspaper className="w-6 h-6 text-cyan-500" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-white">AI Newsfeed</h1>
              <p className="text-slate-400 text-base mt-1">
                Find market consensus, relevant headlines, market movers and more for any asset
              </p>
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => setSearchMode('quick')}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                searchMode === 'quick'
                  ? 'bg-cyan-600 text-white shadow-lg shadow-cyan-500/30'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700'
              }`}
              title="Quick Search - Surface level scan, faster results"
            >
              Quick Search
            </button>
            <button
              onClick={() => setSearchMode('balanced')}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                searchMode === 'balanced'
                  ? 'bg-cyan-600 text-white shadow-lg shadow-cyan-500/30'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700'
              }`}
              title="Balanced - Moderate depth and speed"
            >
              Balanced
            </button>
            <button
              onClick={() => setSearchMode('deep')}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                searchMode === 'deep'
                  ? 'bg-cyan-600 text-white shadow-lg shadow-cyan-500/30'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700'
              }`}
              title="Deep Dive - More thorough analysis, longer wait time"
            >
              Deep Dive
            </button>
          </div>
        </div>

      </div>

      <div className="max-w-4xl">
        <form onSubmit={handleSubmit} className="mb-6">
          <div className="bg-slate-900 border border-slate-700 rounded-xl p-6 relative">
            <label htmlFor="keywords" className="block text-white font-medium mb-3">
              Enter Asset Ticker or Keywords
            </label>
            <div className="flex gap-3">
              <AssetSearchInput
                value={keywords}
                onChange={setKeywords}
                placeholder="E.G., AAPL, TSLA, NVDA, TECH STOCKS..."
                assetClass="all"
                focusColor="focus:border-cyan-500 focus:ring-cyan-500"
              />
              <button
                type="submit"
                disabled={!keywords.trim() || isSubmitting}
                className="px-6 py-3 bg-cyan-600 hover:bg-cyan-700 disabled:bg-slate-700 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors"
              >
                Get News
              </button>
            </div>

            {rateLimitError && (
              <div className="mt-4 p-4 bg-red-500/10 border border-red-500/50 rounded-lg flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-red-400 mb-1">Rate Limit Exceeded</h4>
                  <p className="text-sm text-red-300">{rateLimitError}</p>
                </div>
              </div>
            )}
          </div>
        </form>

        <div className="bg-slate-900 border border-slate-700 rounded-xl p-6 mb-6 relative">
          <h3 className="text-white font-medium mb-4">Keyword Searches</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <button
              onClick={() => handleKeywordSearch('Crypto')}
              className="px-4 py-3 bg-slate-800 hover:bg-slate-700 border border-slate-600 hover:border-cyan-500 rounded-lg text-white font-medium transition-all"
            >
              Crypto
            </button>
            <button
              onClick={() => handleKeywordSearch('Stocks')}
              className="px-4 py-3 bg-slate-800 hover:bg-slate-700 border border-slate-600 hover:border-cyan-500 rounded-lg text-white font-medium transition-all"
            >
              Stocks
            </button>
            <button
              onClick={() => handleKeywordSearch('Forex')}
              className="px-4 py-3 bg-slate-800 hover:bg-slate-700 border border-slate-600 hover:border-cyan-500 rounded-lg text-white font-medium transition-all"
            >
              Forex
            </button>
            <button
              onClick={() => handleKeywordSearch('Commodities')}
              className="px-4 py-3 bg-slate-800 hover:bg-slate-700 border border-slate-600 hover:border-cyan-500 rounded-lg text-white font-medium transition-all"
            >
              Commodities
            </button>
            <button
              onClick={() => handleKeywordSearch('Interest Rates')}
              className="px-4 py-3 bg-slate-800 hover:bg-slate-700 border border-slate-600 hover:border-cyan-500 rounded-lg text-white font-medium transition-all"
            >
              Interest Rates
            </button>
            <button
              onClick={() => handleKeywordSearch('Tariffs')}
              className="px-4 py-3 bg-slate-800 hover:bg-slate-700 border border-slate-600 hover:border-cyan-500 rounded-lg text-white font-medium transition-all"
            >
              Tariffs
            </button>
            <button
              onClick={() => handleKeywordSearch('Supply Shocks')}
              className="px-4 py-3 bg-slate-800 hover:bg-slate-700 border border-slate-600 hover:border-cyan-500 rounded-lg text-white font-medium transition-all"
            >
              Supply Shocks
            </button>
          </div>
        </div>

        <div className="bg-slate-900/50 border border-slate-700 rounded-xl p-6">
          <h3 className="text-white font-medium mb-3">About AI Newsfeed</h3>
          <p className="text-slate-300 leading-relaxed">
            AI Newsfeed scans and analyzes news sources, social media, and market data to provide you with comprehensive insights about any asset or market sector. Choose your search depth based on how thorough you want the analysis to be.
          </p>
        </div>

      </div>
      <Disclaimer />
    </>
  );
}
