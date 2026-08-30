import axios from 'axios';
import { authUtils } from './auth';

const CORE_API_URL = process.env.NEXT_PUBLIC_CORE_API_URL || 'http://localhost:4001/api/v1';

const coreApi = axios.create({ baseURL: CORE_API_URL, headers: { 'Content-Type': 'application/json' } });

coreApi.interceptors.request.use((config) => {
  const token = authUtils.getAccessToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

coreApi.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      authUtils.clearAuth();
      if (typeof window !== 'undefined') window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default coreApi;
