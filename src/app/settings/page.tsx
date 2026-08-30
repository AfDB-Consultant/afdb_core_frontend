'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTheme } from 'next-themes';
import { authUtils } from '@/lib/auth';
import { User } from '@/types';
import AuthenticatedLayout from '@/components/layout/AuthenticatedLayout';
import PageLoader from '@/components/ui/PageLoader';
import api from '@/lib/api';
import { Input } from '@/components/ui/input';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  User as UserIcon,
  Bell,
  Shield,
  Globe,
  Palette,
  Save,
  Camera,
  Lock,
  Key,
  Smartphone,
  Monitor,
  Mail,
  Eye,
  EyeOff,
  Check,
  CheckCircle2,
  Loader2,
} from 'lucide-react';

type SettingsTab = 'profile' | 'notifications' | 'security' | 'regional' | 'appearance';

const tabs: { id: SettingsTab; label: string; description: string; icon: React.ElementType }[] = [
  { id: 'profile', label: 'Profile', description: 'Manage your personal information and preferences', icon: UserIcon },
  { id: 'notifications', label: 'Notifications', description: 'Configure email and push notification settings', icon: Bell },
  { id: 'security', label: 'Security', description: 'Password, MFA, and session management', icon: Shield },
  { id: 'regional', label: 'Regional', description: 'Language, timezone, and currency preferences', icon: Globe },
  { id: 'appearance', label: 'Appearance', description: 'Customize your visual preferences', icon: Palette },
];

export default function SettingsPage() {
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const [user, setUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState<SettingsTab>('profile');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  // Profile state
  const [profile, setProfile] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    jobTitle: '',
    department: '',
    bio: '',
  });

  // Notifications state
  const [notifications, setNotifications] = useState({
    emailNotifications: true,
    pushNotifications: false,
    securityAlerts: true,
    projectUpdates: true,
    weeklyDigest: false,
    marketingEmails: false,
  });

  // Security state
  const [security, setSecurity] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
    mfaEnabled: false,
  });
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);

  // 2FA OTP state
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [showOtpField, setShowOtpField] = useState(false);
  const [otpVerifying, setOtpVerifying] = useState(false);
  const [generatedOtp, setGeneratedOtp] = useState('');
  const [otpError, setOtpError] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [resendNotification, setResendNotification] = useState('');

  // Regional state
  const [regional, setRegional] = useState({
    language: 'en',
    timezone: 'Africa/Kigali',
    currency: 'USD',
    dateFormat: 'MMM DD, YYYY',
  });

  // Appearance state
  const [appearance, setAppearance] = useState({
    theme: 'dark',
    fontSize: 'medium',
    compactMode: false,
    animationsEnabled: true,
  });

  useEffect(() => {
    if (!authUtils.isAuthenticated()) { router.push('/login'); return; }
    const u = authUtils.getUser();
    setUser(u);
    if (u) {
      const userData = u as unknown as Record<string, unknown>;
      setProfile({
        firstName: u.firstName || '',
        lastName: u.lastName || '',
        email: u.email || '',
        phone: (userData.phone as string) || '',
        jobTitle: (userData.jobTitle as string) || '',
        department: (userData.department as string) || '',
        bio: (userData.bio as string) || '',
      });
    }

    // Load saved settings from localStorage
    const savedAppearance = localStorage.getItem('appearance');
    if (savedAppearance) {
      const parsed = JSON.parse(savedAppearance);
      setAppearance(parsed);
      if (parsed.theme) setTheme(parsed.theme);
      if (parsed.fontSize) {
        document.documentElement.style.setProperty('--font-size', parsed.fontSize === 'small' ? '14px' : parsed.fontSize === 'large' ? '18px' : '16px');
      }
      if (parsed.compactMode) document.documentElement.classList.add('compact-mode');
      if (parsed.animationsEnabled === false) document.documentElement.classList.add('no-animations');
    }

    const savedNotifications = localStorage.getItem('notifications');
    if (savedNotifications) setNotifications(JSON.parse(savedNotifications));

    const savedRegional = localStorage.getItem('regional');
    if (savedRegional) setRegional(JSON.parse(savedRegional));
  }, [router, setTheme]);

  // Apply theme changes immediately
  const handleThemeChange = (newTheme: string) => {
    setAppearance({ ...appearance, theme: newTheme });
    setTheme(newTheme);
    localStorage.setItem('appearance', JSON.stringify({ ...appearance, theme: newTheme }));
  };

  // Apply font size immediately
  const handleFontSizeChange = (fontSize: string) => {
    setAppearance({ ...appearance, fontSize });
    const size = fontSize === 'small' ? '14px' : fontSize === 'large' ? '18px' : '16px';
    document.documentElement.style.setProperty('--font-size', size);
    localStorage.setItem('appearance', JSON.stringify({ ...appearance, fontSize }));
  };

  // Apply compact mode immediately
  const handleCompactModeChange = (compactMode: boolean) => {
    setAppearance({ ...appearance, compactMode });
    if (compactMode) document.documentElement.classList.add('compact-mode');
    else document.documentElement.classList.remove('compact-mode');
    localStorage.setItem('appearance', JSON.stringify({ ...appearance, compactMode }));
  };

  // Apply animations immediately
  const handleAnimationsChange = (animationsEnabled: boolean) => {
    setAppearance({ ...appearance, animationsEnabled });
    if (!animationsEnabled) document.documentElement.classList.add('no-animations');
    else document.documentElement.classList.remove('no-animations');
    localStorage.setItem('appearance', JSON.stringify({ ...appearance, animationsEnabled }));
  };

  // 2FA OTP handlers
  const handleEnable2FA = async () => {
    try {
      setOtpError('');
      const response = await api.post('/auth/send-otp');
      if (response.data?.success) {
        setShowOtpField(true);
        setOtpSent(true);
        setOtp(['', '', '', '', '', '']);
        setResendNotification('');
      }
    } catch (error: any) {
      const msg = error.response?.data?.message || 'Failed to send verification code';
      setOtpError(msg);
      setShowOtpField(true);
    }
  };

  const handleDisable2FA = () => {
    setSecurity({ ...security, mfaEnabled: false });
    setShowOtpField(false);
    setOtpSent(false);
    setOtp(['', '', '', '', '', '']);
    setOtpError('');
  };

  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    setOtpError('');
    // Auto-focus next input
    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      nextInput?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`);
      prevInput?.focus();
    }
  };

  const handleVerifyOtp = async () => {
    const enteredOtp = otp.join('');
    if (enteredOtp.length !== 6) {
      setOtpError('Please enter the complete 6-digit code');
      return;
    }
    setOtpVerifying(true);
    setOtpError('');
    try {
      const response = await api.post('/auth/verify-otp', { code: enteredOtp });
      if (response.data?.success) {
        setSecurity({ ...security, mfaEnabled: true });
        setShowOtpField(false);
        setOtpSent(false);
        setOtp(['', '', '', '', '', '']);
      }
    } catch (error: any) {
      const msg = error.response?.data?.message || 'Verification failed. Please try again.';
      setOtpError(msg);
    }
    setOtpVerifying(false);
  };

  const handleResendOtp = async () => {
    try {
      setOtpError('');
      const response = await api.post('/auth/send-otp');
      if (response.data?.success) {
        setOtp(['', '', '', '', '', '']);
        setResendNotification('A new verification code has been sent to your email');
        setTimeout(() => setResendNotification(''), 5000);
      }
    } catch (error: any) {
      const msg = error.response?.data?.message || 'Failed to resend code';
      setOtpError(msg);
    }
  };

  const handleSave = async () => {
    setSaving(true);

    // Save all settings to localStorage
    localStorage.setItem('appearance', JSON.stringify(appearance));
    localStorage.setItem('notifications', JSON.stringify(notifications));
    localStorage.setItem('regional', JSON.stringify(regional));

    // Save profile to user storage
    const currentUser = authUtils.getUser();
    if (currentUser) {
      const updatedUser = { ...currentUser, ...profile };
      localStorage.setItem('afdb_user', JSON.stringify(updatedUser));
      setUser(updatedUser);
    }

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 800));

    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  if (!user) return <PageLoader />;

  const getInitials = () => {
    const first = profile.firstName?.[0] || '';
    const last = profile.lastName?.[0] || '';
    return (first + last).toUpperCase() || user.email?.[0].toUpperCase() || 'U';
  };

  return (
    <AuthenticatedLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white" style={{ fontFamily: 'Afacad, sans-serif' }}>Settings</h1>
        <p className="text-sm text-muted-foreground mt-1">Manage your account preferences</p>
      </div>
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Sidebar Navigation */}
        <div className="lg:w-64 flex-shrink-0">
          <div className="bg-white dark:bg-[rgb(15,15,15)] rounded-xl border border-gray-100 dark:border-[rgb(30,30,30)] p-2">
            <nav className="space-y-1">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-colors ${
                      isActive
                        ? 'bg-[#009A44]/10 text-[#009A44] dark:bg-[#009A44]/20'
                        : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-[rgb(25,25,25)]'
                    }`}
                  >
                    <Icon className="w-4 h-4 flex-shrink-0" />
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">{tab.label}</p>
                    </div>
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 min-w-0">
          <div className="bg-white dark:bg-[rgb(15,15,15)] rounded-xl border border-gray-100 dark:border-[rgb(30,30,30)]">
            {/* Header */}
            <div className="px-6 py-4">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white" style={{ fontFamily: 'Afacad, sans-serif' }}>
                {tabs.find(t => t.id === activeTab)?.label}
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                {tabs.find(t => t.id === activeTab)?.description}
              </p>
            </div>

            {/* Content */}
            <div className="p-6">
              {/* Profile Tab */}
              {activeTab === 'profile' && (
                <div className="space-y-6">
                  {/* Avatar Section */}
                  <div className="flex items-center gap-4">
                    <div className="relative">
                      <div className="w-20 h-20 rounded-full bg-[#009A44] flex items-center justify-center text-white text-2xl font-bold">
                        {getInitials()}
                      </div>
                      <button className="absolute bottom-0 right-0 w-7 h-7 rounded-full bg-white dark:bg-[rgb(25,25,25)] border border-gray-200 dark:border-[rgb(30,30,30)] flex items-center justify-center text-gray-500 hover:text-[#009A44] transition-colors">
                        <Camera className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">{profile.firstName} {profile.lastName}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{profile.email}</p>
                    </div>
                  </div>

                  {/* Name Fields */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">First Name</label>
                      <Input
                        value={profile.firstName}
                        onChange={(e) => setProfile({ ...profile, firstName: e.target.value })}
                        placeholder="Enter first name"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">Last Name</label>
                      <Input
                        value={profile.lastName}
                        onChange={(e) => setProfile({ ...profile, lastName: e.target.value })}
                        placeholder="Enter last name"
                      />
                    </div>
                  </div>

                  {/* Email & Phone */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">Email Address</label>
                      <Input
                        type="email"
                        value={profile.email}
                        onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                        placeholder="Enter email"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">Phone Number</label>
                      <Input
                        value={profile.phone}
                        onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                        placeholder="Enter phone number"
                      />
                    </div>
                  </div>

                  {/* Job Title & Department */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">Job Title</label>
                      <Input
                        value={profile.jobTitle}
                        onChange={(e) => setProfile({ ...profile, jobTitle: e.target.value })}
                        placeholder="Enter job title"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">Department</label>
                      <Input
                        value={profile.department}
                        onChange={(e) => setProfile({ ...profile, department: e.target.value })}
                        placeholder="Enter department"
                      />
                    </div>
                  </div>

                  {/* Bio */}
                  <div>
                    <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">Bio</label>
                    <textarea
                      value={profile.bio}
                      onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                      rows={3}
                      className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-[rgb(30,30,30)] bg-white dark:bg-[rgb(20,20,20)] text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-[#009A44]/20 focus:border-[#009A44] resize-none"
                      placeholder="Tell us about yourself..."
                    />
                  </div>
                </div>
              )}

              {/* Notifications Tab */}
              {activeTab === 'notifications' && (
                <div className="space-y-4">
                  {[
                    { key: 'emailNotifications', label: 'Email Notifications', desc: 'Receive notifications via email', icon: Mail },
                    { key: 'pushNotifications', label: 'Push Notifications', desc: 'Receive browser push notifications', icon: Bell },
                    { key: 'securityAlerts', label: 'Security Alerts', desc: 'Get notified about security events', icon: Shield },
                    { key: 'projectUpdates', label: 'Project Updates', desc: 'Notifications about project changes', icon: Monitor },
                    { key: 'weeklyDigest', label: 'Weekly Digest', desc: 'Receive a weekly summary email', icon: Mail },
                    { key: 'marketingEmails', label: 'Marketing Emails', desc: 'Receive product updates and offers', icon: Mail },
                  ].map((item) => {
                    const Icon = item.icon;
                    return (
                      <div key={item.key} className="flex items-center justify-between p-4 rounded-lg bg-gray-50 dark:bg-[rgb(20,20,20)] border border-gray-100 dark:border-[rgb(25,25,25)]">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-lg bg-white dark:bg-[rgb(15,15,15)] border border-gray-200 dark:border-[rgb(30,30,30)] flex items-center justify-center">
                            <Icon className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900 dark:text-white">{item.label}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">{item.desc}</p>
                          </div>
                        </div>
                        <button
                          onClick={() => setNotifications({ ...notifications, [item.key]: !notifications[item.key as keyof typeof notifications] })}
                          className={`relative w-11 h-6 rounded-full transition-colors ${
                            notifications[item.key as keyof typeof notifications]
                              ? 'bg-[#009A44]'
                              : 'bg-gray-200 dark:bg-[rgb(40,40,40)]'
                          }`}
                        >
                          <div className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${
                            notifications[item.key as keyof typeof notifications]
                              ? 'translate-x-[22px]'
                              : 'translate-x-0.5'
                          }`} />
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Security Tab */}
              {activeTab === 'security' && (
                <div className="space-y-6">
                  {/* Change Password */}
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                      <Lock className="w-4 h-4 text-[#009A44]" /> Change Password
                    </h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">Current Password</label>
                        <div className="relative">
                          <Input
                            type={showCurrentPassword ? 'text' : 'password'}
                            value={security.currentPassword}
                            onChange={(e) => setSecurity({ ...security, currentPassword: e.target.value })}
                            placeholder="Enter current password"
                          />
                          <button
                            type="button"
                            onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                          >
                            {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">New Password</label>
                        <div className="relative">
                          <Input
                            type={showNewPassword ? 'text' : 'password'}
                            value={security.newPassword}
                            onChange={(e) => setSecurity({ ...security, newPassword: e.target.value })}
                            placeholder="Enter new password"
                          />
                          <button
                            type="button"
                            onClick={() => setShowNewPassword(!showNewPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                          >
                            {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">Confirm New Password</label>
                        <Input
                          type="password"
                          value={security.confirmPassword}
                          onChange={(e) => setSecurity({ ...security, confirmPassword: e.target.value })}
                          placeholder="Confirm new password"
                        />
                      </div>
                    </div>
                  </div>

                  {/* MFA Section */}
                  <div className="pt-6 border-t border-gray-100 dark:border-[rgb(30,30,30)]">
                    <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                      <Smartphone className="w-4 h-4 text-[#009A44]" /> Two-Factor Authentication
                    </h3>
                    <div className="flex items-center justify-between p-4 rounded-lg bg-gray-50 dark:bg-[rgb(20,20,20)] border border-gray-100 dark:border-[rgb(25,25,25)]">
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">Enable 2FA</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Add an extra layer of security to your account</p>
                      </div>
                      <button
                        onClick={() => security.mfaEnabled ? handleDisable2FA() : handleEnable2FA()}
                        className={`relative w-11 h-6 rounded-full transition-colors ${
                          security.mfaEnabled ? 'bg-[#009A44]' : 'bg-gray-200 dark:bg-[rgb(40,40,40)]'
                        }`}
                      >
                        <div className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${
                          security.mfaEnabled ? 'translate-x-[22px]' : 'translate-x-0.5'
                        }`} />
                      </button>
                    </div>

                    {/* OTP Verification */}
                    {showOtpField && (
                      <div className="mt-4 p-4 rounded-lg bg-[#009A44]/5 dark:bg-[#009A44]/10 border border-[#009A44]/20">
                        <div className="flex items-start gap-3 mb-4">
                          <div className="w-9 h-9 rounded-lg bg-[#009A44]/10 flex items-center justify-center flex-shrink-0">
                            <Mail className="w-4 h-4 text-[#009A44]" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900 dark:text-white">Verification code sent</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                              Enter the 6-digit code sent to <span className="font-medium text-[#009A44]">{user?.email}</span>
                            </p>
                          </div>
                        </div>

                        {/* OTP Input Fields */}
                        <div className="flex items-center gap-2 mb-3">
                          {otp.map((digit, index) => (
                            <input
                              key={index}
                              id={`otp-${index}`}
                              type="text"
                              inputMode="numeric"
                              maxLength={1}
                              value={digit}
                              onChange={(e) => handleOtpChange(index, e.target.value.replace(/[^0-9]/g, ''))}
                              onKeyDown={(e) => handleOtpKeyDown(index, e)}
                              className="w-11 h-12 text-center text-lg font-semibold rounded-lg border-2 border-gray-200 dark:border-[rgb(30,30,30)] bg-white dark:bg-[rgb(15,15,15)] text-gray-900 dark:text-white focus:border-[#009A44] focus:outline-none focus:ring-2 focus:ring-[#009A44]/20 transition-colors"
                            />
                          ))}
                        </div>

                        {/* Error Message */}
                        {otpError && (
                          <p className="text-xs text-red-500 dark:text-red-400 mb-3">{otpError}</p>
                        )}

                        {/* Resend Success Notification */}
                        {resendNotification && (
                          <div className="flex items-center gap-2 mb-3 px-3 py-2 rounded-lg bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-900/30">
                            <CheckCircle2 className="w-4 h-4 text-green-600 dark:text-green-400 flex-shrink-0" />
                            <p className="text-xs font-medium text-green-700 dark:text-green-400">{resendNotification}</p>
                          </div>
                        )}

                        {/* Actions */}
                        <div className="flex items-center gap-3">
                          <button
                            onClick={handleVerifyOtp}
                            disabled={otpVerifying || otp.join('').length !== 6}
                            className="flex items-center gap-2 px-4 py-2 bg-[#009A44] text-white rounded-lg text-sm font-medium hover:bg-[#007a36] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                          >
                            {otpVerifying ? (
                              <>
                                <Loader2 className="w-3.5 h-3.5 animate-spin" /> Verifying...
                              </>
                            ) : (
                              <>
                                <Check className="w-3.5 h-3.5" /> Verify & Enable
                              </>
                            )}
                          </button>
                          <button
                            onClick={handleResendOtp}
                            className="text-sm text-[#009A44] hover:text-[#007a36] font-medium transition-colors"
                          >
                            Resend code
                          </button>
                          <button
                            onClick={() => { setShowOtpField(false); setOtpSent(false); }}
                            className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    )}

                    {/* 2FA Status */}
                    {security.mfaEnabled && !showOtpField && (
                      <div className="mt-3 flex items-center gap-2 px-4 py-2 rounded-lg bg-green-50 dark:bg-green-950/20 border border-green-100 dark:border-green-900/30">
                        <Shield className="w-4 h-4 text-green-600 dark:text-green-400" />
                        <p className="text-xs font-medium text-green-700 dark:text-green-400">Two-factor authentication is enabled</p>
                      </div>
                    )}
                  </div>

                  {/* Active Sessions */}
                  <div className="pt-6 border-t border-gray-100 dark:border-[rgb(30,30,30)]">
                    <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                      <Monitor className="w-4 h-4 text-[#009A44]" /> Active Sessions
                    </h3>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-[rgb(20,20,20)] border border-gray-100 dark:border-[rgb(25,25,25)]">
                        <div className="flex items-center gap-3">
                          <Monitor className="w-4 h-4 text-gray-400" />
                          <div>
                            <p className="text-sm font-medium text-gray-900 dark:text-white">Current Session</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">MacOS • Chrome • Active now</p>
                          </div>
                        </div>
                        <span className="text-xs text-green-600 dark:text-green-400 font-medium">Active</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Regional Tab */}
              {activeTab === 'regional' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">Language</label>
                    <Select value={regional.language} onValueChange={(val) => setRegional({ ...regional, language: val })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select language" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="en">English</SelectItem>
                        <SelectItem value="fr">Français</SelectItem>
                        <SelectItem value="sw">Kiswahili</SelectItem>
                        <SelectItem value="pt">Português</SelectItem>
                        <SelectItem value="ar">العربية</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">Timezone</label>
                    <Select value={regional.timezone} onValueChange={(val) => setRegional({ ...regional, timezone: val })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select timezone" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Africa/Kigali">Africa/Kigali (CAT, UTC+2)</SelectItem>
                        <SelectItem value="Africa/Lagos">Africa/Lagos (WAT, UTC+1)</SelectItem>
                        <SelectItem value="Africa/Cairo">Africa/Cairo (EET, UTC+2)</SelectItem>
                        <SelectItem value="Africa/Johannesburg">Africa/Johannesburg (SAST, UTC+2)</SelectItem>
                        <SelectItem value="Europe/London">Europe/London (GMT, UTC+0)</SelectItem>
                        <SelectItem value="America/New_York">America/New York (EST, UTC-5)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">Currency</label>
                    <Select value={regional.currency} onValueChange={(val) => setRegional({ ...regional, currency: val })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select currency" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="USD">USD - US Dollar ($)</SelectItem>
                        <SelectItem value="EUR">EUR - Euro (€)</SelectItem>
                        <SelectItem value="GBP">GBP - British Pound (£)</SelectItem>
                        <SelectItem value="XOF">XOF - West African CFA Franc</SelectItem>
                        <SelectItem value="XAF">XAF - Central African CFA Franc</SelectItem>
                        <SelectItem value="ZAR">ZAR - South African Rand (R)</SelectItem>
                        <SelectItem value="KES">KES - Kenyan Shilling (KSh)</SelectItem>
                        <SelectItem value="NGN">NGN - Nigerian Naira (₦)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">Date Format</label>
                    <Select value={regional.dateFormat} onValueChange={(val) => setRegional({ ...regional, dateFormat: val })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select date format" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="MMM DD, YYYY">MMM DD, YYYY (Jan 01, 2025)</SelectItem>
                        <SelectItem value="DD/MM/YYYY">DD/MM/YYYY (01/01/2025)</SelectItem>
                        <SelectItem value="MM/DD/YYYY">MM/DD/YYYY (01/01/2025)</SelectItem>
                        <SelectItem value="YYYY-MM-DD">YYYY-MM-DD (2025-01-01)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}

              {/* Appearance Tab */}
              {activeTab === 'appearance' && (
                <div className="space-y-6">
                  {/* Theme Selection */}
                  <div>
                    <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-3">Theme</label>
                    <div className="grid grid-cols-3 gap-3">
                      {[
                        { id: 'light', label: 'Light', bg: 'bg-white', border: 'border-gray-200' },
                        { id: 'dark', label: 'Dark', bg: 'bg-[rgb(15,15,15)]', border: 'border-[rgb(30,30,30)]' },
                        { id: 'system', label: 'System', bg: 'bg-gradient-to-r from-white to-[rgb(15,15,15)]', border: 'border-gray-200' },
                      ].map((themeOption) => (
                        <button
                          key={themeOption.id}
                          onClick={() => handleThemeChange(themeOption.id)}
                          className={`relative p-4 rounded-lg border-2 transition-colors ${
                            appearance.theme === themeOption.id
                              ? 'border-[#009A44]'
                              : 'border-gray-200 dark:border-[rgb(30,30,30)] hover:border-gray-300 dark:hover:border-[rgb(40,40,40)]'
                          }`}
                        >
                          <div className={`w-full h-12 rounded ${themeOption.bg} ${themeOption.border} border mb-2`} />
                          <p className="text-xs font-medium text-gray-900 dark:text-white text-center">{themeOption.label}</p>
                          {appearance.theme === themeOption.id && (
                            <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-[#009A44] flex items-center justify-center">
                              <Check className="w-3 h-3 text-white" />
                            </div>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Font Size */}
                  <div>
                    <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-3">Font Size</label>
                    <div className="flex gap-2">
                      {[
                        { id: 'small', label: 'Small', size: 'text-xs' },
                        { id: 'medium', label: 'Medium', size: 'text-sm' },
                        { id: 'large', label: 'Large', size: 'text-base' },
                      ].map((fs) => (
                        <button
                          key={fs.id}
                          onClick={() => handleFontSizeChange(fs.id)}
                          className={`flex-1 py-2 px-3 rounded-lg border text-center transition-colors ${
                            appearance.fontSize === fs.id
                              ? 'border-[#009A44] bg-[#009A44]/10 text-[#009A44]'
                              : 'border-gray-200 dark:border-[rgb(30,30,30)] text-gray-600 dark:text-gray-400 hover:border-gray-300 dark:hover:border-[rgb(40,40,40)]'
                          }`}
                        >
                          <span className={fs.size}>{fs.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Toggle Options */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-4 rounded-lg bg-gray-50 dark:bg-[rgb(20,20,20)] border border-gray-100 dark:border-[rgb(25,25,25)]">
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">Compact Mode</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Reduce spacing and padding throughout the interface</p>
                      </div>
                      <button
                        onClick={() => handleCompactModeChange(!appearance.compactMode)}
                        className={`relative w-11 h-6 rounded-full transition-colors ${
                          appearance.compactMode ? 'bg-[#009A44]' : 'bg-gray-200 dark:bg-[rgb(40,40,40)]'
                        }`}
                      >
                        <div className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${
                          appearance.compactMode ? 'translate-x-[22px]' : 'translate-x-0.5'
                        }`} />
                      </button>
                    </div>
                    <div className="flex items-center justify-between p-4 rounded-lg bg-gray-50 dark:bg-[rgb(20,20,20)] border border-gray-100 dark:border-[rgb(25,25,25)]">
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">Animations</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Enable smooth transitions and animations</p>
                      </div>
                      <button
                        onClick={() => handleAnimationsChange(!appearance.animationsEnabled)}
                        className={`relative w-11 h-6 rounded-full transition-colors ${
                          appearance.animationsEnabled ? 'bg-[#009A44]' : 'bg-gray-200 dark:bg-[rgb(40,40,40)]'
                        }`}
                      >
                        <div className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${
                          appearance.animationsEnabled ? 'translate-x-[22px]' : 'translate-x-0.5'
                        }`} />
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Footer with Save Button */}
            <div className="px-6 py-4 border-t border-gray-100 dark:border-[rgb(30,30,30)] flex items-center justify-end gap-3">
              {saved && (
                <span className="text-sm text-green-600 dark:text-green-400 flex items-center gap-1">
                  <Check className="w-4 h-4" /> Saved successfully
                </span>
              )}
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex items-center gap-2 px-4 py-2 bg-[#009A44] text-white rounded-lg text-sm font-medium hover:bg-[#007a36] disabled:opacity-50 transition-colors"
              >
                {saving ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" /> Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" /> Save Changes
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </AuthenticatedLayout>
  );
}
