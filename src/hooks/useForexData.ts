import { useState, useEffect } from 'react';
import { Asset, ExchangeRateResponse } from '../types/market';

const FOREX_PAIRS = [
  { symbol: 'USD/CAD', name: 'US Dollar / Canadian Dollar', base: 'USD', quote: 'CAD' },
  { symbol: 'GBP/USD', name: 'British Pound / US Dollar', base: 'GBP', quote: 'USD' },
  { symbol: 'EUR/USD', name: 'Euro / US Dollar', base: 'EUR', quote: 'USD' },
  { symbol: 'AUD/USD', name: 'Australian Dollar / US Dollar', base: 'AUD', quote: 'USD' },
];

const POLL_INTERVAL = 60000;

export function useForexData() {
  const [assets, setAssets] = useState<Asset[]>(
    FOREX_PAIRS.map((pair) => ({
      symbol: pair.symbol,
      name: pair.name,
      price: null,
      change: null,
      loading: true,
    }))
  );

  const previousRatesRef = useState<Map<string, number>>(new Map())[0];

  useEffect(() => {
    const fetchForexData = async () => {
      try {
        const response = await fetch('https://api.exchangerate-api.com/v4/latest/USD');
        const data: ExchangeRateResponse = await response.json();

        for (const pair of FOREX_PAIRS) {
          let rate: number;

          if (pair.base === 'USD') {
            rate = data.rates[pair.quote];
          } else {
            const baseToUsd = 1 / data.rates[pair.base];
            if (pair.quote === 'USD') {
              rate = baseToUsd;
            } else {
              rate = baseToUsd * data.rates[pair.quote];
            }
          }

          const previousRate = previousRatesRef.get(pair.symbol);
          let change = 0;

          if (previousRate) {
            change = ((rate - previousRate) / previousRate) * 100;
          }

          previousRatesRef.set(pair.symbol, rate);

          setAssets((prev) =>
            prev.map((asset) =>
              asset.symbol === pair.symbol
                ? {
                    ...asset,
                    price: rate,
                    change,
                    loading: false,
                    lastUpdate: Date.now(),
                  }
                : asset
            )
          );
        }
      } catch (error) {
        setAssets((prev) =>
          prev.map((asset) => ({
            ...asset,
            loading: false,
          }))
        );
      }
    };

    fetchForexData();
    const interval = setInterval(fetchForexData, POLL_INTERVAL);

    return () => clearInterval(interval);
  }, [previousRatesRef]);

  return assets;
}
