import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, TrendingUp, Search, Sparkles, AlertTriangle } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { checkRateLimit } from '../utils/rateLimiting';

export default function EventForecastingPage() {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [rateLimitError, setRateLimitError] = useState<string | null>(null);
  const [examples, setExamples] = useState<string[]>([
    "Will Apple release Vision Pro 2 in 2025?",
    "Will Bitcoin close above $100k this year?",
    "Will the NDP win BC?",
    "Will ETH ETF be approved by March?",
    "Will the Leafs win tonight?",
    "Will unemployment rise above 5% this quarter?",
    "Will Tesla announce a new model this year?",
    "Will interest rates be cut by Q2?",
    "Will oil prices exceed $100 per barrel?",
    "Will inflation fall below 2% by year end?"
  ]);

  useEffect(() => {
    const fetchExamples = async () => {
      try {
        const { data, error } = await supabase
          .from('event_forecasting_examples')
          .select('question')
          .eq('active', true)
          .order('created_at', { ascending: false })
          .limit(10);

        if (error) throw error;

        if (data && data.length > 0) {
          setExamples(data.map(item => item.question));
        }
      } catch (error) {
        console.error('Failed to fetch examples:', error);
      }
    };

    fetchExamples();

    const interval = setInterval(fetchExamples, 60000);

    return () => clearInterval(interval);
  }, []);

  const handleSearch = async () => {
    if (!query.trim() || isSubmitting) return;

    setRateLimitError(null);
    setIsSubmitting(true);

    const rateLimitResult = await checkRateLimit('event-forecasting');

    if (!rateLimitResult.allowed) {
      setRateLimitError(rateLimitResult.message || 'Rate limit exceeded. Please try again later.');
      setIsSubmitting(false);
      return;
    }

    navigate(`/tools/event-forecasting/loading?query=${encodeURIComponent(query.trim())}`);
  };

  return (
    <>
      <div className="mb-8">
        <button
          onClick={() => navigate('/tools')}
          className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-6"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back to Tools</span>
        </button>

        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-500/10 rounded-lg">
            <TrendingUp className="w-6 h-6 text-blue-500" />
          </div>
          <div>
            <h1 className="text-4xl font-bold text-white">Event Forecasting</h1>
            <p className="text-slate-400">Predict real-world outcomes with data-driven analysis</p>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto">
        <div className="bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 rounded-xl p-8 shadow-xl">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-white mb-3">
              What outcome do you want to forecast?
            </h2>
            <p className="text-slate-400">
              Ask about elections, sports, price targets, weather events, policy outcomes, or anything with a real-world result.
            </p>
          </div>

          <div className="space-y-4">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && !isSubmitting && handleSearch()}
                placeholder="Enter your question..."
                disabled={isSubmitting}
                className="w-full pl-12 pr-4 py-4 bg-slate-900 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              />
            </div>

            {rateLimitError && (
              <div className="p-4 bg-red-500/10 border border-red-500/50 rounded-lg flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-red-400 mb-1">Rate Limit Exceeded</h4>
                  <p className="text-sm text-red-300">{rateLimitError}</p>
                </div>
              </div>
            )}

            <button
              onClick={handleSearch}
              disabled={!query.trim() || isSubmitting}
              className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 disabled:from-slate-700 disabled:to-slate-800 text-white font-semibold py-4 rounded-lg transition-all duration-300 flex items-center justify-center gap-3 shadow-lg hover:shadow-blue-500/20 disabled:cursor-not-allowed"
            >
              <Sparkles className="w-5 h-5" />
              <span>{isSubmitting ? 'Processing...' : 'Forecast Event'}</span>
            </button>
          </div>
        </div>

        <div className="mt-4 text-center">
          <p className="text-sm text-slate-500 italic">
            This engine answers yes/no prediction questions only.
          </p>
        </div>

        <div className="mt-8 bg-slate-800/50 border border-slate-700 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-blue-400" />
            Popular on Polymarket
          </h3>
          <div className="space-y-2">
            {examples.map((example, index) => (
              <button
                key={index}
                onClick={() => setQuery(example)}
                className="w-full text-left px-4 py-3 bg-slate-900/50 hover:bg-slate-900 border border-slate-700 hover:border-slate-600 rounded-lg text-slate-300 hover:text-white transition-all duration-200"
              >
                {example}
              </button>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
