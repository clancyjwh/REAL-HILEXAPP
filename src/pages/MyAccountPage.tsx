import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Building2, Mail, Key, CheckCircle, XCircle, CreditCard, LogOut, Bell, MessageCircle, Linkedin, Send } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface UserData {
  full_name: string | null;
  business_name: string | null;
  email: string | null;
  subscription_status: string | null;
}

interface ProfileData {
  display_name: string | null;
  notifications_enabled: boolean;
}

export default function MyAccountPage() {
  const navigate = useNavigate();
  const [userData, setUserData] = useState<UserData | null>(null);
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [displayName, setDisplayName] = useState('');
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [savingUsername, setSavingUsername] = useState(false);
  const [togglingNotifications, setTogglingNotifications] = useState(false);

  useEffect(() => {
    loadUserData();
    loadProfileData();
  }, []);

  const loadUserData = async () => {
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();

      if (authError || !user) {
        setMessage({ type: 'error', text: 'Failed to load user data' });
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('users')
        .select('full_name, business_name, email, subscription_status')
        .eq('id', user.id)
        .maybeSingle();

      if (error) {
        setMessage({ type: 'error', text: 'Failed to fetch account details' });
      } else {
        setUserData(data);
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'An unexpected error occurred' });
    } finally {
      setLoading(false);
    }
  };

  const loadProfileData = async () => {
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();

      if (authError || !user) return;

      const { data, error } = await supabase
        .from('profiles')
        .select('display_name, notifications_enabled')
        .eq('id', user.id)
        .maybeSingle();

      if (!error && data) {
        setProfileData(data);
        setDisplayName(data.display_name || '');
        setNotificationsEnabled(data.notifications_enabled ?? true);
      }
    } catch (err) {
      console.error('Error loading profile data:', err);
    }
  };

  const handleChangePassword = () => {
    navigate('/change-password');
  };

  const handleSaveUsername = async () => {
    setMessage(null);
    setSavingUsername(true);

    if (!displayName.trim()) {
      setMessage({ type: 'error', text: 'Username cannot be empty' });
      setSavingUsername(false);
      return;
    }

    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();

      if (authError || !user) {
        setMessage({ type: 'error', text: 'Failed to get user information' });
        setSavingUsername(false);
        return;
      }

      const { error } = await supabase
        .from('profiles')
        .update({ display_name: displayName.trim() })
        .eq('id', user.id);

      if (error) {
        setMessage({ type: 'error', text: 'Failed to update username' });
      } else {
        setMessage({ type: 'success', text: 'Username updated successfully!' });
        await loadProfileData();
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'An unexpected error occurred' });
    } finally {
      setSavingUsername(false);
    }
  };

  const handleToggleNotifications = async () => {
    setMessage(null);
    setTogglingNotifications(true);

    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();

      if (authError || !user) {
        setMessage({ type: 'error', text: 'Failed to get user information' });
        setTogglingNotifications(false);
        return;
      }

      const newValue = !notificationsEnabled;

      const { error } = await supabase
        .from('profiles')
        .update({ notifications_enabled: newValue })
        .eq('id', user.id);

      if (error) {
        setMessage({ type: 'error', text: 'Failed to update notification preferences' });
      } else {
        setNotificationsEnabled(newValue);
        setMessage({
          type: 'success',
          text: `Notifications ${newValue ? 'enabled' : 'disabled'} successfully!`
        });
        await loadProfileData();
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'An unexpected error occurred' });
    } finally {
      setTogglingNotifications(false);
    }
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      navigate('/login');
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to log out' });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-slate-700 border-t-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950">
      <div className="max-w-4xl mx-auto p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">My Account</h1>
          <p className="text-slate-400">Manage your account information and security</p>
        </div>

        {message && (
          <div
            className={`mb-6 p-4 rounded-lg flex items-center gap-3 ${
              message.type === 'success'
                ? 'bg-green-900/20 border border-green-500/50 text-green-400'
                : 'bg-red-900/20 border border-red-500/50 text-red-400'
            }`}
          >
            {message.type === 'success' ? (
              <CheckCircle className="w-5 h-5 flex-shrink-0" />
            ) : (
              <XCircle className="w-5 h-5 flex-shrink-0" />
            )}
            <span>{message.text}</span>
          </div>
        )}

        <div className="grid gap-6">
          <div className="bg-slate-900 border border-slate-700 rounded-xl p-6">
            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              <User className="w-5 h-5 text-blue-500" />
              Account Information
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-2 flex items-center gap-2">
                  <User className="w-4 h-4" />
                  Full Name
                </label>
                <input
                  type="text"
                  value={userData?.full_name || 'Not provided'}
                  readOnly
                  className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-400 mb-2 flex items-center gap-2">
                  <Building2 className="w-4 h-4" />
                  Business Name
                </label>
                <input
                  type="text"
                  value={userData?.business_name || 'Not provided'}
                  readOnly
                  className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-400 mb-2 flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  Email Address
                </label>
                <input
                  type="email"
                  value={userData?.email || 'Not provided'}
                  readOnly
                  className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-400 mb-2 flex items-center gap-2">
                  <CreditCard className="w-4 h-4" />
                  Subscription Status
                </label>
                <input
                  type="text"
                  value={userData?.subscription_status ? userData.subscription_status.charAt(0).toUpperCase() + userData.subscription_status.slice(1) : 'Not provided'}
                  readOnly
                  className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-700 rounded-xl p-6">
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <Key className="w-5 h-5 text-orange-500" />
              Change Password
            </h2>

            <p className="text-slate-400 text-sm mb-6">
              Update your account password securely. You'll need to verify your current password first.
            </p>

            <button
              onClick={handleChangePassword}
              className="w-full px-4 py-3 bg-orange-600 hover:bg-orange-700 disabled:bg-slate-700 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              <Key className="w-4 h-4" />
              Change Password
            </button>
          </div>

          <div className="bg-slate-900 border border-slate-700 rounded-xl p-6">
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <MessageCircle className="w-5 h-5 text-blue-500" />
              Get in Touch
            </h2>

            <p className="text-slate-400 text-sm mb-6">
              Have a question or need assistance? We're here to help. Send us a message and we'll get back to you as soon as possible.
            </p>

            <button
              onClick={() => navigate('/contact')}
              className="w-full px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              <MessageCircle className="w-4 h-4" />
              Contact Support
            </button>
          </div>

          <div className="bg-slate-900 border border-slate-700 rounded-xl p-6">
            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              <User className="w-5 h-5 text-purple-500" />
              Username Settings
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-2">
                  Display Name (shown in chatrooms)
                </label>
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="Enter your display name"
                  className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <button
                onClick={handleSaveUsername}
                disabled={savingUsername || displayName === profileData?.display_name}
                className="w-full px-4 py-3 bg-purple-600 hover:bg-purple-700 disabled:bg-slate-700 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                {savingUsername ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                    Saving...
                  </>
                ) : (
                  'Save Username'
                )}
              </button>
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-700 rounded-xl p-6">
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <Bell className="w-5 h-5 text-yellow-500" />
              Notification Preferences
            </h2>

            <p className="text-slate-400 text-sm mb-6">
              Control how you receive notifications from Hilex Bot in chatrooms. When disabled, notifications will still be collected but won't show unread counts.
            </p>

            <div className="flex items-center justify-between p-4 bg-slate-800 rounded-lg">
              <div>
                <p className="text-white font-medium">Enable Notifications</p>
                <p className="text-sm text-slate-400">Show unread notification badges</p>
              </div>
              <button
                onClick={handleToggleNotifications}
                disabled={togglingNotifications}
                className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2 focus:ring-offset-slate-900 ${
                  notificationsEnabled ? 'bg-yellow-500' : 'bg-slate-600'
                } ${togglingNotifications ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <span
                  className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${
                    notificationsEnabled ? 'translate-x-7' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-700 rounded-xl p-6">
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <LogOut className="w-5 h-5 text-red-500" />
              Log Out
            </h2>

            <p className="text-slate-400 text-sm mb-6">
              Sign out of your account and return to the login screen.
            </p>

            <button
              onClick={handleLogout}
              className="w-full px-4 py-3 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              <LogOut className="w-4 h-4" />
              Log Out
            </button>
          </div>
        </div>

        <div className="mt-8 flex items-center justify-center gap-6">
          <a
            href="https://www.linkedin.com/search/results/all/?fetchDeterministicClustersOnly=true&heroEntityKey=urn%3Ali%3Aorganization%3A109950133&keywords=hylex%20optimized%20trends&origin=RICH_QUERY_SUGGESTION&position=0&searchId=193d177c-9b19-4dbf-b348-64d3c5bba970&sid=PLZ&spellCorrectionEnabled=false"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-slate-400 hover:text-blue-500 transition-colors text-sm"
          >
            <Linkedin className="w-5 h-5" />
            <span>Follow us on LinkedIn!</span>
          </a>
          <a
            href="https://x.com/HilEX_Optimized"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-slate-400 hover:text-blue-500 transition-colors text-sm"
          >
            <span className="w-5 h-5 flex items-center justify-center font-bold text-lg">𝕏</span>
            <span>Follow us on X!</span>
          </a>
          <a
            href="https://t.me/HilexOptimizedTrendsUpdatebot"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-slate-400 hover:text-blue-500 transition-colors text-sm"
          >
            <Send className="w-5 h-5" />
            <span>Join our Telegram for daily updates!</span>
          </a>
        </div>
      </div>
    </div>
  );
}
