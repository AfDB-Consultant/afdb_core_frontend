'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { authUtils } from '@/lib/auth';
import { User } from '@/types';
import AuthenticatedLayout from '@/components/layout/AuthenticatedLayout';
import PageLoader from '@/components/ui/PageLoader';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  Activity, Shield, AlertTriangle, Users, RefreshCw,
  Filter, ChevronDown, ChevronUp, X,
  LogIn, LogOut, UserPlus, Key, ShieldAlert, ShieldCheck,
  Monitor, Clock, Globe, BarChart3, TrendingUp, PieChart as PieChartIcon,
} from 'lucide-react';

const CORE_API = process.env.NEXT_PUBLIC_CORE_API_URL || 'http://localhost:4001/api/v1';

interface ActivityEvent {
  _id: string;
  action: string;
  entityType: string;
  userId: string;
  userName: string;
  userEmail: string;
  details: Record<string, unknown>;
  ipAddress: string;
  userAgent: string;
  severity: 'info' | 'warning' | 'critical';
  source: string;
  status: 'success' | 'failure';
  createdAt: string;
}

interface Stats {
  totalEvents24h: number;
  totalEvents7d: number;
  activeUsersCount: number;
  failedAttempts24h: number;
  criticalAlerts24h: number;
  actionBreakdown: { action: string; count: number }[];
  severityBreakdown: { severity: string; count: number }[];
  hourlyActivity: { hour: string; count: number }[];
}

const actionLabels: Record<string, { label: string; icon: React.ElementType; color: string }> = {
  'auth.login': { label: 'Login', icon: LogIn, color: '#16A34A' },
  'auth.login_failed': { label: 'Login Failed', icon: AlertTriangle, color: '#DC2626' },
  'auth.account_locked': { label: 'Account Locked', icon: ShieldAlert, color: '#DC2626' },
  'auth.mfa_verified': { label: 'MFA Verified', icon: ShieldCheck, color: '#16A34A' },
  'auth.mfa_failed': { label: 'MFA Failed', icon: AlertTriangle, color: '#DC2626' },
  'auth.mfa_enabled': { label: 'MFA Enabled', icon: Shield, color: '#2563EB' },
  'auth.mfa_disabled': { label: 'MFA Disabled', icon: Shield, color: '#F59E0B' },
  'auth.signup': { label: 'Signup', icon: UserPlus, color: '#16A34A' },
  'auth.password_changed': { label: 'Password Changed', icon: Key, color: '#2563EB' },
  'auth.token_refresh': { label: 'Token Refresh', icon: RefreshCw, color: '#6B7280' },
  'auth.logout': { label: 'Logout', icon: LogOut, color: '#6B7280' },
  'auth.sso_login': { label: 'SSO Login', icon: Globe, color: '#16A34A' },
  'auth.sso_failed': { label: 'SSO Failed', icon: AlertTriangle, color: '#DC2626' },
  'auth.sso_provisioned': { label: 'SSO Provisioned', icon: UserPlus, color: '#2563EB' },
  'auth.backup_codes_regenerated': { label: 'Backup Codes', icon: Key, color: '#F59E0B' },
};

const severityStyles = {
  info: { bg: 'bg-emerald-50 dark:bg-emerald-950/30', text: 'text-emerald-700 dark:text-emerald-400', dot: 'bg-emerald-500' },
  warning: { bg: 'bg-amber-50 dark:bg-amber-950/30', text: 'text-amber-700 dark:text-amber-400', dot: 'bg-amber-500' },
  critical: { bg: 'bg-red-50 dark:bg-red-950/30', text: 'text-red-700 dark:text-red-400', dot: 'bg-red-500' },
};

const severityColors: Record<string, string> = {
  info: '#10b981',
  warning: '#f59e0b',
  critical: '#ef4444',
};

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

export default function MonitoringPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [activities, setActivities] = useState<ActivityEvent[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filterAction, setFilterAction] = useState('');
  const [filterSeverity, setFilterSeverity] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [selectedUser, setSelectedUser] = useState<{ id: string; name: string } | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  const getCoreApi = useCallback(() => {
    const token = authUtils.getAccessToken();
    return axios.create({
      baseURL: CORE_API,
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    });
  }, []);

  useEffect(() => {
    if (!authUtils.isAuthenticated()) { router.push('/login'); return; }
    setUser(authUtils.getUser());
  }, [router]);

  const fetchActivities = useCallback(async () => {
    try {
      const api = getCoreApi();
      const params: Record<string, string> = { page: String(page), limit: '30' };
      if (filterAction) params.action = filterAction;
      if (filterSeverity) params.severity = filterSeverity;
      if (filterStatus) params.status = filterStatus;
      if (selectedUser) params.userId = selectedUser.id;

      const res = await api.get('/activities', { params });
      setActivities(res.data.data || []);
      setTotalPages(res.data.pagination?.pages || 1);
    } catch (err) {
      console.error('Failed to fetch activities:', err);
    } finally {
      setLoading(false);
    }
  }, [getCoreApi, page, filterAction, filterSeverity, filterStatus, selectedUser]);

  const fetchStats = useCallback(async () => {
    try {
      const api = getCoreApi();
      const res = await api.get('/activities/stats');
      setStats(res.data.data);
    } catch (err) {
      console.error('Failed to fetch stats:', err);
    }
  }, [getCoreApi]);

  useEffect(() => {
    if (!user) return;
    setLoading(true);
    fetchActivities();
    fetchStats();
  }, [user, fetchActivities, fetchStats]);

  const clearFilters = () => {
    setFilterAction('');
    setFilterSeverity('');
    setFilterStatus('');
    setSelectedUser(null);
    setPage(1);
  };

  if (!user) return <PageLoader />;

  // KPI Component
  const Kpi = ({ title, value, subtitle, color, icon: Icon }: { title: string; value: number; subtitle: string; color: string; icon: React.ElementType }) => {
    const gradients: Record<string, string> = {
      blue: 'bg-gradient-to-br from-blue-500 to-blue-600 dark:from-blue-600 dark:to-blue-700',
      green: 'bg-gradient-to-br from-emerald-500 to-emerald-600 dark:from-emerald-600 dark:to-emerald-700',
      amber: 'bg-gradient-to-br from-amber-500 to-amber-600 dark:from-amber-600 dark:to-amber-700',
      red: 'bg-gradient-to-br from-rose-500 to-rose-600 dark:from-rose-600 dark:to-rose-700',
    };
    return (
      <div className={`relative overflow-hidden ${gradients[color]} text-white rounded-xl border-0 shadow-sm hover:shadow-lg transition-shadow`}>
        <div className="p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-white/90">{title}</span>
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/20">
              <Icon className="h-5 w-5 text-white" />
            </div>
          </div>
          <div className="text-3xl font-bold text-white">{value}</div>
          <p className="text-xs text-white/80 mt-1">{subtitle}</p>
        </div>
      </div>
    );
  };

  const maxHourly = stats?.hourlyActivity ? Math.max(...stats.hourlyActivity.map(h => h.count), 1) : 1;
  const totalSeverity = stats?.severityBreakdown ? stats.severityBreakdown.reduce((sum, s) => sum + s.count, 0) : 1;

  return (
    <AuthenticatedLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2" style={{ fontFamily: 'Afacad, sans-serif' }}>
              <Monitor className="w-5 h-5 text-primary" />
              Activity Monitor
            </h1>
            <p className="text-sm text-muted-foreground mt-1">Diagnostic tool — real-time user activity from the Beta auth portal</p>
          </div>
          <div className="flex items-center gap-2">
            {/* Active filter tags */}
            {selectedUser && (
              <span className="inline-flex items-center gap-1 px-2 py-1 text-[11px] font-medium bg-blue-50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-400 rounded-full">
                <Users className="w-3 h-3" /> {selectedUser.name}
                <button onClick={() => setSelectedUser(null)} className="ml-0.5 hover:text-blue-900"><X className="w-3 h-3" /></button>
              </span>
            )}
            {filterAction && (
              <span className="inline-flex items-center gap-1 px-2 py-1 text-[11px] font-medium bg-gray-100 dark:bg-[rgb(20,20,20)] text-gray-700 dark:text-gray-300 rounded-full">
                {actionLabels[filterAction]?.label || filterAction}
                <button onClick={() => setFilterAction('')} className="ml-0.5 hover:text-gray-900"><X className="w-3 h-3" /></button>
              </span>
            )}
            {(filterAction || filterSeverity || filterStatus || selectedUser) && (
              <button onClick={clearFilters} className="text-[11px] text-gray-400 hover:text-gray-600 underline mr-1">Clear all</button>
            )}
            {/* Filters button */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors ${
                showFilters || filterAction || filterSeverity || filterStatus || selectedUser
                  ? 'text-primary border-primary/30 bg-primary/5'
                  : 'text-gray-600 dark:text-gray-300 border-gray-200 dark:border-[rgb(30,30,30)] bg-white dark:bg-[rgb(15,15,15)]'
              }`}
            >
              <Filter className="w-3 h-3" /> Filters
              {(filterAction || filterSeverity || filterStatus || selectedUser) && (
                <span className="w-4 h-4 rounded-full bg-primary text-white text-[9px] flex items-center justify-center">
                  {[filterAction, filterSeverity, filterStatus, selectedUser].filter(Boolean).length}
                </span>
              )}
              {showFilters ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            </button>
            {/* Refresh button */}
            <button
              onClick={() => { setPage(1); fetchActivities(); fetchStats(); }}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-600 dark:text-gray-300 bg-white dark:bg-[rgb(15,15,15)] border border-gray-200 dark:border-[rgb(30,30,30)] rounded-lg hover:bg-gray-50 dark:hover:bg-[rgb(25,25,25)] transition-colors"
            >
              <RefreshCw className="w-3 h-3" /> Refresh
            </button>
          </div>
        </div>

        {/* Filter dropdown panel */}
        {showFilters && (
          <div className="bg-white dark:bg-[rgb(15,15,15)] rounded-xl border border-gray-100 dark:border-[rgb(30,30,30)] p-4 grid grid-cols-2 md:grid-cols-3 gap-3">
            <div>
              <label className="text-[11px] font-medium text-gray-500 dark:text-gray-400 mb-1 block">Action Type</label>
              <Select value={filterAction || 'all'} onValueChange={(val) => { setFilterAction(val === 'all' ? '' : val); setPage(1); }}>
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue placeholder="All actions" />
                </SelectTrigger>
                <SelectContent searchable>
                  <SelectItem value="all">All actions</SelectItem>
                  {Object.entries(actionLabels).map(([key, val]) => (
                    <SelectItem key={key} value={key}>{val.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-[11px] font-medium text-gray-500 dark:text-gray-400 mb-1 block">Severity</label>
              <Select value={filterSeverity || 'all'} onValueChange={(val) => { setFilterSeverity(val === 'all' ? '' : val); setPage(1); }}>
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue placeholder="All severities" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All severities</SelectItem>
                  <SelectItem value="info">Info</SelectItem>
                  <SelectItem value="warning">Warning</SelectItem>
                  <SelectItem value="critical">Critical</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-[11px] font-medium text-gray-500 dark:text-gray-400 mb-1 block">Status</label>
              <Select value={filterStatus || 'all'} onValueChange={(val) => { setFilterStatus(val === 'all' ? '' : val); setPage(1); }}>
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue placeholder="All statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All statuses</SelectItem>
                  <SelectItem value="success">Success</SelectItem>
                  <SelectItem value="failure">Failure</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        )}

        {/* KPI Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Kpi title="Events (24h)" value={stats?.totalEvents24h ?? 0} subtitle="Last 24 hours" icon={Activity} color="blue" />
          <Kpi title="Active Users" value={stats?.activeUsersCount ?? 0} subtitle="Currently active" icon={Users} color="green" />
          <Kpi title="Failed Attempts" value={stats?.failedAttempts24h ?? 0} subtitle="Requires attention" icon={AlertTriangle} color="amber" />
          <Kpi title="Critical Alerts" value={stats?.criticalAlerts24h ?? 0} subtitle="Immediate action needed" icon={Shield} color="red" />
        </div>

        {/* Charts Grid */}
        {stats && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Bar Chart - Hourly Activity */}
            <div className="lg:col-span-2 bg-white dark:bg-[rgb(15,15,15)] rounded-xl border border-gray-100 dark:border-[rgb(30,30,30)] shadow-sm hover:shadow-md transition-shadow">
              <div className="p-5 border-b border-gray-100 dark:border-[rgb(30,30,30)]">
                <h3 className="text-base font-semibold text-foreground flex items-center gap-2" style={{ fontFamily: 'Afacad, sans-serif' }}>
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 text-white">
                    <TrendingUp className="h-4 w-4" />
                  </div>
                  Hourly Activity (24h)
                </h3>
              </div>
              <div className="p-5">
                {stats.hourlyActivity.length > 0 ? (
                  <div className="flex items-end justify-between h-32 gap-0.5">
                    {stats.hourlyActivity.map((item) => (
                      <div key={item.hour} className="flex flex-col items-center flex-1">
                        <div className="w-full relative flex items-end justify-center" style={{ height: '100px' }}>
                          <div
                            className="w-full max-w-[16px] bg-gradient-to-t from-blue-500 to-blue-400 rounded-t-sm hover:from-blue-600 hover:to-blue-500 transition-colors cursor-pointer"
                            style={{ height: `${(item.count / maxHourly) * 100}%` }}
                            title={`${item.hour}: ${item.count} events`}
                          />
                        </div>
                        <span className="text-[8px] text-gray-500 dark:text-gray-400 mt-1 hidden sm:block">
                          {item.hour.split(':')[0]}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="h-32 flex items-center justify-center text-gray-400 text-sm">No hourly data available</div>
                )}
              </div>
            </div>

            {/* Pie Chart - Severity Distribution */}
            <div className="bg-white dark:bg-[rgb(15,15,15)] rounded-xl border border-gray-100 dark:border-[rgb(30,30,30)] shadow-sm hover:shadow-md transition-shadow">
              <div className="p-5 border-b border-gray-100 dark:border-[rgb(30,30,30)]">
                <h3 className="text-base font-semibold text-foreground flex items-center gap-2" style={{ fontFamily: 'Afacad, sans-serif' }}>
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500 to-violet-600 text-white">
                    <PieChartIcon className="h-4 w-4" />
                  </div>
                  Severity Distribution
                </h3>
              </div>
              <div className="p-5">
                {stats.severityBreakdown.length > 0 ? (
                  <>
                    {/* Simple CSS Pie Chart */}
                    <div className="flex items-center justify-center mb-4">
                      <div className="relative w-24 h-24">
                        <svg viewBox="0 0 100 100" className="transform -rotate-90">
                          {stats.severityBreakdown.reduce<{ elements: React.ReactNode[]; offset: number }>((acc, item, i) => {
                            const circumference = Math.PI * 2 * 40;
                            const percentage = (item.count / totalSeverity) * 100;
                            const strokeLength = (percentage / 100) * circumference;
                            const strokeOffset = -acc.offset;
                            acc.elements.push(
                              <circle
                                key={i}
                                cx="50"
                                cy="50"
                                r="40"
                                fill="none"
                                stroke={severityColors[item.severity] || '#6b7280'}
                                strokeWidth="20"
                                strokeDasharray={`${strokeLength} ${circumference - strokeLength}`}
                                strokeDashoffset={strokeOffset}
                              />
                            );
                            acc.offset += strokeLength;
                            return acc;
                          }, { elements: [], offset: 0 }).elements}
                        </svg>
                      </div>
                    </div>
                    <div className="space-y-2">
                      {stats.severityBreakdown.map((item) => (
                        <div key={item.severity} className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: severityColors[item.severity] || '#6b7280' }} />
                            <span className="text-xs text-gray-600 dark:text-gray-400 capitalize">{item.severity}</span>
                          </div>
                          <span className="text-xs font-medium text-gray-900 dark:text-white">{item.count}</span>
                        </div>
                      ))}
                    </div>
                  </>
                ) : (
                  <div className="h-32 flex items-center justify-center text-gray-400 text-sm">No severity data available</div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Action Breakdown - Horizontal Bar Chart Style */}
        {stats && stats.actionBreakdown.length > 0 && (
          <div className="bg-white dark:bg-[rgb(15,15,15)] rounded-xl border border-gray-100 dark:border-[rgb(30,30,30)] shadow-sm hover:shadow-md transition-shadow">
            <div className="p-5 border-b border-gray-100 dark:border-[rgb(30,30,30)]">
              <h3 className="text-base font-semibold text-foreground flex items-center gap-2" style={{ fontFamily: 'Afacad, sans-serif' }}>
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-500 to-emerald-600 text-white">
                  <BarChart3 className="h-4 w-4" />
                </div>
                Event Breakdown (24h)
              </h3>
            </div>
            <div className="p-5">
              <div className="space-y-3">
                {stats.actionBreakdown.slice(0, 8).map((item) => {
                  const meta = actionLabels[item.action];
                  const maxCount = Math.max(...stats.actionBreakdown.map(a => a.count));
                  return (
                    <button
                      key={item.action}
                      onClick={() => { setFilterAction(item.action); setPage(1); }}
                      className="w-full text-left"
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{meta?.label || item.action}</span>
                        <span className="text-sm text-gray-500 dark:text-gray-400">{item.count}</span>
                      </div>
                      <div className="h-2 bg-gray-100 dark:bg-[rgb(20,20,20)] rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{ width: `${(item.count / maxCount) * 100}%`, backgroundColor: meta?.color || '#6b7280' }}
                        />
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Activity Feed */}
        <div className="bg-white dark:bg-[rgb(15,15,15)] rounded-xl border border-gray-100 dark:border-[rgb(30,30,30)] shadow-sm hover:shadow-md transition-shadow">
          <div className="p-5 border-b border-gray-100 dark:border-[rgb(30,30,30)] flex items-center justify-between">
            <h3 className="text-base font-semibold text-foreground flex items-center gap-2" style={{ fontFamily: 'Afacad, sans-serif' }}>
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-slate-500 to-slate-600 text-white">
                <Clock className="h-4 w-4" />
              </div>
              Activity Feed
            </h3>
            <span className="text-xs text-muted-foreground">Page {page} of {totalPages}</span>
          </div>

          {loading ? (
            <div className="p-8 text-center text-muted-foreground text-sm">Loading activity data...</div>
          ) : activities.length === 0 ? (
            <div className="p-8 text-center">
              <Activity className="w-8 h-8 text-gray-300 dark:text-gray-600 mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">No activity events found</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-50 dark:divide-gray-700/50">
              {activities.map((event) => {
                const meta = actionLabels[event.action] || { label: event.action, icon: Activity, color: '#6B7280' };
                const Icon = meta.icon;
                const sev = severityStyles[event.severity] || severityStyles.info;

                return (
                  <div key={event._id} className="px-5 py-4 hover:bg-gray-50/50 dark:hover:bg-[rgb(25,25,25)]/30 transition-colors">
                    <div className="flex items-start gap-3">
                      {/* Icon */}
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5 ${
                        event.status === 'failure' ? 'bg-red-50 dark:bg-red-950/30' : 'bg-gray-50 dark:bg-[rgb(20,20,20)]'
                      }`}>
                        <Icon className="w-4 h-4" style={{ color: event.status === 'failure' ? '#DC2626' : meta.color }} />
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-sm font-medium text-foreground">{meta.label}</span>
                          <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-medium ${sev.bg} ${sev.text}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${sev.dot}`} />
                            {event.severity}
                          </span>
                          {event.status === 'failure' && (
                            <span className="px-1.5 py-0.5 rounded-full text-[10px] font-medium bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400">
                              Failed
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <button
                            onClick={() => setSelectedUser({ id: event.userId, name: event.userName })}
                            className="text-xs text-blue-600 dark:text-blue-400 hover:underline font-medium"
                          >
                            {event.userName}
                          </button>
                          <span className="text-xs text-muted-foreground">{event.userEmail}</span>
                        </div>
                        <div className="flex items-center gap-3 mt-1">
                          {event.ipAddress && (
                            <span className="text-[10px] text-gray-400 dark:text-gray-500 flex items-center gap-0.5">
                              <Globe className="w-2.5 h-2.5" /> {event.ipAddress}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Time */}
                      <div className="flex-shrink-0 text-right">
                        <span className="text-xs text-muted-foreground">{timeAgo(event.createdAt)}</span>
                        <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-0.5">
                          {new Date(event.createdAt).toLocaleDateString()} {new Date(event.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="px-5 py-3 border-t border-gray-100 dark:border-[rgb(30,30,30)] flex items-center justify-between">
              <button
                onClick={() => setPage(Math.max(1, page - 1))}
                disabled={page === 1}
                className="text-xs px-3 py-1 rounded-lg border border-gray-200 dark:border-[rgb(30,30,30)] text-gray-600 dark:text-gray-300 disabled:opacity-40 hover:bg-gray-50 dark:hover:bg-[rgb(25,25,25)] transition-colors"
              >
                Previous
              </button>
              <button
                onClick={() => setPage(Math.min(totalPages, page + 1))}
                disabled={page === totalPages}
                className="text-xs px-3 py-1 rounded-lg border border-gray-200 dark:border-[rgb(30,30,30)] text-gray-600 dark:text-gray-300 disabled:opacity-40 hover:bg-gray-50 dark:hover:bg-[rgb(25,25,25)] transition-colors"
              >
                Next
              </button>
            </div>
          )}
        </div>
      </div>
    </AuthenticatedLayout>
  );
}
