import { User, AuthTokens } from '@/types';

const AUTH_KEY = 'afdb_auth';

export const authUtils = {
  setAuthData(tokens: AuthTokens, user: User): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem(AUTH_KEY, JSON.stringify({ tokens, user }));
    }
  },

  getTokens(): AuthTokens | null {
    if (typeof window === 'undefined') return null;
    const data = localStorage.getItem(AUTH_KEY);
    if (!data) return null;
    return JSON.parse(data).tokens;
  },

  getUser(): User | null {
    if (typeof window === 'undefined') return null;
    const data = localStorage.getItem(AUTH_KEY);
    if (!data) return null;
    return JSON.parse(data).user;
  },

  isAuthenticated(): boolean {
    const tokens = this.getTokens();
    return !!tokens?.accessToken;
  },

  clearAuth(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(AUTH_KEY);
    }
  },

  getAccessToken(): string | null {
    return this.getTokens()?.accessToken || null;
  },
};
