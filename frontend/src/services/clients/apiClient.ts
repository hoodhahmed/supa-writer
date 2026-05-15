import axios from 'axios';

const apiClient = axios.create({
  baseURL: '/api/v1',
  headers: { 'Content-Type': 'application/json' },
  timeout: 15000,
});

// Response interceptor to normalize errors and handle 401 -> token refresh
apiClient.interceptors.response.use(
  (resp) => resp,
  async (error) => {
    const originalRequest = error?.config;
    const status = error?.response?.status;

    // Try refresh once on 401
    if (status === 401 && !originalRequest?._retry) {
      originalRequest._retry = true;
      try {
        const refreshToken = localStorage.getItem('supawriter_refresh');
        if (refreshToken) {
          // Use a bare axios instance to call refresh (avoid interceptor loop)
          const r = await axios.post('/api/v1/auth/refresh', { refresh_token: refreshToken });
          const data = r.data;
          if (data?.access_token) {
            apiClient.defaults.headers.common['Authorization'] = `Bearer ${data.access_token}`;
            localStorage.setItem('supawriter_token', data.access_token);
            if (data?.refresh_token) localStorage.setItem('supawriter_refresh', data.refresh_token);
            originalRequest.headers['Authorization'] = `Bearer ${data.access_token}`;
            return apiClient(originalRequest);
          }
        }
      } catch (err) {
        // Fallthrough to reject
      }
    }

    const payload = error?.response?.data || { message: error.message || 'Network error' };
    return Promise.reject(payload);
  }
);

export default apiClient;

export function setAuthToken(token?: string | null) {
  if (token) {
    apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete apiClient.defaults.headers.common['Authorization'];
  }
}

// Initialize auth header from localStorage if available
try {
  const _tok = localStorage.getItem('supawriter_token');
  if (_tok) apiClient.defaults.headers.common['Authorization'] = `Bearer ${_tok}`;
} catch (_) {}
