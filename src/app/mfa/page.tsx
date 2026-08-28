'use client';
import React, { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import AuthLayout from '@/components/layout/AuthLayout';
import { authUtils } from '@/lib/auth';
import api from '@/lib/api';
import { LoginResponse } from '@/types';
import { ShieldCheck, Loader2, ArrowLeft, KeyRound, RefreshCw } from 'lucide-react';

function MfaContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const userId = searchParams.get('userId') || '';
  const [code, setCode] = useState('');
  const [backupCode, setBackupCode] = useState('');
  const [useBackup, setUseBackup] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [remainingCodes, setRemainingCodes] = useState<number | null>(null);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!useBackup && code.length !== 6) { setError('Enter the full 6-digit code'); return; }
    if (useBackup && backupCode.length < 4) { setError('Enter a valid backup code'); return; }
    setLoading(true);
    setError('');

    try {
      const payload = useBackup
        ? { userId, backupCode: backupCode.replace(/-/g, '').trim() }
        : { userId, token: code };

      const { data } = await api.post<LoginResponse>('/auth/verify-mfa', payload);
      if (data.data?.accessToken && data.data?.user) {
        authUtils.setAuthData(
          { accessToken: data.data.accessToken, refreshToken: data.data.refreshToken! },
          data.data.user
        );
        if (data.data.remainingBackupCodes !== undefined) {
          setRemainingCodes(data.data.remainingBackupCodes);
        }
        router.push('/dashboard');
      }
    } catch {
      setError(useBackup ? 'Invalid backup code. Each code can only be used once.' : 'Invalid verification code. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout>
      <div className="mb-6 text-center lg:text-left">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2" style={{ fontFamily: 'Afacad, sans-serif' }}>
          Two-Factor Authentication
        </h1>
        <p className="text-sm" style={{ color: 'rgb(110, 130, 165)', fontFamily: 'Afacad, sans-serif' }}>
          {useBackup
            ? 'Enter one of your backup codes to verify your identity'
            : 'Enter the 6-digit code from your authenticator app'}
        </p>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-xl text-red-700 dark:text-red-400 text-sm text-center">
          {error}
        </div>
      )}

      <div className="py-5 px-6 rounded-[15px] sm:rounded-[20px] bg-white dark:bg-[#0a0a0a] shadow-[-5px_5px_50px_-5px_#e1e1e1] dark:shadow-none border border-gray-100 dark:border-gray-800">
        <form onSubmit={handleVerify} className="space-y-6">
          {/* Icon */}
          <div className="flex justify-center mb-2">
            <div className="w-16 h-16 rounded-full bg-primary/10 dark:bg-primary/20 flex items-center justify-center">
              {useBackup
                ? <KeyRound className="w-8 h-8 text-primary" />
                : <ShieldCheck className="w-8 h-8 text-primary" />}
            </div>
          </div>

          {/* Code input */}
          {!useBackup ? (
            <div className="flex justify-center">
              <input
                type="text"
                inputMode="numeric"
                maxLength={6}
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
                placeholder="000000"
                className="w-48 text-center text-3xl font-mono tracking-[0.5em] py-4 border-2 border-gray-200 dark:border-gray-700 dark:bg-[#0c0c0d] dark:text-gray-100 rounded-2xl focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                autoFocus
              />
            </div>
          ) : (
            <div className="flex justify-center">
              <input
                type="text"
                value={backupCode}
                onChange={(e) => setBackupCode(e.target.value.toUpperCase())}
                placeholder="XXXX-XXXX"
                className="w-56 text-center text-lg font-mono tracking-wider py-4 border-2 border-gray-200 dark:border-gray-700 dark:bg-[#0c0c0d] dark:text-gray-100 rounded-2xl focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                autoFocus
              />
            </div>
          )}

          <button
            type="submit"
            disabled={loading || (!useBackup && code.length !== 6) || (useBackup && backupCode.length < 4)}
            className="w-full inline-flex items-center justify-center rounded-full text-sm font-medium bg-white dark:bg-gradient-to-r dark:from-primary/90 dark:to-primary border border-gray-200 dark:border-transparent text-gray-900 dark:text-white shadow-lg hover:bg-gray-50 dark:hover:opacity-90 h-10 px-4 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ fontFamily: 'Afacad, sans-serif' }}
          >
            {loading ? (
              <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Verifying...</>
            ) : (
              'Verify & Continue'
            )}
          </button>

          {/* Toggle backup/TOTP */}
          <button
            type="button"
            onClick={() => { setUseBackup(!useBackup); setError(''); setCode(''); setBackupCode(''); }}
            className="w-full text-center text-sm text-gray-500 hover:text-primary transition-colors inline-flex items-center justify-center gap-2"
          >
            <RefreshCw className="w-3 h-3" />
            {useBackup ? 'Use authenticator code instead' : 'Use a backup code instead'}
          </button>

          <button
            type="button"
            onClick={() => router.push('/login')}
            className="w-full text-center text-sm text-gray-500 hover:text-primary transition-colors inline-flex items-center justify-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to login
          </button>
        </form>
      </div>

      {remainingCodes !== null && remainingCodes <= 3 && (
        <div className="mt-4 p-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-xl text-amber-700 dark:text-amber-400 text-sm text-center">
          You have {remainingCodes} backup code{remainingCodes !== 1 ? 's' : ''} remaining. Consider generating new ones.
        </div>
      )}
    </AuthLayout>
  );
}

export default function MfaPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-white dark:bg-black">Loading...</div>}>
      <MfaContent />
    </Suspense>
  );
}
