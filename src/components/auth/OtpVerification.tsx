'use client';

import React, { useRef, useState, useEffect, useCallback } from 'react';
import { Loader2, CheckCircle2, Mail, Clock } from 'lucide-react';

const OTP_EXPIRY_SECONDS = 600; // 10 minutes — matches Redis TTL

interface OtpVerificationProps {
  email: string;
  otp: string[];
  onOtpChange: (index: number, value: string) => void;
  onVerify: () => void;
  onResend: () => void;
  onCancel?: () => void;
  loading: boolean;
  error: string;
  notification: string;
  title?: string;
  description?: string;
  verifyLabel?: string;
  /** Change this value to reset the countdown (e.g. after resend) */
  timerKey?: number;
}

export default function OtpVerification({
  email,
  otp,
  onOtpChange,
  onVerify,
  onResend,
  onCancel,
  loading,
  error,
  notification,
  title = 'Verification code sent',
  description,
  verifyLabel = 'Verify & Continue',
  timerKey = 0,
}: OtpVerificationProps) {
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const [secondsLeft, setSecondsLeft] = useState(OTP_EXPIRY_SECONDS);
  const [expired, setExpired] = useState(false);

  // Countdown timer
  useEffect(() => {
    setSecondsLeft(OTP_EXPIRY_SECONDS);
    setExpired(false);
  }, [timerKey]);

  useEffect(() => {
    if (secondsLeft <= 0) {
      setExpired(true);
      return;
    }
    const interval = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          setExpired(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [secondsLeft, timerKey]);

  const formatTime = useCallback((totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }, []);

  const handleChange = (index: number, value: string) => {
    const cleaned = value.replace(/[^0-9]/g, '');
    // Handle paste or multi-digit input: distribute across fields starting from current index
    if (cleaned.length > 1) {
      const digits = cleaned.slice(0, 6).split('');
      digits.forEach((d, i) => {
        if (index + i < 6) onOtpChange(index + i, d);
      });
      const lastFilled = Math.min(index + digits.length - 1, 5);
      inputRefs.current[lastFilled]?.focus();
      return;
    }
    onOtpChange(index, cleaned);
    // Clear any trailing digits after current position
    if (!cleaned) {
      for (let i = index + 1; i < 6; i++) {
        if (otp[i]) onOtpChange(i, '');
      }
    }
    if (cleaned && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace') {
      if (!otp[index] && index > 0) {
        inputRefs.current[index - 1]?.focus();
      }
      // Clear all fields from current position onward when clearing
      if (otp[index]) {
        for (let i = index; i < 6; i++) {
          if (otp[i]) onOtpChange(i, '');
        }
      }
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const pasted = e.clipboardData.getData('text').replace(/[^0-9]/g, '').slice(0, 6);
    if (pasted.length > 0) {
      pasted.split('').forEach((digit, i) => {
        onOtpChange(i, digit);
      });
      inputRefs.current[Math.min(pasted.length - 1, 5)]?.focus();
    }
  };

  const timerColor = expired
    ? 'text-red-500 dark:text-red-400'
    : secondsLeft <= 120
      ? 'text-orange-500 dark:text-orange-400'
      : 'text-gray-500 dark:text-gray-400';

  return (
    <div className="py-4 px-5 sm:py-5 sm:px-6 rounded-[15px] sm:rounded-[20px] bg-white dark:bg-[#0a0a0a] shadow-[-5px_5px_50px_-5px_#e1e1e1] dark:shadow-none border border-gray-100 dark:border-gray-800">
      {/* Header */}
      <div className="flex items-start gap-3 mb-5">
        <div className="w-10 h-10 rounded-xl bg-[#009A44]/10 flex items-center justify-center flex-shrink-0">
          <Mail className="w-5 h-5 text-[#009A44]" />
        </div>
        <div>
          <p className="text-sm font-semibold text-gray-900 dark:text-white" style={{ fontFamily: 'Afacad, sans-serif' }}>{title}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
            {description || (<>Enter the 6-digit code sent to <span className="font-medium text-[#009A44]">{email}</span></>)}
          </p>
        </div>
      </div>

      {/* OTP Inputs */}
      <div className="flex items-center gap-2 mb-3" onPaste={handlePaste}>
        {otp.map((digit, index) => (
          <input
            key={index}
            ref={(el) => { inputRefs.current[index] = el; }}
            type="text"
            inputMode="numeric"
            value={digit}
            onChange={(e) => handleChange(index, e.target.value)}
            onPaste={handlePaste}
            onKeyDown={(e) => handleKeyDown(index, e)}
            className="w-11 h-12 text-center text-lg font-semibold rounded-lg border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-[#0c0c0d] text-gray-900 dark:text-white focus:border-[#009A44] focus:outline-none focus:ring-2 focus:ring-[#009A44]/20 transition-colors"
            autoFocus={index === 0}
          />
        ))}
      </div>

      {/* Expiry Timer */}
      <div className="flex items-center justify-end gap-1.5 mb-4">
        <Clock className={`w-3.5 h-3.5 ${timerColor} flex-shrink-0`} />
        <span className={`text-xs font-semibold tabular-nums ${timerColor}`} style={{ fontFamily: 'Afacad, sans-serif' }}>
          {expired ? 'Code expired — please resend' : `Expires in ${formatTime(secondsLeft)}`}
        </span>
      </div>

      {/* Error */}
      {error && (
        <p className="text-xs text-red-500 dark:text-red-400 mb-3">{error}</p>
      )}

      {/* Resend Notification */}
      {notification && (
        <div className="flex items-center gap-2 mb-3 px-3 py-2 rounded-lg bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-900/30">
          <CheckCircle2 className="w-4 h-4 text-green-600 dark:text-green-400 flex-shrink-0" />
          <p className="text-xs font-medium text-green-700 dark:text-green-400">{notification}</p>
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center gap-3">
        <button
          onClick={onVerify}
          disabled={loading || expired || otp.join('').length !== 6}
          className="flex-1 inline-flex items-center justify-center gap-2 rounded-full text-sm font-medium bg-white dark:bg-gradient-to-r dark:from-[#009A44]/90 dark:to-[#009A44] border border-gray-200 dark:border-transparent text-gray-900 dark:text-white shadow-lg hover:bg-gray-50 dark:hover:opacity-90 h-10 px-4 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          style={{ fontFamily: 'Afacad, sans-serif' }}
        >
          {loading ? (
            <><Loader2 className="w-4 h-4 animate-spin" /> Verifying...</>
          ) : expired ? (
            'Code Expired'
          ) : (
            verifyLabel
          )}
        </button>
        <button
          onClick={onResend}
          disabled={loading}
          className="text-sm text-[#009A44] hover:text-[#007a36] font-medium transition-colors disabled:opacity-50"
          style={{ fontFamily: 'Afacad, sans-serif' }}
        >
          Resend
        </button>
        {onCancel && (
          <button
            onClick={onCancel}
            className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
            style={{ fontFamily: 'Afacad, sans-serif' }}
          >
            Cancel
          </button>
        )}
      </div>
    </div>
  );
}
