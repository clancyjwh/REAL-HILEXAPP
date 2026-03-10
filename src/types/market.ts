export interface Asset {
  symbol: string;
  name: string;
  price: number | null;
  change: number | null;
  loading: boolean;
  lastUpdate?: number;
}

export interface CoinbaseMessage {
  type: string;
  product_id?: string;
  price?: string;
  time?: string;
}

export interface TwelveDataResponse {
  price?: string;
  percent_change?: string;
}

export interface ExchangeRateResponse {
  rates: {
    [key: string]: number;
  };
}

export type AssetCategory = 'crypto' | 'stocks' | 'commodities' | 'forex';
