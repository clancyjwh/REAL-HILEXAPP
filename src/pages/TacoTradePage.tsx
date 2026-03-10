import { useState, useEffect } from 'react';
import { RefreshCw, ExternalLink } from 'lucide-react';
import { supabase } from '../lib/supabase';
import Disclaimer from '../components/Disclaimer';

type SearchMode = 'quick' | 'balanced' | 'deep';

interface TacoTradeUpdate {
  date: string;
  source: string;
  quote: string;
  topic: string;
  aggression_score: number;
  followthrough_score: number;
  summary: string;
  historical_consistency: string;
  chickened_out: boolean;
  verdict: string;
  reference_link: string;
  created_at: string;
}

export default function TacoTradePage() {
  const [webhookResponse, setWebhookResponse] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [searchMode, setSearchMode] = useState<SearchMode>('balanced');

  useEffect(() => {
    handleRefresh();
  }, []);

  const handleRefresh = async () => {
    setLoading(true);
    setError('');
    setWebhookResponse(null);

    try {
      const response = await fetch('https://hook.us2.make.com/lgc3hoxdaky8opcdsd1dyv444olp54kr', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          search_mode: searchMode
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to trigger webhook');
      }

      const webhookData = await response.text();
      setWebhookResponse(webhookData);
    } catch (err) {
      console.error('Error triggering webhook:', err);
      setError('Failed to trigger update. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <header className="mb-8">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-white mb-2">Taco Trade</h1>
              <p className="text-slate-400">Latest trading insights and updates</p>
            </div>
            <button
              onClick={handleRefresh}
              disabled={loading}
              className="flex items-center gap-2 px-6 py-3 bg-orange-600 hover:bg-orange-700 disabled:bg-slate-700 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-all"
            >
              <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex-1" />
            <div className="flex gap-2">
              <button
                onClick={() => setSearchMode('quick')}
                disabled={loading}
                className={`px-4 py-2 rounded-lg font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
                  searchMode === 'quick'
                    ? 'bg-pink-600 text-white shadow-lg shadow-pink-500/30'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700'
                }`}
                title="Quick Search - Surface level scan, faster results"
              >
                Quick Search
              </button>
              <button
                onClick={() => setSearchMode('balanced')}
                disabled={loading}
                className={`px-4 py-2 rounded-lg font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
                  searchMode === 'balanced'
                    ? 'bg-pink-600 text-white shadow-lg shadow-pink-500/30'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700'
                }`}
                title="Balanced - Moderate depth and speed"
              >
                Balanced
              </button>
              <button
                onClick={() => setSearchMode('deep')}
                disabled={loading}
                className={`px-4 py-2 rounded-lg font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
                  searchMode === 'deep'
                    ? 'bg-pink-600 text-white shadow-lg shadow-pink-500/30'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700'
                }`}
                title="Deep Dive - More thorough analysis, longer wait time"
              >
                Deep Dive
              </button>
            </div>
          </div>

          <div className="text-center">
            <p className="text-sm text-slate-400">
              {searchMode === 'quick' && 'Quick Search: Surface level scan for faster results'}
              {searchMode === 'balanced' && 'Balanced: Moderate depth and speed'}
              {searchMode === 'deep' && 'Deep Dive: More thorough analysis with longer wait time'}
            </p>
          </div>
        </div>
      </header>

      <div className="space-y-6">
        {error ? (
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-8">
            <div className="text-red-400 text-center py-8">
              {error}
            </div>
          </div>
        ) : loading ? (
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-8">
            <div className="text-slate-400 text-center py-8">
              Loading...
            </div>
          </div>
        ) : webhookResponse ? (
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-8">
            <pre className="bg-slate-950 border border-slate-700 rounded-lg p-6 overflow-x-auto">
              <code className="text-slate-300 text-sm font-mono whitespace-pre-wrap break-words">
                {typeof webhookResponse === 'string'
                  ? webhookResponse
                  : JSON.stringify(webhookResponse, null, 2)}
              </code>
            </pre>
          </div>
        ) : (
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-8">
            <div className="text-slate-400 text-center py-8">
              No data yet. Click Refresh to fetch webhook response.
            </div>
          </div>
        )}
      </div>
      <Disclaimer />
    </>
  );
}
