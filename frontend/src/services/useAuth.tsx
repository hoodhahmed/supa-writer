import { useState, useEffect, useCallback } from 'react';
import { authApi } from './auth.api';

export function useAuth() {
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    try {
      const t = localStorage.getItem('supawriter_token');
      setToken(t);
    } catch (_) {}
  }, []);

  const signin = useCallback(async (email: string, password: string) => {
    const data = await authApi.signin(email, password);
    const t = data?.access_token || null;
    setToken(t);
    return data;
  }, []);

  const signup = useCallback(async (email: string, password: string) => {
    const data = await authApi.signup(email, password);
    return data;
  }, []);

  const signout = useCallback(async () => {
    await authApi.signout();
    setToken(null);
  }, []);

  return { token, signin, signup, signout };
}
