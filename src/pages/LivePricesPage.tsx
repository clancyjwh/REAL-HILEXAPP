import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowUp, ArrowDown, TrendingUp, Bitcoin, DollarSign, Gem, Search, Loader2 } from 'lucide-react';
import { useCryptoData } from '../hooks/useCryptoData';
import { useStocksData } from '../hooks/useStocksData';
import { useCommoditiesData } from '../hooks/useCommoditiesData';
import { useForexData } from '../hooks/useForexData';
import { Asset } from '../types/market';

interface PriceCardProps {
  symbol: string;
  name: string;
  price: number | null;
  change: number | null;
  loading: boolean;
  icon?: React.ReactNode;
}

const PriceCard = ({ symbol, name, price, change, loading, icon }: PriceCardProps) => {
  const isPositive = (change ?? 0) >= 0;
  const bgColor = isPositive ? 'bg-green-900/20' : 'bg-red-900/20';
  const borderColor = isPositive ? 'border-green-600/30' : 'border-red-600/30';
  const textColor = isPositive ? 'text-green-400' : 'text-red-400';

  return (
    <div className={`${bgColor} border ${borderColor} rounded-xl p-6 transition-all duration-300`}>
      <div className="flex items-center gap-2 mb-2">
        {icon}
        <div className="text-sm font-semibold text-white">{symbol}</div>
      </div>
      <div className="text-xs text-slate-400 mb-3">{name}</div>
      {loading ? (
        <div className="flex items-center gap-2 text-slate-400">
          <Loader2 className="w-4 h-4 animate-spin" />
          <span className="text-sm">Loading...</span>
        </div>
      ) : price !== null ? (
        <>
          <div className="text-2xl font-bold text-white mb-2">
            ${price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          {change !== null && (
            <div className={`flex items-center gap-1 text-sm ${textColor}`}>
              {isPositive ? (
                <ArrowUp className="w-4 h-4" />
              ) : (
                <ArrowDown className="w-4 h-4" />
              )}
              <span>{change >= 0 ? '+' : ''}{change.toFixed(2)}%</span>
              <span className="text-slate-500 ml-1">24h</span>
            </div>
          )}
        </>
      ) : (
        <div className="text-slate-500 text-sm">No data</div>
      )}
    </div>
  );
};

interface SearchResult {
  symbol: string;
  name: string;
  price: number;
  change: number;
}

export default function LivePricesPage() {
  const navigate = useNavigate();
  const cryptocurrencies = useCryptoData();
  const stocks = useStocksData();
  const commodities = useCommoditiesData();
  const forex = useForexData();

  const [searchSymbol, setSearchSymbol] = useState('');

  const handleSearch = async () => {
    if (!searchSymbol.trim()) return;
    navigate('/asset-search-loading', { state: { symbol: searchSymbol.toUpperCase() } });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchSymbol(e.target.value.toUpperCase());
  };

  return (
    <div className="min-h-screen pb-12">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <TrendingUp className="w-10 h-10 text-orange-500" />
          <h1 className="text-4xl font-bold text-white">Live Prices</h1>
        </div>
        <p className="text-slate-400 text-lg">Real-time market data across all asset classes</p>
      </div>

      <div className="space-y-8">
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Bitcoin className="w-6 h-6 text-orange-500" />
            <h2 className="text-2xl font-bold text-white">Cryptocurrency</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {cryptocurrencies.map((crypto: Asset) => (
              <PriceCard
                key={crypto.symbol}
                {...crypto}
                icon={<Bitcoin className="w-5 h-5 text-orange-500" />}
              />
            ))}
          </div>
        </div>

        <div>
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-6 h-6 text-blue-500" />
            <h2 className="text-2xl font-bold text-white">Stocks</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {stocks.map((stock: Asset) => (
              <PriceCard
                key={stock.symbol}
                {...stock}
                icon={<TrendingUp className="w-5 h-5 text-blue-500" />}
              />
            ))}
          </div>
        </div>

        <div>
          <div className="flex items-center gap-2 mb-4">
            <Gem className="w-6 h-6 text-yellow-500" />
            <h2 className="text-2xl font-bold text-white">Commodities</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {commodities.map((commodity: Asset) => (
              <PriceCard
                key={commodity.symbol}
                {...commodity}
                icon={<Gem className="w-5 h-5 text-yellow-500" />}
              />
            ))}
          </div>
        </div>

        <div>
          <div className="flex items-center gap-2 mb-4">
            <DollarSign className="w-6 h-6 text-green-500" />
            <h2 className="text-2xl font-bold text-white">Forex</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {forex.map((pair: Asset) => (
              <PriceCard
                key={pair.symbol}
                {...pair}
                icon={<DollarSign className="w-5 h-5 text-green-500" />}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
