'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import AfDBLogo from '@/components/ui/AfDBLogo';
import { authUtils } from '@/lib/auth';
import axios from 'axios';

const BETA_API = 'http://localhost:4000/api/v1';

export default function CoreLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const { data } = await axios.post(`${BETA_API}/auth/login`, { email, password });
      if (data.data?.accessToken && data.data?.user) {
        authUtils.setAuthData(
          { accessToken: data.data.accessToken, refreshToken: data.data.refreshToken },
          data.data.user
        );
        router.push('/dashboard');
      }
    } catch {
      setError('Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-afdb-navy">
      <div className="w-full max-w-md bg-white rounded-2xl p-10 shadow-2xl">
        <div className="text-center mb-8">
          <AfDBLogo size={56} />
          <h1 className="text-xl font-bold text-afdb-navy mt-4">Enterprise Dashboard</h1>
          <p className="text-sm text-gray-500 mt-1">Sign in with your AfDB credentials</p>
        </div>
        {error && <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">{error}</div>}
        <form onSubmit={handleLogin} className="space-y-4">
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="name@afdb.org" required className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-afdb-green/20 focus:border-afdb-green" />
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" required className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-afdb-green/20 focus:border-afdb-green" />
          <button type="submit" disabled={loading} className="w-full py-3 bg-afdb-green hover:bg-afdb-green-dark text-white font-semibold rounded-lg transition-all disabled:opacity-50">
            {loading ? 'Signing in...' : 'Sign In to Dashboard'}
          </button>
        </form>
      </div>
    </div>
  );
}
