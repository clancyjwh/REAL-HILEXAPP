import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { BarChart3, Loader2 } from 'lucide-react';

export default function RelativeValueLoadingPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { ticker, timeframe, exchange } = location.state || {};
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (!ticker || !timeframe || !exchange) {
      navigate('/tools/relative-value-index');
      return;
    }

    const fetchData = async () => {
      try {
        const response = await fetch('https://hook.us2.make.com/z532hhifpuire6jkr122cmpo0mdau80q', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            ticker: ticker.toUpperCase(),
            timeframe: parseInt(timeframe),
            exchange: exchange,
          }),
        });

        if (!response.ok) {
          throw new Error('Failed to fetch data');
        }

        const data = await response.json();

        navigate('/tools/relative-value-index/result', {
          state: { result: data, ticker, exchange, timeframe },
        });
      } catch (err) {
        navigate('/tools/relative-value-index', {
          state: { error: err instanceof Error ? err.message : 'An error occurred' },
        });
      }
    };

    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 90) return prev;
        return prev + 10;
      });
    }, 300);

    fetchData();

    return () => clearInterval(progressInterval);
  }, [ticker, timeframe, exchange, navigate]);

  return (
    <div className="min-h-screen pb-12 flex items-center justify-center">
      <div className="max-w-2xl w-full">
        <div className="bg-slate-900 border border-slate-700 rounded-xl p-12">
          <div className="flex flex-col items-center text-center space-y-8">
            <div className="p-4 bg-blue-500/10 rounded-full">
              <BarChart3 className="w-12 h-12 text-blue-500" />
            </div>

            <div>
              <h2 className="text-3xl font-bold text-white mb-2">Analyzing Relative Value</h2>
              <p className="text-slate-400 text-lg">
                Comparing {ticker} against {exchange}
              </p>
            </div>

            <div className="w-full space-y-4">
              <div className="w-full bg-slate-800 rounded-full h-3 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-blue-500 to-blue-600 transition-all duration-300 ease-out"
                  style={{ width: `${progress}%` }}
                />
              </div>

              <div className="flex items-center justify-center gap-2 text-slate-400">
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Processing data...</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
