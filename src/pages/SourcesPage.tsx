import { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, ExternalLink, Newspaper } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface AssetData {
  symbol: string;
  name: string;
  sources?: string | string[];
}

const tableMap: Record<string, string> = {
  crypto: 'crypto_top_picks',
  forex: 'forex_top_picks',
  stocks: 'stocks_top_picks',
  commodities: 'commodities_top_picks',
};

const nameFieldMap: Record<string, string> = {
  crypto: 'crypto_name',
  forex: 'pair_name',
  stocks: 'stock_name',
  commodities: 'commodity_name',
};

export default function SourcesPage() {
  const { category = '', symbol = '' } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [asset, setAsset] = useState<AssetData | null>(null);
  const [loading, setLoading] = useState(true);
  const sourcesFromState = location.state?.sources as string[] | undefined;

  useEffect(() => {
    if (sourcesFromState) {
      console.log('Sources from state:', sourcesFromState);
      setLoading(false);
      return;
    }

    const fetchAssetData = async () => {
      if (!category || !symbol) {
        setLoading(false);
        return;
      }

      const tableName = tableMap[category.toLowerCase()];
      const nameField = nameFieldMap[category.toLowerCase()];

      if (!tableName || !nameField) {
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from(tableName)
          .select('symbol, ' + nameField + ', news_summary, raw_data')
          .eq('symbol', symbol.toUpperCase())
          .maybeSingle();

        if (error) throw error;

        if (data) {
          let sources: string | string[] = [];

          if (data.news_summary?.sources) {
            sources = data.news_summary.sources;
          } else {
            const rawData = data.raw_data || {};
            const json8String = rawData['JSON 8'] || rawData.json_8 || rawData.JSON_8 || '{}';

            try {
              const json8 = typeof json8String === 'string' ? JSON.parse(json8String) : json8String;
              sources = json8.Sources || json8.sources || '';
            } catch (e) {
              console.error('Error parsing JSON 8:', e);
            }
          }

          setAsset({
            symbol: data.symbol,
            name: data[nameField],
            sources,
          });
        }
      } catch (error) {
        console.error('Error fetching asset data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAssetData();
  }, [category, symbol, sourcesFromState]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-white text-xl">Loading sources...</div>
      </div>
    );
  }

  if (!asset && !sourcesFromState) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-slate-400 text-xl">No sources available</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-12">
      <button
        onClick={() => sourcesFromState ? navigate(-1) : navigate(`/top-picks/${category}/${symbol}`)}
        className="flex items-center gap-2 text-slate-400 hover:text-white mb-6 transition-colors"
      >
        <ArrowLeft className="w-5 h-5" />
        <span>Back to {sourcesFromState ? 'News Analysis' : asset?.name}</span>
      </button>

      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-3 bg-blue-500/10 rounded-xl">
            <Newspaper className="w-8 h-8 text-blue-500" />
          </div>
          <div>
            <h1 className="text-4xl font-bold text-white">Sources</h1>
            {asset && <p className="text-slate-400">{asset.name} ({asset.symbol})</p>}
          </div>
        </div>
      </div>

      <div className="max-w-5xl">
        {(() => {
          let urlsList: string[] = [];

          if (sourcesFromState) {
            console.log('Using sources from state:', sourcesFromState);
            urlsList = sourcesFromState;
          } else if (asset?.sources) {
            if (typeof asset.sources === 'string') {
              if (asset.sources.includes(',')) {
                urlsList = asset.sources.split(',').map(url => url.trim()).filter(url => url.length > 0);
              } else if (asset.sources.trim().startsWith('http')) {
                urlsList = [asset.sources];
              }
            } else if (Array.isArray(asset.sources)) {
              urlsList = asset.sources;
            }
          }

          console.log('Final urlsList:', urlsList);

          return urlsList.length > 0 ? (
            <div className="space-y-4">
              {urlsList.map((url, index) => (
                <div
                  key={index}
                  className="bg-slate-800/50 border border-slate-700 rounded-xl p-6 hover:border-blue-500/50 transition-colors"
                >
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                      <span className="text-white font-bold text-sm">{index + 1}</span>
                    </div>
                    <div className="flex-1">
                      <a
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-lg font-semibold text-blue-400 hover:text-blue-300 transition-colors inline-flex items-center gap-2 break-all"
                      >
                        {url}
                        <ExternalLink className="w-4 h-4 flex-shrink-0" />
                      </a>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-12 text-center">
              <Newspaper className="w-16 h-16 text-slate-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-slate-400 mb-2">No sources available</h3>
              <p className="text-slate-500">There are no news sources for this asset at the moment.</p>
            </div>
          );
        })()}
      </div>
    </div>
  );
}
