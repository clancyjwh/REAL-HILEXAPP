import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import type { User, Session } from '@supabase/supabase-js';
import { ensureUserProfile } from '../utils/profileUtils';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  isPremium: boolean;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signInWithGoogle: () => Promise<{ error: any }>;
  signUp: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: any }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [isPremium, setIsPremium] = useState(false);

  const checkPremiumStatus = async (userId: string) => {
    try {
      const { data: userData } = await supabase
        .from('users')
        .select('subscription_status')
        .eq('id', userId)
        .maybeSingle();

      const { data: profileData } = await supabase
        .from('profiles')
        .select('tier')
        .eq('id', userId)
        .maybeSingle();

      const hasActiveSubscription = userData?.subscription_status === 'active' || userData?.subscription_status === 'premium';
      const hasPremiumTier = profileData?.tier === 'premium' || profileData?.tier === 'pro';

      setIsPremium(hasActiveSubscription || hasPremiumTier);
    } catch (error) {
      console.error('Error checking premium status:', error);
      setIsPremium(false);
    }
  };

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        ensureUserProfile(session.user.id);
        checkPremiumStatus(session.user.id);
      }
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      (async () => {
        setSession(session);
        setUser(session?.user ?? null);
        if (session?.user) {
          await ensureUserProfile(session.user.id);
          await checkPremiumStatus(session.user.id);
        } else {
          setIsPremium(false);
        }
        setLoading(false);
      })();
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { error };
  };

  const signInWithGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}`,
      },
    });
    return { error };
  };

  const signUp = async (email: string, password: string) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    return { error };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  const resetPassword = async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: 'https://heat-signal-real-dup-zd1a.bolt.host/reset-password',
    });
    return { error };
  };

  return (
    <AuthContext.Provider value={{ user, session, loading, isPremium, signIn, signInWithGoogle, signUp, signOut, resetPassword }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
