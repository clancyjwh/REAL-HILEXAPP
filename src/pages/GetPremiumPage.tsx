import { useNavigate } from 'react-router-dom';
import { CreditCard, FileText, Star, Check } from 'lucide-react';
import { useState } from 'react';
import { supabase } from '../lib/supabase';

export default function GetPremiumPage() {
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(false);

  const benefits = [
    'Full access to all tools in the Tools category',
    'Horizon Optimizer',
    'Technical Indicators analysis',
    'Relative Value Index',
    'AI Newsfeed',
    'Interest Rates comparison',
    'Zero Day Options',
    'Event Forecasting',
    'Price Direction Forecast',
    'Increased access to My Watchlist',
    'Priority support',
  ];

  const handleStripeCheckout = async (tier: 'premium' | 'enterprise') => {
    try {
      setIsProcessing(true);

      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        alert('Please sign in to upgrade to premium');
        navigate('/login');
        return;
      }

      const userId = session.user.id;
      const paymentLink = tier === 'premium'
        ? `https://buy.stripe.com/9B614gb154uibm248E9Ve00?client_reference_id=${userId}`
        : `https://buy.stripe.com/3cI4gsb155ymahY5cI9Ve02?client_reference_id=${userId}`;

      window.open(paymentLink, '_blank');
    } catch (error) {
      console.error('Checkout error:', error);
      alert('Failed to start checkout. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen pb-12">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center p-5 bg-gradient-to-br from-amber-500/20 to-orange-500/20 rounded-3xl mb-6 backdrop-blur-sm border-2 border-amber-400/40 shadow-2xl shadow-amber-500/30">
            <Star className="w-14 h-14 text-amber-400" />
          </div>
          <h1 className="text-5xl font-extrabold text-white mb-4 bg-gradient-to-r from-amber-400 to-orange-400 bg-clip-text text-transparent">
            Upgrade to Premium
          </h1>
          <p className="text-xl text-slate-300 max-w-2xl mx-auto">
            Unlock the full power of Hilex Optimized Trends with premium access
          </p>
        </div>

        <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-8 mb-8">
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
            <Check className="w-6 h-6 text-amber-500" />
            Premium Benefits
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {benefits.map((benefit, index) => (
              <div key={index} className="flex items-start gap-3">
                <Check className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
                <span className="text-slate-300">{benefit}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-gradient-to-br from-slate-800/90 to-slate-900/90 border-2 border-amber-500/50 rounded-2xl p-8 shadow-xl shadow-amber-500/20">
            <div className="text-center mb-6">
              <h3 className="text-2xl font-bold text-amber-400 mb-4">Premium</h3>
              <div className="text-5xl font-extrabold text-white mb-2">
                $1,000 <span className="text-2xl text-slate-400">CAD</span> <span className="text-xl text-slate-500">+ Tax</span>
              </div>
              <div className="text-slate-400 text-lg">per month (recurring)</div>
              <div className="mt-4 inline-block px-4 py-2 bg-green-500/20 border border-green-500 rounded-full">
                <span className="text-green-400 font-semibold">30 Day Money-Back Guarantee</span>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-slate-800/90 to-slate-900/90 border-2 border-amber-500/50 rounded-2xl p-8 shadow-xl shadow-amber-500/20">
            <div className="text-center mb-6">
              <h3 className="text-2xl font-bold text-amber-400 mb-4">Enterprise</h3>
              <div className="text-5xl font-extrabold text-white mb-2">
                $3,000 <span className="text-2xl text-slate-400">CAD</span> <span className="text-xl text-slate-500">+ Tax</span>
              </div>
              <div className="text-slate-400 text-lg">per month (recurring)</div>
              <div className="mt-4 inline-block px-4 py-2 bg-green-500/20 border border-green-500 rounded-full">
                <span className="text-green-400 font-semibold">30 Day Money-Back Guarantee</span>
              </div>
              <div className="mt-4 pt-4 border-t border-slate-700">
                <p className="text-amber-400 font-semibold">All Premium benefits plus:</p>
                <p className="text-slate-300 mt-2">1 Bespoke project</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <button
            onClick={() => navigate('/get-premium/invoice')}
            className="group relative overflow-hidden rounded-xl bg-gradient-to-br from-blue-600 to-blue-700 border-2 border-blue-500 p-8 text-left transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/50 hover:scale-105"
          >
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 bg-white/10 rounded-lg">
                <FileText className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-white">Pay by Invoice</h2>
            </div>
            <p className="text-blue-100">
              Receive an invoice and pay via bank transfer or check
            </p>
          </button>

          <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-8">
            <div className="flex items-center gap-4 mb-6">
              <div className="p-3 bg-violet-600/20 rounded-lg">
                <CreditCard className="w-8 h-8 text-violet-400" />
              </div>
              <h2 className="text-2xl font-bold text-white">Pay with Stripe</h2>
            </div>
            <p className="text-slate-300 mb-6">
              Pay instantly with credit card via Stripe
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <button
                onClick={() => handleStripeCheckout('premium')}
                disabled={isProcessing}
                className="group relative overflow-hidden rounded-xl bg-gradient-to-br from-violet-600 to-purple-700 border-2 border-violet-500 py-4 px-6 text-center transition-all duration-300 hover:shadow-lg hover:shadow-violet-500/50 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
              >
                <p className="text-xl font-bold text-white">
                  {isProcessing ? 'Processing...' : 'Get Premium'}
                </p>
                <p className="text-sm text-violet-200 mt-1">$1,000 CAD/month</p>
              </button>
              <button
                onClick={() => handleStripeCheckout('enterprise')}
                disabled={isProcessing}
                className="group relative overflow-hidden rounded-xl bg-gradient-to-br from-amber-600 to-orange-700 border-2 border-amber-500 py-4 px-6 text-center transition-all duration-300 hover:shadow-lg hover:shadow-amber-500/50 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
              >
                <p className="text-xl font-bold text-white">
                  {isProcessing ? 'Processing...' : 'Get Enterprise'}
                </p>
                <p className="text-sm text-amber-200 mt-1">$3,000 CAD/month</p>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
