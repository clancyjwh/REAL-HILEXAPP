import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, TrendingUp, CheckCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';

export default function ResetPasswordPage() {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<'loading' | 'invalid' | 'ready'>('loading');
  const navigate = useNavigate();

  useEffect(() => {
    const exchangeCodeForSession = async () => {
      const url = window.location.href;

      const { data, error } = await supabase.auth.exchangeCodeForSession(url);

      if (error) {
        setStatus('invalid');
        setMessage('This reset link is invalid or has expired.');
      } else {
        setStatus('ready');
      }
    };

    exchangeCodeForSession();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);

    if (!newPassword || !confirmPassword) {
      setError('Please fill out both fields.');
      setLoading(false);
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      setLoading(false);
      return;
    }

    const { error } = await supabase.auth.updateUser({
      password: newPassword
    });

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      setMessage('Your password has been reset successfully.');
      setLoading(false);
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    }
  };

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
        <div className="text-white text-xl">Verifying reset link...</div>
      </div>
    );
  }

  if (status === 'invalid') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="bg-slate-800 rounded-2xl shadow-2xl p-8 border border-slate-700">
            <div className="flex items-center justify-center mb-8">
              <div className="p-3 bg-gradient-to-r from-red-500 to-red-600 rounded-xl">
                <Lock className="w-8 h-8 text-white" />
              </div>
            </div>

            <h1 className="text-3xl font-bold text-white text-center mb-2">
              Invalid Reset Link
            </h1>

            <div className="bg-red-900/20 border border-red-700 rounded-lg p-4 mb-6">
              <p className="text-red-300 text-sm text-center">
                {message}
              </p>
            </div>

            <button
              type="button"
              onClick={() => navigate('/forgot-password')}
              className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white font-semibold py-3 px-4 rounded-lg hover:from-blue-600 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-slate-800 transition-all duration-200"
            >
              Request New Reset Link
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
            Set New Password
          </h1>
          <p className="text-slate-400 text-center mb-8">
            Enter your new password below
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="newPassword" className="block text-sm font-medium text-slate-300 mb-2">
                New Password
              </label>
              <input
                id="newPassword"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter new password"
                required
              />
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-slate-300 mb-2">
                Confirm Password
              </label>
              <input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Confirm new password"
                required
              />
            </div>

            {error && (
              <div className="bg-red-900/20 border border-red-700 rounded-lg p-4">
                <p className="text-red-300 text-sm">{error}</p>
              </div>
            )}

            {message && (
              <div className="bg-green-900/20 border border-green-700 rounded-lg p-4">
                <p className="text-green-300 text-sm flex items-center justify-center gap-2">
                  <CheckCircle className="w-5 h-5" />
                  {message}
                </p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white font-semibold py-3 px-4 rounded-lg hover:from-blue-600 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-slate-800 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <span>Updating password...</span>
              ) : (
                <>
                  <Lock className="w-5 h-5" />
                  <span>Set New Password</span>
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
