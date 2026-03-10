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
            <div className="p-2 rounded-lg" style={{ background: 'rgba(0,216,255,0.1)' }}>
              <Newspaper className="w-6 h-6 text-[#00D8FF]" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-white tracking-tight">AI Newsfeed</h1>
              <p className="text-slate-400 text-base mt-1">
                News summaries are provided for informational purposes only and<br />
                should not be used as the sole basis for investment decisions.
              </p>
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => setSearchMode('quick')}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${searchMode === 'quick'
                ? 'bg-orange-600 text-white shadow-lg shadow-orange-500/30'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700'
                }`}
              title="Quick Search - Surface level scan, faster results"
            >
              Quick Search
            </button>
            <button
              onClick={() => setSearchMode('balanced')}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${searchMode === 'balanced'
                ? 'bg-orange-600 text-white shadow-lg shadow-orange-500/30'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700'
                }`}
              title="Balanced - Moderate depth and speed"
            >
              Balanced
            </button>
            <button
              onClick={() => setSearchMode('deep')}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${searchMode === 'deep'
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
          <div className="rounded-xl p-6 relative border border-white/10" style={{ background: 'rgba(255,255,255,0.04)', backdropFilter: 'blur(12px)' }}>
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
                  className="w-full pl-12 pr-4 py-3 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-[#00D8FF] focus:ring-1 focus:ring-[#00D8FF] transition-all"
                  style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', textTransform: 'uppercase' }}
                />
              </div>
              <button
                type="submit"
                disabled={!keywords.trim()}
                className="px-6 py-3 font-medium rounded-lg transition-all text-black disabled:opacity-40 disabled:cursor-not-allowed"
                style={{ background: keywords.trim() ? '#00D8FF' : 'rgba(255,255,255,0.1)', boxShadow: keywords.trim() ? '0 0 20px rgba(0,212,255,0.3)' : 'none', color: keywords.trim() ? '#000' : '#fff' }}
              >
                Get News
              </button>
            </div>
          </div>
        </form>

        <div className="rounded-xl p-6 mb-6 relative border border-white/10" style={{ background: 'rgba(255,255,255,0.04)', backdropFilter: 'blur(12px)' }}>
          <h3 className="text-white font-medium mb-4">Quick Market Scans</h3>
          <div className="flex justify-center">
            <button
              onClick={() => handleMarketScan('stocks')}
              className="px-8 py-4 rounded-lg text-black font-semibold transition-all shadow-lg hover:scale-105"
              style={{ background: '#00D8FF', boxShadow: '0 0 20px rgba(0,212,255,0.3)' }}
            >
              General Market Scan
            </button>
          </div>
        </div>

        {topStories.length > 0 && (
          <div className="rounded-xl p-6 border border-white/10" style={{ background: 'rgba(255,255,255,0.04)', backdropFilter: 'blur(12px)' }}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-white flex items-center gap-2 tracking-tight">
                <Newspaper className="w-5 h-5 text-[#00D8FF]" />
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
                  className="block p-4 rounded-lg border border-white/8 hover:border-[#00D8FF]/30 transition-all duration-200 group"
                  style={{ background: 'rgba(255,255,255,0.03)' }}
                  onMouseEnter={e => (e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,216,255,0.08)')}
                  onMouseLeave={e => (e.currentTarget.style.boxShadow = 'none')}
                >
                  <h3 className="text-lg font-semibold text-white group-hover:text-[#00D8FF] mb-2 transition-colors tracking-tight">
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

        {/* WatchDog Sponsored Ad */}
        <div className="mt-8">
          <a
            href="https://watchdog.ltd"
            target="_blank"
            rel="noopener noreferrer"
            className="block rounded-xl overflow-hidden transition-all duration-300 group"
            style={{
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.08)',
              backdropFilter: 'blur(12px)',
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.boxShadow = '0 8px 32px rgba(0,216,255,0.08)'; (e.currentTarget as HTMLElement).style.borderColor = 'rgba(0,216,255,0.2)'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.boxShadow = 'none'; (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.08)'; }}
          >
            {/* Sponsored label bar */}
            <div className="px-5 py-2 flex items-center gap-2" style={{ background: 'rgba(255,255,255,0.03)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
              <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: '#f97316' }} />
              <span className="text-xs font-semibold tracking-widest uppercase" style={{ color: '#f97316', fontFamily: 'JetBrains Mono, monospace' }}>Sponsored</span>
            </div>
            {/* Ad body */}
            <div className="py-6 px-6 flex flex-col items-center gap-3">
              {/* White pill so black logo is visible */}
              <div className="rounded-xl px-6 py-3 transition-transform duration-300 group-hover:scale-105" style={{ background: '#ffffff' }}>
                <img
                  src="/watchdog.png"
                  alt="WatchDog"
                  className="h-12 w-auto object-contain"
                />
              </div>
              <p className="text-slate-300 text-sm font-semibold tracking-wide group-hover:text-white transition-colors">
                Monitor What Matters
              </p>
              <span
                className="text-xs px-3 py-1 rounded-full mt-1 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-1 group-hover:translate-y-0"
                style={{ background: 'rgba(0,216,255,0.1)', color: '#00D8FF', border: '1px solid rgba(0,216,255,0.2)' }}
              >
                Visit watchdog.ltd →
              </span>
            </div>
          </a>
        </div>

      </div>
      <Disclaimer />
    </>
  );
}
