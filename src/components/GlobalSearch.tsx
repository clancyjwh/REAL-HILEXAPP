import { useState, useEffect } from 'react';
import { Search, X, Loader2, TrendingUp, DollarSign, Bitcoin, BarChart3, Minimize2 } from 'lucide-react';
import AssetSearchBanner from './AssetSearchBanner';

interface SearchResult {
  Asset?: string;
  asset?: string;
  Price?: number | string;
  price?: number | string;
  Description?: string;
  description?: string;
}

type AssetClass = 'stocks' | 'crypto' | 'forex' | 'commodities';

const assetClassConfig = {
  stocks: {
    name: 'Stocks',
    icon: TrendingUp,
    color: 'from-blue-500 to-cyan-500',
    borderColor: 'border-blue-500/50',
    placeholder: 'e.g., AAPL, TSLA, NVDA',
  },
  crypto: {
    name: 'Cryptocurrency',
    icon: Bitcoin,
    color: 'from-orange-500 to-amber-500',
    borderColor: 'border-orange-500/50',
    placeholder: 'e.g., BTC, ETH, SOL',
  },
  forex: {
    name: 'Forex',
    icon: DollarSign,
    color: 'from-green-500 to-emerald-500',
    borderColor: 'border-green-500/50',
    placeholder: 'e.g., EUR/USD, GBP/USD',
  },
  commodities: {
    name: 'Commodities',
    icon: BarChart3,
    color: 'from-amber-500 to-yellow-500',
    borderColor: 'border-amber-500/50',
    placeholder: 'e.g., XAU/USD, HG1, C_1, WTI/USD',
  },
};

export default function GlobalSearch() {
  const [ticker, setTicker] = useState('');
  const [assetClass, setAssetClass] = useState<AssetClass | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [searchResult, setSearchResult] = useState<SearchResult | null>(null);
  const [priceChange] = useState(() => (Math.random() - 0.5) * 10);
  const [isCollapsed, setIsCollapsed] = useState(false);

  useEffect(() => {
    const handleExpandSearch = () => {
      setIsExpanded(true);
    };

    window.addEventListener('expandGlobalSearch', handleExpandSearch);
    return () => {
      window.removeEventListener('expandGlobalSearch', handleExpandSearch);
    };
  }, []);

  const formatForexPair = (value: string): string => {
    const cleaned = value.replace(/[^A-Z]/gi, '').toUpperCase();
    if (cleaned.length === 6) {
      return `${cleaned.slice(0, 3)}/${cleaned.slice(3)}`;
    }
    return value;
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!ticker.trim() || !assetClass) {
      return;
    }

    setIsSearching(true);
    const searchTicker = ticker.toUpperCase();

    try {
      const response = await fetch('https://hook.us2.make.com/sbdbpbiskw0995xvsyqtjm8wlx133rcu', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ticker: searchTicker,
          asset_class: assetClass,
        })
      });

      if (!response.ok) throw new Error('Failed to fetch asset data');

      const text = await response.text();

      const lines = text.split('\n');
      const result: Record<string, string> = {};

      lines.forEach(line => {
        const colonIndex = line.indexOf(':');
        if (colonIndex > -1) {
          const key = line.substring(0, colonIndex).trim();
          const value = line.substring(colonIndex + 1).trim();
          result[key] = value;
        }
      });

      setSearchResult(result);
      setTicker('');
      setAssetClass(null);
      setIsExpanded(false);
    } catch (error) {
      console.error('Error searching asset:', error);
      alert('Asset not found');
    } finally {
      setIsSearching(false);
    }
  };

  const handleClose = () => {
    setTicker('');
    setAssetClass(null);
    setIsExpanded(false);
  };

  const handleCloseBanner = () => {
    setSearchResult(null);
  };

  const handleAssetClassSelect = (selectedClass: AssetClass) => {
    setAssetClass(selectedClass);
  };

  const handleBack = () => {
    setAssetClass(null);
    setTicker('');
  };

  const asset = searchResult?.Asset || searchResult?.asset || '';
  const priceValue = typeof searchResult?.Price === 'number' ? searchResult.Price :
                     typeof searchResult?.price === 'number' ? searchResult.price :
                     parseFloat(String(searchResult?.Price || searchResult?.price || 0));
  const description = searchResult?.Description || searchResult?.description || '';

  const currentConfig = assetClass ? assetClassConfig[assetClass] : null;

  return (
    <>
      {isCollapsed ? (
        <div
          onClick={() => setIsCollapsed(false)}
          className="fixed right-0 top-1/2 -translate-y-1/2 z-50 cursor-pointer"
          style={{
            width: '40px',
            height: '60px',
            backgroundColor: '#FF7A1A',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            writingMode: 'vertical-rl',
            textOrientation: 'mixed',
            color: 'white',
            fontWeight: '600',
            fontSize: '14px'
          }}
        >
          Search
        </div>
      ) : (
        <div className="fixed bottom-8 right-8 z-50">
          <div id="searchPriceContainer" className="relative">
            <button
              onClick={() => setIsCollapsed(true)}
              style={{
                position: 'absolute',
                top: '-8px',
                left: '-8px',
                width: '24px',
                height: '24px',
                backgroundColor: '#333',
                color: 'white',
                borderRadius: '6px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                border: 'none',
                fontSize: '16px',
                fontWeight: 'bold',
                zIndex: 10
              }}
            >
              –
            </button>
            <div className={`transition-all duration-300 ${isExpanded ? 'w-96' : 'w-auto'}`}>
              {!isExpanded ? (
                <button
                  onClick={() => setIsExpanded(true)}
                  disabled={isSearching}
                  className="flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 text-white rounded-xl transition-all shadow-xl hover:shadow-orange-500/50 hover:scale-105 active:scale-95 border-2 border-orange-400/70 font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSearching ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>Searching...</span>
                    </>
                  ) : (
                    <>
                      <Search className="w-5 h-5" />
                      <span>Search Asset Price</span>
                    </>
                  )}
                </button>
              ) : !assetClass ? (
                <div className="bg-slate-800 border-2 border-orange-500/50 rounded-xl p-4 shadow-xl">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-white font-semibold">Select Asset Class</h3>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setIsExpanded(false)}
                        className="p-1 hover:bg-slate-700 rounded transition-colors"
                        title="Minimize"
                      >
                        <Minimize2 className="w-5 h-5 text-slate-400" />
                      </button>
                      <button
                        onClick={handleClose}
                        className="p-1 hover:bg-slate-700 rounded transition-colors"
                        title="Close"
                      >
                        <X className="w-5 h-5 text-slate-400" />
                      </button>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {(Object.keys(assetClassConfig) as AssetClass[]).map((classKey) => {
                      const config = assetClassConfig[classKey];
                      const Icon = config.icon;
                      return (
                        <button
                          key={classKey}
                          onClick={() => handleAssetClassSelect(classKey)}
                          className="p-3 bg-slate-700 hover:bg-slate-600 border border-slate-600 rounded-lg transition-all text-left group"
                        >
                          <Icon className="w-5 h-5 text-slate-400 group-hover:text-white mb-1 transition-colors" />
                          <div className="text-white text-sm font-medium">{config.name}</div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSearch} className="bg-slate-800 border-2 border-orange-500/50 rounded-xl p-4 shadow-xl">
                  <div className="flex items-center justify-between mb-3">
                    <button
                      type="button"
                      onClick={handleBack}
                      className="text-slate-400 hover:text-white text-sm transition-colors"
                    >
                      ← Back
                    </button>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setIsExpanded(false)}
                        className="p-1 hover:bg-slate-700 rounded transition-colors"
                        title="Minimize"
                      >
                        <Minimize2 className="w-5 h-5 text-slate-400" />
                      </button>
                      <button
                        type="button"
                        onClick={handleClose}
                        className="p-1 hover:bg-slate-700 rounded transition-colors"
                        title="Close"
                      >
                        <X className="w-5 h-5 text-slate-400" />
                      </button>
                    </div>
                  </div>
                  <div className="mb-3">
                    <div className="text-slate-400 text-xs mb-1">Asset Class</div>
                    <div className="text-white font-medium">{currentConfig?.name}</div>
                  </div>
                  <div className="relative mb-3">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input
                      type="text"
                      value={ticker}
                      onChange={(e) => {
                        const value = e.target.value.toUpperCase();
                        if (assetClass === 'forex') {
                          setTicker(formatForexPair(value));
                        } else {
                          setTicker(value);
                        }
                      }}
                      placeholder={currentConfig?.placeholder}
                      className="w-full pl-10 pr-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500/20 transition-all text-sm"
                      autoFocus
                      disabled={isSearching}
                      style={{ textTransform: 'uppercase' }}
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={isSearching || !ticker.trim()}
                    className="w-full px-4 py-2 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 disabled:from-slate-600 disabled:to-slate-700 text-white rounded-lg transition-all font-semibold disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm"
                  >
                    {isSearching ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Searching...</span>
                      </>
                    ) : (
                      'Search'
                    )}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      )}

      {searchResult && (
        <AssetSearchBanner
          asset={asset}
          price={priceValue}
          priceChange={priceChange}
          description={description}
          onClose={handleCloseBanner}
        />
      )}
    </>
  );
}
