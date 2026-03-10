import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LineChart, Search, ArrowLeft, Loader2, Bitcoin, TrendingUp, DollarSign, BarChart2, AlertTriangle } from 'lucide-react';
import { searchAssets, AssetSuggestion } from '../utils/assetSuggestions';
import { checkRateLimit } from '../utils/rateLimiting';

type AssetClass = 'crypto' | 'stocks' | 'forex' | 'commodities';

interface SearchResult {
  symbol: string;
  instrument_name: string;
  exchange?: string;
  instrument_type?: string;
  country?: string;
}

export default function PriceForecastingPage() {
  const navigate = useNavigate();
  const [selectedAssetClass, setSelectedAssetClass] = useState<AssetClass>('stocks');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedSymbol, setSelectedSymbol] = useState<string>('');
  const [showResults, setShowResults] = useState(false);
  const [rateLimitError, setRateLimitError] = useState<string | null>(null);

  const assetClasses = [
    { id: 'crypto' as AssetClass, name: 'Crypto', icon: Bitcoin, color: 'amber' },
    { id: 'stocks' as AssetClass, name: 'Stocks', icon: TrendingUp, color: 'blue' },
    { id: 'forex' as AssetClass, name: 'Forex', icon: DollarSign, color: 'green' },
    { id: 'commodities' as AssetClass, name: 'Commodities', icon: BarChart2, color: 'orange' },
  ];

  const handleAssetClassChange = (assetClass: AssetClass) => {
    setSelectedAssetClass(assetClass);
    setSearchQuery('');
    setSearchResults([]);
    setSelectedSymbol('');
    setShowResults(false);
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setShowResults(true);

    if (query.trim().length < 1) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);

    const suggestions = searchAssets(query, selectedAssetClass);
    const formattedResults = suggestions.map(suggestion => ({
      symbol: suggestion.symbol,
      instrument_name: suggestion.name,
      exchange: suggestion.category,
    }));

    setSearchResults(formattedResults);
    setIsSearching(false);
  };

  const handleSelectSymbol = (symbol: string) => {
    setSelectedSymbol(symbol);
    setSearchQuery(symbol);
    setShowResults(false);
    setSearchResults([]);
  };

  const handleSubmit = async () => {
    if (!selectedSymbol || isSubmitting) return;

    setRateLimitError(null);
    setIsSubmitting(true);

    const rateLimitResult = await checkRateLimit('price-forecasting');

    if (!rateLimitResult.allowed) {
      setRateLimitError(rateLimitResult.message || 'Rate limit exceeded. Please try again later.');
      setIsSubmitting(false);
      return;
    }

    let tickerToSend = selectedSymbol;

    if (selectedAssetClass === 'crypto') {
      if (!tickerToSend.includes('/')) {
        tickerToSend = `${tickerToSend}/USD`;
      }
    }

    navigate(`/tools/price-forecasting/loading?asset_class=${encodeURIComponent(selectedAssetClass)}&ticker=${encodeURIComponent(tickerToSend)}`);
  };

  return (
    <>
      <div className="mb-8">
        <button
          onClick={() => navigate('/tools')}
          className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Tools
        </button>
        <div className="flex items-center gap-3">
          <div className="p-2 bg-orange-500/10 rounded-lg">
            <LineChart className="w-6 h-6 text-orange-500" />
          </div>
          <div>
            <h1 className="text-4xl font-bold text-white">Price Forecasting</h1>
            <p className="text-slate-400">Generate price forecasts for any asset</p>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {assetClasses.map((assetClass) => {
            const Icon = assetClass.icon;
            const isSelected = selectedAssetClass === assetClass.id;

            const getButtonClass = () => {
              if (!isSelected) return 'border-slate-700 bg-slate-800 hover:border-slate-600';
              switch (assetClass.color) {
                case 'amber': return 'border-amber-500 bg-amber-500/10';
                case 'blue': return 'border-blue-500 bg-blue-500/10';
                case 'green': return 'border-green-500 bg-green-500/10';
                case 'orange': return 'border-orange-500 bg-orange-500/10';
                default: return 'border-slate-700 bg-slate-800';
              }
            };

            const getIconClass = () => {
              if (!isSelected) return 'text-slate-400';
              switch (assetClass.color) {
                case 'amber': return 'text-amber-500';
                case 'blue': return 'text-blue-500';
                case 'green': return 'text-green-500';
                case 'orange': return 'text-orange-500';
                default: return 'text-slate-400';
              }
            };

            return (
              <button
                key={assetClass.id}
                onClick={() => handleAssetClassChange(assetClass.id)}
                className={`p-6 rounded-xl border-2 transition-all ${getButtonClass()}`}
              >
                <Icon className={`w-8 h-8 mx-auto mb-2 ${getIconClass()}`} />
                <div className={`text-center font-medium ${getIconClass()}`}>
                  {assetClass.name}
                </div>
              </button>
            );
          })}
        </div>

        <div className="bg-slate-800 rounded-xl border border-slate-700 p-8">
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Search for an asset
          </label>
          <div className="relative">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value.toUpperCase())}
                onFocus={() => setShowResults(true)}
                placeholder={
                  selectedAssetClass === 'commodities'
                    ? 'Enter ticker symbol (e.g., XAU/USD, HG1, C_1, WTI/USD)'
                    : 'Enter ticker symbol (e.g., AAPL, BTC, EUR)'
                }
                className="w-full pl-12 pr-4 py-3 bg-slate-900 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-orange-500"
                style={{ textTransform: 'uppercase' }}
              />
            </div>

            {showResults && (searchResults.length > 0 || isSearching) && (
              <div className="absolute z-10 w-full mt-2 bg-slate-900 border border-slate-700 rounded-lg shadow-xl max-h-96 overflow-y-auto">
                {isSearching ? (
                  <div className="p-4 text-center text-slate-400">
                    <Loader2 className="w-5 h-5 animate-spin mx-auto" />
                  </div>
                ) : (
                  searchResults.map((result, index) => (
                    <button
                      key={index}
                      onClick={() => handleSelectSymbol(result.symbol)}
                      className="w-full p-4 text-left hover:bg-slate-800 transition-colors border-b border-slate-800 last:border-b-0"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-medium text-white">{result.symbol}</div>
                          <div className="text-sm text-slate-400">{result.instrument_name}</div>
                        </div>
                        {result.exchange && (
                          <div className="text-xs text-slate-500">{result.exchange}</div>
                        )}
                      </div>
                    </button>
                  ))
                )}
              </div>
            )}
          </div>

          <div className="mt-4 p-4 bg-slate-700/30 border border-slate-600/50 rounded-lg">
            <p className="text-slate-300 text-sm leading-relaxed">
              This engine analyzes the last 10 days of price movement for the selected asset, searches historical data for past periods with similar price patterns and market conditions, and then summarizes how the asset typically moves over the following 10 days.
            </p>
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

          <button
            onClick={handleSubmit}
            disabled={!selectedSymbol || isSubmitting}
            className={`w-full mt-6 py-3 px-6 rounded-lg font-medium transition-all ${
              selectedSymbol && !isSubmitting
                ? 'bg-orange-500 hover:bg-orange-600 text-white'
                : 'bg-slate-700 text-slate-500 cursor-not-allowed'
            }`}
          >
            {isSubmitting ? (
              <span className="flex items-center justify-center gap-2">
                <Loader2 className="w-5 h-5 animate-spin" />
                Generating Forecast...
              </span>
            ) : (
              'Generate Forecast'
            )}
          </button>
        </div>

        {selectedSymbol && (
          <div className="mt-4 p-4 bg-slate-800 rounded-lg border border-slate-700">
            <div className="text-sm text-slate-400">
              Selected: <span className="text-white font-medium">{selectedSymbol}</span>
              {' '}({selectedAssetClass})
              {selectedAssetClass === 'crypto' && !selectedSymbol.includes('/') && (
                <span className="text-orange-500"> → Will send as {selectedSymbol}/USD</span>
              )}
            </div>
          </div>
        )}
      </div>
    </>
  );
}
