import { useEffect, useState } from 'react';
import { X, TrendingUp, TrendingDown } from 'lucide-react';
import { finnhubService, StockQuote } from '../lib/finnhub';

interface LivePriceBannerProps {
  ticker: string;
  companyName: string;
  onClose: () => void;
}

export default function LivePriceBanner({ ticker, companyName, onClose }: LivePriceBannerProps) {
  const [quote, setQuote] = useState<StockQuote | null>(null);

  useEffect(() => {
    if (!ticker) return;

    const fetchQuote = async () => {
      const data = await finnhubService.getQuote(ticker);
      setQuote(data);
    };

    fetchQuote();
    const interval = setInterval(fetchQuote, 5000);

    return () => clearInterval(interval);
  }, [ticker]);

  if (!quote) {
    return (
      <div className="fixed bottom-0 left-0 right-0 bg-slate-900 border-t-2 border-slate-700 px-6 py-4 shadow-2xl z-50 ml-64">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-6">
            <div className="text-white text-lg">Loading...</div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors p-1"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>
    );
  }

  const priceChange = quote.d || 0;
  const percentChange = quote.dp || 0;
  const isPositive = priceChange >= 0;

  const bgColor = isPositive
    ? 'bg-gradient-to-r from-green-900/90 to-green-800/90'
    : 'bg-gradient-to-r from-red-900/90 to-red-800/90';

  const borderColor = isPositive ? 'border-green-600' : 'border-red-600';
  const textColor = isPositive ? 'text-green-300' : 'text-red-300';

  return (
    <div className={`fixed bottom-0 left-0 right-0 ${bgColor} border-t-2 ${borderColor} px-6 py-4 shadow-2xl z-50 ml-64 backdrop-blur-sm`}>
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-8">
          <div className="flex flex-col">
            <div className="text-white/70 text-xs font-medium mb-0.5">TICKER</div>
            <div className="text-white text-2xl font-bold">{ticker}</div>
          </div>

          <div className="h-12 w-px bg-white/20"></div>

          <div className="flex flex-col">
            <div className="text-white/70 text-xs font-medium mb-0.5">PRICE</div>
            <div className="text-white text-2xl font-bold">
              ${quote.c?.toFixed(2) || '0.00'}
            </div>
          </div>

          <div className="h-12 w-px bg-white/20"></div>

          <div className="flex flex-col">
            <div className="text-white/70 text-xs font-medium mb-0.5">CHANGE</div>
            <div className={`flex items-center gap-2 text-xl font-semibold ${textColor}`}>
              {isPositive ? (
                <TrendingUp className="w-5 h-5" />
              ) : (
                <TrendingDown className="w-5 h-5" />
              )}
              <span>
                {isPositive ? '+' : ''}{priceChange.toFixed(2)} ({isPositive ? '+' : ''}{percentChange.toFixed(2)}%)
              </span>
            </div>
          </div>
        </div>

        <button
          onClick={onClose}
          className="text-white/60 hover:text-white transition-colors p-2 hover:bg-white/10 rounded-lg"
        >
          <X className="w-6 h-6" />
        </button>
      </div>
    </div>
  );
}
