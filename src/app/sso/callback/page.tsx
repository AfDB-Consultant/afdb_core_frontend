'use client';
import React, { useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { authUtils } from '@/lib/auth';
import api from '@/lib/api';
import { User } from '@/types';
import { Loader2, CheckCircle2, XCircle } from 'lucide-react';

function SsoCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = React.useState<'processing' | 'success' | 'error'>('processing');
  const [message, setMessage] = React.useState('');

  useEffect(() => {
    const accessToken = searchParams.get('accessToken');
    const refreshToken = searchParams.get('refreshToken');

    if (accessToken && refreshToken) {
      // Fetch user info to complete login
      api.get('/auth/me', { headers: { Authorization: `Bearer ${accessToken}` } })
        .then(res => {
          const user = res.data.data as User;
          authUtils.setAuthData({ accessToken, refreshToken }, user);
          setStatus('success');
          setMessage('SSO login successful! Redirecting...');
          setTimeout(() => router.push('/dashboard'), 1500);
        })
        .catch(() => {
          setStatus('error');
          setMessage('Failed to complete SSO login. Please try again.');
        });
    } else {
      setStatus('error');
      setMessage('SSO authentication failed. No tokens received.');
    }
  }, [searchParams, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center space-y-4 p-8 rounded-2xl bg-white dark:bg-[#0a0a0a] shadow-lg border border-gray-100 dark:border-gray-800 max-w-sm">
        {status === 'processing' && (
          <>
            <Loader2 className="w-12 h-12 text-primary animate-spin mx-auto" />
            <p className="text-gray-600 dark:text-gray-400" style={{ fontFamily: 'Afacad, sans-serif' }}>
              Completing SSO login...
            </p>
          </>
        )}
        {status === 'success' && (
          <>
            <CheckCircle2 className="w-12 h-12 text-green-500 mx-auto" />
            <p className="text-green-600 dark:text-green-400" style={{ fontFamily: 'Afacad, sans-serif' }}>
              {message}
            </p>
          </>
        )}
        {status === 'error' && (
          <>
            <XCircle className="w-12 h-12 text-red-500 mx-auto" />
            <p className="text-red-600 dark:text-red-400" style={{ fontFamily: 'Afacad, sans-serif' }}>
              {message}
            </p>
            <button
              onClick={() => router.push('/login')}
              className="mt-4 px-6 py-2 rounded-full bg-primary text-white text-sm font-medium hover:opacity-90 transition-opacity"
              style={{ fontFamily: 'Afacad, sans-serif' }}
            >
              Back to Login
            </button>
          </>
        )}
      </div>
    </div>
  );
}

export default function SsoCallbackPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>}>
      <SsoCallbackContent />
    </Suspense>
  );
}
