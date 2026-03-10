import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Key, Lock, CheckCircle, Eye, EyeOff } from 'lucide-react';
import { supabase } from '../lib/supabase';

export default function ChangePasswordPage() {
  const navigate = useNavigate();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isCurrentPasswordVerified, setIsCurrentPasswordVerified] = useState(false);
  const [verifyingPassword, setVerifyingPassword] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleVerifyCurrentPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    setVerifyingPassword(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user?.email) {
        setMessage({ type: 'error', text: 'User email not found' });
        setVerifyingPassword(false);
        return;
      }

      const { error } = await supabase.auth.signInWithPassword({
        email: user.email,
        password: currentPassword,
      });

      if (error) {
        setMessage({ type: 'error', text: 'Incorrect password. Please try again.' });
        setVerifyingPassword(false);
        return;
      }

      setIsCurrentPasswordVerified(true);
      setMessage({ type: 'success', text: 'Password verified! You can now set a new password.' });
    } catch (err) {
      setMessage({ type: 'error', text: 'An unexpected error occurred' });
    } finally {
      setVerifyingPassword(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    setChangingPassword(true);

    try {
      const inputs = {
        newPassword: newPassword,
        confirmPassword: confirmPassword
      };

      // 1. Validate matching passwords
      if (!inputs.newPassword || !inputs.confirmPassword) {
        setMessage({ type: 'error', text: 'Please enter your new password twice.' });
        setChangingPassword(false);
        return;
      }

      if (inputs.newPassword !== inputs.confirmPassword) {
        setMessage({ type: 'error', text: 'Passwords do not match.' });
        setChangingPassword(false);
        return;
      }

      // 2. Update password for the logged-in user
      const { error: updateError } = await supabase.auth.updateUser({
        password: inputs.newPassword
      });

      if (updateError) {
        setMessage({ type: 'error', text: updateError.message });
        setChangingPassword(false);
        return;
      }

      // 3. Success
      setMessage({ type: 'success', text: 'Password updated successfully! Redirecting...' });

      setTimeout(() => {
        navigate('/my-account');
      }, 2000);
    } catch (err) {
      setMessage({ type: 'error', text: 'An unexpected error occurred' });
      setChangingPassword(false);
    }
  };

  const passwordsMatch = newPassword === confirmPassword && newPassword.length > 0;

  return (
    <div className="min-h-screen pb-12">
      <button
        onClick={() => navigate('/my-account')}
        className="flex items-center gap-2 text-slate-400 hover:text-white mb-8 transition-colors"
      >
        <ArrowLeft className="w-5 h-5" />
        <span>Back to My Account</span>
      </button>

      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2.5 bg-orange-500/10 rounded-lg">
            <Key className="w-7 h-7 text-orange-400" />
          </div>
          <h1 className="text-4xl font-bold text-white">Change Password</h1>
        </div>
        <p className="text-slate-400 ml-[52px]">Update your account password securely</p>
      </div>

      <div className="max-w-2xl">
        {message && (
          <div className={`mb-6 p-4 rounded-lg border flex items-start gap-3 ${
            message.type === 'success'
              ? 'bg-green-900/20 border-green-500/30 text-green-400'
              : 'bg-red-900/20 border-red-500/30 text-red-400'
          }`}>
            {message.type === 'success' ? (
              <CheckCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            ) : (
              <XCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            )}
            <p>{message.text}</p>
          </div>
        )}

        {!isCurrentPasswordVerified ? (
          <div className="bg-slate-900 border border-slate-700 rounded-xl p-6">
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <Lock className="w-5 h-5 text-orange-500" />
              Verify Current Password
            </h2>

            <p className="text-slate-400 text-sm mb-6">
              Please enter your current password to continue.
            </p>

            <form onSubmit={handleVerifyCurrentPassword}>
              <div className="mb-6">
                <label htmlFor="current-password" className="block text-sm font-medium text-slate-300 mb-2">
                  Current Password
                </label>
                <div className="relative">
                  <input
                    type={showCurrentPassword ? 'text' : 'password'}
                    id="current-password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="w-full px-4 py-3 pr-12 bg-slate-800 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
                    placeholder="Enter your current password"
                    required
                    disabled={verifyingPassword}
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors"
                  >
                    {showCurrentPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={verifyingPassword || !currentPassword}
                className="w-full px-4 py-3 bg-orange-600 hover:bg-orange-700 disabled:bg-slate-700 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                {verifyingPassword ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                    Verifying...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4" />
                    Verify Password
                  </>
                )}
              </button>
            </form>
          </div>
        ) : (
          <div className="bg-slate-900 border border-slate-700 rounded-xl p-6">
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <Key className="w-5 h-5 text-orange-500" />
              Set New Password
            </h2>

            <p className="text-slate-400 text-sm mb-6">
              Enter your new password. Make sure both fields match exactly.
            </p>

            <form onSubmit={handleChangePassword}>
              <div className="mb-4">
                <label htmlFor="new-password" className="block text-sm font-medium text-slate-300 mb-2">
                  New Password
                </label>
                <div className="relative">
                  <input
                    type={showNewPassword ? 'text' : 'password'}
                    id="new-password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full px-4 py-3 pr-12 bg-slate-800 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
                    placeholder="Enter new password"
                    required
                    disabled={changingPassword}
                    minLength={6}
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors"
                  >
                    {showNewPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <div className="mb-6">
                <label htmlFor="confirm-password" className="block text-sm font-medium text-slate-300 mb-2">
                  Confirm New Password
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    id="confirm-password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className={`w-full px-4 py-3 pr-12 bg-slate-800 border rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-1 ${
                      confirmPassword && !passwordsMatch
                        ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                        : confirmPassword && passwordsMatch
                        ? 'border-green-500 focus:border-green-500 focus:ring-green-500'
                        : 'border-slate-600 focus:border-orange-500 focus:ring-orange-500'
                    }`}
                    placeholder="Confirm new password"
                    required
                    disabled={changingPassword}
                    minLength={6}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors"
                  >
                    {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {confirmPassword && !passwordsMatch && (
                  <p className="mt-2 text-sm text-red-400">Passwords do not match</p>
                )}
                {confirmPassword && passwordsMatch && (
                  <p className="mt-2 text-sm text-green-400 flex items-center gap-1">
                    <CheckCircle className="w-4 h-4" />
                    Passwords match
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={changingPassword || !passwordsMatch || !newPassword || !confirmPassword}
                className="w-full px-4 py-3 bg-orange-600 hover:bg-orange-700 disabled:bg-slate-700 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                {changingPassword ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                    Changing Password...
                  </>
                ) : (
                  <>
                    <Key className="w-4 h-4" />
                    Change Password
                  </>
                )}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}

function XCircle(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <circle cx="12" cy="12" r="10" />
      <path d="m15 9-6 6" />
      <path d="m9 9 6 6" />
    </svg>
  );
}
