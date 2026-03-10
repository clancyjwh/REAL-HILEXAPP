import { useState, useEffect, useRef } from 'react';
import { Asset, CoinbaseMessage } from '../types/market';

const CRYPTO_SYMBOLS = [
  { symbol: 'BTC-USD', name: 'Bitcoin' },
  { symbol: 'ETH-USD', name: 'Ethereum' },
  { symbol: 'SOL-USD', name: 'Solana' },
  { symbol: 'XRP-USD', name: 'Ripple' },
  { symbol: 'LINK-USD', name: 'Chainlink' },
  { symbol: 'USDT-USD', name: 'Tether' },
];

export function useCryptoData() {
  const [assets, setAssets] = useState<Asset[]>(
    CRYPTO_SYMBOLS.map((crypto) => ({
      ...crypto,
      price: null,
      change: null,
      loading: true,
    }))
  );

  const wsRef = useRef<WebSocket | null>(null);
  const priceHistoryRef = useRef<Map<string, number[]>>(new Map());
  const reconnectTimeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    const connectWebSocket = () => {
      const ws = new WebSocket('wss://ws-feed.exchange.coinbase.com');
      wsRef.current = ws;

      ws.onopen = () => {
        const subscribeMessage = {
          type: 'subscribe',
          product_ids: CRYPTO_SYMBOLS.map((c) => c.symbol),
          channels: ['ticker'],
        };
        ws.send(JSON.stringify(subscribeMessage));
      };

      ws.onmessage = (event) => {
        const data: CoinbaseMessage = JSON.parse(event.data);

        if (data.type === 'ticker' && data.product_id && data.price) {
          const price = parseFloat(data.price);
          const symbol = data.product_id;

          let history = priceHistoryRef.current.get(symbol) || [];
          history.push(price);

          if (history.length > 1440) {
            history = history.slice(-1440);
          }
          priceHistoryRef.current.set(symbol, history);

          let change = 0;
          if (history.length >= 2) {
            const oldPrice = history[0];
            change = ((price - oldPrice) / oldPrice) * 100;
          }

          setAssets((prev) =>
            prev.map((asset) =>
              asset.symbol === symbol
                ? {
                    ...asset,
                    price,
                    change,
                    loading: false,
                    lastUpdate: Date.now(),
                  }
                : asset
            )
          );
        }
      };

      ws.onerror = () => {
        ws.close();
      };

      ws.onclose = () => {
        reconnectTimeoutRef.current = setTimeout(() => {
          connectWebSocket();
        }, 3000);
      };
    };

    connectWebSocket();

    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, []);

  return assets;
}
