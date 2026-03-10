export interface AssetSuggestion {
  symbol: string;
  name: string;
  category: string;
  assetClass: 'stocks' | 'crypto' | 'forex' | 'commodities';
}

export const COMMODITY_SUGGESTIONS: AssetSuggestion[] = [
  { symbol: 'C_1', name: 'Corn Futures', category: 'Agricultural Product', assetClass: 'commodities' },
  { symbol: 'CC1', name: 'Cocoa Futures', category: 'Agricultural Product', assetClass: 'commodities' },
  { symbol: 'CHE', name: 'Cheese Futures', category: 'Livestock', assetClass: 'commodities' },
  { symbol: 'CL1', name: 'Crude Oil Futures', category: 'Energy Resource', assetClass: 'commodities' },
  { symbol: 'CO1', name: 'Brent Futures', category: 'Energy Resource', assetClass: 'commodities' },
  { symbol: 'CT1', name: 'Cotton Futures', category: 'Agricultural Product', assetClass: 'commodities' },
  { symbol: 'DA', name: 'Milk Futures', category: 'Livestock', assetClass: 'commodities' },
  { symbol: 'DL1', name: 'Ethanol Futures', category: 'Energy Resource', assetClass: 'commodities' },
  { symbol: 'FC1', name: 'Feeder Cattle Futures', category: 'Livestock', assetClass: 'commodities' },
  { symbol: 'GAU/EUR', name: 'Gold Gram', category: 'Precious Metal', assetClass: 'commodities' },
  { symbol: 'GAU/GBP', name: 'Gold Gram', category: 'Precious Metal', assetClass: 'commodities' },
  { symbol: 'GAU/IDR', name: 'Gold Gram', category: 'Precious Metal', assetClass: 'commodities' },
  { symbol: 'GAU/TRY', name: 'Gold Gram', category: 'Precious Metal', assetClass: 'commodities' },
  { symbol: 'GAU/USD', name: 'Gold Gram', category: 'Precious Metal', assetClass: 'commodities' },
  { symbol: 'HG1', name: 'Copper Futures', category: 'Industrial Metal', assetClass: 'commodities' },
  { symbol: 'JBP', name: 'Steel Futures', category: 'Industrial Metal', assetClass: 'commodities' },
  { symbol: 'JO1', name: 'Orange Juice Futures', category: 'Agricultural Product', assetClass: 'commodities' },
  { symbol: 'KC1', name: 'Coffee Futures', category: 'Agricultural Product', assetClass: 'commodities' },
  { symbol: 'LB1', name: 'Lumber Futures', category: 'Agricultural Product', assetClass: 'commodities' },
  { symbol: 'LC', name: 'Lithium Futures', category: 'Industrial Metal', assetClass: 'commodities' },
  { symbol: 'LC1', name: 'Live Cattle Futures', category: 'Livestock', assetClass: 'commodities' },
  { symbol: 'LH1', name: 'Lean Hogs Futures', category: 'Livestock', assetClass: 'commodities' },
  { symbol: 'LMAHDS03', name: 'Aluminum Futures', category: 'Industrial Metal', assetClass: 'commodities' },
  { symbol: 'NG/USD', name: 'Natural Gas', category: 'Energy Resource', assetClass: 'commodities' },
  { symbol: 'NI1', name: 'Nickel Futures', category: 'Industrial Metal', assetClass: 'commodities' },
  { symbol: 'O_1', name: 'Oat Futures', category: 'Agricultural Product', assetClass: 'commodities' },
  { symbol: 'RR1', name: 'Rice Futures', category: 'Agricultural Product', assetClass: 'commodities' },
  { symbol: 'RS1', name: 'Canola Futures', category: 'Agricultural Product', assetClass: 'commodities' },
  { symbol: 'S_1', name: 'Soybeans Futures', category: 'Agricultural Product', assetClass: 'commodities' },
  { symbol: 'SB1', name: 'Sugar Futures', category: 'Agricultural Product', assetClass: 'commodities' },
  { symbol: 'URALS/USD', name: 'Urals Crude Oil Spot', category: 'Energy Resource', assetClass: 'commodities' },
  { symbol: 'UXA', name: 'Uranium Futures', category: 'Industrial Metal', assetClass: 'commodities' },
  { symbol: 'W_1', name: 'Wheat Futures', category: 'Agricultural Product', assetClass: 'commodities' },
  { symbol: 'WTI/USD', name: 'Crude Oil WTI Spot', category: 'Energy Resource', assetClass: 'commodities' },
  { symbol: 'XAG/AUD', name: 'Silver Spot', category: 'Precious Metal', assetClass: 'commodities' },
  { symbol: 'XAG/CAD', name: 'Silver Spot', category: 'Precious Metal', assetClass: 'commodities' },
  { symbol: 'XAG/CHF', name: 'Silver Spot', category: 'Precious Metal', assetClass: 'commodities' },
  { symbol: 'XAG/EUR', name: 'Silver Spot', category: 'Precious Metal', assetClass: 'commodities' },
  { symbol: 'XAG/GBP', name: 'Silver Spot', category: 'Precious Metal', assetClass: 'commodities' },
  { symbol: 'XAGg/EUR', name: 'Gram Silver', category: 'Precious Metal', assetClass: 'commodities' },
  { symbol: 'XAGg/TRY', name: 'Gram Silver', category: 'Precious Metal', assetClass: 'commodities' },
  { symbol: 'XAGg/USD', name: 'Gram Silver', category: 'Precious Metal', assetClass: 'commodities' },
  { symbol: 'XAG/TRY', name: 'Silver Spot', category: 'Precious Metal', assetClass: 'commodities' },
  { symbol: 'XAG/USD', name: 'Silver Spot', category: 'Precious Metal', assetClass: 'commodities' },
  { symbol: 'XAU/AUD', name: 'Gold Spot', category: 'Precious Metal', assetClass: 'commodities' },
  { symbol: 'XAU/CAD', name: 'Gold Spot', category: 'Precious Metal', assetClass: 'commodities' },
  { symbol: 'XAU/CHF', name: 'Gold Spot', category: 'Precious Metal', assetClass: 'commodities' },
  { symbol: 'XAU/EUR', name: 'Gold Spot', category: 'Precious Metal', assetClass: 'commodities' },
  { symbol: 'XAU/GBP', name: 'Gold Spot', category: 'Precious Metal', assetClass: 'commodities' },
  { symbol: 'XAU/HKD', name: 'Gold Spot', category: 'Precious Metal', assetClass: 'commodities' },
  { symbol: 'XAU/JPY', name: 'Gold Spot', category: 'Precious Metal', assetClass: 'commodities' },
  { symbol: 'XAU/NZD', name: 'Gold Spot', category: 'Precious Metal', assetClass: 'commodities' },
  { symbol: 'XAU/SGD', name: 'Gold Spot', category: 'Precious Metal', assetClass: 'commodities' },
  { symbol: 'XAU/USD', name: 'Gold Spot', category: 'Precious Metal', assetClass: 'commodities' },
  { symbol: 'XAU/XAG', name: 'Gold Spot', category: 'Precious Metal', assetClass: 'commodities' },
  { symbol: 'XB1', name: 'Gasoline Futures', category: 'Energy Resource', assetClass: 'commodities' },
  { symbol: 'XBR/USD', name: 'Brent Spot', category: 'Energy Resource', assetClass: 'commodities' },
  { symbol: 'XPD/USD', name: 'Palladium Spot', category: 'Industrial Metal', assetClass: 'commodities' },
  { symbol: 'XPT/USD', name: 'Platinum Spot', category: 'Industrial Metal', assetClass: 'commodities' },
  { symbol: 'ZS', name: 'Zinc Futures', category: 'Industrial Metal', assetClass: 'commodities' },
];

export const CRYPTO_SUGGESTIONS: AssetSuggestion[] = [
  { symbol: 'BTC/USD', name: 'Bitcoin', category: 'Cryptocurrency', assetClass: 'crypto' },
  { symbol: 'ETH/USD', name: 'Ethereum', category: 'Cryptocurrency', assetClass: 'crypto' },
  { symbol: 'SOL/USD', name: 'Solana', category: 'Cryptocurrency', assetClass: 'crypto' },
  { symbol: 'XRP/USD', name: 'XRP', category: 'Cryptocurrency', assetClass: 'crypto' },
  { symbol: 'ADA/USD', name: 'Cardano', category: 'Cryptocurrency', assetClass: 'crypto' },
  { symbol: 'DOGE/USD', name: 'Dogecoin', category: 'Cryptocurrency', assetClass: 'crypto' },
  { symbol: 'DOT/USD', name: 'Polkadot', category: 'Cryptocurrency', assetClass: 'crypto' },
  { symbol: 'MATIC/USD', name: 'Polygon', category: 'Cryptocurrency', assetClass: 'crypto' },
  { symbol: 'LINK/USD', name: 'Chainlink', category: 'Cryptocurrency', assetClass: 'crypto' },
  { symbol: 'UNI/USD', name: 'Uniswap', category: 'Cryptocurrency', assetClass: 'crypto' },
  { symbol: 'AVAX/USD', name: 'Avalanche', category: 'Cryptocurrency', assetClass: 'crypto' },
  { symbol: 'ATOM/USD', name: 'Cosmos', category: 'Cryptocurrency', assetClass: 'crypto' },
  { symbol: 'LTC/USD', name: 'Litecoin', category: 'Cryptocurrency', assetClass: 'crypto' },
  { symbol: 'BCH/USD', name: 'Bitcoin Cash', category: 'Cryptocurrency', assetClass: 'crypto' },
  { symbol: 'XLM/USD', name: 'Stellar', category: 'Cryptocurrency', assetClass: 'crypto' },
  { symbol: 'ALGO/USD', name: 'Algorand', category: 'Cryptocurrency', assetClass: 'crypto' },
  { symbol: 'VET/USD', name: 'VeChain', category: 'Cryptocurrency', assetClass: 'crypto' },
  { symbol: 'ICP/USD', name: 'Internet Computer', category: 'Cryptocurrency', assetClass: 'crypto' },
  { symbol: 'FIL/USD', name: 'Filecoin', category: 'Cryptocurrency', assetClass: 'crypto' },
  { symbol: 'TRX/USD', name: 'TRON', category: 'Cryptocurrency', assetClass: 'crypto' },
  { symbol: 'ETC/USD', name: 'Ethereum Classic', category: 'Cryptocurrency', assetClass: 'crypto' },
  { symbol: 'NEAR/USD', name: 'NEAR Protocol', category: 'Cryptocurrency', assetClass: 'crypto' },
  { symbol: 'HBAR/USD', name: 'Hedera', category: 'Cryptocurrency', assetClass: 'crypto' },
  { symbol: 'APT/USD', name: 'Aptos', category: 'Cryptocurrency', assetClass: 'crypto' },
  { symbol: 'ARB/USD', name: 'Arbitrum', category: 'Cryptocurrency', assetClass: 'crypto' },
  { symbol: 'OP/USD', name: 'Optimism', category: 'Cryptocurrency', assetClass: 'crypto' },
  { symbol: 'SUI/USD', name: 'Sui', category: 'Cryptocurrency', assetClass: 'crypto' },
  { symbol: 'INJ/USD', name: 'Injective', category: 'Cryptocurrency', assetClass: 'crypto' },
  { symbol: 'STX/USD', name: 'Stacks', category: 'Cryptocurrency', assetClass: 'crypto' },
  { symbol: 'TIA/USD', name: 'Celestia', category: 'Cryptocurrency', assetClass: 'crypto' },
  { symbol: 'BNB/USD', name: 'BNB', category: 'Cryptocurrency', assetClass: 'crypto' },
  { symbol: 'SHIB/USD', name: 'Shiba Inu', category: 'Cryptocurrency', assetClass: 'crypto' },
  { symbol: 'PEPE/USD', name: 'Pepe', category: 'Cryptocurrency', assetClass: 'crypto' },
];

export const FOREX_SUGGESTIONS: AssetSuggestion[] = [
  { symbol: 'EUR/USD', name: 'Euro / US Dollar', category: 'Major Pair', assetClass: 'forex' },
  { symbol: 'GBP/USD', name: 'British Pound / US Dollar', category: 'Major Pair', assetClass: 'forex' },
  { symbol: 'USD/JPY', name: 'US Dollar / Japanese Yen', category: 'Major Pair', assetClass: 'forex' },
  { symbol: 'USD/CHF', name: 'US Dollar / Swiss Franc', category: 'Major Pair', assetClass: 'forex' },
  { symbol: 'AUD/USD', name: 'Australian Dollar / US Dollar', category: 'Major Pair', assetClass: 'forex' },
  { symbol: 'USD/CAD', name: 'US Dollar / Canadian Dollar', category: 'Major Pair', assetClass: 'forex' },
  { symbol: 'NZD/USD', name: 'New Zealand Dollar / US Dollar', category: 'Major Pair', assetClass: 'forex' },
  { symbol: 'EUR/GBP', name: 'Euro / British Pound', category: 'Cross Pair', assetClass: 'forex' },
  { symbol: 'EUR/JPY', name: 'Euro / Japanese Yen', category: 'Cross Pair', assetClass: 'forex' },
  { symbol: 'GBP/JPY', name: 'British Pound / Japanese Yen', category: 'Cross Pair', assetClass: 'forex' },
  { symbol: 'AUD/JPY', name: 'Australian Dollar / Japanese Yen', category: 'Cross Pair', assetClass: 'forex' },
  { symbol: 'EUR/AUD', name: 'Euro / Australian Dollar', category: 'Cross Pair', assetClass: 'forex' },
  { symbol: 'GBP/AUD', name: 'British Pound / Australian Dollar', category: 'Cross Pair', assetClass: 'forex' },
];

export const STOCK_SUGGESTIONS: AssetSuggestion[] = [
  { symbol: 'AAPL', name: 'Apple Inc.', category: 'Technology', assetClass: 'stocks' },
  { symbol: 'MSFT', name: 'Microsoft Corporation', category: 'Technology', assetClass: 'stocks' },
  { symbol: 'GOOGL', name: 'Alphabet Inc.', category: 'Technology', assetClass: 'stocks' },
  { symbol: 'AMZN', name: 'Amazon.com Inc.', category: 'Consumer Cyclical', assetClass: 'stocks' },
  { symbol: 'NVDA', name: 'NVIDIA Corporation', category: 'Technology', assetClass: 'stocks' },
  { symbol: 'TSLA', name: 'Tesla Inc.', category: 'Automotive', assetClass: 'stocks' },
  { symbol: 'META', name: 'Meta Platforms Inc.', category: 'Technology', assetClass: 'stocks' },
  { symbol: 'BRK.B', name: 'Berkshire Hathaway Inc.', category: 'Financial Services', assetClass: 'stocks' },
  { symbol: 'V', name: 'Visa Inc.', category: 'Financial Services', assetClass: 'stocks' },
  { symbol: 'JNJ', name: 'Johnson & Johnson', category: 'Healthcare', assetClass: 'stocks' },
  { symbol: 'WMT', name: 'Walmart Inc.', category: 'Consumer Defensive', assetClass: 'stocks' },
  { symbol: 'JPM', name: 'JPMorgan Chase & Co.', category: 'Financial Services', assetClass: 'stocks' },
  { symbol: 'MA', name: 'Mastercard Inc.', category: 'Financial Services', assetClass: 'stocks' },
  { symbol: 'PG', name: 'Procter & Gamble Co.', category: 'Consumer Defensive', assetClass: 'stocks' },
  { symbol: 'UNH', name: 'UnitedHealth Group Inc.', category: 'Healthcare', assetClass: 'stocks' },
  { symbol: 'HD', name: 'Home Depot Inc.', category: 'Consumer Cyclical', assetClass: 'stocks' },
  { symbol: 'DIS', name: 'Walt Disney Co.', category: 'Communication Services', assetClass: 'stocks' },
  { symbol: 'BAC', name: 'Bank of America Corp.', category: 'Financial Services', assetClass: 'stocks' },
  { symbol: 'NFLX', name: 'Netflix Inc.', category: 'Communication Services', assetClass: 'stocks' },
  { symbol: 'ADBE', name: 'Adobe Inc.', category: 'Technology', assetClass: 'stocks' },
  { symbol: 'CRM', name: 'Salesforce Inc.', category: 'Technology', assetClass: 'stocks' },
  { symbol: 'AMD', name: 'Advanced Micro Devices Inc.', category: 'Technology', assetClass: 'stocks' },
  { symbol: 'INTC', name: 'Intel Corporation', category: 'Technology', assetClass: 'stocks' },
  { symbol: 'CSCO', name: 'Cisco Systems Inc.', category: 'Technology', assetClass: 'stocks' },
  { symbol: 'PEP', name: 'PepsiCo Inc.', category: 'Consumer Defensive', assetClass: 'stocks' },
  { symbol: 'KO', name: 'Coca-Cola Co.', category: 'Consumer Defensive', assetClass: 'stocks' },
  { symbol: 'NKE', name: 'Nike Inc.', category: 'Consumer Cyclical', assetClass: 'stocks' },
  { symbol: 'MRK', name: 'Merck & Co. Inc.', category: 'Healthcare', assetClass: 'stocks' },
  { symbol: 'ABBV', name: 'AbbVie Inc.', category: 'Healthcare', assetClass: 'stocks' },
  { symbol: 'TMO', name: 'Thermo Fisher Scientific Inc.', category: 'Healthcare', assetClass: 'stocks' },
];

export const ALL_ASSET_SUGGESTIONS: AssetSuggestion[] = [
  ...STOCK_SUGGESTIONS,
  ...CRYPTO_SUGGESTIONS,
  ...FOREX_SUGGESTIONS,
  ...COMMODITY_SUGGESTIONS,
];

export function getAssetSuggestionsByClass(assetClass: 'stocks' | 'crypto' | 'forex' | 'commodities' | 'all'): AssetSuggestion[] {
  if (assetClass === 'all') {
    return ALL_ASSET_SUGGESTIONS;
  }
  return ALL_ASSET_SUGGESTIONS.filter(asset => asset.assetClass === assetClass);
}

export function searchAssets(query: string, assetClass?: 'stocks' | 'crypto' | 'forex' | 'commodities' | 'all'): AssetSuggestion[] {
  const searchQuery = query.toUpperCase().trim();
  if (!searchQuery) {
    return [];
  }

  const assets = assetClass ? getAssetSuggestionsByClass(assetClass) : ALL_ASSET_SUGGESTIONS;

  return assets.filter(asset =>
    asset.symbol.toUpperCase().includes(searchQuery) ||
    asset.name.toUpperCase().includes(searchQuery) ||
    asset.category.toUpperCase().includes(searchQuery)
  ).slice(0, 10);
}
