import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Users, Search } from 'lucide-react';

type AnalysisType = 'quick' | 'balanced' | 'deep';

export default function ConsensusPage() {
  const { category } = useParams<{ category: string }>();
  const navigate = useNavigate();
  const [input, setInput] = useState('');
  const [selectedType, setSelectedType] = useState<AnalysisType>('balanced');
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [response, setResponse] = useState('');

  const getCategoryTitle = () => {
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
    let interval: NodeJS.Timeout;
    if (isLoading && progress < 100) {
      interval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 95) return prev;
          return prev + (100 - prev) * 0.008;
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
      const webhookResponse = await fetch('https://hook.us2.make.com/1jceva12y0wt6vsgeqh0b1acwcatr8ak', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: selectedType,
          input: input.trim(),
        }),
      });

      const data = await webhookResponse.text();
      setProgress(100);
      setResponse(data);
    } catch (error) {
      setProgress(100);
      setResponse('Error: Failed to fetch data. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <div className="mb-8">
        <button
          onClick={() => navigate(`/${category}/tools`)}
          className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-4"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Tools
        </button>
        <div className="flex items-center gap-3">
          <div className="p-2 bg-cyan-500/10 rounded-lg">
            <Users className="w-6 h-6 text-cyan-500" />
          </div>
          <div>
            <h1 className="text-4xl font-bold text-white">Consensus</h1>
            <p className="text-slate-400">{getCategoryTitle()}</p>
          </div>
        </div>
      </div>

      <div className="max-w-4xl">
        <form onSubmit={handleSubmit} className="mb-8">
          <div className="bg-slate-900 border border-slate-700 rounded-xl p-6 mb-4">
            <label htmlFor="input" className="block text-white font-medium mb-3">
              Enter Asset Ticker Symbol
            </label>
            <div className="relative mb-4">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                id="input"
                value={input}
                onChange={(e) => setInput(e.target.value.toUpperCase())}
                placeholder="e.g., BTC, AAPL, GC..."
                className="w-full pl-12 pr-4 py-3 bg-slate-800 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
                disabled={isLoading}
                style={{ textTransform: 'uppercase' }}
              />
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-700 rounded-xl p-6 mb-4">
            <label className="block text-white font-medium mb-3">
              Analysis Type
            </label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <button
                type="button"
                onClick={() => setSelectedType('quick')}
                disabled={isLoading}
                className={`p-4 rounded-lg border-2 transition-all duration-200 ${
                  selectedType === 'quick'
                    ? 'border-cyan-500 bg-cyan-500/10 text-white'
                    : 'border-slate-700 bg-slate-800 text-slate-400 hover:border-slate-600'
                }`}
              >
                <div className="font-semibold mb-1">Quick Search</div>
                <div className="text-xs text-slate-500">Fast analysis</div>
              </button>

              <button
                type="button"
                onClick={() => setSelectedType('balanced')}
                disabled={isLoading}
                className={`p-4 rounded-lg border-2 transition-all duration-200 ${
                  selectedType === 'balanced'
                    ? 'border-cyan-500 bg-cyan-500/10 text-white'
                    : 'border-slate-700 bg-slate-800 text-slate-400 hover:border-slate-600'
                }`}
              >
                <div className="font-semibold mb-1">Balanced</div>
                <div className="text-xs text-slate-500">Moderate depth</div>
              </button>

              <button
                type="button"
                onClick={() => setSelectedType('deep')}
                disabled={isLoading}
                className={`p-4 rounded-lg border-2 transition-all duration-200 ${
                  selectedType === 'deep'
                    ? 'border-cyan-500 bg-cyan-500/10 text-white'
                    : 'border-slate-700 bg-slate-800 text-slate-400 hover:border-slate-600'
                }`}
              >
                <div className="font-semibold mb-1">Deep Dive</div>
                <div className="text-xs text-slate-500">Comprehensive</div>
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="w-full px-6 py-3 bg-cyan-600 hover:bg-cyan-700 disabled:bg-slate-700 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors"
          >
            {isLoading ? 'Analyzing...' : 'Analyze Consensus'}
          </button>
        </form>

        {isLoading && (
          <div className="bg-slate-900 border border-slate-700 rounded-xl p-6 mb-8">
            <div className="mb-3">
              <div className="flex items-center justify-between text-sm mb-2">
                <span className="text-slate-400">Processing consensus analysis...</span>
                <span className="text-white font-medium">{Math.round(progress)}%</span>
              </div>
              <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-cyan-500 to-cyan-600 transition-all duration-300 ease-out"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          </div>
        )}

        {response && !isLoading && (
          <div className="bg-slate-900 border border-slate-700 rounded-xl p-6">
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <Users className="w-5 h-5 text-cyan-500" />
              Consensus Results
            </h2>
            <div className="bg-slate-800 rounded-lg p-4">
              <pre className="text-slate-300 whitespace-pre-wrap break-words font-mono text-sm">
                {response}
              </pre>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
