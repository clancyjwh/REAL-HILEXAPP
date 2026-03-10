import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { LogIn, TrendingUp, Eye } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import LiveMarketBanner from '../components/LiveMarketBanner';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { signIn, user } = useAuth();

  useEffect(() => {
    if (user) {
      const redirect = searchParams.get('redirect');
      if (redirect === 'bespoke-projects') {
        navigate('/bespoke-projects', { replace: true });
      } else if (redirect === 'get-premium') {
        navigate('/get-premium', { replace: true });
      } else {
        navigate('/', { replace: true });
      }
    }
  }, [user, navigate, searchParams]);

  useEffect(() => {
    window.history.pushState(null, '', window.location.href);
    const handlePopState = () => {
      window.history.pushState(null, '', window.location.href);
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const { error } = await signIn(email, password);

    if (error) {
      setError(error.message);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <LiveMarketBanner />
      <div className="flex items-center justify-center p-4 min-h-[calc(100vh-60px)]">
        <div className="w-full max-w-md">
          <div className="bg-slate-800 rounded-2xl shadow-2xl p-8 border border-slate-700">
          <div className="flex items-center justify-center mb-8">
            <div className="p-3 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl">
              <TrendingUp className="w-8 h-8 text-white" />
            </div>
          </div>

          <h1 className="text-3xl font-bold text-white text-center mb-2">
            Welcome to Hilex Optimized Trends
          </h1>
          <p className="text-slate-400 text-center mb-8">
            Log in to access your trend analyses
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

            <div>
              <div className="flex items-center justify-between mb-2">
                <label htmlFor="password" className="block text-sm font-medium text-slate-300">
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => navigate('/forgot-password')}
                  className="text-sm text-blue-400 hover:text-blue-300 transition-colors duration-200"
                >
                  Forgot Password?
                </button>
              </div>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter your password"
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
                <span>Logging in...</span>
              ) : (
                <>
                  <LogIn className="w-5 h-5" />
                  <span>Log In</span>
                </>
              )}
            </button>
          </form>

          <div className="mt-6 text-center space-y-3">
            <button
              type="button"
              onClick={() => {
                const redirect = searchParams.get('redirect');
                navigate(redirect ? `/signup?redirect=${redirect}` : '/signup');
              }}
              className="text-blue-400 hover:text-blue-300 text-sm font-medium transition-colors duration-200"
            >
              Don't have an account? Create one
            </button>

            <div>
              <button
                type="button"
                onClick={() => navigate('/landingpage')}
                className="inline-flex items-center gap-2 text-slate-400 hover:text-slate-300 text-sm font-medium transition-colors duration-200"
              >
                <Eye className="w-4 h-4" />
                View Landing Page
              </button>
            </div>
          </div>

          <div className="mt-6 pt-6 border-t border-slate-700">
            <p className="text-slate-500 text-xs text-center">
              Access on desktop for best user experience
            </p>
          </div>
          </div>
        </div>
      </div>
    </div>
  );
}
