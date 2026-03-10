import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { BarChart3, ArrowLeft, Search, AlertTriangle } from 'lucide-react';
import AssetSearchInput from '../components/AssetSearchInput';
import { checkRateLimit } from '../utils/rateLimiting';

export default function RelativeValueIndexPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [ticker, setTicker] = useState('');
  const [timeframe, setTimeframe] = useState('7');
  const [exchange, setExchange] = useState('S&P 500');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [rateLimitError, setRateLimitError] = useState<string | null>(null);

  const timeframeOptions = [
    { label: '7 Days', value: '7' },
    { label: '1 Month', value: '30' },
    { label: '2 Months', value: '60' },
    { label: '3 Months', value: '90' },
    { label: '4 Months', value: '120' },
    { label: '6 Months', value: '180' },
    { label: '1 Year', value: '364' },
  ];

  const exchangeOptions = [
    { label: 'S&P 500', value: 'S&P 500' },
    { label: 'NASDAQ Composite', value: 'NASDAQ Composite' },
    { label: 'NASDAQ 100', value: 'NASDAQ 100' },
    { label: 'Dow Jones Industrial Average', value: 'Dow Jones Industrial Average' },
    { label: 'Russell 2000', value: 'Russell 2000' },
    { label: 'S&P/TSX Composite', value: 'S&P/TSX Composite' },
    { label: 'S&P/TSX 60', value: 'S&P/TSX 60' },
    { label: 'FTSE 100', value: 'FTSE 100' },
    { label: 'EURO STOXX 50', value: 'EURO STOXX 50' },
    { label: 'DAX', value: 'DAX' },
    { label: 'CAC 40', value: 'CAC 40' },
    { label: 'Nikkei 225', value: 'Nikkei 225' },
    { label: 'Hang Seng Index', value: 'Hang Seng Index' },
    { label: 'Shanghai Composite', value: 'Shanghai Composite' },
    { label: 'Shenzhen Component', value: 'Shenzhen Component' },
    { label: 'ASX 200', value: 'ASX 200' },
    { label: 'Nifty 50', value: 'Nifty 50' },
    { label: 'BSE Sensex', value: 'BSE Sensex' },
    { label: 'Bovespa', value: 'Bovespa' },
    { label: 'IPC', value: 'IPC' },
    { label: 'Straits Times Index', value: 'Straits Times Index' },
    { label: 'KOSPI', value: 'KOSPI' },
    { label: 'TAIEX', value: 'TAIEX' },
    { label: 'SET Index', value: 'SET Index' },
    { label: 'MOEX Russia Index', value: 'MOEX Russia Index' },
    { label: 'FTSE/JSE Top 40', value: 'FTSE/JSE Top 40' },
    { label: 'OMX Stockholm 30', value: 'OMX Stockholm 30' },
    { label: 'OMX Helsinki 25', value: 'OMX Helsinki 25' },
    { label: 'Oslo All Share', value: 'Oslo All Share' },
  ];

  useEffect(() => {
    if (location.state?.error) {
      setError(location.state.error);
    }
  }, [location]);

  const handleSearch = async () => {
    if (!ticker.trim()) {
      setError('Please enter an asset ticker');
      return;
    }

    setError('');
    setRateLimitError(null);
    setIsSubmitting(true);

    const rateLimitResult = await checkRateLimit('relative-value');

    if (!rateLimitResult.allowed) {
      setRateLimitError(rateLimitResult.message || 'Rate limit exceeded. Please try again later.');
      setIsSubmitting(false);
      return;
    }

    navigate('/tools/relative-value-index/loading', {
      state: { ticker, timeframe, exchange },
    });
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <div className="min-h-screen pb-12">
      <button
        onClick={() => navigate('/tools')}
        className="flex items-center gap-2 text-slate-400 hover:text-white mb-8 transition-colors"
      >
        <ArrowLeft className="w-5 h-5" />
        <span>Back to Tools</span>
      </button>

      <div className="mb-8">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-500/10 rounded-lg">
            <BarChart3 className="w-6 h-6 text-blue-500" />
          </div>
          <div>
            <h1 className="text-4xl font-bold text-white">Relative Value Index</h1>
            <p className="text-slate-400">Compare asset relative values over time</p>
          </div>
        </div>
      </div>

      <div className="max-w-4xl">
        <div className="bg-slate-900 border border-slate-700 rounded-xl p-8 mb-8">
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Asset Ticker
              </label>
              <AssetSearchInput
                value={ticker}
                onChange={setTicker}
                placeholder="Enter ticker (e.g., AAPL, TSLA)"
                assetClass="stocks"
                focusColor="focus:border-blue-500 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Exchange
              </label>
              <select
                value={exchange}
                onChange={(e) => setExchange(e.target.value)}
                className="w-full px-4 py-3 bg-slate-800 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-blue-500 transition-colors"
              >
                {exchangeOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Timeframe
              </label>
              <select
                value={timeframe}
                onChange={(e) => setTimeframe(e.target.value)}
                className="w-full px-4 py-3 bg-slate-800 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-blue-500 transition-colors"
              >
                {timeframeOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
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
              onClick={handleSearch}
              disabled={isSubmitting}
              className="w-full px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-700 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              <Search className="w-5 h-5" />
              Search
            </button>
          </div>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500 rounded-xl p-6 mb-8">
            <h2 className="text-xl font-bold text-red-400 mb-2">Error</h2>
            <p className="text-slate-300">{error}</p>
          </div>
        )}

        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6 mt-8">
          <p className="text-slate-300 text-sm leading-relaxed">
            <span className="font-semibold text-slate-200">Relative Value to the Index:</span> Compare an asset's historical price movements against a selected index to observe how closely they have moved together in the past. This is historical observation only and does not predict future correlation or performance.
          </p>
        </div>
      </div>
    </div>
  );
}
