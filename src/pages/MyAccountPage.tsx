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
      if (authError || !user) { setMessage({ type: 'error', text: 'Failed to load user data' }); setLoading(false); return; }
      const { data, error } = await supabase.from('users').select('full_name, business_name, email, subscription_status').eq('id', user.id).maybeSingle();
      if (error) { setMessage({ type: 'error', text: 'Failed to fetch account details' }); } else { setUserData(data); }
    } catch { setMessage({ type: 'error', text: 'An unexpected error occurred' }); }
    finally { setLoading(false); }
  };

  const loadProfileData = async () => {
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) return;
      const { data, error } = await supabase.from('profiles').select('display_name, notifications_enabled').eq('id', user.id).maybeSingle();
      if (!error && data) { setProfileData(data); setDisplayName(data.display_name || ''); setNotificationsEnabled(data.notifications_enabled ?? true); }
    } catch (err) { console.error('Error loading profile data:', err); }
  };

  const handleSaveUsername = async () => {
    setMessage(null); setSavingUsername(true);
    if (!displayName.trim()) { setMessage({ type: 'error', text: 'Username cannot be empty' }); setSavingUsername(false); return; }
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) { setMessage({ type: 'error', text: 'Failed to get user information' }); setSavingUsername(false); return; }
      const { error } = await supabase.from('profiles').update({ display_name: displayName.trim() }).eq('id', user.id);
      if (error) { setMessage({ type: 'error', text: 'Failed to update username' }); } else { setMessage({ type: 'success', text: 'Username updated successfully!' }); await loadProfileData(); }
    } catch { setMessage({ type: 'error', text: 'An unexpected error occurred' }); }
    finally { setSavingUsername(false); }
  };

  const handleToggleNotifications = async () => {
    setMessage(null); setTogglingNotifications(true);
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) { setMessage({ type: 'error', text: 'Failed to get user information' }); setTogglingNotifications(false); return; }
      const newValue = !notificationsEnabled;
      const { error } = await supabase.from('profiles').update({ notifications_enabled: newValue }).eq('id', user.id);
      if (error) { setMessage({ type: 'error', text: 'Failed to update notification preferences' }); }
      else { setNotificationsEnabled(newValue); setMessage({ type: 'success', text: `Notifications ${newValue ? 'enabled' : 'disabled'} successfully!` }); await loadProfileData(); }
    } catch { setMessage({ type: 'error', text: 'An unexpected error occurred' }); }
    finally { setTogglingNotifications(false); }
  };

  const handleLogout = async () => {
    try { await supabase.auth.signOut(); navigate('/login'); }
    catch { setMessage({ type: 'error', text: 'Failed to log out' }); }
  };

  const glassCard = {
    background: 'rgba(255,255,255,0.04)',
    backdropFilter: 'blur(12px)',
    border: '1px solid rgba(255,255,255,0.08)',
  };

  const glassInput = {
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.1)',
    color: 'white',
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#020617' }}>
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-white/10 border-t-[#00D8FF]"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-8">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 rounded-lg" style={{ background: 'rgba(0,216,255,0.1)' }}>
            <User className="w-6 h-6" style={{ color: '#00D8FF' }} />
          </div>
          <h1 className="text-4xl font-bold text-white tracking-tight">My Account</h1>
        </div>
        <p className="text-slate-400 ml-1">Manage your account information and security</p>
      </div>

      {message && (
        <div className={`mb-6 p-4 rounded-xl flex items-center gap-3 ${message.type === 'success' ? 'bg-green-900/20 border border-green-500/30 text-green-400' : 'bg-red-900/20 border border-red-500/30 text-red-400'}`}>
          {message.type === 'success' ? <CheckCircle className="w-5 h-5 flex-shrink-0" /> : <XCircle className="w-5 h-5 flex-shrink-0" />}
          <span>{message.text}</span>
        </div>
      )}

      <div className="grid gap-5">
        {/* Account Information */}
        <div className="rounded-xl p-6" style={glassCard}>
          <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2 tracking-tight">
            <User className="w-5 h-5" style={{ color: '#00D8FF' }} />
            Account Information
          </h2>
          <div className="space-y-4">
            {[
              { icon: <User className="w-4 h-4" />, label: 'Full Name', value: userData?.full_name || 'Not provided' },
              { icon: <Building2 className="w-4 h-4" />, label: 'Business Name', value: userData?.business_name || 'Not provided' },
              { icon: <Mail className="w-4 h-4" />, label: 'Email Address', value: userData?.email || 'Not provided', type: 'email' },
              { icon: <CreditCard className="w-4 h-4" />, label: 'Subscription Status', value: userData?.subscription_status ? userData.subscription_status.charAt(0).toUpperCase() + userData.subscription_status.slice(1) : 'Not provided' },
            ].map(({ icon, label, value, type }) => (
              <div key={label}>
                <label className="block text-sm font-medium text-slate-400 mb-2 flex items-center gap-2">
                  {icon} {label}
                </label>
                <input
                  type={type || 'text'}
                  value={value}
                  readOnly
                  className="w-full px-4 py-3 rounded-lg outline-none font-mono text-sm"
                  style={glassInput}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Change Password */}
        <div className="rounded-xl p-6" style={glassCard}>
          <h2 className="text-xl font-bold text-white mb-2 flex items-center gap-2 tracking-tight">
            <Key className="w-5 h-5 text-amber-400" />
            Change Password
          </h2>
          <p className="text-slate-400 text-sm mb-5">Update your account password securely. You'll need to verify your current password first.</p>
          <button
            onClick={() => navigate('/change-password')}
            className="w-full px-4 py-3 rounded-lg font-semibold transition-all flex items-center justify-center gap-2 text-black"
            style={{ background: '#00D8FF', boxShadow: '0 0 20px rgba(0,216,255,0.25)' }}
          >
            <Key className="w-4 h-4" />
            Change Password
          </button>
        </div>

        {/* Get in Touch */}
        <div className="rounded-xl p-6" style={glassCard}>
          <h2 className="text-xl font-bold text-white mb-2 flex items-center gap-2 tracking-tight">
            <MessageCircle className="w-5 h-5" style={{ color: '#00D8FF' }} />
            Get in Touch
          </h2>
          <p className="text-slate-400 text-sm mb-5">Have a question or need assistance? We're here to help.</p>
          <button
            onClick={() => navigate('/contact')}
            className="w-full px-4 py-3 rounded-lg font-semibold transition-all flex items-center justify-center gap-2"
            style={{ background: 'rgba(0,216,255,0.1)', border: '1px solid rgba(0,216,255,0.3)', color: '#00D8FF' }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(0,216,255,0.15)'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(0,216,255,0.1)'; }}
          >
            <MessageCircle className="w-4 h-4" />
            Contact Support
          </button>
        </div>

        {/* Username Settings */}
        <div className="rounded-xl p-6" style={glassCard}>
          <h2 className="text-xl font-bold text-white mb-5 flex items-center gap-2 tracking-tight">
            <User className="w-5 h-5 text-violet-400" />
            Username Settings
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-2">Display Name (shown in chatrooms)</label>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Enter your display name"
                className="w-full px-4 py-3 rounded-lg outline-none transition-all"
                style={{ ...glassInput, outline: 'none' }}
                onFocus={e => { e.currentTarget.style.border = '1px solid rgba(139,92,246,0.6)'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(139,92,246,0.1)'; }}
                onBlur={e => { e.currentTarget.style.border = '1px solid rgba(255,255,255,0.1)'; e.currentTarget.style.boxShadow = 'none'; }}
              />
            </div>
            <button
              onClick={handleSaveUsername}
              disabled={savingUsername || displayName === profileData?.display_name}
              className="w-full px-4 py-3 rounded-lg font-semibold transition-all flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
              style={{ background: 'rgba(139,92,246,0.15)', border: '1px solid rgba(139,92,246,0.3)', color: '#c4b5fd' }}
            >
              {savingUsername ? (
                <><div className="animate-spin rounded-full h-4 w-4 border-2 border-violet-400 border-t-transparent" />Saving...</>
              ) : 'Save Username'}
            </button>
          </div>
        </div>

        {/* Notification Preferences */}
        <div className="rounded-xl p-6" style={glassCard}>
          <h2 className="text-xl font-bold text-white mb-2 flex items-center gap-2 tracking-tight">
            <Bell className="w-5 h-5 text-amber-400" />
            Notification Preferences
          </h2>
          <p className="text-slate-400 text-sm mb-5">Control how you receive notifications from Hilex Bot in chatrooms.</p>
          <div className="flex items-center justify-between p-4 rounded-lg" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
            <div>
              <p className="text-white font-medium">Enable Notifications</p>
              <p className="text-sm text-slate-400">Show unread notification badges</p>
            </div>
            <button
              onClick={handleToggleNotifications}
              disabled={togglingNotifications}
              className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors focus:outline-none ${togglingNotifications ? 'opacity-50 cursor-not-allowed' : ''}`}
              style={{ background: notificationsEnabled ? '#f59e0b' : 'rgba(255,255,255,0.1)' }}
            >
              <span className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${notificationsEnabled ? 'translate-x-7' : 'translate-x-1'}`} />
            </button>
          </div>
        </div>

        {/* Log Out */}
        <div className="rounded-xl p-6" style={glassCard}>
          <h2 className="text-xl font-bold text-white mb-2 flex items-center gap-2 tracking-tight">
            <LogOut className="w-5 h-5 text-red-400" />
            Log Out
          </h2>
          <p className="text-slate-400 text-sm mb-5">Sign out of your account and return to the login screen.</p>
          <button
            onClick={handleLogout}
            className="w-full px-4 py-3 rounded-lg font-semibold transition-all flex items-center justify-center gap-2"
            style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: '#f87171' }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(239,68,68,0.18)'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(239,68,68,0.1)'; }}
          >
            <LogOut className="w-4 h-4" />
            Log Out
          </button>
        </div>
      </div>

      <div className="mt-8 flex items-center justify-center gap-6">
        {[
          {
            href: 'https://www.linkedin.com/search/results/all/?fetchDeterministicClustersOnly=true&heroEntityKey=urn%3Ali%3Aorganization%3A109950133&keywords=hylex%20optimized%20trends&origin=RICH_QUERY_SUGGESTION&position=0&searchId=193d177c-9b19-4dbf-b348-64d3c5bba970&sid=PLZ&spellCorrectionEnabled=false',
            icon: <Linkedin className="w-5 h-5" />, label: 'Follow us on LinkedIn!'
          },
          { href: 'https://x.com/HilEX_Optimized', icon: <span className="w-5 h-5 flex items-center justify-center font-bold text-lg">𝕏</span>, label: 'Follow us on X!' },
          { href: 'https://t.me/HilexOptimizedTrendsUpdatebot', icon: <Send className="w-5 h-5" />, label: 'Join our Telegram for daily updates!' },
        ].map(({ href, icon, label }) => (
          <a
            key={label}
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-sm transition-colors"
            style={{ color: '#64748b' }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = '#00D8FF'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = '#64748b'; }}
          >
            {icon}
            <span>{label}</span>
          </a>
        ))}
      </div>
    </div>
  );
}
