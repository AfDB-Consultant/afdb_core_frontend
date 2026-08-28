'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import AuthLayout from '@/components/layout/AuthLayout';
import axios from 'axios';

const BETA_API = process.env.NEXT_PUBLIC_BETA_API_URL || 'http://localhost:4000/api/v1';
import { User, Mail, Lock, Eye, EyeOff, Loader2, ShieldCheck } from 'lucide-react';

export default function SignupPage() {
  const router = useRouter();
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', password: '', confirmPassword: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const update = (field: string, value: string) => setForm((p) => ({ ...p, [field]: value }));

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) { setError('Passwords do not match'); return; }
    if (form.password.length < 8) { setError('Password must be at least 8 characters'); return; }
    setLoading(true);
    setError('');

    try {
      await axios.post(`${BETA_API}/auth/register`, {
        firstName: form.firstName,
        lastName: form.lastName,
        email: form.email,
        password: form.password,
      });
      router.push('/login?registered=true');
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { message?: string } } };
      setError(axiosErr.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

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
                  <User className="w-4 h-4 text-blue-600 dark:text-blue-400" />
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

          {/* Password */}
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

          {/* Confirm Password */}
          <div>
            <label className="flex items-center text-sm font-medium mb-1.5" style={{ fontFamily: 'Afacad, sans-serif', color: 'rgb(71, 85, 105)' }}>
              <span className="p-1.5 rounded-full bg-blue-50 dark:bg-blue-950/40 flex items-center justify-center mr-2">
                <Lock className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              </span>
              Confirm Password
            </label>
            <input
              type="password" value={form.confirmPassword} onChange={(e) => update('confirmPassword', e.target.value)}
              placeholder="Re-enter password" required autoComplete="new-password"
              className="w-full border rounded-full border-gray-200 dark:border-gray-700 dark:bg-[#0c0c0d] dark:text-gray-100 dark:placeholder-gray-500 px-4 py-2.5 text-base focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
              style={{ height: '40px', fontFamily: 'Afacad, sans-serif' }}
            />
          </div>

          <button
            type="submit" disabled={loading}
            className="w-full inline-flex items-center justify-center rounded-full text-sm font-medium bg-white dark:bg-gradient-to-r dark:from-primary/90 dark:to-primary border border-gray-200 dark:border-transparent text-gray-900 dark:text-white shadow-lg hover:bg-gray-50 dark:hover:opacity-90 h-10 px-4 transition-all disabled:opacity-50"
            style={{ fontFamily: 'Afacad, sans-serif' }}
          >
            {loading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Creating account...</> : 'Create Account'}
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
