import { useState } from 'react';
import { X, TrendingUp, TrendingDown, FileText } from 'lucide-react';

interface AssetSearchBannerProps {
  asset: string;
  price: number;
  priceChange: number;
  description?: string;
  onClose: () => void;
}

export default function AssetSearchBanner({ asset, price, priceChange, description, onClose }: AssetSearchBannerProps) {
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);
  const isPositive = priceChange >= 0;

  const bgColor = isPositive
    ? 'bg-gradient-to-r from-green-900/95 to-green-800/95'
    : 'bg-gradient-to-r from-red-900/95 to-red-800/95';

  const borderColor = isPositive ? 'border-green-600' : 'border-red-600';
  const textColor = isPositive ? 'text-green-300' : 'text-red-300';

  return (
    <div className={`fixed bottom-0 left-0 right-0 ${bgColor} border-t-2 ${borderColor} px-6 py-4 shadow-2xl z-50 ml-64 backdrop-blur-sm`}>
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-8">
            <div className="flex flex-col">
              <div className="text-white/70 text-xs font-medium mb-0.5">ASSET</div>
              <div className="text-white text-2xl font-bold">{asset}</div>
            </div>

            <div className="h-12 w-px bg-white/20"></div>

            <div className="flex flex-col">
              <div className="text-white/70 text-xs font-medium mb-0.5">PRICE</div>
              <div className="text-white text-2xl font-bold">
                ${price.toFixed(2)}
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
                  {isPositive ? '+' : ''}{priceChange.toFixed(2)}%
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

        {description && (
          <button
            onClick={() => setIsDescriptionExpanded(!isDescriptionExpanded)}
            className="w-full bg-black/20 rounded-lg p-3 border border-white/10 hover:bg-black/30 transition-colors text-left cursor-pointer"
          >
            <div className="flex items-center gap-2 text-xs font-semibold text-white/70 mb-2">
              <FileText className="w-3 h-3" />
              Description
            </div>
            <p className={`text-white/80 text-sm leading-relaxed ${isDescriptionExpanded ? '' : 'line-clamp-2'}`}>
              {description}
            </p>
            {!isDescriptionExpanded && (
              <div className="text-xs text-white/50 mt-1">Click to expand...</div>
            )}
          </button>
        )}
      </div>
    </div>
  );
}
