import axios from 'axios';
import { authUtils } from './auth';

const API_URL = process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_PUBLIC_BETA_API_URL || 'http://localhost:4000/api/v1';

const api = axios.create({ baseURL: API_URL, headers: { 'Content-Type': 'application/json' } });

api.interceptors.request.use((config) => {
  const token = authUtils.getAccessToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      const requestUrl = error.config?.url || '';
      // Only clear auth and redirect for auth-related endpoints
      if (requestUrl.includes('/auth/') || requestUrl.includes('/messenger/')) {
        // Don't clear auth for messenger errors (contacts, messages) — just reject
        if (requestUrl.includes('/messenger/')) {
          return Promise.reject(error);
        }
        authUtils.clearAuth();
        if (typeof window !== 'undefined') window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
