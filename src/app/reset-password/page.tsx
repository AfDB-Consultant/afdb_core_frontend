'use client';
import React, { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import AuthLayout from '@/components/layout/AuthLayout';
import axios from 'axios';

const BETA_API = process.env.NEXT_PUBLIC_BETA_API_URL || 'http://localhost:4000/api/v1';
import { Lock, Eye, EyeOff, Loader2, CheckCircle2, ArrowLeft } from 'lucide-react';

function ResetPasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token') || '';

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) { setError('Passwords do not match'); return; }
    if (password.length < 8) { setError('Password must be at least 8 characters'); return; }
    setLoading(true);
    setError('');

    try {
      await axios.post(`${BETA_API}/auth/reset-password`, { token, password });
      setSuccess(true);
      setTimeout(() => router.push('/login'), 3000);
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { message?: string } } };
      setError(axiosErr.response?.data?.message || 'Reset failed. The link may have expired.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <AuthLayout>
        <div className="py-6 px-5 rounded-[15px] sm:rounded-[20px] bg-white dark:bg-[#0a0a0a] shadow-[-5px_5px_50px_-5px_#e1e1e1] dark:shadow-none border border-gray-100 dark:border-gray-800 text-center">
          <CheckCircle2 className="w-12 h-12 text-primary mx-auto mb-4" />
          <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-2" style={{ fontFamily: 'Afacad, sans-serif' }}>
            Password reset successful!
          </h2>
          <p className="text-sm mb-6" style={{ color: 'rgb(110, 130, 165)', fontFamily: 'Afacad, sans-serif' }}>
            Redirecting you to sign in...
          </p>
          <Link href="/login" className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:opacity-80 transition-opacity">
            <ArrowLeft className="w-4 h-4" />
            Go to sign in now
          </Link>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout>
      <div className="mb-6 text-center lg:text-left">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2" style={{ fontFamily: 'Afacad, sans-serif' }}>
          Reset Password
        </h1>
        <p className="text-sm" style={{ color: 'rgb(110, 130, 165)', fontFamily: 'Afacad, sans-serif' }}>
          Enter your new password below
        </p>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-xl text-red-700 dark:text-red-400 text-sm">
          {error}
        </div>
      )}

      <div className="py-4 px-5 sm:py-5 sm:px-6 rounded-[15px] sm:rounded-[20px] bg-white dark:bg-[#0a0a0a] shadow-[-5px_5px_50px_-5px_#e1e1e1] dark:shadow-none border border-gray-100 dark:border-gray-800">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="flex items-center text-sm font-medium mb-1.5" style={{ fontFamily: 'Afacad, sans-serif', color: 'rgb(71, 85, 105)' }}>
              <span className="p-1.5 rounded-full bg-blue-50 dark:bg-blue-950/40 flex items-center justify-center mr-2">
                <Lock className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              </span>
              New Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'} value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Min 8 characters" required autoComplete="new-password"
                className="w-full border rounded-full border-gray-200 dark:border-gray-700 dark:bg-[#0c0c0d] dark:text-gray-100 dark:placeholder-gray-500 px-4 py-2.5 pr-12 text-base focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                style={{ height: '40px', fontFamily: 'Afacad, sans-serif' }}
              />
              <button type="button" onClick={() => setShowPassword(!showPassword)}
                className="absolute right-0 top-0 h-full px-3 flex items-center justify-center rounded-r-full text-gray-400 hover:text-gray-600 transition-colors">
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          <div>
            <label className="flex items-center text-sm font-medium mb-1.5" style={{ fontFamily: 'Afacad, sans-serif', color: 'rgb(71, 85, 105)' }}>
              <span className="p-1.5 rounded-full bg-blue-50 dark:bg-blue-950/40 flex items-center justify-center mr-2">
                <Lock className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              </span>
              Confirm New Password
            </label>
            <input
              type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Re-enter new password" required autoComplete="new-password"
              className="w-full border rounded-full border-gray-200 dark:border-gray-700 dark:bg-[#0c0c0d] dark:text-gray-100 dark:placeholder-gray-500 px-4 py-2.5 text-base focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
              style={{ height: '40px', fontFamily: 'Afacad, sans-serif' }}
            />
          </div>

          <button
            type="submit" disabled={loading}
            className="w-full inline-flex items-center justify-center rounded-full text-sm font-medium bg-white dark:bg-gradient-to-r dark:from-primary/90 dark:to-primary border border-gray-200 dark:border-transparent text-gray-900 dark:text-white shadow-lg hover:bg-gray-50 dark:hover:opacity-90 h-10 px-4 transition-all disabled:opacity-50"
            style={{ fontFamily: 'Afacad, sans-serif' }}
          >
            {loading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Resetting...</> : 'Reset Password'}
          </button>
        </form>
      </div>

      <div className="mt-6 text-center">
        <Link href="/login" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-primary transition-colors">
          <ArrowLeft className="w-4 h-4" />
          Back to sign in
        </Link>
      </div>
    </AuthLayout>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-white dark:bg-black">Loading...</div>}>
      <ResetPasswordContent />
    </Suspense>
  );
}
