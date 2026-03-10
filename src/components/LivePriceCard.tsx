import { Plus } from 'lucide-react';

interface LivePriceCardProps {
  ticker?: string;
  companyName?: string;
  slotPosition: number;
  onAddClick: () => void;
  onRemove?: (slotPosition: number) => void;
  onClick?: (ticker: string, companyName: string) => void;
  assetClass?: string;
  currentPrice?: number;
  priceChange?: number;
  priceChangePercent?: number;
}

export default function LivePriceCard({
  ticker,
  companyName,
  slotPosition,
  onAddClick,
  onRemove,
  onClick,
  assetClass,
  currentPrice,
  priceChange = 0,
  priceChangePercent = 0
}: LivePriceCardProps) {

  if (!ticker || currentPrice === undefined || currentPrice === null) {
    return (
      <button
        onClick={onAddClick}
        className="w-full h-48 bg-slate-900 border-2 border-dashed border-slate-700 rounded-xl hover:border-slate-600 hover:bg-slate-800/50 transition-all duration-300 flex flex-col items-center justify-center gap-3 group"
      >
        <div className="w-16 h-16 rounded-full bg-slate-800 flex items-center justify-center group-hover:bg-slate-700 transition-colors">
          <Plus className="w-8 h-8 text-slate-600 group-hover:text-slate-400 transition-colors" />
        </div>
        <div className="text-center">
          <div className="text-slate-500 font-medium">Empty Slot</div>
          <div className="text-slate-600 text-sm">Click to add</div>
        </div>
      </button>
    );
  }

  const isPositive = priceChange >= 0;

  const bgColor = isPositive
    ? 'bg-gradient-to-br from-emerald-600 to-green-600'
    : 'bg-gradient-to-br from-red-600 to-rose-600';

  const pulseColor = isPositive ? 'animate-pulse-green' : 'animate-pulse-red';

  const formatPrice = (price: number) => {
    if (assetClass === 'forex') {
      return price.toFixed(5);
    }
    if (assetClass === 'crypto' && price > 1000) {
      return price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    }
    return price.toFixed(2);
  };

  return (
    <div
      onClick={() => onClick?.(ticker, companyName)}
      className={`relative w-full h-48 ${bgColor} ${pulseColor} rounded-xl p-6 shadow-xl border-2 ${isPositive ? 'border-emerald-400' : 'border-red-400'} group cursor-pointer hover:scale-105 transition-transform duration-200`}
    >
      {onRemove && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onRemove(slotPosition);
          }}
          className="absolute top-2 right-2 w-8 h-8 rounded-full bg-black/40 hover:bg-black/60 flex items-center justify-center transition-all"
        >
          <span className="text-white font-bold text-lg">×</span>
        </button>
      )}

      <div className="flex flex-col h-full justify-between">
        <div>
          <div className="text-sm text-white/80 font-medium mb-1">#{slotPosition}</div>
          <div className="text-2xl font-bold text-white mb-1">
            {assetClass === 'crypto' && ticker.includes('/') ? ticker.split('/')[0] : ticker}
          </div>
          <div className="text-sm text-white/90 line-clamp-1">{companyName}</div>
        </div>

        <div>
          <div className="text-3xl font-bold text-white mb-2">
            ${formatPrice(currentPrice)}
          </div>
          <div className="flex items-center gap-2">
            <span className="text-white/90 font-semibold">
              {isPositive ? '+' : ''}{priceChange.toFixed(2)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
