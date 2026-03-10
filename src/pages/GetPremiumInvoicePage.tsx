import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Mail, Check, DollarSign } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export default function GetPremiumInvoicePage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [email, setEmail] = useState(user?.email || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [selectedTier, setSelectedTier] = useState<'Premium' | 'Enterprise'>('Premium');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      const response = await fetch('https://hook.us2.make.com/gfjzkdd4kvh0dc3m0uy97wvc6o44u1t0', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Tier': selectedTier,
        },
        body: JSON.stringify({
          email: email,
          user_id: user?.id,
          timestamp: new Date().toISOString(),
          tier: selectedTier,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to submit request');
      }

      navigate('/get-premium/confirmation');
    } catch (err) {
      console.error('Error submitting invoice request:', err);
      setError('There was an error processing your request. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const tools = [
    'Horizon Optimizer',
    'Technical Indicators analysis',
    'Relative Value Index',
    'AI Newsfeed',
    'Interest Rates comparison',
    'Zero Day Options',
    'Event Forecasting',
    'Price Direction Forecast',
  ];

  return (
    <div className="min-h-screen pb-12">
      <button
        onClick={() => navigate('/get-premium')}
        className="group flex items-center gap-2 text-slate-400 hover:text-white transition-all duration-300 mb-8 hover:gap-3"
      >
        <ArrowLeft className="w-5 h-5" />
        <span className="font-medium">Back to Payment Options</span>
      </button>

      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center p-5 bg-gradient-to-br from-blue-500/20 to-blue-600/20 rounded-3xl mb-6 backdrop-blur-sm border-2 border-blue-400/40 shadow-2xl shadow-blue-500/30">
            <Mail className="w-14 h-14 text-blue-400" />
          </div>
          <h1 className="text-4xl font-extrabold text-white mb-4">
            Request Invoice
          </h1>
          <p className="text-xl text-slate-300">
            We'll send your invoice to the email address below
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-8">
            <div className="flex items-center gap-3 mb-6 pb-6 border-b border-slate-700">
              <DollarSign className="w-6 h-6 text-amber-500" />
              <div>
                <div className="text-3xl font-bold text-white">
                  $1,000 <span className="text-lg text-slate-400">CAD / month</span> <span className="text-base text-slate-500">+ Tax</span>
                </div>
                <div className="text-slate-400 text-sm">Recurring monthly payment</div>
              </div>
            </div>

            <div className="mb-6">
              <h3 className="text-lg font-semibold text-white mb-3">Premium includes:</h3>
              <div className="space-y-2">
                <div className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
                  <span className="text-slate-300">
                    <strong>Full access to Tools category:</strong>
                  </span>
                </div>
                <ul className="ml-7 space-y-1">
                  {tools.map((tool, index) => (
                    <li key={index} className="text-slate-400">• {tool}</li>
                  ))}
                </ul>
                <div className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
                  <span className="text-slate-300">Increased access to My Watchlist tab</span>
                </div>
              </div>
            </div>

            <div className="bg-green-500/10 border border-green-500 rounded-lg p-4 text-center">
              <span className="text-green-400 font-semibold">✓ 30 Day Money-Back Guarantee</span>
            </div>
          </div>

          <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-8">
            <div className="flex items-center gap-3 mb-6 pb-6 border-b border-slate-700">
              <DollarSign className="w-6 h-6 text-amber-500" />
              <div>
                <div className="text-3xl font-bold text-white">
                  $3,000 <span className="text-lg text-slate-400">CAD / month</span> <span className="text-base text-slate-500">+ Tax</span>
                </div>
                <div className="text-slate-400 text-sm">Recurring monthly payment</div>
              </div>
            </div>

            <div className="mb-6">
              <h3 className="text-lg font-semibold text-white mb-3">Enterprise includes:</h3>
              <div className="space-y-2">
                <div className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
                  <span className="text-slate-300">
                    <strong>All Premium benefits</strong>
                  </span>
                </div>
                <div className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
                  <span className="text-slate-300">
                    <strong>1 Bespoke project</strong>
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-green-500/10 border border-green-500 rounded-lg p-4 text-center">
              <span className="text-green-400 font-semibold">✓ 30 Day Money-Back Guarantee</span>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="bg-slate-800/50 border border-slate-700 rounded-2xl p-8">
          <h2 className="text-xl font-bold text-white mb-6">Invoice Details</h2>

          <div className="mb-6">
            <label className="block text-sm font-medium text-slate-300 mb-3">
              Select Tier
            </label>
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => setSelectedTier('Premium')}
                className={`px-6 py-4 rounded-lg font-semibold transition-all duration-300 ${
                  selectedTier === 'Premium'
                    ? 'bg-gradient-to-br from-violet-600 to-purple-700 border-2 border-violet-500 text-white shadow-lg shadow-violet-500/50'
                    : 'bg-slate-900 border-2 border-slate-700 text-slate-400 hover:border-slate-600'
                }`}
              >
                <div className="text-lg">Premium</div>
                <div className="text-sm opacity-75">$1,000 CAD/mo</div>
              </button>
              <button
                type="button"
                onClick={() => setSelectedTier('Enterprise')}
                className={`px-6 py-4 rounded-lg font-semibold transition-all duration-300 ${
                  selectedTier === 'Enterprise'
                    ? 'bg-gradient-to-br from-amber-600 to-orange-700 border-2 border-amber-500 text-white shadow-lg shadow-amber-500/50'
                    : 'bg-slate-900 border-2 border-slate-700 text-slate-400 hover:border-slate-600'
                }`}
              >
                <div className="text-lg">Enterprise</div>
                <div className="text-sm opacity-75">$3,000 CAD/mo</div>
              </button>
            </div>
          </div>

          <div className="mb-6">
            <label htmlFor="email" className="block text-sm font-medium text-slate-300 mb-2">
              What email would you like this invoice sent to?
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="your@email.com"
            />
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500 rounded-lg">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting || !email}
            className={`w-full py-4 rounded-lg font-semibold text-lg transition-all duration-300 ${
              isSubmitting || !email
                ? 'bg-slate-700 text-slate-500 cursor-not-allowed'
                : 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg hover:shadow-xl'
            }`}
          >
            {isSubmitting ? 'Submitting...' : 'Confirm & Request Invoice'}
          </button>
        </form>
      </div>
    </div>
  );
}
