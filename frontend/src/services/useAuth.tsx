import { useState, useEffect, useCallback } from 'react';
import { authApi } from './auth.api';
import { setAuthToken } from './clients/apiClient';

export function useAuth() {
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true); // true while reading localStorage

  const syncTokenFromStorage = useCallback(() => {
    try {
      const t = localStorage.getItem('supawriter_token');
      setToken(t);
      setAuthToken(t);
    } catch (_) {
      setToken(null);
      setAuthToken(undefined);
    }
  }, []);

  useEffect(() => {
    syncTokenFromStorage();
    setLoading(false);

    const handleAuthChanged = () => {
      syncTokenFromStorage();
    };

    window.addEventListener('supawriter-auth-changed', handleAuthChanged);

    return () => {
      window.removeEventListener('supawriter-auth-changed', handleAuthChanged);
    };
  }, [syncTokenFromStorage]);

  const signin = useCallback(async (email: string, password: string) => {
    const data = await authApi.signin(email, password);
    const t = data?.access_token || null;
    setToken(t);
    if (t) {
      setAuthToken(t);
      try {
        localStorage.setItem('supawriter_token', t);
        if (data?.refresh_token) localStorage.setItem('supawriter_refresh', data.refresh_token);
      } catch (_) {}
      window.dispatchEvent(new Event('supawriter-auth-changed'));
    }
    return data;
  }, []);

  const signup = useCallback(async (email: string, password: string) => {
    const data = await authApi.signup(email, password);
    return data;
  }, []);

  const signout = useCallback(async () => {
    await authApi.signout();
    setToken(null);
    window.dispatchEvent(new Event('supawriter-auth-changed'));
  }, []);

  return { token, loading, signin, signup, signout };
}
