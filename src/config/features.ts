export interface FeatureFlags {
  showTopPicks: boolean;
  showMarketMovers: boolean;
  showConsensus: boolean;
  showTacoTrade: boolean;
  showAINewsfeed: boolean;
  showStopSignal: boolean;
  showHorizonOptimizer: boolean;
  showTools: boolean;
}

function getFeatureFlags(): FeatureFlags {
  const liteMode = import.meta.env.VITE_LITE_MODE === 'true';

  if (liteMode) {
    return {
      showTopPicks: import.meta.env.VITE_SHOW_TOP_PICKS === 'true',
      showMarketMovers: import.meta.env.VITE_SHOW_MARKET_MOVERS === 'true',
      showConsensus: import.meta.env.VITE_SHOW_CONSENSUS === 'true',
      showTacoTrade: import.meta.env.VITE_SHOW_TACO_TRADE === 'true',
      showAINewsfeed: import.meta.env.VITE_SHOW_AI_NEWSFEED === 'true',
      showStopSignal: import.meta.env.VITE_SHOW_STOP_SIGNAL === 'true',
      showHorizonOptimizer: import.meta.env.VITE_SHOW_HORIZON_OPTIMIZER === 'true',
      showTools: import.meta.env.VITE_SHOW_TOOLS === 'true',
    };
  }

  return {
    showTopPicks: true,
    showMarketMovers: true,
    showConsensus: true,
    showTacoTrade: true,
    showAINewsfeed: true,
    showStopSignal: true,
    showHorizonOptimizer: true,
    showTools: true,
  };
}

export const features = getFeatureFlags();

export function getAvailableFeatures(): FeatureFlags {
  return features;
}
