import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Percent, Loader2 } from 'lucide-react';
import { supabase } from '../lib/supabase';

export default function InterestRatesLoadingPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { country1, country2, country1Name, country2Name } = location.state || {};

  useEffect(() => {
    if (!country1 || !country2 || !country1Name || !country2Name) {
      navigate('/interest-rates');
      return;
    }

    let hasNavigated = false;

    const checkForData = async () => {
      const { data } = await supabase
        .from('interest_rates_data')
        .select('*')
        .eq('country1_code', country1)
        .eq('country2_code', country2)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (data && !hasNavigated) {
        hasNavigated = true;
        navigate('/interest-rates/result', {
          state: { country1Name, country2Name }
        });
      }
    };

    checkForData();

    const pollInterval = setInterval(checkForData, 2000);

    const channel = supabase
      .channel('interest_rates_changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'interest_rates_data',
        },
        async (payload) => {
          if (!hasNavigated &&
              payload.new.country1_code === country1 &&
              payload.new.country2_code === country2) {
            hasNavigated = true;
            navigate('/interest-rates/result', {
              state: { country1Name, country2Name }
            });
          }
        }
      )
      .subscribe();

    return () => {
      clearInterval(pollInterval);
      supabase.removeChannel(channel);
    };
  }, [country1, country2, country1Name, country2Name, navigate]);

  if (!country1 || !country2) {
    return null;
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="flex justify-center mb-6">
          <div className="relative">
            <div className="p-4 bg-pink-500/10 rounded-full">
              <Percent className="w-12 h-12 text-pink-500" />
            </div>
            <Loader2 className="w-6 h-6 text-pink-500 animate-spin absolute -top-1 -right-1" />
          </div>
        </div>

        <h2 className="text-2xl font-bold text-white mb-3">
          Analyzing Interest Rates
        </h2>

        <p className="text-slate-400 text-lg mb-2">
          Comparing central bank data...
        </p>

        <div className="flex items-center justify-center gap-2 text-sm text-slate-500">
          <div className="w-2 h-2 bg-pink-500 rounded-full animate-pulse" />
          <div className="w-2 h-2 bg-pink-500 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }} />
          <div className="w-2 h-2 bg-pink-500 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }} />
        </div>
      </div>
    </div>
  );
}
