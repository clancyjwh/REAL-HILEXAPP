import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, TrendingUp, ArrowLeft } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { resetPassword } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(false);
    setLoading(true);

    if (!email) {
      setError('Please enter your email.');
      setLoading(false);
      return;
    }

    try {
      await fetch('https://hook.us2.make.com/mtv48ma1hrxqh31gw2djcj0z3ta2h7h7', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });
      setSuccess(true);
      setLoading(false);
    } catch (webhookError) {
      console.error('Webhook error:', webhookError);
      setError('Failed to send request. Please try again.');
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="bg-slate-800 rounded-2xl shadow-2xl p-8 border border-slate-700">
            <div className="flex items-center justify-center mb-8">
              <div className="p-3 bg-gradient-to-r from-green-500 to-green-600 rounded-xl">
                <Mail className="w-8 h-8 text-white" />
              </div>
            </div>

            <h1 className="text-3xl font-bold text-white text-center mb-2">
              Check Your Email
            </h1>
            <p className="text-slate-400 text-center mb-8">
              We've sent a password reset link to <span className="text-white font-medium">{email}</span>
            </p>

            <div className="bg-green-900/20 border border-green-700 rounded-lg p-4 mb-6">
              <p className="text-green-300 text-sm text-center">
                Thank you for your patience. Our support team will be in touch shortly to guide you on next steps.
              </p>
            </div>

            <button
              type="button"
              onClick={() => navigate('/login')}
              className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white font-semibold py-3 px-4 rounded-lg hover:from-blue-600 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-slate-800 transition-all duration-200 flex items-center justify-center gap-2"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Back to Login</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-slate-800 rounded-2xl shadow-2xl p-8 border border-slate-700">
          <div className="flex items-center justify-center mb-8">
            <div className="p-3 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl">
              <TrendingUp className="w-8 h-8 text-white" />
            </div>
          </div>

          <h1 className="text-3xl font-bold text-white text-center mb-2">
            Reset Password
          </h1>
          <p className="text-slate-400 text-center mb-8">
            Enter your email address and we'll send you a link to reset your password
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-slate-300 mb-2">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter your email"
                required
              />
            </div>

            {error && (
              <div className="bg-red-900/20 border border-red-700 rounded-lg p-4">
                <p className="text-red-300 text-sm">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white font-semibold py-3 px-4 rounded-lg hover:from-blue-600 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-slate-800 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <span>Sending...</span>
              ) : (
                <>
                  <Mail className="w-5 h-5" />
                  <span>Send Reset Email</span>
                </>
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <button
              type="button"
              onClick={() => navigate('/login')}
              className="text-blue-400 hover:text-blue-300 text-sm font-medium transition-colors duration-200 inline-flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Login
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
