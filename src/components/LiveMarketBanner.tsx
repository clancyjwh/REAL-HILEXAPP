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
    <div className="w-full bg-slate-950 border-b border-slate-700 overflow-hidden py-3">
      <div className="relative flex">
        <div className="animate-scroll flex gap-8 whitespace-nowrap will-change-transform">
          {[...assets, ...assets, ...assets, ...assets].map((asset, index) => (
            <div
              key={`${asset.symbol}-${index}`}
              className={`${getSignalTextColor(asset.signal)} font-semibold text-base`}
            >
              {asset.symbol}: {asset.signal > 0 ? '+' : ''}{asset.signal.toFixed(1)}
            </div>
          ))}
        </div>
        <div className="animate-scroll flex gap-8 whitespace-nowrap will-change-transform">
          {[...assets, ...assets, ...assets, ...assets].map((asset, index) => (
            <div
              key={`${asset.symbol}-duplicate-${index}`}
              className={`${getSignalTextColor(asset.signal)} font-semibold text-base`}
            >
              {asset.symbol}: {asset.signal > 0 ? '+' : ''}{asset.signal.toFixed(1)}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
