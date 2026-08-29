'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import AuthLayout from '@/components/layout/AuthLayout';
import api from '@/lib/api';
import { Mail, Lock, Eye, EyeOff, Loader2, ArrowLeft, CheckCircle2, ShieldCheck } from 'lucide-react';
import OtpVerification from '@/components/auth/OtpVerification';

export default function ForgotPasswordPage() {
  const router = useRouter();

  // Step 1: Email input
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Step 2: OTP verification
  const [showOtp, setShowOtp] = useState(false);
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [otpLoading, setOtpLoading] = useState(false);
  const [otpError, setOtpError] = useState('');
  const [otpNotification, setOtpNotification] = useState('');
  const [otpTimerKey, setOtpTimerKey] = useState(0);

  // Step 3: New password
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [passwordError, setPasswordError] = useState('');

  // Step 4: Success
  const [success, setSuccess] = useState(false);

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await api.post('/auth/send-reset-otp', { email });
      setOtpTimerKey((k) => k + 1);
      setShowOtp(true);
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { message?: string } } };
      setError(axiosErr.response?.data?.message || 'Could not send verification code. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleOtpVerify = () => {
    // Just validate OTP format, then show password form
    if (otp.join('').length !== 6) {
      setOtpError('Please enter the full 6-digit code');
      return;
    }
    setOtpError('');
    setShowPasswordForm(true);
  };

  const handleOtpResend = async () => {
    try {
      await api.post('/auth/send-reset-otp', { email });
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

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) { setPasswordError('Passwords do not match'); return; }
    if (newPassword.length < 8) { setPasswordError('Password must be at least 8 characters'); return; }

    setOtpLoading(true);
    setOtpError('');

    try {
      await api.post('/auth/verify-reset-otp', {
        email,
        code: otp.join(''),
        newPassword,
      });
      setSuccess(true);
      setTimeout(() => router.push('/login'), 4000);
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { message?: string } } };
      setOtpError(axiosErr.response?.data?.message || 'Reset failed. The code may have expired.');
    } finally {
      setOtpLoading(false);
    }
  };

  // Step 4: Success
  if (success) {
    return (
      <AuthLayout>
        <div className="py-6 px-5 rounded-[15px] sm:rounded-[20px] bg-white dark:bg-[#0a0a0a] shadow-[-5px_5px_50px_-5px_#e1e1e1] dark:shadow-none border border-gray-100 dark:border-gray-800 text-center">
          <CheckCircle2 className="w-12 h-12 text-primary mx-auto mb-4" />
          <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-2" style={{ fontFamily: 'Afacad, sans-serif' }}>
            Password Reset Successful!
          </h2>
          <p className="text-sm mb-6" style={{ color: 'rgb(110, 130, 165)', fontFamily: 'Afacad, sans-serif' }}>
            Your password has been updated. Redirecting to sign in...
          </p>
          <Link href="/login" className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:opacity-80 transition-opacity">
            <ArrowLeft className="w-4 h-4" />
            Go to sign in now
          </Link>
        </div>
      </AuthLayout>
    );
  }

  // Step 3: New password form (after OTP verified)
  if (showPasswordForm) {
    return (
      <AuthLayout>
        <div className="mb-6 text-center lg:text-left">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2" style={{ fontFamily: 'Afacad, sans-serif' }}>
            Set New Password
          </h1>
          <p className="text-sm" style={{ color: 'rgb(110, 130, 165)', fontFamily: 'Afacad, sans-serif' }}>
            Enter your new password below
          </p>
        </div>

        {otpError && (
          <div className="mb-4 p-3 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-xl text-red-700 dark:text-red-400 text-sm flex items-start gap-2">
            <ShieldCheck className="w-5 h-5 mt-0.5 flex-shrink-0" />
            <span>{otpError}</span>
          </div>
        )}

        <div className="py-4 px-5 sm:py-5 sm:px-6 rounded-[15px] sm:rounded-[20px] bg-white dark:bg-[#0a0a0a] shadow-[-5px_5px_50px_-5px_#e1e1e1] dark:shadow-none border border-gray-100 dark:border-gray-800">
          <form onSubmit={handleResetPassword} className="space-y-4">
            <div>
              <label className="flex items-center text-sm font-medium mb-1.5" style={{ fontFamily: 'Afacad, sans-serif', color: 'rgb(71, 85, 105)' }}>
                <span className="p-1.5 rounded-full bg-blue-50 dark:bg-blue-950/40 flex items-center justify-center mr-2">
                  <Lock className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                </span>
                New Password
              </label>
              <div className="relative">
                <input
                  type={showNewPassword ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Min 8 characters"
                  required
                  autoFocus
                  autoComplete="new-password"
                  className="w-full border rounded-full border-gray-200 dark:border-gray-700 dark:bg-[#0c0c0d] dark:text-gray-100 dark:placeholder-gray-500 px-4 py-2.5 pr-12 text-base focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                  style={{ height: '40px', fontFamily: 'Afacad, sans-serif' }}
                />
                <button type="button" onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-0 top-0 h-full px-3 flex items-center justify-center rounded-r-full text-gray-400 hover:text-gray-600 transition-colors">
                  {showNewPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
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
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter new password"
                required
                autoComplete="new-password"
                className="w-full border rounded-full border-gray-200 dark:border-gray-700 dark:bg-[#0c0c0d] dark:text-gray-100 dark:placeholder-gray-500 px-4 py-2.5 text-base focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                style={{ height: '40px', fontFamily: 'Afacad, sans-serif' }}
              />
            </div>

            {passwordError && (
              <p className="text-xs text-red-500 dark:text-red-400">{passwordError}</p>
            )}

            <div className="flex items-center gap-3">
              <button
                type="submit"
                disabled={otpLoading}
                className="flex-1 inline-flex items-center justify-center gap-2 rounded-full text-sm font-medium bg-white dark:bg-gradient-to-r dark:from-[#009A44]/90 dark:to-[#009A44] border border-gray-200 dark:border-transparent text-gray-900 dark:text-white shadow-lg hover:bg-gray-50 dark:hover:opacity-90 h-10 px-4 transition-all disabled:opacity-50"
                style={{ fontFamily: 'Afacad, sans-serif' }}
              >
                {otpLoading ? <><Loader2 className="w-4 h-4 animate-spin" /> Resetting...</> : 'Reset Password'}
              </button>
              <button
                type="button"
                onClick={() => { setShowPasswordForm(false); setPasswordError(''); }}
                className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
                style={{ fontFamily: 'Afacad, sans-serif' }}
              >
                Back
              </button>
            </div>
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

  // Step 2: OTP verification
  if (showOtp) {
    return (
      <AuthLayout>
        <div className="mb-6 text-center lg:text-left">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2" style={{ fontFamily: 'Afacad, sans-serif' }}>
            Verify Your Email
          </h1>
          <p className="text-sm" style={{ color: 'rgb(110, 130, 165)', fontFamily: 'Afacad, sans-serif' }}>
            Enter the code sent to {email}
          </p>
        </div>
        <OtpVerification
          email={email}
          otp={otp}
          onOtpChange={handleOtpChange}
          onVerify={handleOtpVerify}
          onResend={handleOtpResend}
          onCancel={() => { setShowOtp(false); setError(''); }}
          loading={false}
          error={otpError}
          notification={otpNotification}
          title="Password reset verification code"
          verifyLabel="Continue"
          timerKey={otpTimerKey}
        />
        <div className="mt-6 text-center">
          <Link href="/login" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-primary transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Back to sign in
          </Link>
        </div>
      </AuthLayout>
    );
  }

  // Step 1: Email input
  return (
    <AuthLayout>
      <div className="mb-6 text-center lg:text-left">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2" style={{ fontFamily: 'Afacad, sans-serif' }}>
          Forgot Password
        </h1>
        <p className="text-sm" style={{ color: 'rgb(110, 130, 165)', fontFamily: 'Afacad, sans-serif' }}>
          No worries — enter your email and we&apos;ll send you a verification code
        </p>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-xl text-red-700 dark:text-red-400 text-sm">
          {error}
        </div>
      )}

      <div className="py-4 px-5 sm:py-5 sm:px-6 rounded-[15px] sm:rounded-[20px] bg-white dark:bg-[#0a0a0a] shadow-[-5px_5px_50px_-5px_#e1e1e1] dark:shadow-none border border-gray-100 dark:border-gray-800">
        <form onSubmit={handleSendOtp} className="space-y-4">
          <div>
            <label className="flex items-center text-sm font-medium mb-1.5" style={{ fontFamily: 'Afacad, sans-serif', color: 'rgb(71, 85, 105)' }}>
              <span className="p-1.5 rounded-full bg-blue-50 dark:bg-blue-950/40 flex items-center justify-center mr-2">
                <Mail className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              </span>
              Email Address
            </label>
            <input
              type="email" value={email} onChange={(e) => setEmail(e.target.value)}
              placeholder="afdbadmin@yopmail.com" required autoFocus autoComplete="email"
              className="w-full border rounded-full border-gray-200 dark:border-gray-700 dark:bg-[#0c0c0d] dark:text-gray-100 dark:placeholder-gray-500 px-4 py-2.5 text-base focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
              style={{ height: '40px', fontFamily: 'Afacad, sans-serif' }}
            />
          </div>

          <button
            type="submit" disabled={loading}
            className="w-full inline-flex items-center justify-center rounded-full text-sm font-medium bg-white dark:bg-gradient-to-r dark:from-primary/90 dark:to-primary border border-gray-200 dark:border-transparent text-gray-900 dark:text-white shadow-lg hover:bg-gray-50 dark:hover:opacity-90 h-10 px-4 transition-all disabled:opacity-50"
            style={{ fontFamily: 'Afacad, sans-serif' }}
          >
            {loading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Sending...</> : 'Send Verification Code'}
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
