import { useState, useEffect } from 'react';
import { CreditCard, Check } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface SubscriptionData {
  subscription_status: string | null;
  price_id: string | null;
  current_period_end: number | null;
  cancel_at_period_end: boolean | null;
  payment_method_brand: string | null;
  payment_method_last4: string | null;
}

export default function BillingPage() {
  const [loading, setLoading] = useState(true);
  const [subscription, setSubscription] = useState<SubscriptionData | null>(null);

  useEffect(() => {
    loadSubscription();

    const channel = supabase
      .channel('billing-updates')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'users'
        },
        (payload) => {
          console.log('Billing subscription updated:', payload);
          loadSubscription();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const loadSubscription = async () => {
    try {
      const { data, error } = await supabase
        .from('stripe_user_subscriptions')
        .select('*')
        .maybeSingle();

      if (error) throw error;
      setSubscription(data);
    } catch (error) {
      console.error('Error loading subscription:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCheckout = () => {
    window.open('https://buy.stripe.com/dRmfZjfhjgmp8QBahB9fW00', '_blank');
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-8">
          <div className="text-center text-slate-400">Loading...</div>
        </div>
      </div>
    );
  }

  const hasActiveSubscription = subscription?.subscription_status === 'active';

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Billing</h1>
        <p className="text-slate-400">Manage your subscription and billing information</p>
      </div>

      {hasActiveSubscription ? (
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-8">
          <div className="flex items-start justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold text-white mb-2">Active Subscription</h2>
              <p className="text-slate-400">You have an active subscription</p>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-green-500/10 border border-green-500/20 rounded-lg">
              <Check className="w-4 h-4 text-green-500" />
              <span className="text-green-500 font-medium">Active</span>
            </div>
          </div>

          <div className="space-y-4 border-t border-slate-800 pt-6">
            {subscription.payment_method_brand && subscription.payment_method_last4 && (
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Payment Method</span>
                <span className="text-white capitalize">
                  {subscription.payment_method_brand} •••• {subscription.payment_method_last4}
                </span>
              </div>
            )}
            {subscription.current_period_end && (
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Next Billing Date</span>
                <span className="text-white">
                  {new Date(subscription.current_period_end * 1000).toLocaleDateString()}
                </span>
              </div>
            )}
            {subscription.cancel_at_period_end && (
              <div className="mt-4 p-4 bg-orange-500/10 border border-orange-500/20 rounded-lg">
                <p className="text-orange-500 text-sm">
                  Your subscription will be canceled at the end of the current billing period.
                </p>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-8">
          <div className="flex items-start gap-6">
            <div className="flex-shrink-0 w-16 h-16 bg-orange-500/10 rounded-lg flex items-center justify-center">
              <CreditCard className="w-8 h-8 text-orange-500" />
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-bold text-white mb-2">Premium Subscription</h2>
              <p className="text-slate-400 mb-6">
                Get access to premium features and advanced trading signals
              </p>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center gap-3 text-slate-300">
                  <Check className="w-5 h-5 text-green-500" />
                  <span>Unlock more asset classes</span>
                </li>
                <li className="flex items-center gap-3 text-slate-300">
                  <Check className="w-5 h-5 text-green-500" />
                  <span>15 asset custom watchlist</span>
                </li>
                <li className="flex items-center gap-3 text-slate-300">
                  <Check className="w-5 h-5 text-green-500" />
                  <span>Analysis tools</span>
                </li>
                <li className="flex items-center gap-3 text-slate-300">
                  <Check className="w-5 h-5 text-green-500" />
                  <span>Custom newsfeed</span>
                </li>
                <li className="flex items-center gap-3 text-slate-300">
                  <Check className="w-5 h-5 text-green-500" />
                  <span>And much more</span>
                </li>
              </ul>
              <button
                onClick={handleCheckout}
                className="px-6 py-3 bg-[#635BFF] hover:bg-[#5448E0] text-white font-medium rounded-lg transition-colors duration-200"
              >
                Checkout With Stripe
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
