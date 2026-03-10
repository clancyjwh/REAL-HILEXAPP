import { useNavigate } from 'react-router-dom';
import { CheckCircle, Mail, Clock, Home } from 'lucide-react';

export default function GetPremiumConfirmationPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center pb-12">
      <div className="max-w-2xl mx-auto text-center">
        <div className="inline-flex items-center justify-center p-6 bg-gradient-to-br from-green-500/20 to-emerald-500/20 rounded-full mb-8 backdrop-blur-sm border-2 border-green-400/40 shadow-2xl shadow-green-500/30">
          <CheckCircle className="w-20 h-20 text-green-400" />
        </div>

        <h1 className="text-5xl font-extrabold text-white mb-4">
          Thank You!
        </h1>
        <p className="text-2xl text-slate-300 mb-12">
          Your premium upgrade request has been received
        </p>

        <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-8 mb-8 text-left">
          <h2 className="text-xl font-bold text-white mb-6 text-center">What happens next?</h2>

          <div className="space-y-6">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-blue-500/10 rounded-lg flex-shrink-0">
                <Mail className="w-6 h-6 text-blue-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white mb-2">Check your email</h3>
                <p className="text-slate-400">
                  We've sent an invoice to your email address. Please check your inbox (and spam folder, just in case).
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="p-3 bg-amber-500/10 rounded-lg flex-shrink-0">
                <Clock className="w-6 h-6 text-amber-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white mb-2">Processing time</h3>
                <p className="text-slate-400">
                  Please allow up to 2 business days for us to process your invoice and upgrade your account to premium.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="p-3 bg-green-500/10 rounded-lg flex-shrink-0">
                <CheckCircle className="w-6 h-6 text-green-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white mb-2">Activation</h3>
                <p className="text-slate-400">
                  Once your payment is received and processed, your account will be automatically upgraded to premium with full access to all tools and features.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-green-500/10 border border-green-500 rounded-lg p-4 mb-8">
          <p className="text-green-400 font-semibold">
            ✓ Protected by our 30 Day Money-Back Guarantee
          </p>
        </div>

        <button
          onClick={() => navigate('/')}
          className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold rounded-lg transition-all duration-300 shadow-lg hover:shadow-xl"
        >
          <Home className="w-5 h-5" />
          <span>Return to Home</span>
        </button>
      </div>
    </div>
  );
}
