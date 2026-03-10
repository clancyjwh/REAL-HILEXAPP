import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Percent, ArrowLeft, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { supabase } from '../lib/supabase';

const getSpreadColors = (spread: string) => {
  const value = parseFloat(spread.replace('%', '').replace('+', ''));

  if (value > 0) {
    if (value >= 2) return { bg: 'bg-green-500', border: 'border-green-400', text: 'text-white' };
    if (value >= 1) return { bg: 'bg-green-600', border: 'border-green-500', text: 'text-white' };
    if (value >= 0.5) return { bg: 'bg-green-700', border: 'border-green-600', text: 'text-white' };
    return { bg: 'bg-green-800', border: 'border-green-700', text: 'text-white' };
  } else if (value < 0) {
    const absValue = Math.abs(value);
    if (absValue >= 2) return { bg: 'bg-red-500', border: 'border-red-400', text: 'text-white' };
    if (absValue >= 1) return { bg: 'bg-red-600', border: 'border-red-500', text: 'text-white' };
    if (absValue >= 0.5) return { bg: 'bg-red-700', border: 'border-red-600', text: 'text-white' };
    return { bg: 'bg-red-800', border: 'border-red-700', text: 'text-white' };
  }
  return { bg: 'bg-slate-700', border: 'border-slate-600', text: 'text-white' };
};

const getRateColors = (rate: string) => {
  const value = parseFloat(rate.replace('%', ''));

  if (value >= 5) return { bg: 'bg-green-500', border: 'border-green-400', text: 'text-white' };
  if (value >= 4) return { bg: 'bg-green-600', border: 'border-green-500', text: 'text-white' };
  if (value >= 3) return { bg: 'bg-green-700', border: 'border-green-600', text: 'text-white' };
  if (value >= 2) return { bg: 'bg-green-800', border: 'border-green-700', text: 'text-white' };
  if (value >= 1) return { bg: 'bg-yellow-700', border: 'border-yellow-600', text: 'text-white' };
  if (value >= 0) return { bg: 'bg-red-700', border: 'border-red-600', text: 'text-white' };
  return { bg: 'bg-red-800', border: 'border-red-700', text: 'text-white' };
};

export default function InterestRatesToolResultPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { country1Name, country2Name } = location.state || {};
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!country1Name || !country2Name) {
      navigate('/tools/interest-rates');
      return;
    }

    const fetchData = async () => {
      const { data: result, error } = await supabase
        .from('interest_rates_data')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) {
        console.error('Error fetching interest rates data:', error);
      } else if (result) {
        setData(result);
      }
      setLoading(false);
    };

    fetchData();

    const channel = supabase
      .channel('interest_rates_changes_tool_result')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'interest_rates_data',
        },
        (payload) => {
          setData(payload.new);
          setLoading(false);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [country1Name, country2Name, navigate]);

  if (!country1Name || !country2Name) {
    return null;
  }

  if (loading || !data) {
    return (
      <div className="min-h-screen pb-12">
        <button
          onClick={() => navigate('/tools/interest-rates')}
          className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-6"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Interest Rates
        </button>
        <div className="mb-8">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-pink-500/10 rounded-lg">
              <Percent className="w-6 h-6 text-pink-500" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-white">Interest Rates Comparison</h1>
              <p className="text-slate-400">Loading data...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const spreadValue = parseFloat(data.spread.replace('%', '').replace('+', ''));
  const isPositive = spreadValue > 0;
  const isNeutral = spreadValue === 0;
  const spreadColors = getSpreadColors(data.spread);
  const rate1Colors = getRateColors(data.interest_rate_1);
  const rate2Colors = getRateColors(data.interest_rate_2);

  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex-1 pb-12">
        <div className="mb-8">
          <button
            onClick={() => navigate('/tools/interest-rates')}
            className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-6"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Search
          </button>

          <div className="flex items-center gap-3">
            <div className="p-2 bg-pink-500/10 rounded-lg">
              <Percent className="w-6 h-6 text-pink-500" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-white">Interest Rates Comparison</h1>
              <p className="text-slate-400">
                {country1Name} vs {country2Name}
              </p>
            </div>
          </div>
        </div>

        <div className="max-w-4xl space-y-6">
          <div className={`${spreadColors.bg} ${spreadColors.border} border-2 rounded-xl p-8 shadow-lg`}>
            <div className="flex items-center gap-3 mb-6">
              {isNeutral ? (
                <Minus className="w-6 h-6 text-white" />
              ) : isPositive ? (
                <TrendingUp className="w-6 h-6 text-white" />
              ) : (
                <TrendingDown className="w-6 h-6 text-white" />
              )}
              <h2 className="text-2xl font-bold text-white">Spread</h2>
            </div>

            <div className="mb-4">
              <div className={`text-6xl font-bold ${spreadColors.text}`}>
                {data.spread}
              </div>
            </div>

            <p className="text-white/90 text-lg">
              {isPositive
                ? `${country1Name} has a ${data.spread} higher interest rate than ${country2Name}`
                : isNeutral
                ? `${country1Name} and ${country2Name} have the same interest rate`
                : `${country1Name} has a ${data.spread} lower interest rate than ${country2Name}`
              }
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className={`${rate1Colors.bg} ${rate1Colors.border} border-2 rounded-xl p-6 shadow-lg`}>
              <h3 className="text-lg font-semibold text-white/80 mb-3">{country1Name}</h3>
              <div className={`text-4xl font-bold ${rate1Colors.text}`}>
                {data.interest_rate_1}
              </div>
            </div>

            <div className={`${rate2Colors.bg} ${rate2Colors.border} border-2 rounded-xl p-6 shadow-lg`}>
              <h3 className="text-lg font-semibold text-white/80 mb-3">{country2Name}</h3>
              <div className={`text-4xl font-bold ${rate2Colors.text}`}>
                {data.interest_rate_2}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-slate-900/60 backdrop-blur-sm border-t border-slate-700/50 py-6 px-4">
        <p className="text-slate-400 text-sm text-center max-w-4xl mx-auto leading-relaxed">
          Interest rate data is sourced from the Federal Reserve Bank of St. Louis database and is provided for informational purposes only.
          Rates are subject to change and may not reflect real-time values. This information does not constitute financial advice.
        </p>
      </div>
    </div>
  );
}
