import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, session, loading } = useAuth();
  const location = useLocation();
  const [validatingSession, setValidatingSession] = useState(true);
  const [sessionValid, setSessionValid] = useState(false);

  useEffect(() => {
    const validateSession = async () => {
      if (!user || !session) {
        setSessionValid(false);
        setValidatingSession(false);
        return;
      }

      try {
        const { data, error } = await supabase.auth.getSession();

        if (error || !data.session) {
          setSessionValid(false);
          await supabase.auth.signOut();
        } else {
          const expiresAt = data.session.expires_at;
          if (expiresAt && expiresAt * 1000 < Date.now()) {
            setSessionValid(false);
            await supabase.auth.signOut();
          } else {
            setSessionValid(true);
          }
        }
      } catch (error) {
        console.error('Session validation error:', error);
        setSessionValid(false);
        await supabase.auth.signOut();
      } finally {
        setValidatingSession(false);
      }
    };

    validateSession();
  }, [user, session, location.pathname]);

  if (loading || validatingSession) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  const url = window.location.href;
  const isPasswordRecovery = url.includes("type=recovery");

  if (!user && !isPasswordRecovery) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (user && !sessionValid && !isPasswordRecovery) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return <>{children}</>;
}
