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
    <div className="min-h-screen bg-[#020617] relative overflow-hidden"
      style={{
        backgroundImage: `
          linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px),
          linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)`,
        backgroundSize: '50px 50px',
      }}
    >
      {/* Cyan glow blob */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(ellipse, rgba(0,212,255,0.12) 0%, transparent 65%)', filter: 'blur(80px)' }}
      />

      <LiveMarketBanner />

      <div className="flex items-center justify-center p-4 min-h-[calc(100vh-60px)] relative z-10">
        <div className="w-full max-w-md">
          {/* Glass card */}
          <div className="rounded-2xl shadow-2xl p-8 border border-white/10"
            style={{ background: 'rgba(255,255,255,0.05)', backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)' }}
          >
            {/* Logo */}
            <div className="flex items-center justify-center mb-8">
              <div className="p-3 rounded-xl" style={{ background: 'rgba(0,216,255,0.1)', border: '1px solid rgba(0,216,255,0.3)', boxShadow: '0 0 20px rgba(0,216,255,0.2)' }}>
                <TrendingUp className="w-8 h-8 text-[#00D8FF]" />
              </div>
            </div>

            <h1 className="text-3xl font-bold text-white text-center mb-2 tracking-tight">
              Welcome to HilEX
            </h1>
            <p className="text-slate-400 text-center mb-8 font-mono text-sm">
              Optimized Trends Platform
            </p>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-slate-300 mb-2">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-[#00D8FF]/50 focus:border-[#00D8FF]/50 transition-all"
                  style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)' }}
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
                    className="text-sm text-[#00D8FF] hover:text-white transition-colors duration-200"
                  >
                    Forgot Password?
                  </button>
                </div>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-[#00D8FF]/50 focus:border-[#00D8FF]/50 transition-all"
                  style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)' }}
                  placeholder="Enter your password"
                  required
                />
              </div>

              {error && (
                <div className="rounded-lg p-4" style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)' }}>
                  <p className="text-red-400 text-sm">{error}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full font-semibold py-3 px-4 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-black"
                style={{
                  background: loading ? 'rgba(0,216,255,0.6)' : '#00D8FF',
                  boxShadow: loading ? 'none' : '0 0 20px rgba(0,212,255,0.35)',
                }}
              >
                {loading ? (
                  <span className="text-black/80">Logging in...</span>
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
                className="text-[#00D8FF] hover:text-white text-sm font-medium transition-colors duration-200"
              >
                Don't have an account? Create one
              </button>

              <div>
                <button
                  type="button"
                  onClick={() => navigate('/landingpage')}
                  className="inline-flex items-center gap-2 text-slate-500 hover:text-slate-300 text-sm font-medium transition-colors duration-200"
                >
                  <Eye className="w-4 h-4" />
                  View Landing Page
                </button>
              </div>
            </div>

            <div className="mt-6 pt-6 border-t border-white/10">
              <p className="text-slate-600 text-xs text-center font-mono">
                Access on desktop for best user experience
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
