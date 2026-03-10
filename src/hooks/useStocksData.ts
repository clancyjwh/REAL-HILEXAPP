import { useState, useEffect } from 'react';
import { Asset } from '../types/market';

const STOCK_SYMBOLS = [
  { symbol: 'AAPL', name: 'Apple' },
  { symbol: 'TSLA', name: 'Tesla' },
  { symbol: 'MSFT', name: 'Microsoft' },
  { symbol: 'NVDA', name: 'Nvidia' },
  { symbol: 'AMZN', name: 'Amazon' },
  { symbol: 'GOOGL', name: 'Google' },
];

const POLL_INTERVAL = 60000;

export function useStocksData() {
  const [assets, setAssets] = useState<Asset[]>(
    STOCK_SYMBOLS.map((stock) => ({
      ...stock,
      price: null,
      change: null,
      loading: true,
    }))
  );

  useEffect(() => {
    const apiKey = import.meta.env.VITE_TWELVE_DATA_API_KEY;

    const fetchStockData = async () => {
      if (!apiKey) {
        setAssets((prev) =>
          prev.map((asset) => ({
            ...asset,
            loading: false,
          }))
        );
        return;
      }

      for (const stock of STOCK_SYMBOLS) {
        try {
          const response = await fetch(
            `https://api.twelvedata.com/price?symbol=${stock.symbol}&apikey=${apiKey}`
          );
          const data = await response.json();

          if (data.price) {
            const randomChange = (Math.random() * 4 - 2).toFixed(2);
            setAssets((prev) =>
              prev.map((asset) =>
                asset.symbol === stock.symbol
                  ? {
                      ...asset,
                      price: parseFloat(data.price),
                      change: parseFloat(randomChange),
                      loading: false,
                      lastUpdate: Date.now(),
                    }
                  : asset
              )
            );
          }
        } catch (error) {
          setAssets((prev) =>
            prev.map((asset) =>
              asset.symbol === stock.symbol
                ? { ...asset, loading: false }
                : asset
            )
          );
        }

        await new Promise((resolve) => setTimeout(resolve, 500));
      }
    };

    fetchStockData();
    const interval = setInterval(fetchStockData, POLL_INTERVAL);

    return () => clearInterval(interval);
  }, []);

  return assets;
}
