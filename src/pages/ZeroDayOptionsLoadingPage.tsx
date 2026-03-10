import { useEffect, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Loader2, Zap } from 'lucide-react';
import { supabase } from '../lib/supabase';

export default function ZeroDayOptionsLoadingPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const ticker = searchParams.get('ticker') || '';
  const horizon = searchParams.get('horizon') || '5';
  const hasFetched = useRef(false);
  const [startTime] = useState(Date.now());

  useEffect(() => {
    if (hasFetched.current) {
      return;
    }

    if (!ticker) {
      return;
    }

    hasFetched.current = true;

    const fetchAnalysis = async () => {
      try {
        // Trigger the Make scenario
        const webhookUrl = `https://hook.us2.make.com/4buab6mstm3u585ua168v5bynhw15i48?ticker=${encodeURIComponent(ticker)}&horizon=${horizon}`;

        await fetch(webhookUrl);

        // Poll for results in the database
        const pollForResults = async () => {
          const maxAttempts = 60; // 60 seconds max
          let attempts = 0;

          while (attempts < maxAttempts) {
            const { data, error } = await supabase
              .from('zero_day_options_results')
              .select('*')
              .eq('ticker', ticker)
              .eq('horizon', parseInt(horizon))
              .gte('created_at', new Date(startTime).toISOString())
              .order('created_at', { ascending: false })
              .limit(1)
              .maybeSingle();

            if (error) {
              console.error('Database query error:', error);
              throw error;
            }

            if (data) {
              navigate(`/tools/zero-day-options/result?id=${data.id}`);
              return;
            }

            // Wait 1 second before polling again
            await new Promise(resolve => setTimeout(resolve, 1000));
            attempts++;
          }

          throw new Error('Analysis timeout');
        };

        await pollForResults();
      } catch (error) {
        console.error('Analysis error:', error);
        navigate('/tools/zero-day-options');
      }
    };

    fetchAnalysis();
  }, [ticker, horizon, navigate, startTime]);

  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center">
      <div className="text-center space-y-6">
        <div className="flex justify-center">
          <div className="p-4 bg-emerald-500/10 rounded-full">
            <Zap className="w-12 h-12 text-emerald-500" />
          </div>
        </div>

        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-white">Analyzing {ticker}</h2>
          <p className="text-slate-400">Processing {horizon}-minute analysis...</p>
        </div>

        <div className="flex justify-center">
          <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
        </div>

        <div className="max-w-md mx-auto">
          <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4">
            <p className="text-slate-400 text-sm">
              Running ultra-short-term predictive analysis on market scenarios...
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
