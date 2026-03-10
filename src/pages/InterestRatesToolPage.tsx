import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Percent, Search, ArrowLeft, AlertTriangle } from 'lucide-react';
import { checkRateLimit } from '../utils/rateLimiting';

interface Country {
  name: string;
  code: string;
}

const countries: Country[] = [
  { name: 'United States', code: 'FEDFUNDS' },
  { name: 'Canada', code: 'IRLTLT01CAM156N' },
  { name: 'Mexico', code: 'IRLTLT01MXM156N' },
  { name: 'Chile', code: 'IRLTLT01CLM156N' },
  { name: 'Euro Area', code: 'IRSTCI01EZM156N' },
  { name: 'United Kingdom', code: 'IRLTLT01GBM156N' },
  { name: 'Switzerland', code: 'IRLTLT01CHM156N' },
  { name: 'Norway', code: 'IRLTLT01NOM156N' },
  { name: 'Sweden', code: 'IRLTLT01SEM156N' },
  { name: 'Denmark', code: 'IRLTLT01DKM156N' },
  { name: 'Portugal', code: 'IRLTLT01PTM156N' },
  { name: 'Italy', code: 'IRLTLT01ITM156N' },
  { name: 'Spain', code: 'IRLTLT01ESM156N' },
  { name: 'Greece', code: 'IRLTLT01GRM156N' },
  { name: 'Hungary', code: 'IRLTLT01HUM156N' },
  { name: 'Poland', code: 'IRLTLT01PLM156N' },
  { name: 'Israel', code: 'IRLTLT01ILM156N' },
  { name: 'Russia', code: 'IRLTLT01RUM156N' },
  { name: 'South Africa', code: 'IRLTLT01ZAM156N' },
  { name: 'New Zealand', code: 'IRLTLT01NZM156N' },
  { name: 'Australia', code: 'IRLTLT01AUM156N' },
  { name: 'South Korea', code: 'IRLTLT01KRM156N' },
  { name: 'Japan', code: 'IRLTLT01JPM156N' },
  { name: 'Iceland', code: 'IRLTLT01ISM156N' },
];

export default function InterestRatesToolPage() {
  const navigate = useNavigate();
  const [country1, setCountry1] = useState('');
  const [country2, setCountry2] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [rateLimitError, setRateLimitError] = useState<string | null>(null);

  const handleSearch = async () => {
    if (!country1 || !country2) {
      alert('Please select both countries');
      return;
    }

    setRateLimitError(null);
    setIsSubmitting(true);

    const rateLimitResult = await checkRateLimit('interest-rates');

    if (!rateLimitResult.allowed) {
      setRateLimitError(rateLimitResult.message || 'Rate limit exceeded. Please try again later.');
      setIsSubmitting(false);
      return;
    }

    const country1Name = countries.find(c => c.code === country1)?.name || '';
    const country2Name = countries.find(c => c.code === country2)?.name || '';

    try {
      navigate('/tools/interest-rates/loading', {
        state: { country1, country2, country1Name, country2Name }
      });

      await fetch('https://hook.us2.make.com/9w6qcmklo6slfrmen5vke9i8usaxy3u7', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          country1_code: country1,
          country2_code: country2,
          country1_name: country1Name,
          country2_name: country2Name,
        }),
      });
    } catch (error) {
      console.error('Error sending webhook:', error);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <button
        onClick={() => navigate('/tools')}
        className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-6"
      >
        <ArrowLeft className="w-5 h-5" />
        Back to Tools
      </button>
      <div className="flex-1 flex items-center justify-center py-12">
        <div className="w-full max-w-2xl px-4">
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center p-4 bg-gradient-to-br from-pink-500/20 to-purple-500/20 rounded-2xl mb-6 backdrop-blur-sm border border-pink-500/30 shadow-lg shadow-pink-500/20">
              <Percent className="w-12 h-12 text-pink-400" />
            </div>
            <h1 className="text-5xl font-bold text-white mb-3 bg-gradient-to-r from-pink-400 via-pink-300 to-purple-400 bg-clip-text text-transparent">
              Interest Rates
            </h1>
            <p className="text-slate-300 text-lg">Compare central bank interest rates across countries</p>
          </div>

          <div className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-xl rounded-2xl p-8 border-2 border-cyan-400/50 shadow-2xl shadow-cyan-500/20">
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-bold text-cyan-400 mb-3 uppercase tracking-wide">
                  First Country
                </label>
                <select
                  value={country1}
                  onChange={(e) => setCountry1(e.target.value)}
                  className="w-full px-5 py-4 bg-slate-900/90 border-2 border-cyan-400/60 rounded-xl text-cyan-100 font-medium focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/30 transition-all text-base hover:border-cyan-400 cursor-pointer"
                >
                  <option value="" className="bg-slate-900 text-cyan-100">Select a country</option>
                  {countries.map((country) => (
                    <option key={country.code} value={country.code} className="bg-slate-900 text-cyan-100">
                      {country.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center justify-center">
                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-fuchsia-500 to-pink-500 border-2 border-fuchsia-400 flex items-center justify-center shadow-lg shadow-fuchsia-500/50 animate-pulse">
                  <span className="text-white font-extrabold text-xl">VS</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-cyan-400 mb-3 uppercase tracking-wide">
                  Second Country
                </label>
                <select
                  value={country2}
                  onChange={(e) => setCountry2(e.target.value)}
                  className="w-full px-5 py-4 bg-slate-900/90 border-2 border-cyan-400/60 rounded-xl text-cyan-100 font-medium focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/30 transition-all text-base hover:border-cyan-400 cursor-pointer"
                >
                  <option value="" className="bg-slate-900 text-cyan-100">Select a country</option>
                  {countries.map((country) => (
                    <option key={country.code} value={country.code} className="bg-slate-900 text-cyan-100">
                      {country.name}
                    </option>
                  ))}
                </select>
              </div>

              {rateLimitError && (
                <div className="mt-4 p-4 bg-red-500/10 border border-red-500/50 rounded-lg flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-red-400 mb-1">Rate Limit Exceeded</h4>
                    <p className="text-sm text-red-300">{rateLimitError}</p>
                  </div>
                </div>
              )}

              <button
                onClick={handleSearch}
                disabled={!country1 || !country2 || isSubmitting}
                className="w-full flex items-center justify-center gap-3 px-6 py-5 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 disabled:from-slate-700 disabled:to-slate-700 disabled:cursor-not-allowed text-white rounded-xl transition-all font-bold text-lg shadow-lg shadow-cyan-500/50 hover:shadow-cyan-400/60 hover:scale-[1.02] active:scale-[0.98]"
              >
                <Search className="w-5 h-5" />
                Compare Interest Rates
              </button>
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
