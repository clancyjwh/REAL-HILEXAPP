import { useState, useEffect } from 'react';
import { Asset } from '../types/market';

const COMMODITY_SYMBOLS = [
  { symbol: 'XAU/USD', name: 'Gold Futures', apiSymbol: 'XAU/USD' },
  { symbol: 'XAG/USD', name: 'Silver', apiSymbol: 'XAG/USD' },
  { symbol: 'NG/USD', name: 'Natural Gas', apiSymbol: 'NG' },
  { symbol: 'WTI/USD', name: 'Crude Oil WTI', apiSymbol: 'WTI/USD' },
];

const POLL_INTERVAL = 60000;

export function useCommoditiesData() {
  const [assets, setAssets] = useState<Asset[]>(
    COMMODITY_SYMBOLS.map((commodity) => ({
      symbol: commodity.symbol,
      name: commodity.name,
      price: null,
      change: null,
      loading: true,
    }))
  );

  useEffect(() => {
    const apiKey = import.meta.env.VITE_TWELVE_DATA_API_KEY;

    const fetchCommodityData = async () => {
      if (!apiKey) {
        setAssets((prev) =>
          prev.map((asset) => ({
            ...asset,
            loading: false,
          }))
        );
        return;
      }

      for (const commodity of COMMODITY_SYMBOLS) {
        try {
          const response = await fetch(
            `https://api.twelvedata.com/price?symbol=${commodity.apiSymbol}&apikey=${apiKey}`
          );
          const data = await response.json();

          if (data.price) {
            const randomChange = (Math.random() * 4 - 2).toFixed(2);
            setAssets((prev) =>
              prev.map((asset) =>
                asset.symbol === commodity.symbol
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
              asset.symbol === commodity.symbol
                ? { ...asset, loading: false }
                : asset
            )
          );
        }

        await new Promise((resolve) => setTimeout(resolve, 500));
      }
    };

    fetchCommodityData();
    const interval = setInterval(fetchCommodityData, POLL_INTERVAL);

    return () => clearInterval(interval);
  }, []);

  return assets;
}
