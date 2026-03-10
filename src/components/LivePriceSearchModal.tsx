import { useState, useEffect } from 'react';
import { Search, X, Loader2, TrendingUp, Bitcoin, DollarSign, BarChart3, ArrowLeft, Minimize2 } from 'lucide-react';
import { finnhubService, StockSearchResult } from '../lib/finnhub';
import { COMMODITY_SUGGESTIONS } from '../utils/assetSuggestions';

interface TwelveDataSearchResult {
  symbol: string;
  instrument_name: string;
  exchange: string;
  country: string;
  currency: string;
  instrument_type: string;
}

interface LivePriceSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (ticker: string, companyName: string, assetClass: string) => void;
  isLoading?: boolean;
  error?: string | null;
}

type AssetClass = 'stocks' | 'crypto' | 'forex' | 'commodities';

const assetClassConfig = {
  stocks: {
    name: 'Stocks',
    icon: TrendingUp,
    color: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
    useFinnhub: true,
  },
  crypto: {
    name: 'Cryptocurrency',
    icon: Bitcoin,
    color: 'bg-orange-500/10 text-orange-400 border-orange-500/30',
    useFinnhub: false,
    placeholder: 'e.g., BTC, ETH, SOL',
  },
  forex: {
    name: 'Forex',
    icon: DollarSign,
    color: 'bg-green-500/10 text-green-400 border-green-500/30',
    useFinnhub: false,
    placeholder: 'e.g., EURUSD, GBPUSD',
  },
  commodities: {
    name: 'Commodities',
    icon: BarChart3,
    color: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
    useFinnhub: false,
    placeholder: 'e.g., XAU/USD, WTI/USD, NG/USD, HG1',
  },
};

export default function LivePriceSearchModal({ isOpen, onClose, onSelect, isLoading = false, error = null }: LivePriceSearchModalProps) {
  const [assetClass, setAssetClass] = useState<AssetClass | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<StockSearchResult[]>([]);
  const [cryptoResults, setCryptoResults] = useState<TwelveDataSearchResult[]>([]);
  const [commodityResults, setCommodityResults] = useState<TwelveDataSearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setAssetClass(null);
      setSearchQuery('');
      setSearchResults([]);
      setIsMinimized(false);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!searchQuery.trim() || !assetClass) {
      setSearchResults([]);
      setCryptoResults([]);
      setCommodityResults([]);
      return;
    }

    const delayDebounce = setTimeout(async () => {
      setLoading(true);

      if (assetClassConfig[assetClass].useFinnhub) {
        const results = await finnhubService.searchSymbol(searchQuery);
        const usStocks = results.filter(r => r.type === 'Common Stock' && !r.symbol.includes('.'));
        setSearchResults(usStocks.slice(0, 10));
        setCryptoResults([]);
        setCommodityResults([]);
      } else if (assetClass === 'crypto') {
        try {
          const apiKey = import.meta.env.VITE_TWELVE_DATA_API_KEY;
          const response = await fetch(
            `https://api.twelvedata.com/symbol_search?symbol=${encodeURIComponent(searchQuery)}&outputsize=30&apikey=${apiKey}`
          );
          const data = await response.json();

          if (data.status !== 'error' && data.data) {
            const filtered = data.data.filter((item: TwelveDataSearchResult) =>
              item.instrument_type === 'Digital Currency' && item.symbol.endsWith('/USD')
            );
            setCryptoResults(filtered);
          } else {
            setCryptoResults([]);
          }
          setSearchResults([]);
          setCommodityResults([]);
        } catch (error) {
          console.error('Crypto search error:', error);
          setCryptoResults([]);
        }
      } else if (assetClass === 'commodities') {
        const commodityMatches = COMMODITY_SUGGESTIONS.filter(commodity =>
          commodity.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          commodity.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
          commodity.category.toLowerCase().includes(searchQuery.toLowerCase())
        );

        const formatted = commodityMatches.map(commodity => ({
          symbol: commodity.symbol,
          instrument_name: commodity.name,
          exchange: 'TwelveData',
          country: 'Global',
          currency: 'USD',
          instrument_type: commodity.category
        }));

        setCommodityResults(formatted);
        setSearchResults([]);
        setCryptoResults([]);
      } else {
        setSearchResults([]);
        setCryptoResults([]);
        setCommodityResults([]);
      }

      setLoading(false);
    }, 500);

    return () => clearTimeout(delayDebounce);
  }, [searchQuery, assetClass]);

  const formatForexPair = (value: string): string => {
    const cleaned = value.replace(/[^A-Z]/gi, '').toUpperCase();

    if (cleaned.length > 3 && !value.includes('/')) {
      return `${cleaned.slice(0, 3)}/${cleaned.slice(3, 6)}`;
    }

    if (cleaned.length > 7) {
      return cleaned.slice(0, 7);
    }

    return cleaned;
  };

  const handleSelect = async (result: StockSearchResult) => {
    if (!assetClass) return;
    const profile = await finnhubService.getCompanyProfile(result.symbol);
    const companyName = profile?.name || result.description;
    onSelect(result.symbol, companyName, assetClass);
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim() || !assetClass) return;

    const ticker = assetClass === 'crypto' && !searchQuery.includes('/')
      ? searchQuery.toUpperCase()
      : searchQuery.toUpperCase();

    onSelect(ticker, ticker, assetClass);
  };

  const handleCryptoSelect = (result: TwelveDataSearchResult) => {
    // Store the full symbol (e.g., "BTC/USD") so it can be looked up correctly
    onSelect(result.symbol, result.instrument_name, 'crypto');
  };

  const handleCommoditySelect = (result: TwelveDataSearchResult) => {
    onSelect(result.symbol, result.instrument_name, 'commodities');
  };

  const handleBack = () => {
    setAssetClass(null);
    setSearchQuery('');
    setSearchResults([]);
    setCryptoResults([]);
    setCommodityResults([]);
  };

  if (!isOpen) return null;

  const currentConfig = assetClass ? assetClassConfig[assetClass] : null;

  if (isMinimized) {
    return (
      <div className="fixed bottom-8 right-8 z-50">
        <button
          onClick={() => setIsMinimized(false)}
          className="flex items-center gap-3 px-5 py-3 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 text-white rounded-xl transition-all shadow-xl hover:shadow-orange-500/50 hover:scale-105 active:scale-95 border-2 border-orange-400/70 font-semibold"
        >
          <Search className="w-5 h-5" />
          Search Asset Price
        </button>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-slate-800 border border-slate-700 rounded-xl w-full max-w-2xl max-h-[80vh] overflow-hidden flex flex-col relative">
        {isLoading && (
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 rounded-xl">
            <div className="flex flex-col items-center gap-3">
              <Loader2 className="w-12 h-12 text-blue-500 animate-spin" />
              <p className="text-white text-lg font-semibold">Fetching price data...</p>
              <p className="text-slate-400 text-sm">This may take a few seconds</p>
            </div>
          </div>
        )}
        {!assetClass ? (
          <>
            <div className="p-6 border-b border-slate-700 flex items-center justify-between">
              <h2 className="text-xl font-bold text-white">Select Asset Class</h2>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsMinimized(true)}
                  className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
                  title="Minimize"
                >
                  <Minimize2 className="w-5 h-5 text-slate-400" />
                </button>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
                  title="Close"
                >
                  <X className="w-5 h-5 text-slate-400" />
                </button>
              </div>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-2 gap-3">
                {(Object.keys(assetClassConfig) as AssetClass[]).map((classKey) => {
                  const config = assetClassConfig[classKey];
                  const Icon = config.icon;
                  return (
                    <button
                      key={classKey}
                      onClick={() => setAssetClass(classKey)}
                      className="p-4 bg-slate-700 hover:bg-slate-600 border border-slate-600 rounded-lg transition-all text-left group"
                    >
                      <Icon className="w-6 h-6 text-slate-400 group-hover:text-white mb-2 transition-colors" />
                      <div className="text-white font-medium">{config.name}</div>
                    </button>
                  );
                })}
              </div>
            </div>
          </>
        ) : (
          <>
            <div className="p-6 border-b border-slate-700">
              <div className="flex items-center justify-between mb-4">
                <button
                  onClick={handleBack}
                  className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span className="text-sm">Back</span>
                </button>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setIsMinimized(true)}
                    className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
                    title="Minimize"
                  >
                    <Minimize2 className="w-5 h-5 text-slate-400" />
                  </button>
                  <button
                    onClick={onClose}
                    className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
                    title="Close"
                  >
                    <X className="w-5 h-5 text-slate-400" />
                  </button>
                </div>
              </div>
              <h2 className="text-xl font-bold text-white mb-1">Search {currentConfig?.name}</h2>
              {error && (
                <div className="mb-3 p-3 bg-red-900/50 border border-red-500 rounded-lg">
                  <p className="text-red-200 text-sm">{error}</p>
                </div>
              )}
              <form onSubmit={handleManualSubmit}>
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => {
                      const value = e.target.value.toUpperCase();
                      if (assetClass === 'forex') {
                        setSearchQuery(formatForexPair(value));
                      } else {
                        setSearchQuery(value);
                      }
                    }}
                    placeholder={
                      currentConfig?.useFinnhub
                        ? 'Search by ticker or company name...'
                        : currentConfig?.placeholder || 'Enter ticker...'
                    }
                    autoFocus
                    className="w-full pl-12 pr-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    style={{ textTransform: 'uppercase' }}
                  />
                </div>
                {assetClass === 'forex' && (
                  <button
                    type="submit"
                    disabled={!searchQuery.trim() || searchQuery.length < 7}
                    className="w-full mt-3 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-700 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors"
                  >
                    Add to Watchlist
                  </button>
                )}
              </form>
              {currentConfig?.useFinnhub && (
                <p className="text-xs text-slate-500 mt-2">Search for US stocks</p>
              )}
              {assetClass === 'crypto' && (
                <p className="text-xs text-slate-500 mt-2">Showing only USD pairs</p>
              )}
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              {loading && (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
                </div>
              )}

              {!loading && searchQuery && searchResults.length === 0 && cryptoResults.length === 0 && commodityResults.length === 0 && (
                <div className="text-center py-12">
                  <p className="text-slate-400">No results found</p>
                  <p className="text-slate-500 text-sm mt-1">Try a different search term</p>
                </div>
              )}

              {!loading && !searchQuery && (
                <div className="text-center py-12">
                  <Search className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                  <p className="text-slate-400">Start typing to search</p>
                </div>
              )}

              {!loading && searchResults.length > 0 && (
                <div className="space-y-2">
                  {searchResults.map((result) => (
                    <button
                      key={result.symbol}
                      onClick={() => handleSelect(result)}
                      className="w-full p-4 bg-slate-700 hover:bg-slate-600 border border-slate-600 rounded-lg transition-colors text-left"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-white font-bold text-lg">{result.symbol}</div>
                          <div className="text-slate-400 text-sm">{result.description}</div>
                        </div>
                        <div className="text-slate-500 text-sm">{result.type}</div>
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {!loading && cryptoResults.length > 0 && (
                <div className="space-y-2">
                  {cryptoResults.map((result, idx) => (
                    <button
                      key={`${result.symbol}-${idx}`}
                      onClick={() => handleCryptoSelect(result)}
                      className="w-full p-4 bg-slate-700 hover:bg-slate-600 border border-slate-600 rounded-lg transition-colors text-left"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-white font-bold text-lg">{result.symbol}</div>
                          <div className="text-slate-400 text-sm">{result.instrument_name}</div>
                          <div className="flex items-center gap-2 mt-1">
                            <div className="text-xs text-slate-500">{result.exchange}</div>
                          </div>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {!loading && commodityResults.length > 0 && (
                <div className="space-y-2">
                  {commodityResults.map((result, idx) => (
                    <button
                      key={`${result.symbol}-${idx}`}
                      onClick={() => handleCommoditySelect(result)}
                      className="w-full p-4 bg-slate-700 hover:bg-slate-600 border border-slate-600 rounded-lg transition-colors text-left"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-white font-bold text-lg">{result.symbol}</div>
                          <div className="text-slate-400 text-sm">{result.instrument_name}</div>
                          <div className="flex items-center gap-2 mt-1">
                            <div className="text-xs text-slate-500">{result.exchange}</div>
                            {result.country && <div className="text-xs text-slate-500">• {result.country}</div>}
                          </div>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
