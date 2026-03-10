export interface IndicatorSummary {
  name: string;
  signal: number | string;
  displayName: string;
  sortKey: string;
}

export interface PriceData {
  startPrice: number | null;
  endPrice: number | null;
  priceChange: number | null;
  priceChangePercent: number | null;
}

const INDICATOR_CONFIGS = {
  RSI: { displayName: 'RSI', sortOrder: 1 },
  MACD: { displayName: 'MACD', sortOrder: 2 },
  Bollinger: { displayName: 'Bollinger Bands', sortOrder: 3 },
  Boll: { displayName: 'Bollinger Bands', sortOrder: 3 },
  SMA: { displayName: 'SMA', sortOrder: 4 },
  CCI: { displayName: 'CCI', sortOrder: 5 },
  ROC: { displayName: 'ROC', sortOrder: 6 },
};

export function extractIndicators(horizonData: any): IndicatorSummary[] {
  const indicators: IndicatorSummary[] = [];

  const indicatorKeys = [
    { key: 'RSI', signalKey: 'RSI_Signal' },
    { key: 'MACD', signalKey: 'MACD_Signal' },
    { key: 'Bollinger', signalKey: 'Boll_Signal' },
    { key: 'Boll', signalKey: 'Boll_Signal' },
    { key: 'SMA', signalKey: 'SMA_Original_Signal' },
    { key: 'CCI', signalKey: 'CCI_Signal' },
    { key: 'ROC', signalKey: 'ROC_Signal' },
  ];

  const processedKeys = new Set<string>();

  for (const { key, signalKey } of indicatorKeys) {
    const config = INDICATOR_CONFIGS[key as keyof typeof INDICATOR_CONFIGS];
    if (!config || processedKeys.has(config.displayName)) continue;

    const signal = horizonData[signalKey] ??
                   horizonData[signalKey.toLowerCase()] ??
                   horizonData[`${key}_signal`] ??
                   horizonData[`${key.toLowerCase()}_signal`];

    if (signal !== undefined && signal !== null) {
      indicators.push({
        name: key === 'Boll' ? 'Bollinger' : key,
        signal: signal,
        displayName: config.displayName,
        sortKey: `${config.sortOrder}_${key}`,
      });
      processedKeys.add(config.displayName);
    }
  }

  return indicators.sort((a, b) => a.sortKey.localeCompare(b.sortKey));
}

export function extractPriceData(horizonData: any): PriceData {
  const startPrice = horizonData.Start_Price_30 ??
                     horizonData.start_price_30 ??
                     horizonData.Start_Price ??
                     horizonData.start_price ??
                     null;

  const endPrice = horizonData.End_Price_30 ??
                   horizonData.end_price_30 ??
                   horizonData.End_Price ??
                   horizonData.end_price ??
                   null;

  let priceChange = null;
  let priceChangePercent = null;

  if (startPrice !== null && endPrice !== null) {
    priceChange = endPrice - startPrice;
    priceChangePercent = (priceChange / startPrice) * 100;
  }

  return {
    startPrice,
    endPrice,
    priceChange,
    priceChangePercent,
  };
}

export function getSignalStrength(horizonData: any): number | null {
  const signalStrength = horizonData.Signal_Strength ??
                        horizonData.signal_strength ??
                        horizonData.Confidence ??
                        horizonData.confidence ??
                        null;

  return signalStrength !== null ? parseFloat(signalStrength) : null;
}

export function extractIndicatorDetail(horizonData: any, indicatorName: string): any {
  const details: any = {
    signal: null,
    reason: null,
  };

  const normalizedName = indicatorName === 'Bollinger' ? 'Boll' : indicatorName;
  const prefixes = [normalizedName, normalizedName.toUpperCase(), normalizedName.toLowerCase()];

  for (const prefix of prefixes) {
    Object.keys(horizonData).forEach(key => {
      const lowerKey = key.toLowerCase();
      const keyPrefix = key.split('_')[0].toLowerCase();

      if (keyPrefix === prefix.toLowerCase() || lowerKey.startsWith(prefix.toLowerCase())) {
        const fieldName = key.replace(new RegExp(`^${prefix}_?`, 'i'), '').toLowerCase();
        if (fieldName) {
          details[fieldName] = horizonData[key];
        } else {
          details[key.toLowerCase()] = horizonData[key];
        }
      }
    });
  }

  return Object.keys(details).length > 1 ? details : null;
}

export function getSummaryText(horizonData: any): string | null {
  return horizonData.Summary ?? horizonData.summary ?? null;
}

export function getDateFromData(horizonData: any): string | null {
  return horizonData.Date ?? horizonData.date ?? null;
}

export interface IndicatorBoxData {
  name: string;
  displayName: string;
  signal: number | string | null;
  data: Record<string, any>;
  hasData: boolean;
}

export function extractAllIndicatorBoxes(horizonData: any): IndicatorBoxData[] {
  const indicators: IndicatorBoxData[] = [];

  const indicatorConfigs = [
    { name: 'CCI', displayName: 'CCI', patterns: ['cci', 'c_c_i', 'c c i'] },
    { name: 'RSI', displayName: 'RSI', patterns: ['rsi', 'r_s_i', 'r s i'] },
    { name: 'MACD', displayName: 'MACD', patterns: ['macd', 'm_a_c_d', 'm a c d'] },
    { name: 'Bollinger', displayName: 'Bollinger Bands', patterns: ['boll', 'bollinger'] },
    { name: 'SMA', displayName: 'SMA', patterns: ['sma', 's_m_a', 's m a'] },
    { name: 'ROC', displayName: 'ROC', patterns: ['roc', 'r_o_c', 'r o c'] },
  ];

  for (const config of indicatorConfigs) {
    const data: Record<string, any> = {};
    let hasData = false;

    Object.keys(horizonData).forEach(key => {
      const keyNormalized = key.toLowerCase().replace(/[\s_]/g, '');

      const matchesPattern = config.patterns.some(pattern => {
        const patternNormalized = pattern.toLowerCase().replace(/[\s_]/g, '');
        return keyNormalized.startsWith(patternNormalized + '_') ||
               keyNormalized.startsWith(patternNormalized) ||
               keyNormalized === patternNormalized;
      });

      if (matchesPattern) {
        data[key] = horizonData[key];
        hasData = true;
      }
    });

    if (hasData) {
      const signalKey = Object.keys(data).find(k =>
        k.toLowerCase().includes('signal') && !k.toLowerCase().includes('original')
      );

      indicators.push({
        name: config.name,
        displayName: config.displayName,
        signal: signalKey ? data[signalKey] : null,
        data: data,
        hasData: true,
      });
    }
  }

  return indicators;
}

export function extractHighLevelSummary(horizonData: any): Record<string, any> {
  const summaryKeys = [
    'Asset', 'asset',
    'Outcome', 'outcome',
    'Original_Signal', 'original_signal'
  ];

  const summary: Record<string, any> = {};

  summaryKeys.forEach(key => {
    if (horizonData[key] !== undefined && horizonData[key] !== null) {
      summary[key] = horizonData[key];
    }
  });

  return summary;
}

export function extractGeneralData(horizonData: any): Record<string, any> {
  const indicatorPatterns = ['rsi', 'macd', 'boll', 'bollinger', 'sma', 'cci', 'roc'];
  const summaryKeys = [
    'asset', 'outcome', 'original_signal'
  ];

  const generalData: Record<string, any> = {};

  Object.keys(horizonData).forEach(key => {
    const keyNormalized = key.toLowerCase().replace(/[\s_]/g, '');
    const keyLower = key.toLowerCase();

    const isIndicator = indicatorPatterns.some(pattern => {
      const patternNormalized = pattern.toLowerCase().replace(/[\s_]/g, '');
      return keyNormalized.startsWith(patternNormalized + '_') ||
             keyNormalized.startsWith(patternNormalized) ||
             keyNormalized === patternNormalized ||
             keyLower.startsWith(pattern + '_') ||
             keyLower === pattern;
    });

    const isSummary = summaryKeys.some(sumKey => keyLower === sumKey);

    if (!isIndicator && !isSummary) {
      generalData[key] = horizonData[key];
    }
  });

  return generalData;
}
