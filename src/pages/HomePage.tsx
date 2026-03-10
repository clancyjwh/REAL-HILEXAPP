import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { TrendingUp, TrendingDown, Activity, Newspaper, Linkedin, Twitter, Send } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { calculateMarketSentiment } from '../utils/marketSentiment';
import { useAuth } from '../contexts/AuthContext';
import { getAvailableFeatures } from '../config/features';
import Disclaimer from '../components/Disclaimer';
import { trackAdvertiserClick } from '../utils/advertiserTracking';

interface TopPickAsset {
  id: string;
  name: string;
  symbol: string;
  signal: number;
  price?: number;
  roc_signal?: number;
  roc_value?: number;
  indicators?: any;
  optimized_parameters?: any;
  updated_at: string;
  asset_type: 'stocks' | 'crypto' | 'forex' | 'commodities';
}

interface TopStory {
  id: number;
  headline: string;
  summary: string;
  link?: string;
  category?: string;
  source?: string;
  published_at: string;
  created_at: string;
}

type StoryFilterType = 'topic' | 'source';

const getSignalColors = (signal: number) => {
  if (signal >= 9) return { bg: 'bg-[linear-gradient(145deg,#FFFDF5_0%,#FFF3CC_35%,#EBD48E_70%,#C9A43B_100%)] bg-[length:200%_200%] animate-[shimmer_4s_linear_infinite] shadow-[0_0_20px_rgba(201,164,59,0.8),0_0_40px_rgba(235,212,142,0.4),0_0_60px_rgba(255,253,245,0.2)]', border: 'border-yellow-400', text: 'text-black' };
  if (signal >= 7) return { bg: 'bg-green-900', border: 'border-green-700', text: 'text-green-300' };
  if (signal >= 4) return { bg: 'bg-green-700', border: 'border-green-600', text: 'text-green-200' };
  if (signal >= 1) return { bg: 'bg-green-500', border: 'border-green-400', text: 'text-green-100' };
  if (signal > -1) return { bg: 'bg-slate-600', border: 'border-slate-500', text: 'text-slate-200' };
  if (signal >= -4) return { bg: 'bg-orange-500', border: 'border-orange-400', text: 'text-orange-100' };
  if (signal >= -7) return { bg: 'bg-red-600', border: 'border-red-500', text: 'text-red-100' };
  if (signal <= -9) return { bg: 'bg-gradient-to-br from-red-900 to-red-950', border: 'border-red-600', text: 'text-red-200' };
  return { bg: 'bg-red-900', border: 'border-red-700', text: 'text-red-300' };
};

const americanStocks = ['AAPL', 'TSLA', 'NVDA', 'MSFT', 'AMZN'];
const canadianStocks = ['SHOP', 'CSU', 'LSPD', 'CLS', 'SPAI'];
const cryptoSymbols = ['BTC', 'ETH', 'XRP', 'SOL', 'LINK', 'ADA'];
const commoditySymbols = ['XAU/USD', 'WTI/USD', 'NG/USD', 'XAG/USD', 'W_1!', 'HG1'];
const forexSymbols = ['EUR/USD', 'USD/CAD', 'USD/JPY', 'AUD/USD', 'GBP/USD'];

type AssetClass = 'crypto' | 'commodity' | 'american-stock' | 'canadian-stock' | 'forex';

const getAssetClass = (symbol: string): AssetClass => {
  if (cryptoSymbols.includes(symbol)) return 'crypto';
  if (commoditySymbols.includes(symbol)) return 'commodity';
  if (americanStocks.includes(symbol)) return 'american-stock';
  if (canadianStocks.includes(symbol)) return 'canadian-stock';
  if (forexSymbols.includes(symbol)) return 'forex';
  return 'american-stock';
};

const getAssetClassLabel = (assetClass: AssetClass): string => {
  switch (assetClass) {
    case 'crypto':
      return 'Cryptocurrency';
    case 'commodity':
      return 'Commodity';
    case 'american-stock':
      return 'American Stock';
    case 'canadian-stock':
      return 'Canadian Stock';
    case 'forex':
      return 'Foreign Exchange';
  }
};

const assetNames: Record<string, string> = {
  // Stocks
  'AAPL': 'Apple Inc.',
  'TSLA': 'Tesla Inc.',
  'NVDA': 'NVIDIA Corp.',
  'MSFT': 'Microsoft Corp.',
  'AMZN': 'Amazon.com Inc.',
  'GOOGL': 'Alphabet Inc. Class C',
  'SHOP': 'Shopify Inc.',
  'CSU': 'Constellation Software Inc.',
  'LSPD': 'Lightspeed Commerce Inc.',
  'CLS': 'Celestica Inc.',
  'SPAI': 'Sparc AI Inc.',
  'SRC': 'Stakeholder Gold Corp.',
  'META': 'Meta Platforms Inc.',
  'PNG': 'Kraken Robotics Inc.',
  'CTTT': 'Critical Infrastructure Technologies Ltd.',
  'DPRO': 'Draganfly Inc.',
  // Cryptocurrencies
  'BTC': 'Bitcoin',
  'ETH': 'Ethereum',
  'USDT': 'Tether',
  'BNB': 'Binance Coin',
  'SOL': 'Solana',
  'XRP': 'Ripple',
  'USDC': 'USD Coin',
  'ADA': 'Cardano',
  'DOGE': 'Dogecoin',
  'TRX': 'TRON',
  'AVAX': 'Avalanche',
  'SHIB': 'Shiba Inu',
  'DOT': 'Polkadot',
  'LINK': 'Chainlink',
  'MATIC': 'Polygon',
  'LTC': 'Litecoin',
  'UNI': 'Uniswap',
  'ATOM': 'Cosmos',
  'XLM': 'Stellar',
  'NEAR': 'NEAR Protocol',
  // Commodities
  'NG': 'Natural Gas',
  'NG/USD': 'Natural Gas',
  'WTI': 'Crude Oil',
  'WTI/USD': 'Crude Oil',
  'BRENT': 'Brent Crude Oil',
  'GOLD': 'Gold',
  'SILVER': 'Silver',
  'XAU': 'Gold',
  'XAU/USD': 'Gold',
  'XAG': 'Silver',
  'XAG/USD': 'Silver',
  'W_1!': 'Wheat',
  'HG1': 'Copper',
  // Forex
  'EUR/CAD': 'Euro / Canadian Dollar',
  'EUR/USD': 'Euro / US Dollar',
  'USD/CAD': 'US Dollar / Canadian Dollar',
  'USD/JPY': 'US Dollar / Japanese Yen',
  'AUD/USD': 'Australian Dollar / US Dollar',
  'GBP/USD': 'British Pound / US Dollar',
  'USD/CHF': 'US Dollar / Swiss Franc',
};

const formatTimeAgo = (timestamp: string): string => {
  const now = new Date();
  const updated = new Date(timestamp);
  const diffMs = now.getTime() - updated.getTime();
  const diffMins = Math.floor(diffMs / 60000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays}d ago`;
};

const calculateAverageSignal = (asset: TopPickAsset): number => {
  if (asset.signal !== undefined && asset.signal !== null) {
    return asset.signal;
  }

  const signals: number[] = [];

  if (asset.roc_signal !== undefined) signals.push(asset.roc_signal);

  if (asset.indicators) {
    Object.values(asset.indicators).forEach((indicator: any) => {
      if (indicator.signal !== undefined) {
        signals.push(indicator.signal);
      }
    });
  }

  if (signals.length === 0) return 0;

  const sum = signals.reduce((acc, val) => acc + val, 0);
  return sum / signals.length;
};

export default function HomePage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const availableFeatures = getAvailableFeatures();
  const [assets, setAssets] = useState<TopPickAsset[]>([]);
  const [loading, setLoading] = useState(true);
  const [topStories, setTopStories] = useState<TopStory[]>([]);
  const [lastCheckedAt, setLastCheckedAt] = useState<string>('');
  const [activeFilters, setActiveFilters] = useState<Set<AssetClass>>(new Set());
  const [storyFilterType, setStoryFilterType] = useState<StoryFilterType>('topic');
  const [activeStoryFilters, setActiveStoryFilters] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetchAssets();
    fetchTopStories();

    // Subscribe to all asset tables
    const stocksChannel = supabase
      .channel('stocks_top_picks_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'stocks_top_picks',
        },
        () => {
          fetchAssets();
        }
      )
      .subscribe();

    const cryptoChannel = supabase
      .channel('crypto_top_picks_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'crypto_top_picks',
        },
        () => {
          fetchAssets();
        }
      )
      .subscribe();

    const forexChannel = supabase
      .channel('forex_top_picks_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'forex_top_picks',
        },
        () => {
          fetchAssets();
        }
      )
      .subscribe();

    const commoditiesChannel = supabase
      .channel('commodities_top_picks_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'commodities_top_picks',
        },
        () => {
          fetchAssets();
        }
      )
      .subscribe();

    const storiesChannel = supabase
      .channel('top_stories_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'top_stories',
        },
        () => {
          fetchTopStories();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(stocksChannel);
      supabase.removeChannel(cryptoChannel);
      supabase.removeChannel(forexChannel);
      supabase.removeChannel(commoditiesChannel);
      supabase.removeChannel(storiesChannel);
    };
  }, []);

  const fetchAssets = async () => {
    try {
      const allowedSymbols = {
        crypto: ['BTC', 'ETH', 'XRP', 'SOL', 'LINK', 'ADA'],
        stocks: ['AAPL', 'TSLA', 'NVDA', 'MSFT', 'AMZN', 'SHOP', 'CSU', 'LSPD', 'CLS', 'SPAI'],
        forex: ['EUR/USD', 'USD/CAD', 'USD/JPY', 'AUD/USD', 'GBP/USD'],
        commodities: ['XAU/USD', 'WTI/USD', 'NG/USD', 'XAG/USD', 'W_1!', 'HG1']
      };

      // Fetch from all four tables with symbol filtering
      const [stocksResult, cryptoResult, forexResult, commoditiesResult] = await Promise.all([
        supabase.from('stocks_top_picks').select('*').in('symbol', allowedSymbols.stocks),
        supabase.from('crypto_top_picks').select('*').in('symbol', allowedSymbols.crypto),
        supabase.from('forex_top_picks').select('*').in('symbol', allowedSymbols.forex),
        supabase.from('commodities_top_picks').select('*').in('symbol', allowedSymbols.commodities),
      ]);

      const allAssets: TopPickAsset[] = [];

      // Process stocks
      if (stocksResult.data) {
        stocksResult.data.forEach((item: any) => {
          allAssets.push({
            id: item.id,
            name: item.stock_name,
            symbol: item.symbol,
            signal: parseFloat(item.signal),
            price: item.price ? parseFloat(item.price) : undefined,
            roc_signal: item.roc_signal ? parseFloat(item.roc_signal) : undefined,
            roc_value: item.roc_value ? parseFloat(item.roc_value) : undefined,
            indicators: item.indicators || null,
            optimized_parameters: item.optimized_parameters || null,
            updated_at: item.updated_at,
            asset_type: 'stocks',
          });
        });
      }

      // Process crypto
      if (cryptoResult.data) {
        cryptoResult.data.forEach((item: any) => {
          allAssets.push({
            id: item.id,
            name: item.crypto_name,
            symbol: item.symbol,
            signal: parseFloat(item.signal),
            price: item.price ? parseFloat(item.price) : undefined,
            roc_signal: item.roc_signal ? parseFloat(item.roc_signal) : undefined,
            roc_value: item.roc_value ? parseFloat(item.roc_value) : undefined,
            indicators: item.indicators || null,
            optimized_parameters: item.optimized_parameters || null,
            updated_at: item.updated_at,
            asset_type: 'crypto',
          });
        });
      }

      // Process forex
      if (forexResult.data) {
        forexResult.data.forEach((item: any) => {
          allAssets.push({
            id: item.id,
            name: item.pair_name,
            symbol: item.symbol,
            signal: parseFloat(item.signal),
            price: item.price ? parseFloat(item.price) : undefined,
            roc_signal: item.roc_signal ? parseFloat(item.roc_signal) : undefined,
            roc_value: item.roc_value ? parseFloat(item.roc_value) : undefined,
            indicators: item.indicators || null,
            optimized_parameters: item.optimized_parameters || null,
            updated_at: item.updated_at,
            asset_type: 'forex',
          });
        });
      }

      // Process commodities
      if (commoditiesResult.data) {
        commoditiesResult.data.forEach((item: any) => {
          allAssets.push({
            id: item.id,
            name: item.commodity_name,
            symbol: item.symbol,
            signal: parseFloat(item.signal),
            price: item.price ? parseFloat(item.price) : undefined,
            roc_signal: item.roc_signal ? parseFloat(item.roc_signal) : undefined,
            roc_value: item.roc_value ? parseFloat(item.roc_value) : undefined,
            indicators: item.indicators || null,
            optimized_parameters: item.optimized_parameters || null,
            updated_at: item.updated_at,
            asset_type: 'commodities',
          });
        });
      }

      // Sort by average signal
      allAssets.sort((a, b) => {
        const avgA = calculateAverageSignal(a);
        const avgB = calculateAverageSignal(b);
        return avgB - avgA;
      });

      setAssets(allAssets);
    } catch (error) {
      console.error('Error fetching assets:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchTopStories = async () => {
    try {
      const { data, error } = await supabase
        .from('top_stories')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      if (data && data.length > 0) {
        const seenHeadlines = new Set<string>();
        const uniqueStories = data.filter((story) => {
          if (seenHeadlines.has(story.headline)) {
            return false;
          }
          seenHeadlines.add(story.headline);
          return true;
        });

        setTopStories(uniqueStories);
        setLastCheckedAt(uniqueStories[0].published_at);
      } else {
        setTopStories([]);
      }
    } catch (error) {
      console.error('Error fetching top stories:', error);
    }
  };

  const handleAssetClick = (asset: TopPickAsset) => {
    navigate(`/top-picks/${asset.asset_type}/${encodeURIComponent(asset.symbol)}`);
  };

  const formatLastUpdated = (timestamp: string): string => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    return date.toLocaleString('en-US', {
      month: '2-digit',
      day: '2-digit',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  const cleanHeadline = (headline: string): string => {
    return headline.replace(/by investing\.com/gi, '').trim();
  };

  const toggleFilter = (assetClass: AssetClass) => {
    setActiveFilters(prev => {
      const newFilters = new Set(prev);
      if (newFilters.has(assetClass)) {
        newFilters.delete(assetClass);
      } else {
        newFilters.add(assetClass);
      }
      return newFilters;
    });
  };

  const filteredAssets = activeFilters.size === 0
    ? assets
    : assets.filter(asset => {
      const assetClass = getAssetClass(asset.symbol);
      return activeFilters.has(assetClass);
    });

  const toggleStoryFilter = (filter: string) => {
    setActiveStoryFilters(prev => {
      const newFilters = new Set(prev);
      if (newFilters.has(filter)) {
        newFilters.delete(filter);
      } else {
        newFilters.add(filter);
      }
      return newFilters;
    });
  };

  const availableTopics = Array.from(new Set(topStories.map(s => s.category).filter(Boolean)));
  const availableSources = Array.from(new Set(topStories.map(s => s.source).filter(Boolean)));

  const filteredStories = activeStoryFilters.size === 0
    ? topStories
    : topStories.filter(story => {
      const filterKey = storyFilterType === 'topic' ? story.category : story.source;
      return filterKey && activeStoryFilters.has(filterKey);
    });

  return (
    <div className="min-h-screen">
      {/* Promoted Sponsors Section */}
      <div className="mb-6 rounded-xl p-5 border border-white/10" style={{ background: 'rgba(255,255,255,0.04)', backdropFilter: 'blur(12px)' }}>
        <div className="flex items-center justify-center gap-8">
          <span className="text-slate-300 text-sm font-semibold tracking-wide mr-2">Promoted:</span>
          <a
            href="https://blackheath.ca"
            target="_blank"
            rel="noopener noreferrer"
            className="transition-all hover:scale-105 hover:brightness-110 duration-300 flex items-center bg-white rounded-lg px-4 py-2 shadow-md"
            data-track="AdvertiserBanner:Blackheath:Logo"
            onClick={() => {
              const userId = user?.id || 'anonymous';
              console.log('🔔 BLACKHEATH LOGO CLICKED - Firing webhook in background...');
              console.log('User ID:', userId);

              trackAdvertiserClick('blackheath', 'AdvertiserBanner:Blackheath:Logo', userId);

              // Fire webhook in background - DON'T await, DON'T prevent navigation
              (async () => {
                try {
                  let userName = user?.email || 'Anonymous';
                  let userCompany = '';

                  if (user?.id) {
                    console.log('🔍 Fetching profile for user:', user.id);
                    const { data: profile, error: profileError } = await supabase
                      .from('profiles')
                      .select('full_name, business_name')
                      .eq('id', user.id)
                      .maybeSingle();

                    console.log('📋 Profile data:', profile);
                    console.log('❌ Profile error:', profileError);

                    if (profile) {
                      if (profile.full_name) {
                        userName = profile.full_name;
                      }
                      userCompany = profile.business_name || '';
                    }
                  }

                  console.log('👤 Final userName:', userName);
                  console.log('🏢 Final userCompany:', userCompany);

                  const payload = JSON.stringify({
                    'user_name': userName,
                    'user_id': userId,
                    'company': userCompany || 'N/A',
                    'timestamp': new Date().toISOString(),
                    'event_id': `${userId}-${Date.now()}`,
                    'element_clicked': 'AdvertiserBanner:Blackheath:Logo',
                    'advertiser_id': 'BH001',
                  });

                  console.log('📦 Final payload:', payload);

                  console.log('📤 Sending webhook via sendBeacon...');

                  // Use sendBeacon for guaranteed delivery even during navigation
                  if (navigator.sendBeacon) {
                    const blob = new Blob([payload], { type: 'application/json' });
                    const sent = navigator.sendBeacon('https://hook.us2.make.com/o1vw60urdl29rc1trvhyi14je1e2dljt', blob);
                    console.log(sent ? '✅ Webhook sent via sendBeacon' : '⚠️ sendBeacon failed, trying fetch');

                    if (!sent) {
                      // Fallback to fetch with keepalive
                      fetch('https://hook.us2.make.com/o1vw60urdl29rc1trvhyi14je1e2dljt', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: payload,
                        keepalive: true,
                      });
                      console.log('✅ Webhook sent via fetch keepalive');
                    }
                  } else {
                    // Fallback for browsers without sendBeacon
                    fetch('https://hook.us2.make.com/o1vw60urdl29rc1trvhyi14je1e2dljt', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: payload,
                      keepalive: true,
                    });
                    console.log('✅ Webhook sent via fetch keepalive (no sendBeacon support)');
                  }
                } catch (error) {
                  console.error('❌ Webhook error:', error);
                }
              })();

              // Navigation happens immediately via href attribute
            }}
          >
            <img
              src="/Blackheath.png"
              alt="Blackheath Fund Management"
              className="h-10 w-auto object-contain"
            />
          </a>
        </div>
      </div>

      <div className="mb-4 flex items-center justify-between gap-3">
        <h1 className="text-3xl font-bold text-white whitespace-nowrap tracking-tight">HilEX — <span className="text-[#00D8FF]">Top Movers</span></h1>

        <div className="flex items-center gap-2">
          {(['canadian-stock', 'american-stock', 'crypto', 'forex', 'commodity'] as const).map((filter) => (
            <button
              key={filter}
              onClick={() => toggleFilter(filter)}
              className={`px-3 py-2 rounded-lg text-xs font-semibold tracking-wide transition-all duration-200 whitespace-nowrap border ${activeFilters.has(filter)
                  ? 'text-[#00D8FF] border-[#00D8FF]/50 shadow-[0_0_12px_rgba(0,216,255,0.25)]'
                  : 'text-slate-400 border-white/10 hover:border-white/20 hover:text-white'
                }`}
              style={activeFilters.has(filter) ? { background: 'rgba(0,216,255,0.08)' } : { background: 'rgba(255,255,255,0.03)' }}
            >
              {filter === 'canadian-stock' ? 'CA Stocks' : filter === 'american-stock' ? 'US Stocks' : filter === 'forex' ? 'Forex' : filter === 'commodity' ? 'Commodities' : 'Crypto'}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="text-[#00D8FF] text-lg font-mono animate-pulse">Loading top movers...</div>
        </div>
      ) : filteredAssets.length === 0 ? (
        <div className="flex items-center justify-center py-20">
          <div className="text-slate-500 text-lg font-mono">No assets match the selected filters</div>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-2.5">
          {filteredAssets.map((asset, index) => {
            const averageSignal = calculateAverageSignal(asset);
            const colors = getSignalColors(averageSignal);
            const sentiment = calculateMarketSentiment(averageSignal);
            const signalPosition = ((averageSignal + 10) / 20) * 100;
            const assetClass = getAssetClass(asset.symbol);
            const assetClassLabel = getAssetClassLabel(assetClass);

            return (
              <button
                key={asset.id}
                onClick={() => handleAssetClick(asset)}
                className={`${colors.bg} ${colors.border} border-2 rounded-lg p-3 shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 text-left relative`}
              >
                <div className="flex items-center gap-1.5 mb-2">
                  <div className="text-white/60 text-xs font-bold">#{index + 1}</div>
                  <span className="text-white/70 text-[10px] font-medium">{assetClassLabel}</span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="text-white text-xl font-bold">{asset.symbol}</div>
                  <div className={`text-3xl font-bold ${colors.text}`}>
                    {averageSignal > 0 ? '+' : ''}{averageSignal.toFixed(1)}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      )}

      {topStories.length > 0 && (
        <div className="mt-6">
          <div className="rounded-2xl p-8 border border-white/10" style={{ background: 'rgba(255,255,255,0.04)', backdropFilter: 'blur(12px)' }}>
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg" style={{ background: 'rgba(0,216,255,0.1)' }}>
                  <Newspaper className="w-6 h-6 text-[#00D8FF]" />
                </div>
                <h2 className="text-3xl font-bold text-white">Today's Top Stories</h2>
              </div>
              {lastCheckedAt && (
                <p className="text-slate-400 text-sm">
                  Last updated: {formatLastUpdated(lastCheckedAt)}
                </p>
              )}
            </div>

            <div className="mb-6">
              <div className="flex items-center gap-4 mb-4">
                <span className="text-slate-400 text-sm font-semibold tracking-wide uppercase font-mono">Filter By:</span>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setStoryFilterType('topic');
                      setActiveStoryFilters(new Set());
                    }}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all border ${storyFilterType === 'topic'
                        ? 'text-[#00D8FF] border-[#00D8FF]/40'
                        : 'text-slate-400 border-white/10 hover:border-white/20 hover:text-white'
                      }`}
                    style={storyFilterType === 'topic' ? { background: 'rgba(0,216,255,0.08)' } : { background: 'transparent' }}
                  >
                    Topic
                  </button>
                  <button
                    onClick={() => {
                      setStoryFilterType('source');
                      setActiveStoryFilters(new Set());
                    }}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all border ${storyFilterType === 'source'
                        ? 'text-[#00D8FF] border-[#00D8FF]/40'
                        : 'text-slate-400 border-white/10 hover:border-white/20 hover:text-white'
                      }`}
                    style={storyFilterType === 'source' ? { background: 'rgba(0,216,255,0.08)' } : { background: 'transparent' }}
                  >
                    Source
                  </button>
                </div>
              </div>

              {storyFilterType === 'topic' && availableTopics.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {availableTopics.map(topic => (
                    <button
                      key={topic}
                      onClick={() => toggleStoryFilter(topic)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border ${activeStoryFilters.has(topic)
                          ? 'text-[#00D8FF] border-[#00D8FF]/40'
                          : 'text-slate-400 border-white/10 hover:border-white/20 hover:text-white'
                        }`}
                      style={activeStoryFilters.has(topic) ? { background: 'rgba(0,216,255,0.08)' } : { background: 'transparent' }}
                    >
                      {topic}
                    </button>
                  ))}
                </div>
              )}

              {storyFilterType === 'source' && availableSources.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {availableSources.map(source => (
                    <button
                      key={source}
                      onClick={() => toggleStoryFilter(source)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border ${activeStoryFilters.has(source)
                          ? 'text-[#00D8FF] border-[#00D8FF]/40'
                          : 'text-slate-400 border-white/10 hover:border-white/20 hover:text-white'
                        }`}
                      style={activeStoryFilters.has(source) ? { background: 'rgba(0,216,255,0.08)' } : { background: 'transparent' }}
                    >
                      {source}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="space-y-4">
              {filteredStories.map((story) => (
                <a
                  key={story.id}
                  href={story.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block rounded-xl p-6 border border-white/8 hover:border-[#00D8FF]/30 transition-all duration-300 hover:shadow-lg cursor-pointer"
                  style={{ background: 'rgba(255,255,255,0.03)' }}
                  onMouseEnter={e => (e.currentTarget.style.boxShadow = '0 4px 30px rgba(0,216,255,0.08)')}
                  onMouseLeave={e => (e.currentTarget.style.boxShadow = 'none')}
                >
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <h3 className="text-xl font-bold text-white hover:text-[#00D8FF] transition-colors flex-1 tracking-tight">
                      {cleanHeadline(story.headline)}
                    </h3>
                    {story.category && (
                      <span className="px-3 py-1 rounded-full text-[#00D8FF] text-xs font-semibold shrink-0 font-mono" style={{ background: 'rgba(0,216,255,0.1)', border: '1px solid rgba(0,216,255,0.25)' }}>
                        {story.category}
                      </span>
                    )}
                  </div>
                  <p className="text-slate-300 text-base leading-relaxed mb-3">
                    {story.summary}
                  </p>
                  {story.source && (
                    <div className="text-slate-500 text-sm font-medium">
                      Source: {story.source}
                    </div>
                  )}
                </a>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* WatchDog Ad */}
      <div className="mt-6 mb-2">
        <a
          href="https://watchdog.ltd"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-6 p-5 rounded-xl border border-white/10 transition-all duration-300 hover:border-white/20 group"
          style={{ background: 'rgba(255,255,255,0.03)', backdropFilter: 'blur(12px)' }}
        >
          <span className="text-slate-500 text-xs font-semibold tracking-widest uppercase font-mono mr-2">Promoted</span>
          <div className="flex flex-col items-center gap-1 transition-all duration-300 group-hover:scale-105">
            <img src="/watchdog.png" alt="WatchDog" className="h-10 w-auto object-contain brightness-0 invert opacity-80 group-hover:opacity-100 transition-opacity" />
            <span className="text-slate-400 text-xs font-mono tracking-wide group-hover:text-[#00D8FF] transition-colors">Monitor What Matters</span>
          </div>
        </a>
      </div>

      <Disclaimer />

      <div className="mt-8 flex items-center justify-center gap-6">
        <a
          href="https://www.linkedin.com/search/results/all/?fetchDeterministicClustersOnly=true&heroEntityKey=urn%3Ali%3Aorganization%3A109950133&keywords=hilex%20optimized%20trends&origin=RICH_QUERY_SUGGESTION&position=0&searchId=193d177c-9b19-4dbf-b348-64d3c5bba970&sid=PLZ&spellCorrectionEnabled=false"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 text-slate-400 hover:text-blue-500 transition-colors text-sm"
        >
          <Linkedin className="w-5 h-5" />
          <span>Follow us on LinkedIn!</span>
        </a>
        <a
          href="https://x.com/HilEX_Optimized"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 text-slate-400 hover:text-blue-500 transition-colors text-sm"
        >
          <span className="w-5 h-5 flex items-center justify-center font-bold text-lg">𝕏</span>
          <span>Follow us on X!</span>
        </a>
        <a
          href="https://t.me/HilexOptimizedTrendsUpdatebot"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 text-slate-400 hover:text-blue-500 transition-colors text-sm"
        >
          <Send className="w-5 h-5" />
          <span>Join our Telegram for daily updates!</span>
        </a>
      </div>
    </div>
  );
}
