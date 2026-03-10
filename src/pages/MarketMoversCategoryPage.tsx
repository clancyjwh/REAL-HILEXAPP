import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Bitcoin, DollarSign, TrendingUp, Gem, Globe, Zap, Loader2 } from 'lucide-react';

type SearchMode = 'quick' | 'balanced' | 'deep';

interface Asset {
  id: string;
  name: string;
  symbol: string;
  color: string;
}

const cryptoAssets: Asset[] = [
  { id: 'btc', name: 'Bitcoin', symbol: 'BTC', color: 'orange' },
  { id: 'eth', name: 'Ethereum', symbol: 'ETH', color: 'blue' },
  { id: 'sol', name: 'Solana', symbol: 'SOL', color: 'green' },
  { id: 'xrp', name: 'Ripple', symbol: 'XRP', color: 'slate' },
];

const forexAssets: Asset[] = [
  { id: 'cad-usd', name: 'CAD/USD', symbol: 'CADUSD', color: 'red' },
  { id: 'eur-usd', name: 'EUR/USD', symbol: 'EURUSD', color: 'blue' },
  { id: 'gbp-usd', name: 'GBP/USD', symbol: 'GBPUSD', color: 'green' },
  { id: 'usd-jpy', name: 'USD/JPY', symbol: 'USDJPY', color: 'orange' },
];

const stockAssets: Asset[] = [
  { id: 'aapl', name: 'Apple', symbol: 'AAPL', color: 'slate' },
  { id: 'msft', name: 'Microsoft', symbol: 'MSFT', color: 'blue' },
  { id: 'googl', name: 'Google', symbol: 'GOOGL', color: 'green' },
  { id: 'tsla', name: 'Tesla', symbol: 'TSLA', color: 'red' },
];

const commodityAssets: Asset[] = [
  { id: 'gold', name: 'Gold', symbol: 'GOLD', color: 'orange' },
  { id: 'silver', name: 'Silver', symbol: 'SILVER', color: 'slate' },
  { id: 'oil', name: 'Crude Oil', symbol: 'OIL', color: 'red' },
  { id: 'gas', name: 'Natural Gas', symbol: 'NATGAS', color: 'blue' },
];

const colorClasses = {
  orange: 'bg-orange-900/30 border-orange-700 hover:bg-orange-900/50',
  blue: 'bg-blue-900/30 border-blue-700 hover:bg-blue-900/50',
  green: 'bg-green-900/30 border-green-700 hover:bg-green-900/50',
  red: 'bg-red-900/30 border-red-700 hover:bg-red-900/50',
  slate: 'bg-slate-800 border-slate-700 hover:bg-slate-700',
};

export default function MarketMoversCategoryPage() {
  const { category } = useParams<{ category: string }>();
  const navigate = useNavigate();
  const [customInput, setCustomInput] = useState('');
  const [selectedAssets, setSelectedAssets] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [searchMode, setSearchMode] = useState<SearchMode>('balanced');

  const getCategoryConfig = () => {
    switch (category) {
      case 'crypto':
        return {
          title: 'Crypto Market Movers',
          subtitle: 'Select one or more cryptocurrencies to analyze',
          customLabel: 'Add Custom Cryptocurrencies',
          customPlaceholder: 'e.g., BTC, ETH, DOGE, XRP (comma separated)',
          trendingLabel: 'Select trending cryptocurrencies',
          icon: Bitcoin,
          assets: cryptoAssets,
          generalText: 'General Analysis - All Crypto',
        };
      case 'forex':
        return {
          title: 'Forex Market Movers',
          subtitle: 'Select one or more currency pairs to analyze',
          customLabel: 'Add Custom Currency Pairs',
          customPlaceholder: 'e.g., EUR/USD, GBP/JPY, AUD/CAD (comma separated)',
          trendingLabel: 'Select trending pairs',
          icon: DollarSign,
          assets: forexAssets,
          generalText: 'General Analysis - All Forex',
        };
      case 'stocks':
        return {
          title: 'Stock Market Movers',
          subtitle: 'Select one or more stocks to analyze',
          customLabel: 'Add Custom Stocks',
          customPlaceholder: 'e.g., AAPL, MSFT, TSLA, NVDA (comma separated)',
          trendingLabel: 'Select trending stocks',
          icon: TrendingUp,
          assets: stockAssets,
          generalText: 'General Analysis - All Stocks',
        };
      case 'commodities':
        return {
          title: 'Commodities Market Movers',
          subtitle: 'Select one or more commodities to analyze',
          customLabel: 'Add Custom Commodities',
          customPlaceholder: 'e.g., Gold, Silver, Oil (comma separated)',
          trendingLabel: 'Select trending commodities',
          icon: Gem,
          assets: commodityAssets,
          generalText: 'General Analysis - All Commodities',
        };
      case 'general':
        return {
          title: 'General Market Scan',
          subtitle: 'Comprehensive market analysis across all asset classes',
          customLabel: 'Add Custom Assets',
          customPlaceholder: 'e.g., BTC, AAPL, EUR/USD, Gold (comma separated)',
          trendingLabel: 'Select from all markets',
          icon: Globe,
          assets: [...cryptoAssets, ...forexAssets, ...stockAssets, ...commodityAssets].slice(0, 8),
          generalText: 'General Analysis - All Markets',
        };
      default:
        return {
          title: 'Market Movers',
          subtitle: 'Select assets to analyze',
          customLabel: 'Add Custom Assets',
          customPlaceholder: 'Enter asset symbols',
          trendingLabel: 'Select trending assets',
          icon: Zap,
          assets: [],
          generalText: 'General Analysis',
        };
    }
  };

  const config = getCategoryConfig();
  const Icon = config.icon;

  const toggleAsset = (assetId: string) => {
    const newSelected = new Set(selectedAssets);
    if (newSelected.has(assetId)) {
      newSelected.delete(assetId);
    } else {
      newSelected.add(assetId);
    }
    setSelectedAssets(newSelected);
  };

  const handleAnalyze = async () => {
    if (selectedAssets.size === 0 && !customInput.trim()) return;

    setIsLoading(true);
    setError(null);

    try {
      const selectedSymbols = Array.from(selectedAssets)
        .map(id => config.assets.find(a => a.id === id)?.symbol)
        .filter(Boolean) as string[];

      const customSymbols = customInput
        .split(',')
        .map(s => s.trim().toUpperCase().replace(/\//g, ''))
        .filter(Boolean);

      const allSymbols = [...selectedSymbols, ...customSymbols].join(',');

      const assetClassForWebhook = category === 'commodities' ? 'commodity' : category;

      const response = await fetch('https://hook.us2.make.com/j6gxkwarlmiajxflrtvn2e1mb2lgrdjj', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          asset_class: assetClassForWebhook,
          asset: allSymbols,
          search_mode: searchMode
        })
      });

      const text = await response.text();
      setAnalysisResult(text);
    } catch (err) {
      setError('Error connecting to service. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGeneralAnalysis = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const assetClassForWebhook = category === 'commodities' ? 'commodity' : category;

      const response = await fetch('https://hook.us2.make.com/j6gxkwarlmiajxflrtvn2e1mb2lgrdjj', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          asset_class: assetClassForWebhook,
          asset: '',
          search_mode: searchMode
        })
      });

      const text = await response.text();
      setAnalysisResult(text);
    } catch (err) {
      setError('Error connecting to service. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleNewAnalysis = () => {
    setAnalysisResult(null);
    setError(null);
    setSelectedAssets(new Set());
    setCustomInput('');
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Loader2 className="w-16 h-16 text-amber-500 animate-spin mb-4" />
        <h2 className="text-2xl font-bold text-white mb-2">Analyzing market movements...</h2>
        <p className="text-slate-400">This may take up to 2 minutes</p>
      </div>
    );
  }

  if (analysisResult) {
    return (
      <>
        <div className="mb-8">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-500/10 rounded-lg">
              <Icon className="w-6 h-6 text-amber-500" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-white">Analysis Results</h1>
              <p className="text-slate-400">{config.title}</p>
            </div>
          </div>
        </div>

        <div className="max-w-4xl space-y-6">
          <div className="bg-slate-900 border border-slate-700 rounded-xl p-8">
            <div className="text-white whitespace-pre-wrap leading-relaxed">
              {analysisResult}
            </div>
          </div>

          <div className="flex gap-4">
            <button
              onClick={handleNewAnalysis}
              className="flex-1 px-6 py-4 bg-amber-600 hover:bg-amber-700 text-white font-bold text-lg rounded-xl transition-colors"
            >
              New Analysis
            </button>
            <button
              onClick={() => navigate('/')}
              className="flex-1 px-6 py-4 bg-slate-800 hover:bg-slate-700 border border-slate-600 text-white font-medium text-lg rounded-xl transition-colors"
            >
              Home
            </button>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <div className="mb-8">
        <button
          onClick={() => navigate('/market-movers')}
          className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-4"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Market Movers
        </button>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-500/10 rounded-lg">
              <Icon className="w-6 h-6 text-amber-500" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-white">{config.title}</h1>
              <p className="text-slate-400">{config.subtitle}</p>
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => setSearchMode('quick')}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                searchMode === 'quick'
                  ? 'bg-amber-600 text-white shadow-lg shadow-amber-500/30'
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
                  ? 'bg-amber-600 text-white shadow-lg shadow-amber-500/30'
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
                  ? 'bg-amber-600 text-white shadow-lg shadow-amber-500/30'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700'
              }`}
              title="Deep Dive - More thorough analysis, longer wait time"
            >
              Deep Dive
            </button>
          </div>
        </div>

        <div className="mt-4 text-center">
          <p className="text-sm text-slate-400">
            {searchMode === 'quick' && 'Quick Search: Surface level scan for faster results'}
            {searchMode === 'balanced' && 'Balanced: Moderate depth and speed'}
            {searchMode === 'deep' && 'Deep Dive: More thorough analysis with longer wait time'}
          </p>
        </div>
      </div>

      {error && (
        <div className="max-w-4xl mb-6 p-4 bg-red-900/20 border border-red-700 rounded-xl text-red-400">
          {error}
        </div>
      )}

      <div className="max-w-4xl space-y-8">
        <div className="bg-slate-900 border border-slate-700 rounded-xl p-6">
          <label htmlFor="custom-input" className="block text-white font-medium mb-3">
            {config.customLabel}
          </label>
          <input
            type="text"
            id="custom-input"
            value={customInput}
            onChange={(e) => setCustomInput(e.target.value)}
            placeholder={config.customPlaceholder}
            className="w-full px-4 py-3 bg-slate-800 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
          />
        </div>

        <div>
          <h3 className="text-white text-lg font-medium mb-4 text-center">
            {config.trendingLabel}
          </h3>
          <div className="space-y-3">
            {config.assets.map((asset) => {
              const isSelected = selectedAssets.has(asset.id);
              const colorClass = colorClasses[asset.color as keyof typeof colorClasses];

              return (
                <button
                  key={asset.id}
                  onClick={() => toggleAsset(asset.id)}
                  className={`w-full flex items-center gap-4 p-4 rounded-xl border-2 transition-all ${
                    isSelected
                      ? 'border-amber-500 bg-amber-500/10'
                      : colorClass
                  }`}
                >
                  <div className={`w-6 h-6 rounded border-2 flex items-center justify-center transition-all ${
                    isSelected
                      ? 'bg-amber-500 border-amber-500'
                      : 'border-slate-600 bg-slate-900'
                  }`}>
                    {isSelected && (
                      <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>
                  <span className="text-xl font-bold text-white">{asset.name}</span>
                  <span className="text-slate-400">({asset.name.includes('/') ? asset.name : asset.symbol})</span>
                </button>
              );
            })}
          </div>
        </div>

        <button
          onClick={handleAnalyze}
          disabled={selectedAssets.size === 0 && !customInput.trim()}
          className="w-full px-6 py-4 bg-amber-600 hover:bg-amber-700 disabled:bg-slate-700 disabled:cursor-not-allowed text-white font-bold text-lg rounded-xl transition-colors"
        >
          Analyze Selected Assets ({selectedAssets.size + (customInput.trim() ? customInput.split(',').filter(s => s.trim()).length : 0)})
        </button>

        <button
          onClick={handleGeneralAnalysis}
          className="w-full px-6 py-4 bg-slate-800 hover:bg-slate-700 border border-slate-600 text-white font-medium text-lg rounded-xl transition-colors"
        >
          {config.generalText}
        </button>
      </div>
    </>
  );
}
