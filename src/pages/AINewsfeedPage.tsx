import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Newspaper, Search } from 'lucide-react';
import { supabase } from '../lib/supabase';
import Disclaimer from '../components/Disclaimer';
import { cleanText, isValidHeadline } from '../utils/textUtils';

type SearchMode = 'quick' | 'balanced' | 'deep';

export default function AINewsfeedPage() {
  const { category } = useParams<{ category?: string }>();
  const navigate = useNavigate();
  const [keywords, setKeywords] = useState('');
  const [topStories, setTopStories] = useState<any[]>([]);
  const [lastCheckedAt, setLastCheckedAt] = useState<string>('');
  const [searchMode, setSearchMode] = useState<SearchMode>('balanced');

  const getCategoryTitle = () => {
    if (!category) return 'Market';

    switch (category) {
      case 'crypto':
        return 'Cryptocurrency';
      case 'stocks':
        return 'Stocks';
      case 'forex':
        return 'Forex';
      case 'commodities':
        return 'Commodities';
      default:
        return 'Market';
    }
  };

  useEffect(() => {
    fetchTopStories();
  }, []);

  const fetchTopStories = async () => {
    try {
      const { data, error } = await supabase
        .from('top_stories')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && data && data.length > 0) {
        const validStories = data
          .filter(story => {
            const hasValidHeadline = story.headline && isValidHeadline(story.headline);
            const hasValidSummary = story.summary && isValidHeadline(story.summary);
            return hasValidHeadline && hasValidSummary;
          })
          .map(story => ({
            ...story,
            headline: cleanText(story.headline),
            summary: cleanText(story.summary)
          }));

        setTopStories(validStories);
        if (validStories.length > 0) {
          setLastCheckedAt(validStories[0].created_at);
        }
      }
    } catch (error) {
      console.error('Error fetching top stories:', error);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!keywords.trim()) return;

    navigate('/ai-newsfeed/results', {
      state: {
        input: keywords.trim(),
        type: searchMode,
      },
    });
  };

  const handleMarketScan = (market: string) => {
    navigate('/ai-newsfeed/results', {
      state: {
        input: `${market} general market scan`,
        type: searchMode,
      },
    });
  };

  return (
    <>
      <div className="mb-8">
        {category && (
          <button
            onClick={() => navigate(`/${category}`)}
            className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-4"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to {getCategoryTitle()}
          </button>
        )}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-500/10 rounded-lg">
              <Newspaper className="w-6 h-6 text-blue-500" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-white">AI Newsfeed</h1>
              <p className="text-slate-400 text-base mt-1">
                News summaries are provided for informational purposes only and<br />
                should not be used as the sole basis for investment decisions.
              </p>
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => setSearchMode('quick')}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                searchMode === 'quick'
                  ? 'bg-orange-600 text-white shadow-lg shadow-orange-500/30'
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
                  ? 'bg-orange-600 text-white shadow-lg shadow-orange-500/30'
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
                  ? 'bg-orange-600 text-white shadow-lg shadow-orange-500/30'
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
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="text"
                  id="keywords"
                  value={keywords}
                  onChange={(e) => setKeywords(e.target.value.toUpperCase())}
                  placeholder="E.G., AAPL, TSLA, NVDA, TECH STOCKS..."
                  className="w-full pl-12 pr-4 py-3 bg-slate-800 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
                  style={{ textTransform: 'uppercase' }}
                />
              </div>
              <button
                type="submit"
                disabled={!keywords.trim()}
                className="px-6 py-3 bg-orange-600 hover:bg-orange-700 disabled:bg-slate-700 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors"
              >
                Get News
              </button>
            </div>
          </div>
        </form>

        <div className="bg-slate-900 border border-slate-700 rounded-xl p-6 mb-6 relative">
          <h3 className="text-white font-medium mb-4">Quick Market Scans</h3>
          <div className="flex justify-center">
            <button
              onClick={() => handleMarketScan('stocks')}
              className="px-8 py-4 bg-orange-600 hover:bg-orange-700 border border-orange-500 rounded-lg text-white font-medium transition-all shadow-lg shadow-orange-500/20 hover:shadow-orange-500/40"
            >
              General Market Scan
            </button>
          </div>
        </div>

        {topStories.length > 0 && (
          <div className="bg-slate-900 border border-slate-700 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Newspaper className="w-5 h-5 text-blue-500" />
                Today's Top Stories
              </h2>
              {lastCheckedAt && (
                <span className="text-sm text-slate-400">
                  Last updated: {new Date(lastCheckedAt).toLocaleString()}
                </span>
              )}
            </div>
            <p className="text-slate-400 text-sm mb-4 leading-relaxed">
              News headlines displayed in Hilex are quoted directly from their original publishers and fully attributed. Hilex does not create or alter these reports.
            </p>
            <div className="space-y-4">
              {topStories.map((story, index) => (
                <a
                  key={index}
                  href={story.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block p-4 bg-slate-800 hover:bg-slate-750 border border-slate-700 hover:border-blue-500 rounded-lg transition-all duration-200 group"
                >
                  <h3 className="text-lg font-semibold text-white group-hover:text-blue-400 mb-2 transition-colors">
                    {story.headline}
                  </h3>
                  <p className="text-slate-300 text-sm leading-relaxed">
                    {story.summary}
                  </p>
                  {story.source && (
                    <p className="text-slate-500 text-xs mt-2">Source: {story.source}</p>
                  )}
                </a>
              ))}
            </div>
          </div>
        )}

      </div>
      <Disclaimer />
    </>
  );
}
