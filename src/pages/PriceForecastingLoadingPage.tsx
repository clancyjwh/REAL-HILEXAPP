import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { LineChart, TrendingUp, AlertCircle } from 'lucide-react';

export default function PriceForecastingLoadingPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const assetClass = searchParams.get('asset_class') || '';
  const ticker = searchParams.get('ticker') || '';
  const [dots, setDots] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const interval = setInterval(() => {
      setDots(prev => (prev.length >= 3 ? '' : prev + '.'));
    }, 500);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!assetClass || !ticker) {
      navigate('/tools/price-forecasting');
      return;
    }

    let isCancelled = false;
    const abortController = new AbortController();

    const fetchForecast = async () => {
      try {
        console.log('Sending webhook request for ticker:', ticker, 'asset class:', assetClass);

        const response = await fetch('https://hook.us2.make.com/lxfcgn8pepa9okcnn72czzibtwefrna0', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            asset_class: assetClass,
            ticker: ticker,
          }),
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

        let scenariosCompared = [];
        if (data['Scenarios Compared']) {
          try {
            scenariosCompared = data['Scenarios Compared'].map((item: string) =>
              typeof item === 'string' ? JSON.parse(item) : item
            );
          } catch (e) {
            console.error('Error parsing scenarios:', e);
          }
        }

        const stateData = {
          ticker,
          assetClass,
          symbol: data.Symbol || ticker,
          cumulativeScore: parseFloat(data['Cumulative Score'] || '0'),
          scenariosCompared: scenariosCompared,
          expectedReturnPercentage: data['Expected Return Percentage'] || '0',
          currentPrice: data['Current Price'] || '0',
          tenDayPriceForecast: data['10 Day Price Forecast'] || '0',
          upwardMovementProbability: data['Upward Movement Probability '] || data['Upward Movement Probability'] || '0',
          downwardMovementProbability: data['Downward Movement Probability '] || data['Downward Movement Probability'] || '0',
        };

        console.log('PARSED STATE DATA:', stateData);

        navigate('/tools/price-forecasting/result', { state: stateData });
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
  }, [assetClass, ticker, navigate]);

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center max-w-md">
          <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">Error</h2>
          <p className="text-slate-400 mb-6">{error}</p>
          <button
            onClick={() => navigate('/tools/price-forecasting')}
            className="px-6 py-3 bg-orange-600 hover:bg-orange-500 text-white rounded-lg transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center max-w-lg">
        <div className="relative w-24 h-24 mx-auto mb-8">
          <div className="absolute inset-0 bg-gradient-to-br from-orange-500 to-amber-500 rounded-full animate-pulse opacity-20"></div>
          <div className="absolute inset-2 bg-gradient-to-br from-orange-500 to-amber-500 rounded-full animate-pulse opacity-40"></div>
          <div className="absolute inset-4 bg-gradient-to-br from-orange-500 to-amber-500 rounded-full flex items-center justify-center">
            <LineChart className="w-10 h-10 text-white animate-pulse" />
          </div>
        </div>

        <div className="space-y-4">
          <h2 className="text-3xl font-bold text-white flex items-center justify-center gap-3">
            <TrendingUp className="w-8 h-8 text-orange-400 animate-bounce" />
            Analyzing Pattern
          </h2>
          <p className="text-xl text-slate-300">
            Generating forecast for <span className="text-orange-400 font-semibold">{ticker}</span>{dots}
          </p>
          <div className="text-slate-400 space-y-2 mt-6">
            <p className="animate-pulse">Scanning historical data</p>
            <p className="animate-pulse delay-75">Identifying similar patterns</p>
            <p className="animate-pulse delay-150">Calculating probabilities</p>
          </div>
        </div>
      </div>
    </div>
  );
}
