'use client';
import React, { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import AuthLayout from '@/components/layout/AuthLayout';
import { authUtils } from '@/lib/auth';
import api from '@/lib/api';
import { User as UserIcon, Mail, Lock, Eye, EyeOff, Loader2, ShieldCheck, Check, X } from 'lucide-react';
import OtpVerification from '@/components/auth/OtpVerification';

const passwordRules = [
  { label: 'At least 8 characters', test: (p: string) => p.length >= 8 },
  { label: 'One uppercase letter', test: (p: string) => /[A-Z]/.test(p) },
  { label: 'One lowercase letter', test: (p: string) => /[a-z]/.test(p) },
  { label: 'One digit', test: (p: string) => /\d/.test(p) },
  { label: 'One special character', test: (p: string) => /[!@#$%^&*()_+\-=[\]{};':"|,.<>/?]/.test(p) },
];

export default function SignupPage() {
  const router = useRouter();
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', password: '', confirmPassword: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // OTP state
  const [showOtp, setShowOtp] = useState(false);
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [otpLoading, setOtpLoading] = useState(false);
  const [otpError, setOtpError] = useState('');
  const [otpNotification, setOtpNotification] = useState('');
  const [otpTimerKey, setOtpTimerKey] = useState(0);

  const update = (field: string, value: string) => setForm((p) => ({ ...p, [field]: value }));

  const strength = useMemo(() => {
    const passed = passwordRules.filter(r => r.test(form.password)).length;
    return { passed, total: passwordRules.length, percent: (passed / passwordRules.length) * 100 };
  }, [form.password]);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) { setError('Passwords do not match'); return; }
    if (strength.passed < strength.total) { setError('Password does not meet all requirements'); return; }
    setLoading(true);
    setError('');

    try {
      // Send OTP to email first
      await api.post('/auth/send-register-otp', { email: form.email });
      setOtpTimerKey((k) => k + 1);
      setShowOtp(true);
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { message?: string } } };
      setError(axiosErr.response?.data?.message || 'Failed to send verification code. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleOtpVerify = async () => {
    setOtpLoading(true);
    setOtpError('');
    try {
      const { data } = await api.post('/auth/verify-register-otp', {
        email: form.email,
        code: otp.join(''),
        firstName: form.firstName,
        lastName: form.lastName,
        password: form.password,
      });
      if (data.data?.accessToken && data.data?.user) {
        authUtils.setAuthData(
          { accessToken: data.data.accessToken, refreshToken: data.data.refreshToken! },
          data.data.user
        );
        router.push('/dashboard');
      }
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { message?: string } } };
      setOtpError(axiosErr.response?.data?.message || 'Verification failed. Please try again.');
    }
    setOtpLoading(false);
  };

  const handleOtpResend = async () => {
    try {
      await api.post('/auth/send-register-otp', { email: form.email });
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

  // OTP verification step
  if (showOtp) {
    return (
      <AuthLayout>
        <div className="mb-6 text-center lg:text-left">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2" style={{ fontFamily: 'Afacad, sans-serif' }}>
            Verify Your Email
          </h1>
          <p className="text-sm" style={{ color: 'rgb(110, 130, 165)', fontFamily: 'Afacad, sans-serif' }}>
            Enter the code sent to {form.email}
          </p>
        </div>
        <OtpVerification
          email={form.email}
          otp={otp}
          onOtpChange={handleOtpChange}
          onVerify={handleOtpVerify}
          onResend={handleOtpResend}
          onCancel={() => setShowOtp(false)}
          loading={otpLoading}
          error={otpError}
          notification={otpNotification}
          title="Registration verification code"
          verifyLabel="Create Account"
          timerKey={otpTimerKey}
        />
      </AuthLayout>
    );
  }

  return (
    <AuthLayout>
      <div className="mb-6 text-center lg:text-left">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2" style={{ fontFamily: 'Afacad, sans-serif' }}>
          Create Account
        </h1>
        <p className="text-sm" style={{ color: 'rgb(110, 130, 165)', fontFamily: 'Afacad, sans-serif' }}>
          Join the AfDB enterprise portal
        </p>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-xl text-red-700 dark:text-red-400 text-sm flex items-start gap-2">
          <ShieldCheck className="w-5 h-5 mt-0.5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="py-4 px-5 sm:py-5 sm:px-6 rounded-[15px] sm:rounded-[20px] bg-white dark:bg-[#0a0a0a] shadow-[-5px_5px_50px_-5px_#e1e1e1] dark:shadow-none border border-gray-100 dark:border-gray-800">
        <form onSubmit={handleSignup} className="space-y-4">
          {/* Name row */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="flex items-center text-sm font-medium mb-1.5" style={{ fontFamily: 'Afacad, sans-serif', color: 'rgb(71, 85, 105)' }}>
                <span className="p-1.5 rounded-full bg-blue-50 dark:bg-blue-950/40 flex items-center justify-center mr-2">
                  <UserIcon className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                </span>
                First Name
              </label>
              <input
                type="text" value={form.firstName} onChange={(e) => update('firstName', e.target.value)}
                placeholder="John" required
                className="w-full border rounded-full border-gray-200 dark:border-gray-700 dark:bg-[#0c0c0d] dark:text-gray-100 dark:placeholder-gray-500 px-4 py-2.5 text-base focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                style={{ height: '40px', fontFamily: 'Afacad, sans-serif' }}
              />
            </div>
            <div>
              <label className="flex items-center text-sm font-medium mb-1.5" style={{ fontFamily: 'Afacad, sans-serif', color: 'rgb(71, 85, 105)' }}>
                Last Name
              </label>
              <input
                type="text" value={form.lastName} onChange={(e) => update('lastName', e.target.value)}
                placeholder="Doe" required
                className="w-full border rounded-full border-gray-200 dark:border-gray-700 dark:bg-[#0c0c0d] dark:text-gray-100 dark:placeholder-gray-500 px-4 py-2.5 text-base focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                style={{ height: '40px', fontFamily: 'Afacad, sans-serif' }}
              />
            </div>
          </div>

          {/* Email */}
          <div>
            <label className="flex items-center text-sm font-medium mb-1.5" style={{ fontFamily: 'Afacad, sans-serif', color: 'rgb(71, 85, 105)' }}>
              <span className="p-1.5 rounded-full bg-blue-50 dark:bg-blue-950/40 flex items-center justify-center mr-2">
                <Mail className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              </span>
              Email Address
            </label>
            <input
              type="email" value={form.email} onChange={(e) => update('email', e.target.value)}
              placeholder="name@afdb.org" required autoComplete="email"
              className="w-full border rounded-full border-gray-200 dark:border-gray-700 dark:bg-[#0c0c0d] dark:text-gray-100 dark:placeholder-gray-500 px-4 py-2.5 text-base focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
              style={{ height: '40px', fontFamily: 'Afacad, sans-serif' }}
            />
          </div>

          {/* Password & Confirm Password */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="flex items-center text-sm font-medium mb-1.5" style={{ fontFamily: 'Afacad, sans-serif', color: 'rgb(71, 85, 105)' }}>
                <span className="p-1.5 rounded-full bg-blue-50 dark:bg-blue-950/40 flex items-center justify-center mr-2">
                  <Lock className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                </span>
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'} value={form.password}
                  onChange={(e) => update('password', e.target.value)}
                  placeholder="Strong password" required autoComplete="new-password"
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
                Confirm Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'} value={form.confirmPassword} onChange={(e) => update('confirmPassword', e.target.value)}
                  placeholder="Re-enter password" required autoComplete="new-password"
                  className="w-full border rounded-full border-gray-200 dark:border-gray-700 dark:bg-[#0c0c0d] dark:text-gray-100 dark:placeholder-gray-500 px-4 py-2.5 pr-12 text-base focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                  style={{ height: '40px', fontFamily: 'Afacad, sans-serif' }}
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-0 top-0 h-full px-3 flex items-center justify-center rounded-r-full text-gray-400 hover:text-gray-600 transition-colors">
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {form.confirmPassword && form.password !== form.confirmPassword && (
                <p className="text-xs text-red-500 mt-1">Passwords do not match</p>
              )}
            </div>
          </div>

          {/* Password strength bar */}
          {form.password && (
            <div className="mt-2">
              <div className="h-1.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-300"
                  style={{
                    width: `${strength.percent}%`,
                    backgroundColor: strength.percent <= 40 ? '#ef4444' : strength.percent <= 60 ? '#f59e0b' : strength.percent <= 80 ? '#3b82f6' : '#22c55e',
                  }}
                />
              </div>
              <div className="mt-2 space-y-1">
                {passwordRules.map(rule => (
                  <div key={rule.label} className="flex items-center gap-1.5 text-xs">
                    {rule.test(form.password)
                      ? <Check className="w-3 h-3 text-green-500" />
                      : <X className="w-3 h-3 text-gray-300 dark:text-gray-600" />}
                    <span className={rule.test(form.password) ? 'text-green-600 dark:text-green-400' : 'text-gray-400 dark:text-gray-500'}>
                      {rule.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <button
            type="submit" disabled={loading || strength.passed < strength.total || form.password !== form.confirmPassword}
            className="w-full inline-flex items-center justify-center rounded-full text-sm font-medium bg-white dark:bg-gradient-to-r dark:from-primary/90 dark:to-primary border border-gray-200 dark:border-transparent text-gray-900 dark:text-white shadow-lg hover:bg-gray-50 dark:hover:opacity-90 h-10 px-4 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ fontFamily: 'Afacad, sans-serif' }}
          >
            {loading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Sending code...</> : 'Continue'}
          </button>
        </form>
      </div>

      <div className="mt-6 text-center">
        <p className="text-sm" style={{ color: 'rgb(110, 130, 165)', fontFamily: 'Afacad, sans-serif' }}>
          Already have an account?{' '}
          <Link href="/login" className="text-gray-700 dark:text-gray-300 hover:text-primary font-medium transition-colors">
            Sign in
          </Link>
        </p>
      </div>
    </AuthLayout>
  );
}
