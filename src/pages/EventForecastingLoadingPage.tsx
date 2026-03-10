import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Sparkles, TrendingUp, AlertCircle } from 'lucide-react';

export default function EventForecastingLoadingPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const query = searchParams.get('query') || '';
  const [dots, setDots] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const interval = setInterval(() => {
      setDots(prev => (prev.length >= 3 ? '' : prev + '.'));
    }, 500);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!query) {
      navigate('/tools/event-forecasting');
      return;
    }

    let isCancelled = false;
    const abortController = new AbortController();

    const fetchForecast = async () => {
      try {
        console.log('Sending webhook request for query:', query);

        const response = await fetch('https://hook.us2.make.com/5qbkt4iyi3e52o8auyjssk4bxar6f8ay', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ query }),
          cache: 'no-store',
          signal: abortController.signal,
        });

        if (!response.ok) {
          throw new Error('Failed to get forecast');
        }

        const data = await response.json();

        if (isCancelled) {
          console.log('Request was cancelled, ignoring response');
          return;
        }

        console.log('RAW WEBHOOK RESPONSE:', data);

        let flipConditions = null;
        if (data['Flip Conditions']) {
          try {
            flipConditions = typeof data['Flip Conditions'] === 'string'
              ? JSON.parse(data['Flip Conditions'])
              : data['Flip Conditions'];
          } catch (e) {
            console.error('Error parsing flip conditions:', e);
          }
        }

        const stateData = {
          query,
          summary: data.Summary || data.summary || '',
          eventScore: parseFloat(data['Event Score'] || data.event_score || '0'),
          recentMomentum: parseFloat(data['Recent Momentum'] || data.recent_momentum || '0'),
          structuralEdge: parseFloat(data['Structural Edge'] || data.structural_edge || '0'),
          expertConsensusScore: parseFloat(data['Expert Consensus Score'] || data.expert_consensus_score || '0'),
          newsSentimentScore: parseFloat(data['News & Sentiment score'] || data.news_sentiment_score || '0'),
          historicalPatternMatch: parseFloat(data['Historical Pattern Match'] || data.historical_pattern_match || '0'),
          timePressureEffect: parseFloat(data['Time Pressure/Deadline Effect'] || data.time_pressure_effect || '0'),
          flipConditions: flipConditions,
        };

        console.log('PARSED STATE DATA:', stateData);

        navigate('/tools/event-forecasting/results', { state: stateData });
      } catch (err) {
        if (err.name === 'AbortError' || isCancelled) {
          console.log('Request was aborted');
          return;
        }
        console.error('Error fetching forecast:', err);
        setError('Failed to get forecast. Please try again.');
      }
    };

    fetchForecast();

    return () => {
      isCancelled = true;
      abortController.abort();
      console.log('Cleanup: Cancelled pending request');
    };
  }, [query, navigate]);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="max-w-2xl mx-auto text-center">
          <div className="mb-8 flex justify-center">
            <div className="w-24 h-24 bg-red-500/20 rounded-full flex items-center justify-center">
              <AlertCircle className="w-12 h-12 text-red-500" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-white mb-4">Error</h1>
          <p className="text-xl text-slate-300 mb-6">{error}</p>
          <button
            onClick={() => navigate('/tools/event-forecasting')}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="max-w-2xl mx-auto text-center">
        <div className="mb-8 flex justify-center">
          <div className="relative">
            <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full flex items-center justify-center animate-pulse">
              <TrendingUp className="w-12 h-12 text-white" />
            </div>
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full animate-ping opacity-20"></div>
          </div>
        </div>

        <h1 className="text-4xl font-bold text-white mb-4">
          Forecasting Event{dots}
        </h1>

        <p className="text-xl text-slate-300 mb-6">
          {query}
        </p>

        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
          <div className="flex items-start gap-4 text-left">
            <Sparkles className="w-5 h-5 text-blue-400 mt-1 flex-shrink-0" />
            <div className="space-y-3 text-slate-300">
              <p>Analyzing historical patterns and trends</p>
              <p>Evaluating expert consensus and sentiment</p>
              <p>Calculating probability distributions</p>
              <p>Generating comprehensive forecast</p>
            </div>
          </div>
        </div>

        <p className="text-slate-500 mt-6 text-sm">
          processing time: 20-40 seconds
        </p>
      </div>
    </div>
  );
}
