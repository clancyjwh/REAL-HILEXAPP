import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, FileText, ChevronRight } from 'lucide-react';

interface SearchResult {
  title: string;
  description: string;
  path: string;
  category: string;
}

const searchableContent: SearchResult[] = [
  // Home & Dashboard
  { title: 'Home', description: 'Main dashboard with market overview and top picks', path: '/', category: 'Navigation' },
  { title: 'Market Analysis', description: 'View comprehensive market analysis and trends', path: '/market-analysis', category: 'Analysis' },

  // Tools
  { title: 'Tools', description: 'Access all analytical tools and utilities', path: '/tools', category: 'Tools' },
  { title: 'Analysis Tools', description: 'Run custom technical analysis on assets', path: '/analysis-tools', category: 'Tools' },
  { title: 'Interest Rates Tool', description: 'Analyze interest rates and their impact', path: '/interest-rates-tool', category: 'Tools' },
  { title: 'Relative Value Analysis', description: 'Compare relative value between assets', path: '/relative-value', category: 'Tools' },
  { title: 'Horizon Optimizer', description: 'Optimize investment horizons for assets', path: '/horizon-optimizer', category: 'Tools' },
  { title: 'Correlation Index', description: 'View correlation analysis between assets', path: '/correlation-index', category: 'Tools' },
  { title: 'AI Newsfeed Tool', description: 'Get AI-powered news analysis and insights', path: '/ai-newsfeed-tool', category: 'Tools' },

  // Watchlist
  { title: 'My Watchlist', description: 'Track your favorite assets with custom signals', path: '/my-watchlist', category: 'Watchlist' },

  // Bespoke Projects
  { title: 'Bespoke Projects', description: 'Custom research projects and analyses', path: '/bespoke-projects', category: 'Premium' },
  { title: 'Bespoke Updates', description: 'Latest updates on custom projects', path: '/bespoke-updates', category: 'Premium' },
  { title: 'Projects & Updates', description: 'View all projects and their updates', path: '/projects-updates', category: 'Premium' },

  // Education Centre
  { title: 'Education Centre', description: 'Learn about technical analysis and indicators', path: '/documentation', category: 'Education' },
  { title: 'FAQ', description: 'Frequently asked questions and answers', path: '/faq', category: 'Education' },
  { title: 'Definitions', description: 'Technical terms and indicator definitions', path: '/definitions', category: 'Education' },
  { title: 'Sources', description: 'Data sources and methodology information', path: '/sources', category: 'Education' },
  { title: 'Parameter Methodology', description: 'How we optimize technical parameters', path: '/parameter-methodology', category: 'Education' },
  { title: 'Newsfeed Methodology', description: 'AI newsfeed analysis methodology', path: '/newsfeed-methodology', category: 'Education' },

  // Account & Billing
  { title: 'My Account', description: 'Manage your account settings and profile', path: '/my-account', category: 'Account' },
  { title: 'Billing', description: 'Subscription and payment information', path: '/billing', category: 'Account' },

  // Market Data
  { title: 'Top Picks', description: 'View our top stock picks and recommendations', path: '/top-picks', category: 'Market Data' },
  { title: 'Market Movers', description: 'See the biggest market movers today', path: '/market-movers', category: 'Market Data' },
  { title: 'Live Prices', description: 'Real-time market prices across all assets', path: '/live-prices', category: 'Market Data' },
  { title: 'Consensus Analysis', description: 'Market consensus and sentiment data', path: '/consensus', category: 'Market Data' },
  { title: 'AI Newsfeed', description: 'AI-curated market news and analysis', path: '/ai-newsfeed', category: 'Market Data' },
  { title: 'Interest Rates', description: 'Interest rate analysis and forecasts', path: '/interest-rates', category: 'Market Data' },
  { title: 'Taco Trade', description: 'TACO trade signals and updates', path: '/taco-trade', category: 'Market Data' },

  // Analysis Types
  { title: 'Analysis Types', description: 'Browse all available analysis types', path: '/analysis-types', category: 'Analysis' },
  { title: 'Analysis Search', description: 'Search for specific asset analysis', path: '/analysis-search', category: 'Analysis' },
  { title: 'Asset Data', description: 'View detailed asset information and metrics', path: '/asset-data', category: 'Analysis' },

  // Signals & Indicators
  { title: 'Stop Signal', description: 'Stop loss and take profit signals', path: '/stop-signal', category: 'Signals' },
  { title: 'Resistance Signal', description: 'Support and resistance level signals', path: '/resistance-signal', category: 'Signals' },
  { title: 'Optimized Parameters', description: 'View optimized indicator parameters', path: '/optimized-parameters', category: 'Signals' },

  // Info Pages
  { title: 'Relative Value Info', description: 'Learn about relative value analysis', path: '/relative-value-info', category: 'Info' },
  { title: 'Horizon Optimizer Info', description: 'Learn about horizon optimization', path: '/horizon-optimizer-info', category: 'Info' },
  { title: 'Interest Rate Info', description: 'Learn about interest rate analysis', path: '/interest-rate-info', category: 'Info' },
  { title: 'Bespoke Projects Info', description: 'Learn about custom research projects', path: '/bespoke-projects-info', category: 'Info' },
  { title: 'Bespoke Updates Info', description: 'Learn about project updates', path: '/bespoke-updates-info', category: 'Info' },
];

export default function SearchPage() {
  const [query, setQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [hasSearched, setHasSearched] = useState(false);
  const navigate = useNavigate();

  const handleSearch = (searchQuery: string) => {
    setQuery(searchQuery);
    setHasSearched(true);

    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }

    const lowerQuery = searchQuery.toLowerCase();
    const results = searchableContent.filter(
      (item) =>
        item.title.toLowerCase().includes(lowerQuery) ||
        item.description.toLowerCase().includes(lowerQuery) ||
        item.category.toLowerCase().includes(lowerQuery)
    );

    setSearchResults(results);
  };

  const handleResultClick = (path: string) => {
    navigate(path);
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      'Navigation': 'bg-blue-500/10 text-blue-400 border-blue-500/20',
      'Tools': 'bg-green-500/10 text-green-400 border-green-500/20',
      'Watchlist': 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
      'Premium': 'bg-orange-500/10 text-orange-400 border-orange-500/20',
      'Education': 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
      'Account': 'bg-purple-500/10 text-purple-400 border-purple-500/20',
      'Market Data': 'bg-pink-500/10 text-pink-400 border-pink-500/20',
      'Analysis': 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
      'Signals': 'bg-red-500/10 text-red-400 border-red-500/20',
      'Info': 'bg-slate-500/10 text-slate-400 border-slate-500/20',
    };
    return colors[category] || 'bg-slate-500/10 text-slate-400 border-slate-500/20';
  };

  const groupedResults = searchResults.reduce((acc, result) => {
    if (!acc[result.category]) {
      acc[result.category] = [];
    }
    acc[result.category].push(result);
    return acc;
  }, {} as Record<string, SearchResult[]>);

  return (
    <div className="min-h-screen pb-12">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <Search className="w-10 h-10 text-purple-500" />
          <h1 className="text-4xl font-bold text-white">Search</h1>
        </div>
        <p className="text-slate-400 text-lg">Find anything across the platform</p>
      </div>

      <div className="mb-8">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-6 h-6 text-slate-400" />
          <input
            type="text"
            value={query}
            onChange={(e) => handleSearch(e.target.value)}
            placeholder="Search for pages, tools, analysis types, and more..."
            className="w-full pl-14 pr-6 py-4 bg-slate-800 border-2 border-slate-700 rounded-xl text-white text-lg placeholder-slate-500 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all"
            autoFocus
          />
        </div>
      </div>

      {!hasSearched ? (
        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-12 text-center">
          <Search className="w-16 h-16 text-slate-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">Start Searching</h2>
          <p className="text-slate-400 max-w-md mx-auto">
            Enter keywords to search across all pages, tools, analysis types, and resources on the platform
          </p>
        </div>
      ) : searchResults.length === 0 ? (
        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-12 text-center">
          <FileText className="w-16 h-16 text-slate-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">No Results Found</h2>
          <p className="text-slate-400">
            Try different keywords or browse the navigation menu
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <p className="text-slate-400">
              Found <span className="text-white font-semibold">{searchResults.length}</span> result{searchResults.length !== 1 ? 's' : ''}
            </p>
          </div>

          {Object.keys(groupedResults).map((category) => (
            <div key={category}>
              <h3 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
                <span className={`px-2 py-1 rounded text-sm border ${getCategoryColor(category)}`}>
                  {category}
                </span>
                <span className="text-slate-500 text-sm">({groupedResults[category].length})</span>
              </h3>
              <div className="space-y-2">
                {groupedResults[category].map((result, index) => (
                  <button
                    key={index}
                    onClick={() => handleResultClick(result.path)}
                    className="w-full bg-slate-800 hover:bg-slate-750 border border-slate-700 hover:border-purple-500/50 rounded-lg p-4 text-left transition-all duration-200 group"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <h4 className="text-white font-semibold text-lg mb-1 group-hover:text-purple-400 transition-colors">
                          {result.title}
                        </h4>
                        <p className="text-slate-400 text-sm">{result.description}</p>
                        <p className="text-slate-600 text-xs mt-2">{result.path}</p>
                      </div>
                      <ChevronRight className="w-5 h-5 text-slate-500 group-hover:text-purple-400 transition-colors flex-shrink-0 mt-1" />
                    </div>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
