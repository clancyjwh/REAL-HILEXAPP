import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Activity, TrendingUp, TrendingDown, CheckCircle, XCircle } from 'lucide-react';
import AssetSearchInput from '../components/AssetSearchInput';

interface TimeHorizonData {
  Result: string;
  Signal: string;
  Correct: string;
  Daysback: string;
  Prediction: string;
}

interface HorizonResponseData {
  '30': string;
  '60': string;
  '90': string;
  '120': string;
  '150': string;
  '180': string;
  '210': string;
  '240': string;
  '270': string;
  '300': string;
  '330': string;
  '360': string;
  Analysis: string;
  'Win Rate': string;
  Parameters: string;
}

export default function HorizonOptimizerPage() {
  const navigate = useNavigate();
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [response, setResponse] = useState('');
  const [parsedData, setParsedData] = useState<HorizonResponseData | null>(null);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isLoading && progress < 100) {
      interval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 95) return prev;
          return prev + (100 - prev) * 0.004;
        });
      }, 100);
    }
    return () => clearInterval(interval);
  }, [isLoading, progress]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    setIsLoading(true);
    setProgress(0);
    setResponse('');

    try {
      const webhookResponse = await fetch('https://hook.us2.make.com/si7woong5skc1nqy4rzl6scy8rmszvqb', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          assetClass: 'stocks',
          input: input.trim(),
        }),
      });

      const data = await webhookResponse.text();
      setProgress(100);
      setResponse(data);

      try {
        const parsed = JSON.parse(data);
        setParsedData(parsed);
      } catch {
        setParsedData(null);
      }
    } catch (error) {
      setProgress(100);
      setResponse('Error: Failed to fetch data. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const parseHorizonData = (jsonString: string): TimeHorizonData | null => {
    try {
      return JSON.parse(jsonString);
    } catch {
      return null;
    }
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
        <div className="flex items-center gap-3">
          <div className="p-2 bg-violet-500/10 rounded-lg">
            <Activity className="w-6 h-6 text-violet-500" />
          </div>
          <div>
            <h1 className="text-4xl font-bold text-white">Horizon Optimizer</h1>
            <p className="text-slate-400">Explore Historical Parameter Performance</p>
            <p className="text-slate-500 text-sm mt-1">Horizon Optimizer analyzes past data to identify which parameter combinations showed the strongest historical results.</p>
          </div>
        </div>
      </div>

      <div className="max-w-4xl">
        <form onSubmit={handleSubmit} className="mb-8">
          <div className="bg-slate-900 border border-slate-700 rounded-xl p-6">
            <label htmlFor="input" className="block text-white font-medium mb-3">
              Enter Asset Ticker Symbol
            </label>
            <div className="flex gap-3">
              <AssetSearchInput
                value={input}
                onChange={setInput}
                placeholder="e.g., AAPL, TSLA, NVDA..."
                disabled={isLoading}
                assetClass="stocks"
                focusColor="focus:border-violet-500 focus:ring-violet-500"
              />
              <button
                type="submit"
                disabled={isLoading || !input.trim()}
                className="px-6 py-3 bg-violet-600 hover:bg-violet-700 disabled:bg-slate-700 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors"
              >
                {isLoading ? 'Analyzing...' : 'Optimize'}
              </button>
            </div>
          </div>
        </form>

        {isLoading && (
          <div className="bg-slate-900 border border-slate-700 rounded-xl p-6 mb-8">
            <div className="mb-3">
              <div className="flex items-center justify-between text-sm mb-2">
                <span className="text-slate-400">Running 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330, 360 day backtest analysis...</span>
                <span className="text-white font-medium">{Math.round(progress)}%</span>
              </div>
              <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-violet-500 to-violet-600 transition-all duration-300 ease-out"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          </div>
        )}

        {response && !isLoading && parsedData && (
          <div className="space-y-6">
            <button
              onClick={() => {
                navigate('/metric-definition?metric=parameters');
              }}
              className="w-full bg-gradient-to-br from-violet-900 to-violet-800 border border-violet-700 hover:border-violet-600 rounded-xl p-8 transition-all duration-200 hover:shadow-xl cursor-pointer text-left"
            >
              <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                <Activity className="w-6 h-6 text-violet-300" />
                Top Historical Parameters
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white/10 rounded-lg p-4">
                  <div className="text-violet-200 text-sm font-semibold mb-2">Asset</div>
                  <div className="text-white text-2xl font-bold">{input}</div>
                </div>
                <div className="bg-white/10 rounded-lg p-4">
                  <div className="text-violet-200 text-sm font-semibold mb-2">Indicator</div>
                  <div className="text-white text-2xl font-bold">{parsedData.Analysis || 'N/A'}</div>
                </div>
                <div className="bg-white/10 rounded-lg p-4">
                  <div className="text-violet-200 text-sm font-semibold mb-2">Parameters</div>
                  <div className="text-white text-2xl font-bold">{parsedData.Parameters || 'N/A'}</div>
                </div>
                <div className="bg-white/10 rounded-lg p-4">
                  <div className="text-violet-200 text-sm font-semibold mb-2">Historical Accuracy Rate</div>
                  <div className="text-white text-2xl font-bold">{parsedData['Win Rate'] || 'N/A'}</div>
                </div>
              </div>
            </button>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {['30', '60', '90', '120', '150', '180', '210', '240', '270', '300', '330', '360'].map((days) => {
                const horizonDataString = parsedData[days as keyof HorizonResponseData];
                if (!horizonDataString || typeof horizonDataString !== 'string') return null;

                const horizonData = parseHorizonData(horizonDataString);
                if (!horizonData) return null;

                const isCorrect = horizonData.Correct === 'true';
                const isUp = horizonData.Result.toUpperCase().includes('UP');
                const isPredictionUp = horizonData.Prediction === 'UP';

                return (
                  <div
                    key={days}
                    className={`border-2 rounded-xl p-6 ${
                      isCorrect
                        ? 'bg-green-900/20 border-green-700'
                        : 'bg-red-900/20 border-red-700'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-2xl font-bold text-white">{days} Days</h3>
                      {isCorrect ? (
                        <CheckCircle className="w-6 h-6 text-green-400" />
                      ) : (
                        <XCircle className="w-6 h-6 text-red-400" />
                      )}
                    </div>

                    <div className="space-y-4">
                      <div className="bg-slate-900/50 rounded-lg p-4">
                        <div className="text-slate-400 text-xs font-semibold mb-2">ACTUAL RESULT</div>
                        <div className={`flex items-center gap-2 ${isUp ? 'text-green-400' : 'text-red-400'}`}>
                          {isUp ? <TrendingUp className="w-5 h-5" /> : <TrendingDown className="w-5 h-5" />}
                          <span className="text-xl font-bold">{horizonData.Result}</span>
                        </div>
                      </div>

                      <div className="bg-slate-900/50 rounded-lg p-4">
                        <div className="text-slate-400 text-xs font-semibold mb-2">PREDICTION</div>
                        <div className={`flex items-center gap-2 ${isPredictionUp ? 'text-green-400' : 'text-red-400'}`}>
                          {isPredictionUp ? <TrendingUp className="w-5 h-5" /> : <TrendingDown className="w-5 h-5" />}
                          <span className="text-xl font-bold">{horizonData.Prediction}</span>
                        </div>
                      </div>

                      <div className="bg-slate-900/50 rounded-lg p-4">
                        <div className="text-slate-400 text-xs font-semibold mb-2">HISTORICAL ANALYSIS OUTPUT</div>
                        <div className="text-white text-xl font-bold">{horizonData.Signal}</div>
                      </div>

                      <div className={`text-center py-3 rounded-lg font-bold ${
                        isCorrect ? 'bg-green-500/20 text-green-300' : 'bg-red-500/20 text-red-300'
                      }`}>
                        {isCorrect ? '✓ ACCURATE' : '✗ INACCURATE'}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {response && !isLoading && !parsedData && (
          <div className="bg-slate-900 border border-slate-700 rounded-xl p-6">
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <Activity className="w-5 h-5 text-violet-500" />
              Raw Response
            </h2>
            <div className="bg-slate-800 rounded-lg p-4">
              <pre className="text-slate-300 whitespace-pre-wrap break-words font-mono text-sm">
                {response}
              </pre>
            </div>
          </div>
        )}

        <div className="mt-8 bg-slate-800/50 border border-slate-600 rounded-xl p-6">
          <p className="text-slate-400 text-sm leading-relaxed">
            This tool analyzes historical data to identify which parameter combinations showed the strongest past performance. Past performance does not guarantee future results. This analysis is for informational purposes only and does not constitute investment advice.
          </p>
        </div>
      </div>
    </>
  );
}
