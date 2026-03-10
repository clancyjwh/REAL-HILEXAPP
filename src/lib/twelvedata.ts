const TWELVE_DATA_API_KEY = import.meta.env.VITE_TWELVE_DATA_API_KEY;
const BASE_URL = 'https://api.twelvedata.com';

export interface TwelveDataQuote {
  symbol: string;
  name: string;
  exchange: string;
  currency: string;
  datetime: string;
  timestamp: number;
  open: string;
  high: string;
  low: string;
  close: string;
  volume?: string;
  previous_close: string;
  change: string;
  percent_change: string;
  average_volume?: string;
  is_market_open: boolean;
}

export const twelveDataService = {
  async getQuote(symbol: string): Promise<TwelveDataQuote | null> {
    try {
      const response = await fetch(
        `${BASE_URL}/quote?symbol=${encodeURIComponent(symbol)}&apikey=${TWELVE_DATA_API_KEY}`
      );

      if (!response.ok) {
        throw new Error('Failed to fetch quote');
      }

      const data = await response.json();

      if (data.status === 'error') {
        console.error('Twelve Data API error:', data.message);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error fetching quote:', error);
      return null;
    }
  },

  async getTimeSeries(symbol: string, interval: string = '1day', outputsize: number = 1): Promise<any> {
    try {
      const response = await fetch(
        `${BASE_URL}/time_series?symbol=${encodeURIComponent(symbol)}&interval=${interval}&outputsize=${outputsize}&apikey=${TWELVE_DATA_API_KEY}`
      );

      if (!response.ok) {
        throw new Error('Failed to fetch time series');
      }

      const data = await response.json();

      if (data.status === 'error') {
        console.error('Twelve Data API error:', data.message);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error fetching time series:', error);
      return null;
    }
  },

  async searchSymbol(query: string): Promise<any[]> {
    try {
      if (!query || query.trim().length === 0) {
        return [];
      }

      const response = await fetch(
        `${BASE_URL}/symbol_search?symbol=${encodeURIComponent(query)}&apikey=${TWELVE_DATA_API_KEY}`
      );

      if (!response.ok) {
        throw new Error('Failed to search symbols');
      }

      const data = await response.json();

      if (data.status === 'error') {
        console.error('Twelve Data API error:', data.message);
        return [];
      }

      return data.data || [];
    } catch (error) {
      console.error('Error searching symbols:', error);
      return [];
    }
  }
};
