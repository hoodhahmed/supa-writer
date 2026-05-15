import apiClient, { setAuthToken } from '@/services/clients/apiClient';

export const authApi = {
  signup: async (email: string, password: string) => {
    const res = await apiClient.post('/auth/signup', { email, password });
    return res.data;
  },

  signin: async (email: string, password: string) => {
    const res = await apiClient.post('/auth/signin', { email, password });
    const data = res.data;
    if (data?.access_token) {
      setAuthToken(data.access_token);
      try {
        localStorage.setItem('supawriter_token', data.access_token);
        if (data.refresh_token) localStorage.setItem('supawriter_refresh', data.refresh_token);
      } catch (_) {}
    }
    return data;
  },

  signout: async () => {
    setAuthToken(undefined);
    try { localStorage.removeItem('supawriter_token'); } catch (_) {}
    try { localStorage.removeItem('supawriter_refresh'); } catch (_) {}
  }
};
