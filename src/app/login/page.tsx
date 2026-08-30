'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import AuthLayout from '@/components/layout/AuthLayout';
import { authUtils } from '@/lib/auth';
import api from '@/lib/api';
import { LoginResponse, SsoProvider } from '@/types';
import { Mail, Lock, Eye, EyeOff, Loader2, ShieldCheck, AlertTriangle } from 'lucide-react';
import OtpVerification from '@/components/auth/OtpVerification';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [remainingAttempts, setRemainingAttempts] = useState<number | null>(null);
  const [ssoProviders, setSsoProviders] = useState<SsoProvider[]>([]);

  // 2FA OTP state
  const [mfaUserId, setMfaUserId] = useState<string | null>(null);
  const [showOtp, setShowOtp] = useState(false);
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [otpLoading, setOtpLoading] = useState(false);
  const [otpError, setOtpError] = useState('');
  const [otpNotification, setOtpNotification] = useState('');
  const [otpTimerKey, setOtpTimerKey] = useState(0);

  useEffect(() => {
    api.get<SsoProvider[] | { providers: SsoProvider[] }>('/sso/providers')
      .then(res => {
        const providers = Array.isArray(res.data) ? res.data : (res.data as { providers: SsoProvider[] }).providers || [];
        setSsoProviders(providers);
      })
      .catch(() => {});
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setRemainingAttempts(null);

    try {
      const { data } = await api.post<LoginResponse>('/auth/login', { email, password });

      if (data.data?.mfaRequired) {
        // Send login OTP via email
        setMfaUserId(data.data.userId!);
        try {
          await api.post('/auth/send-login-otp', { userId: data.data.userId });
          setOtpTimerKey((k) => k + 1);
          setShowOtp(true);
        } catch {
          setError('Failed to send verification code. Please try again.');
        }
        return;
      }

      if (data.data?.accessToken && data.data?.user) {
        authUtils.setAuthData(
          { accessToken: data.data.accessToken, refreshToken: data.data.refreshToken! },
          data.data.user
        );
        router.push('/dashboard');
      }
    } catch (err: unknown) {
      const axiosErr = err as { response?: { status?: number; data?: { message?: string; data?: { remainingAttempts?: number; locked?: boolean } } } };
      const status = axiosErr.response?.status;
      const msg = axiosErr.response?.data?.message;
      const respData = axiosErr.response?.data?.data;

      if (status === 423 || respData?.locked) {
        setError(msg || 'Account is locked. Please try again later.');
      } else if (respData?.remainingAttempts !== undefined) {
        setRemainingAttempts(respData.remainingAttempts);
        setError(msg || 'Invalid credentials');
      } else {
        setError(msg || 'Login failed. Please check your credentials.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleOtpVerify = async () => {
    if (!mfaUserId) return;
    setOtpLoading(true);
    setOtpError('');
    try {
      const { data } = await api.post('/auth/verify-login-otp', { userId: mfaUserId, code: otp.join('') });
      if (data.data?.accessToken && data.data?.user) {
        authUtils.setAuthData(
          { accessToken: data.data.accessToken, refreshToken: data.data.refreshToken! },
          data.data.user
        );
        router.push('/dashboard');
      }
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { message?: string } } };
      setOtpError(axiosErr.response?.data?.message || 'Invalid code. Please try again.');
    }
    setOtpLoading(false);
  };

  const handleOtpResend = async () => {
    if (!mfaUserId) return;
    try {
      await api.post('/auth/send-login-otp', { userId: mfaUserId });
      setOtp(['', '', '', '', '', '']);
      setOtpError('');
      setOtpTimerKey((k) => k + 1);
      setOtpNotification('A new verification code has been sent to your email');
      setTimeout(() => setOtpNotification(''), 5000);
    } catch {
      setOtpError('Failed to resend code');
    }
  };

  const handleOtpChange = (index: number, value: string) => {
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    setOtpError('');
  };

  const handleSsoLogin = async (providerId: string) => {
    try {
      const { data } = await api.get(`/sso/initiate/${providerId}`);
      if (data.data?.authorizationUrl) {
        window.location.href = data.data.authorizationUrl;
      }
    } catch {
      setError('Failed to initiate SSO login. Please try again.');
    }
  };

  // If OTP verification is showing (2FA flow)
  if (showOtp) {
    return (
      <AuthLayout>
        <div className="mb-6 sm:mb-8 text-center lg:text-left">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2" style={{ fontFamily: 'Afacad, sans-serif' }}>
            Two-Step Verification
          </h1>
          <p className="text-sm sm:text-base" style={{ color: 'rgb(110, 130, 165)', fontFamily: 'Afacad, sans-serif' }}>
            Check your email for the verification code
          </p>
        </div>
        <OtpVerification
          email={email}
          otp={otp}
          onOtpChange={handleOtpChange}
          onVerify={handleOtpVerify}
          onResend={handleOtpResend}
          onCancel={() => { setShowOtp(false); setMfaUserId(null); }}
          loading={otpLoading}
          error={otpError}
          notification={otpNotification}
          title="Login verification code"
          verifyLabel="Sign In"
          timerKey={otpTimerKey}
        />
      </AuthLayout>
    );
  }

  return (
    <AuthLayout>
      {/* Header */}
      <div className="mb-6 sm:mb-8 text-center lg:text-left">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2" style={{ fontFamily: 'Afacad, sans-serif' }}>
          Sign In
        </h1>
        <p className="text-sm sm:text-base" style={{ color: 'rgb(110, 130, 165)', fontFamily: 'Afacad, sans-serif' }}>
          Welcome back!<br />Please enter your details
        </p>
      </div>

      {/* Form Card */}
      <div className="py-4 px-5 sm:py-5 sm:px-6 rounded-[15px] sm:rounded-[20px] bg-white dark:bg-[#0a0a0a] shadow-[-5px_5px_50px_-5px_#e1e1e1] dark:shadow-none border border-gray-100 dark:border-gray-800">
        <form onSubmit={handleLogin} className="space-y-4">
          {/* Email */}
          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ fontFamily: 'Afacad, sans-serif', color: 'rgb(71, 85, 105)' }}>
              <div className="flex items-center">
                <span className="p-1.5 rounded-full bg-blue-50 dark:bg-blue-950/40 flex items-center justify-center mr-2">
                  <Mail className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                </span>
                Email Address
              </div>
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="afdbadmin@yopmail.com"
              required
              autoFocus
              autoComplete="email"
              className="w-full border rounded-full border-gray-200 dark:border-gray-700 dark:bg-[#0c0c0d] dark:text-gray-100 dark:placeholder-gray-500 px-4 py-2.5 text-base focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
              style={{ height: '40px', fontFamily: 'Afacad, sans-serif' }}
            />
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ fontFamily: 'Afacad, sans-serif', color: 'rgb(71, 85, 105)' }}>
              <div className="flex items-center">
                <span className="p-1.5 rounded-full bg-blue-50 dark:bg-blue-950/40 flex items-center justify-center mr-2">
                  <Lock className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                </span>
                Password
              </div>
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
                autoComplete="current-password"
                className="w-full border rounded-full border-gray-200 dark:border-gray-700 dark:bg-[#0c0c0d] dark:text-gray-100 dark:placeholder-gray-500 px-4 py-2.5 pr-12 text-base focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                style={{ height: '40px', fontFamily: 'Afacad, sans-serif' }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-0 top-0 h-full px-3 flex items-center justify-center rounded-r-full text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* Remember & Forgot */}
          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" className="w-4 h-4 rounded border-gray-300 dark:border-gray-600 text-primary focus:ring-primary/30 dark:bg-[#0c0c0d]" />
              <span className="text-sm" style={{ color: 'rgb(71, 85, 105)', fontFamily: 'Afacad, sans-serif' }}>Remember me</span>
            </label>
            <Link href="/forgot-password" className="text-sm font-medium text-primary hover:opacity-80 transition-opacity" style={{ fontFamily: 'Afacad, sans-serif' }}>
              Forgot password?
            </Link>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full inline-flex items-center justify-center rounded-full text-sm font-medium bg-white dark:bg-gradient-to-r dark:from-primary/90 dark:to-primary border border-gray-200 dark:border-transparent text-gray-900 dark:text-white shadow-lg hover:bg-gray-50 dark:hover:opacity-90 h-10 px-4 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ fontFamily: 'Afacad, sans-serif' }}
          >
            {loading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Signing in...</> : 'Sign In'}
          </button>
        </form>

        {/* SSO Divider */}
        {ssoProviders.length > 0 && (
          <>
            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200 dark:border-gray-700" />
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="px-2 bg-white dark:bg-[#0a0a0a] text-gray-400" style={{ fontFamily: 'Afacad, sans-serif' }}>
                  Or continue with SSO
                </span>
              </div>
            </div>

            {/* SSO Buttons */}
            <div className="flex gap-3">
              {ssoProviders.map(provider => (
                <button
                  key={provider.id}
                  onClick={() => handleSsoLogin(provider.id)}
                  className="flex-1 inline-flex items-center justify-center gap-2 h-10 px-4 border border-gray-200 dark:border-gray-700 rounded-full text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all"
                  style={{ fontFamily: 'Afacad, sans-serif' }}
                >
                  {provider.id === 'google' && (
                    <svg className="w-4 h-4" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
                  )}
                  {provider.id === 'microsoft' && (
                    <svg className="w-4 h-4" viewBox="0 0 24 24"><path d="M11.4 24H0V12.6h11.4V24zM24 24H12.6V12.6H24V24zM11.4 11.4H0V0h11.4v11.4zM24 11.4H12.6V0H24v11.4z" fill="#00A4EF"/></svg>
                  )}
                  {provider.name}
                </button>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Error */}
      {error && (
        <div className={`mt-4 p-3 border rounded-xl text-sm flex items-start gap-2 ${remainingAttempts !== null && remainingAttempts <= 2 ? 'bg-orange-50 dark:bg-orange-950/30 border-orange-200 dark:border-orange-800 text-orange-700 dark:text-orange-400' : 'bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400'}`}>
          <AlertTriangle className="w-5 h-5 mt-0.5 flex-shrink-0" />
          <div>
            <p>{error}</p>
            {remainingAttempts !== null && remainingAttempts <= 2 && (
              <p className="text-xs mt-1 opacity-80">{remainingAttempts} attempt{remainingAttempts !== 1 ? 's' : ''} remaining before lockout</p>
            )}
          </div>
        </div>
      )}

      {/* Sign Up Link */}
      <div className="mt-6 text-center">
        <p className="text-sm" style={{ color: 'rgb(110, 130, 165)', fontFamily: 'Afacad, sans-serif' }}>
          Don&apos;t have an account?{' '}
          <Link href="/signup" className="text-gray-700 dark:text-gray-300 hover:text-primary font-medium transition-colors" style={{ fontFamily: 'Afacad, sans-serif' }}>
            Sign up
          </Link>
        </p>
      </div>

      {/* Terms */}
      <div className="mt-6 text-center">
        <p className="text-xs" style={{ color: 'rgb(160, 170, 180)', fontFamily: 'Afacad, sans-serif' }}>
          By signing in, you agree to our{' '}
          <span className="text-gray-500 hover:text-primary cursor-pointer transition-colors">Terms of Service</span>
          {' '}and{' '}
          <span className="text-gray-500 hover:text-primary cursor-pointer transition-colors">Privacy Policy</span>
        </p>
      </div>
    </AuthLayout>
  );
}
