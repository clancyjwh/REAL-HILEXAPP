import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Home, TrendingUp, Bitcoin, DollarSign, Gem } from 'lucide-react';
import { supabase } from '../lib/supabase';
import Disclaimer from '../components/Disclaimer';

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
}

interface CategoryConfig {
  title: string;
  subtitle: string;
  tableName: string;
  nameField: string;
  gradientFrom: string;
  gradientTo: string;
  icon: React.ElementType;
}

const categoryConfigs: Record<string, CategoryConfig> = {
  crypto: {
    title: 'Top Crypto Movers',
    subtitle: 'Our recommended cryptocurrency selections',
    tableName: 'crypto_top_picks',
    nameField: 'crypto_name',
    gradientFrom: 'from-orange-500',
    gradientTo: 'to-orange-600',
    icon: Bitcoin,
  },
  forex: {
    title: 'Top Forex Movers',
    subtitle: 'Our recommended forex pair selections',
    tableName: 'forex_top_picks',
    nameField: 'pair_name',
    gradientFrom: 'from-green-500',
    gradientTo: 'to-green-600',
    icon: DollarSign,
  },
  stocks: {
    title: 'Top Stock Movers',
    subtitle: 'Our recommended stock selections',
    tableName: 'stocks_top_picks',
    nameField: 'stock_name',
    gradientFrom: 'from-blue-500',
    gradientTo: 'to-blue-600',
    icon: TrendingUp,
  },
  commodities: {
    title: 'Top Commodity Movers',
    subtitle: 'Our recommended commodity selections',
    tableName: 'commodities_top_picks',
    nameField: 'commodity_name',
    gradientFrom: 'from-amber-500',
    gradientTo: 'to-amber-600',
    icon: Gem,
  },
};

const getCategoryLabel = (category: string): string => {
  switch (category) {
    case 'stocks':
      return 'American Stock';
    case 'crypto':
      return 'Cryptocurrency';
    case 'forex':
      return 'Forex Pair';
    case 'commodities':
      return 'Commodity';
    default:
      return category;
  }
};

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

export default function TopPicksCategoryPage() {
  const { category } = useParams<{ category: string }>();
  const navigate = useNavigate();
  const [assets, setAssets] = useState<TopPickAsset[]>([]);
  const [loading, setLoading] = useState(true);

  const config = category ? categoryConfigs[category] : null;
  const Icon = config?.icon || TrendingUp;

  useEffect(() => {
    if (!config) return;

    fetchAssets();

    const channel = supabase
      .channel(`${config.tableName}_changes`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: config.tableName,
        },
        () => {
          fetchAssets();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [category]);

  const fetchAssets = async () => {
    if (!config) return;

    try {
      const { data, error } = await supabase
        .from(config.tableName)
        .select('*')
        .order('signal', { ascending: false });

      if (error) throw error;

      const formattedData: TopPickAsset[] = (data || []).map((item: any) => ({
        id: item.id,
        name: item[config.nameField],
        symbol: item.symbol,
        signal: parseFloat(item.signal),
        price: item.price ? parseFloat(item.price) : undefined,
        roc_signal: item.roc_signal ? parseFloat(item.roc_signal) : undefined,
        roc_value: item.roc_value ? parseFloat(item.roc_value) : undefined,
        indicators: item.indicators || null,
        optimized_parameters: item.optimized_parameters || null,
        updated_at: item.updated_at,
      }));

      formattedData.sort((a, b) => {
        const avgA = calculateAverageSignal(a);
        const avgB = calculateAverageSignal(b);
        return avgB - avgA;
      });

      setAssets(formattedData);
    } catch (error) {
      console.error('Error fetching assets:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAssetClick = (asset: TopPickAsset) => {
    navigate(`/top-picks/${category}/${encodeURIComponent(asset.symbol)}`);
  };

  if (!config) {
    return (
      <div className="text-white">
        <p>Invalid category</p>
      </div>
    );
  }

  return (
    <>
      <div className={`bg-gradient-to-r ${config.gradientFrom} ${config.gradientTo} -m-8 mb-8 p-8 shadow-lg`}>
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={() => navigate('/top-picks')}
            className="flex items-center gap-2 text-white/90 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Back
          </button>
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 text-white/90 hover:text-white transition-colors"
          >
            <Home className="w-5 h-5" />
            Home
          </button>
        </div>
        <div className="flex items-center gap-3">
          <div className="p-3 bg-white/20 rounded-lg">
            <Icon className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className="text-4xl font-bold text-white">{config.title}</h1>
            <p className="text-white/80">{config.subtitle}</p>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="text-white text-xl">Loading top movers...</div>
        </div>
      ) : assets.length === 0 ? (
        <div className="flex items-center justify-center py-20">
          <div className="text-slate-400 text-xl">No movers available yet</div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {assets.map((asset, index) => {
            const averageSignal = calculateAverageSignal(asset);
            const colors = getSignalColors(averageSignal);

            return (
              <button
                key={asset.id}
                onClick={() => handleAssetClick(asset)}
                className={`${colors.bg} ${colors.border} border-2 rounded-xl p-4 shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 text-left`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="text-white/60 text-xs font-bold">#{index + 1}</div>
                      <div className="text-white/60 text-xs">{getCategoryLabel(category || '')}</div>
                    </div>
                    <div className="text-white text-xl font-bold mb-1">{asset.symbol}</div>
                    <div className="text-white/80 text-xs mb-2">{asset.name}</div>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className={`text-2xl font-bold ${colors.text}`}>
                    {averageSignal > 0 ? '+' : ''}{averageSignal.toFixed(1)}
                  </div>
                  <div className="text-white/50 text-xs">
                    {formatTimeAgo(asset.updated_at)}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      )}
      <Disclaimer />
    </>
  );
}
