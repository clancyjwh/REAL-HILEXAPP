import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Search, Loader2 } from 'lucide-react';

export default function AssetSearchLoadingPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { ticker } = location.state || {};
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!ticker) {
      navigate('/live-prices');
      return;
    }

    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 95) return prev;
        return prev + 5;
      });
    }, 100);

    const fetchAssetData = async () => {
      try {
        const response = await fetch('https://hook.us2.make.com/sbdbpbiskw0995xvsyqtjm8wlx133rcu', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ ticker })
        });

        const text = await response.text();

        if (!response.ok) throw new Error('Asset Not Found');

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

        setProgress(100);

        setTimeout(() => {
          navigate('/asset-search-result', { state: { result } });
        }, 500);
      } catch (err) {
        setError('Asset Not Found');
        clearInterval(progressInterval);
      }
    };

    fetchAssetData();

    return () => clearInterval(progressInterval);
  }, [ticker, navigate]);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="max-w-2xl w-full mx-auto px-4">
          <div className="bg-red-900/40 border border-red-600/50 rounded-xl p-8 text-center">
            <div className="text-red-400 text-xl mb-4">Error</div>
            <p className="text-white mb-6">{error}</p>
            <button
              onClick={() => navigate('/live-prices')}
              className="px-6 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg transition-colors"
            >
              Back to Live Prices
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="max-w-2xl w-full mx-auto px-4">
        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-12">
          <div className="flex flex-col items-center">
            <div className="flex items-center gap-3 mb-6">
              <Search className="w-8 h-8 text-orange-500" />
              <h1 className="text-3xl font-bold text-white">Searching Asset</h1>
            </div>

            <div className="flex items-center gap-2 mb-8">
              <Loader2 className="w-6 h-6 text-orange-500 animate-spin" />
              <p className="text-xl text-slate-300">
                Looking up <span className="text-orange-500 font-semibold">{ticker}</span>
              </p>
            </div>

            <div className="w-full bg-slate-900 rounded-full h-4 mb-4 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-orange-600 to-orange-500 transition-all duration-300 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>

            <p className="text-slate-400 text-sm">
              {progress < 50 ? 'Connecting to market data...' :
               progress < 95 ? 'Fetching asset information...' :
               'Almost there...'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
