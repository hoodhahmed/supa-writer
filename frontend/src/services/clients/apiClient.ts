import axios from 'axios';

const apiClient = axios.create({
  baseURL: '/api/v1',
  headers: { 'Content-Type': 'application/json' },
  timeout: 15000,
});

apiClient.interceptors.response.use(
  (resp) => resp,
  (error) => {
    // Basic centralized error handling - can be replaced with Sentry/logging
    // Normalize axios error to throw a simpler object
    const payload = error?.response?.data || { message: error.message || 'Network error' };
    return Promise.reject(payload);
  }
);

export default apiClient;
