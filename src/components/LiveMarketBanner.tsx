import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

interface Asset {
  symbol: string;
  signal: number;
}

const getSignalTextColor = (signal: number) => {
  if (signal >= 9) return 'text-yellow-400';
  if (signal >= 7) return 'text-green-400';
  if (signal >= 4) return 'text-green-500';
  if (signal >= 1) return 'text-green-300';
  if (signal > -1) return 'text-slate-400';
  if (signal >= -4) return 'text-orange-400';
  if (signal >= -7) return 'text-red-400';
  if (signal <= -9) return 'text-red-500';
  return 'text-red-400';
};

export default function LiveMarketBanner() {
  const [assets, setAssets] = useState<Asset[]>([]);

  useEffect(() => {
    fetchAssets();

    const interval = setInterval(fetchAssets, 30000);

    return () => clearInterval(interval);
  }, []);

  const fetchAssets = async () => {
    try {
      const allowedSymbols = {
        crypto: ['BTC', 'ETH', 'XRP', 'SOL', 'LINK', 'ADA'],
        stocks: ['AAPL', 'TSLA', 'NVDA', 'MSFT', 'AMZN', 'SHOP', 'CSU', 'LSPD', 'CLS', 'SPAI'],
        forex: ['EUR/USD', 'USD/CAD', 'USD/JPY', 'AUD/USD', 'GBP/USD'],
        commodities: ['XAU', 'WTI', 'NG', 'XAG', 'W_1!', 'HG1']
      };

      const [stocksResult, cryptoResult, forexResult, commoditiesResult] = await Promise.all([
        supabase.from('stocks_top_picks').select('symbol, signal').in('symbol', allowedSymbols.stocks),
        supabase.from('crypto_top_picks').select('symbol, signal').in('symbol', allowedSymbols.crypto),
        supabase.from('forex_top_picks').select('symbol, signal').in('symbol', allowedSymbols.forex),
        supabase.from('commodities_top_picks').select('symbol, signal').in('symbol', allowedSymbols.commodities),
      ]);

      const allAssets: Asset[] = [];

      if (stocksResult.data) {
        stocksResult.data.forEach((item: any) => {
          allAssets.push({
            symbol: item.symbol,
            signal: parseFloat(item.signal),
          });
        });
      }

      if (cryptoResult.data) {
        cryptoResult.data.forEach((item: any) => {
          allAssets.push({
            symbol: item.symbol,
            signal: parseFloat(item.signal),
          });
        });
      }

      if (forexResult.data) {
        forexResult.data.forEach((item: any) => {
          allAssets.push({
            symbol: item.symbol,
            signal: parseFloat(item.signal),
          });
        });
      }

      if (commoditiesResult.data) {
        commoditiesResult.data.forEach((item: any) => {
          allAssets.push({
            symbol: item.symbol,
            signal: parseFloat(item.signal),
          });
        });
      }

      allAssets.sort((a, b) => b.signal - a.signal);

      setAssets(allAssets);
    } catch (error) {
      console.error('Error fetching assets for banner:', error);
    }
  };

  if (assets.length === 0) return null;

  return (
    <div className="w-full overflow-hidden relative" style={{ background: 'rgba(2,6,23,0.95)', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
      {/* Left fade */}
      <div className="absolute left-0 top-0 bottom-0 w-20 z-10 pointer-events-none" style={{ background: 'linear-gradient(90deg, rgba(2,6,23,1) 0%, transparent 100%)' }} />
      {/* Right fade */}
      <div className="absolute right-0 top-0 bottom-0 w-20 z-10 pointer-events-none" style={{ background: 'linear-gradient(270deg, rgba(2,6,23,1) 0%, transparent 100%)' }} />

      {/* LIVE badge */}
      <div className="absolute left-4 top-1/2 -translate-y-1/2 z-20 flex items-center gap-1.5 px-2.5 py-1 rounded-full" style={{ background: 'rgba(0,216,255,0.1)', border: '1px solid rgba(0,216,255,0.25)' }}>
        <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: '#00D8FF' }} />
        <span className="text-[10px] font-bold tracking-widest uppercase" style={{ color: '#00D8FF', fontFamily: 'JetBrains Mono, monospace' }}>LIVE</span>
      </div>

      <div className="pl-24 py-2.5 relative flex">
        <div className="animate-scroll flex items-center gap-6 whitespace-nowrap will-change-transform">
          {[...assets, ...assets, ...assets, ...assets].map((asset, index) => (
            <div key={`${asset.symbol}-${index}`} className="flex items-center gap-1.5">
              <span className="text-slate-400 text-xs font-semibold tracking-wider" style={{ fontFamily: 'JetBrains Mono, monospace' }}>{asset.symbol}</span>
              <span className={`text-sm font-bold ${getSignalTextColor(asset.signal)}`} style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                {asset.signal > 0 ? '+' : ''}{asset.signal.toFixed(1)}
              </span>
              <span className="text-slate-700 text-xs">•</span>
            </div>
          ))}
        </div>
        <div className="animate-scroll flex items-center gap-6 whitespace-nowrap will-change-transform">
          {[...assets, ...assets, ...assets, ...assets].map((asset, index) => (
            <div key={`${asset.symbol}-dup-${index}`} className="flex items-center gap-1.5">
              <span className="text-slate-400 text-xs font-semibold tracking-wider" style={{ fontFamily: 'JetBrains Mono, monospace' }}>{asset.symbol}</span>
              <span className={`text-sm font-bold ${getSignalTextColor(asset.signal)}`} style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                {asset.signal > 0 ? '+' : ''}{asset.signal.toFixed(1)}
              </span>
              <span className="text-slate-700 text-xs">•</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
