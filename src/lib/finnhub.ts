const FINNHUB_API_KEY = import.meta.env.VITE_FINNHUB_API_KEY;
const BASE_URL = 'https://finnhub.io/api/v1';

export interface StockQuote {
  c: number;
  d: number;
  dp: number;
  h: number;
  l: number;
  o: number;
  pc: number;
  t: number;
}

export interface StockSearchResult {
  description: string;
  displaySymbol: string;
  symbol: string;
  type: string;
}

export const finnhubService = {
  async searchSymbol(query: string): Promise<StockSearchResult[]> {
    try {
      const response = await fetch(
        `${BASE_URL}/search?q=${encodeURIComponent(query)}&token=${FINNHUB_API_KEY}`
      );

      if (!response.ok) {
        throw new Error('Failed to search symbols');
      }

      const data = await response.json();
      return data.result || [];
    } catch (error) {
      console.error('Error searching symbols:', error);
      return [];
    }
  },

  async getQuote(symbol: string): Promise<StockQuote | null> {
    try {
      const response = await fetch(
        `${BASE_URL}/quote?symbol=${encodeURIComponent(symbol)}&token=${FINNHUB_API_KEY}`
      );

      if (!response.ok) {
        throw new Error('Failed to fetch quote');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching quote:', error);
      return null;
    }
  },

  async getCompanyProfile(symbol: string): Promise<{ name: string } | null> {
    try {
      const response = await fetch(
        `${BASE_URL}/stock/profile2?symbol=${encodeURIComponent(symbol)}&token=${FINNHUB_API_KEY}`
      );

      if (!response.ok) {
        throw new Error('Failed to fetch company profile');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching company profile:', error);
      return null;
    }
  }
};
