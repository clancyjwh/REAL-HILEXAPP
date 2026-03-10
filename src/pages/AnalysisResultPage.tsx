import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Bitcoin, ArrowLeft, Home } from 'lucide-react';
import AnalysisLoadingPage from './AnalysisLoadingPage';

interface AnalysisData {
  asset: string;
  price: string;
  description: string;
}

export default function AnalysisResultPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const ticker = searchParams.get('ticker');
  const [loading, setLoading] = useState(true);
  const [analysisData, setAnalysisData] = useState<AnalysisData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAnalysis = async () => {
      if (!ticker) {
        navigate('/');
        return;
      }

      try {
        const response = await fetch(
          'https://hook.us2.make.com/sbdbpbiskw0995xvsyqtjm8wlx133rcu',
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ Value: ticker }),
          }
        );

        if (!response.ok) {
          throw new Error('Failed to fetch analysis');
        }

        const text = await response.text();

        const lines = text.split('\n').filter(line => line.trim());
        const assetLine = lines.find(l => l.startsWith('Asset:'));
        const priceLine = lines.find(l => l.startsWith('Price:'));
        const descriptionIndex = lines.findIndex(l => l.startsWith('Description:'));

        const asset = assetLine ? assetLine.replace('Asset:', '').trim() : ticker;
        const priceRaw = priceLine ? priceLine.replace('Price:', '').trim() : 'N/A';
        const priceNum = parseFloat(priceRaw.replace(/[^0-9.-]/g, ''));
        const formattedPrice = !isNaN(priceNum)
          ? `$${Math.round(priceNum).toLocaleString('en-US')}`
          : priceRaw;

        const description = descriptionIndex !== -1
          ? lines.slice(descriptionIndex).join('\n').replace('Description:', '').trim()
          : text;

        setAnalysisData({
          asset,
          price: formattedPrice,
          description,
        });
      } catch (err) {
        setError('Failed to load analysis. Please try again.');
        console.error('Analysis fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalysis();
  }, [ticker, navigate]);

  if (loading) {
    return <AnalysisLoadingPage />;
  }

  if (error || !analysisData) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <div className="text-red-500 text-xl mb-4">{error || 'No data available'}</div>
        <button
          onClick={() => navigate('/')}
          className="px-6 py-3 bg-orange-600 hover:bg-orange-700 text-white font-medium rounded-lg transition-all"
        >
          Return Home
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto">
      <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-8 mb-6">
        <div className="flex items-center gap-4 mb-6">
          <div className="p-4 bg-green-500/10 rounded-full">
            <Bitcoin className="w-8 h-8 text-green-500" />
          </div>
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-white">{analysisData.asset}</h1>
            <p className="text-slate-400 mt-1">{analysisData.asset}</p>
          </div>
          <div className="text-right">
            <div className="text-4xl font-bold text-white">{analysisData.price}</div>
          </div>
        </div>

        <div className="border-t border-slate-700 pt-6">
          <p className="text-lg text-slate-300 leading-relaxed">
            {analysisData.description}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <button
          onClick={() => navigate(-1)}
          className="px-6 py-4 bg-slate-800/50 hover:bg-slate-700/50 border border-slate-700 text-white font-medium rounded-lg transition-all flex items-center justify-center gap-3"
        >
          <ArrowLeft className="w-5 h-5" />
          Back
        </button>
        <button
          onClick={() => navigate('/')}
          className="px-6 py-4 bg-orange-600 hover:bg-orange-700 text-white font-medium rounded-lg transition-all flex items-center justify-center gap-3"
        >
          <Home className="w-5 h-5" />
          Home
        </button>
      </div>
    </div>
  );
}
