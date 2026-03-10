import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Zap, Clock, TrendingUp, Loader2, AlertTriangle } from 'lucide-react';
import AssetSearchInput from '../components/AssetSearchInput';
import { checkRateLimit } from '../utils/rateLimiting';

const ALLOWED_HORIZONS = [1, 5, 10, 15, 30];

export default function ZeroDayOptionsPage() {
  const navigate = useNavigate();
  const [ticker, setTicker] = useState('');
  const [horizon, setHorizon] = useState(5);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [rateLimitError, setRateLimitError] = useState<string | null>(null);


  const handleHorizonChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setHorizon(parseInt(e.target.value));
  };

  const handleRunAnalysis = async () => {
    if (!ticker.trim()) {
      setError('Please enter a ticker symbol');
      return;
    }

    setRateLimitError(null);
    setIsAnalyzing(true);

    const rateLimitResult = await checkRateLimit('zero-day-options');

    if (!rateLimitResult.allowed) {
      setRateLimitError(rateLimitResult.message || 'Rate limit exceeded. Please try again later.');
      setIsAnalyzing(false);
      return;
    }

    navigate(`/tools/zero-day-options/loading?ticker=${encodeURIComponent(ticker)}&horizon=${horizon}`);
  };

  return (
    <>
      <div className="mb-8">
        <button
          onClick={() => navigate('/tools')}
          className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-6"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back to Tools</span>
        </button>

        <div className="flex items-center gap-3">
          <div className="p-2 bg-emerald-500/10 rounded-lg">
            <Zap className="w-6 h-6 text-emerald-500" />
          </div>
          <div>
            <h1 className="text-4xl font-bold text-white">Zero Day Options</h1>
            <p className="text-slate-400">Analyze ultra-short-term options strategies</p>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto">
        <div className="bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 rounded-xl p-8 shadow-xl">
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-3">
                Option Ticker
              </label>
              <AssetSearchInput
                value={ticker}
                onChange={setTicker}
                placeholder="Enter ticker (e.g., AAPL)"
                disabled={isAnalyzing}
                assetClass="stocks"
                borderColor="border-slate-700"
                focusColor="focus:ring-emerald-500 focus:border-emerald-500"
                className="bg-slate-900"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-3">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  <span>Look-ahead (minutes)</span>
                </div>
              </label>
              <select
                value={horizon}
                onChange={handleHorizonChange}
                className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all cursor-pointer"
                disabled={isAnalyzing}
              >
                {ALLOWED_HORIZONS.map((value) => (
                  <option key={value} value={value}>
                    {value} {value === 1 ? 'minute' : 'minutes'}
                  </option>
                ))}
              </select>
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500 rounded-lg p-4">
                <p className="text-red-400 text-sm">{error}</p>
              </div>
            )}

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
              onClick={handleRunAnalysis}
              disabled={isAnalyzing}
              className="w-full bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-500 hover:to-green-500 disabled:from-slate-700 disabled:to-slate-800 text-white font-semibold py-4 rounded-lg transition-all duration-300 flex items-center justify-center gap-3 shadow-lg hover:shadow-emerald-500/20 disabled:cursor-not-allowed"
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Analyzing...</span>
                </>
              ) : (
                <>
                  <TrendingUp className="w-5 h-5" />
                  <span>Run Analysis</span>
                </>
              )}
            </button>
          </div>
        </div>

        <div className="mt-8 bg-slate-800/50 border border-slate-700 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-3">About Zero Day Options</h3>
          <div className="space-y-2 text-slate-400 text-sm">
            <p>
              Zero Day Options analysis provides minute-level precision for ultra-short-term trading strategies.
            </p>
            <p>
              Select your target ticker and look-ahead period to analyze potential price movements.
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
