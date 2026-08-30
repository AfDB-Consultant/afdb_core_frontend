'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { authUtils } from '@/lib/auth';
import { User } from '@/types';
import AuthenticatedLayout from '@/components/layout/AuthenticatedLayout';
import { useWeather } from '@/hooks/useWeather';
import PageLoader from '@/components/ui/PageLoader';
import coreApi from '@/lib/coreApi';
import {
  FolderKanban,
  DollarSign,
  Globe2,
  Users,
  Activity,
  CheckCircle2,
  AlertTriangle,
  FileText,
  BarChart3,
  Settings,
  Shield,
  Lock,
  Sunrise,
  Sun,
  Moon,
  TrendingUp,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

// Glass-style Tooltip Component (inspired by accounting_module)
const GlassTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const isDark = document.documentElement.classList.contains('dark');
    
    return (
      <div
        className="backdrop-blur-xl rounded-xl shadow-xl"
        style={{
          padding: '10px 15px',
          backdropFilter: 'blur(12px)',
          backgroundColor: isDark ? 'rgba(30, 30, 40, 0.7)' : 'rgba(255, 255, 255, 0.2)',
          border: isDark ? '1px solid rgba(255, 255, 255, 0.15)' : '1px solid rgba(255, 255, 255, 0.3)',
          boxShadow: isDark ? '0 4px 30px rgba(0, 0, 0, 0.4)' : '0 4px 30px rgba(0, 0, 0, 0.1)',
        }}
      >
        {label && (
          <p
            className="label"
            style={{ color: isDark ? '#f3f4f6' : '#000', fontWeight: 'bold', marginBottom: '6px', fontSize: '13px' }}
          >{`${label}`}</p>
        )}
        {payload.map((entry: any, index: number) => (
          <p
            key={index}
            style={{ color: isDark ? '#e5e7eb' : '#374151', margin: '4px 0', fontSize: '12px' }}
          >
            <span style={{ display: 'inline-flex', alignItems: 'center' }}>
              <span
                className="w-2.5 h-2.5 rounded-full mr-2"
                style={{ backgroundColor: entry.color }}
              ></span>
              {`${entry.name}: ${entry.value}`}
            </span>
          </p>
        ))}
      </div>
    );
  }
  return null;
};

// Custom Legend Component with toggle functionality
interface CustomLegendProps {
  payload?: Array<{ value: string; color: string }>;
  hiddenSeries?: Set<string>;
  onToggleSeries?: (value: string) => void;
}

const CustomLegend = ({ payload, hiddenSeries, onToggleSeries }: CustomLegendProps) => {
  const isDark = document.documentElement.classList.contains('dark');
  return (
    <div className="flex justify-center flex-wrap gap-4 mt-2 mb-1">
      {payload?.map((entry: any, index: number) => {
        const isHidden = hiddenSeries?.has(entry.value);
        return (
          <div
            key={`legend-${index}`}
            className="flex items-center gap-1.5 cursor-pointer hover:opacity-80 transition-opacity"
            onClick={() => onToggleSeries?.(entry.value)}
            style={{ opacity: isHidden ? 0.4 : 1 }}
          >
            <div
              className="w-2.5 h-2.5 rounded-full"
              style={{ backgroundColor: entry.color }}
            />
            <span
              className="text-xs font-medium"
              style={{ color: isDark ? '#9ca3af' : '#6b7280', textDecoration: isHidden ? 'line-through' : 'none' }}
            >
              {entry.value}
            </span>
          </div>
        );
      })}
    </div>
  );
};

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [hiddenAreaSeries, setHiddenAreaSeries] = useState<Set<string>>(new Set());
  const [hiddenBarSeries, setHiddenBarSeries] = useState<Set<string>>(new Set());
  const [dashStats, setDashStats] = useState<{ activeProjects: number; totalProjects: number; totalBudget: number; countriesCount: number; recentActivity: { action: string; timestamp: string; user: string; entityType: string }[] } | null>(null);
  const [teamTotal, setTeamTotal] = useState(0);
  const { data: weatherData, isLoading: weatherLoading, isError: weatherError } = useWeather();

  // Toggle series visibility for Area Chart
  const toggleAreaSeries = (value: string) => {
    const newHidden = new Set(hiddenAreaSeries);
    if (newHidden.has(value)) {
      newHidden.delete(value);
    } else {
      newHidden.add(value);
    }
    setHiddenAreaSeries(newHidden);
  };

  // Toggle series visibility for Bar Chart
  const toggleBarSeries = (value: string) => {
    const newHidden = new Set(hiddenBarSeries);
    if (newHidden.has(value)) {
      newHidden.delete(value);
    } else {
      newHidden.add(value);
    }
    setHiddenBarSeries(newHidden);
  };

  useEffect(() => {
    if (!authUtils.isAuthenticated()) {
      router.push('/login');
      return;
    }
    setUser(authUtils.getUser());
    // Fetch real dashboard stats from core API
    coreApi.get('/dashboard/stats').then(res => {
      if (res.data.success) setDashStats(res.data.data);
    }).catch(() => {});
    coreApi.get('/team', { params: { limit: 1 } }).then(res => {
      if (res.data.success) setTeamTotal(res.data.pagination.total);
    }).catch(() => {});
  }, [router]);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  if (!user) return <PageLoader />;

  const userInitials = user.firstName?.[0] && user.lastName?.[0]
    ? `${user.firstName[0]}${user.lastName[0]}`
    : 'U';

  // Greeting based on time of day
  const getGreeting = () => {
    const hour = currentTime.getHours();
    if (hour < 6) {
      return { greeting: 'Good Morning', Icon: Sunrise, color: '#FFD700' };
    } else if (hour < 12) {
      return { greeting: 'Good Morning', Icon: Sun, color: '#FFD700' };
    } else if (hour < 18) {
      return { greeting: 'Good Afternoon', Icon: Sun, color: '#FFD700' };
    } else {
      return { greeting: 'Good Evening', Icon: Moon, color: '#FFD700' };
    }
  };

  const { greeting, Icon: GreetingIcon } = getGreeting();

  // Time formatting
  const hours = currentTime.getHours();
  const minutes = currentTime.getMinutes();
  const displayHours = hours % 12 || 12;
  const period = hours >= 12 ? 'PM' : 'AM';
  const shortDate = currentTime.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  const formatBudget = (val: number) => {
    if (val >= 1_000_000_000) return `$${(val / 1_000_000_000).toFixed(1)}B`;
    if (val >= 1_000_000) return `$${(val / 1_000_000).toFixed(0)}M`;
    return `$${val}`;
  };

  const stats = [
    { title: 'Active Projects', value: dashStats ? String(dashStats.activeProjects) : '—', subtitle: dashStats ? `Across ${dashStats.countriesCount} countries` : 'Loading...', icon: FolderKanban, color: 'green' },
    { title: 'Total Budget', value: dashStats ? formatBudget(dashStats.totalBudget) : '—', subtitle: `${dashStats?.totalProjects ?? '—'} total projects`, icon: DollarSign, color: 'blue' },
    { title: 'Team Members', value: teamTotal ? String(teamTotal) : '—', subtitle: 'Across all departments', icon: Users, color: 'purple' },
    { title: 'Countries', value: dashStats ? String(dashStats.countriesCount) : '—', subtitle: 'Active operations', icon: Globe2, color: 'amber' },
  ];

  const quickAccessModules = [
    { name: 'Projects', icon: FolderKanban, href: '/projects', active: true },
    { name: 'Reports', icon: FileText, href: '/reports', active: true },
    { name: 'Analytics', icon: BarChart3, href: '/analytics', active: true },
    { name: 'Team', icon: Users, href: '/team', active: true },
    { name: 'Settings', icon: Settings, href: '/settings', active: true },
    { name: 'API Docs', icon: Shield, href: 'http://localhost:4000/api-docs', active: false, external: true },
  ];

  const recentActivity = dashStats?.recentActivity?.length
    ? dashStats.recentActivity.map((a) => ({
        action: a.action || a.entityType,
        project: a.user || 'System',
        time: a.timestamp ? new Date(a.timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'Recently',
        status: 'active' as const,
      }))
    : [
        { action: 'Project proposal submitted', project: 'East Africa Transport Corridor', time: '2 hours ago', status: 'active' as const },
        { action: 'Budget review completed', project: 'West Africa Power Pool', time: '5 hours ago', status: 'completed' as const },
        { action: 'New team member added', project: 'Sahel Region Development', time: '1 day ago', status: 'active' as const },
        { action: 'Quarterly report generated', project: 'North Africa Infrastructure', time: '2 days ago', status: 'completed' as const },
        { action: 'Risk assessment updated', project: 'Central Africa Digital Initiative', time: '3 days ago', status: 'review' as const },
      ];

  const systemStatus = [
    { name: 'Authentication Service', status: 'Operational', healthy: true },
    { name: 'Core Data Engine', status: 'Operational', healthy: true },
    { name: 'SSO-IDP Federation', status: 'Operational', healthy: true },
    { name: 'FileNet Integration', status: 'Maintenance', healthy: false },
  ];

  // Chart data
  const budgetTrendData = [
    { month: 'Jan', disbursement: 65, allocation: 80 },
    { month: 'Feb', disbursement: 72, allocation: 85 },
    { month: 'Mar', disbursement: 58, allocation: 78 },
    { month: 'Apr', disbursement: 90, allocation: 95 },
    { month: 'May', disbursement: 85, allocation: 92 },
    { month: 'Jun', disbursement: 95, allocation: 100 },
    { month: 'Jul', disbursement: 88, allocation: 96 },
    { month: 'Aug', disbursement: 92, allocation: 98 },
  ];

  const sectorData = [
    { name: 'Infrastructure', value: 35, color: '#10b981' },
    { name: 'Transport', value: 25, color: '#3b82f6' },
    { name: 'Energy', value: 20, color: '#8b5cf6' },
    { name: 'Digital', value: 12, color: '#f59e0b' },
    { name: 'Agriculture', value: 8, color: '#ef4444' },
  ];

  const projectPipeline = [
    { name: 'Q1', projects: 8, budget: 120 },
    { name: 'Q2', projects: 12, budget: 180 },
    { name: 'Q3', projects: 15, budget: 250 },
    { name: 'Q4', projects: 10, budget: 200 },
  ];

  const StatCard = ({ title, value, subtitle, color, icon: Icon }: { title: string; value: string; subtitle: string; color: string; icon: React.ElementType }) => {
    const gradients: Record<string, string> = {
      green: 'bg-gradient-to-br from-emerald-500 to-emerald-600 dark:from-emerald-600 dark:to-emerald-700',
      blue: 'bg-gradient-to-br from-blue-500 to-blue-600 dark:from-blue-600 dark:to-blue-700',
      purple: 'bg-gradient-to-br from-violet-500 to-violet-600 dark:from-violet-600 dark:to-violet-700',
      amber: 'bg-gradient-to-br from-amber-500 to-amber-600 dark:from-amber-600 dark:to-amber-700',
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

  return (
    <AuthenticatedLayout>
      <div className="space-y-6">
        {/* Welcome Banner + Stats Section */}
        <div className="flex flex-col lg:flex-row gap-4 rounded-xl">
          {/* Welcome Banner - Left Side */}
          <div className="flex flex-col justify-between p-6 rounded-xl text-white w-full lg:w-[40%] relative overflow-hidden min-h-[240px]">
            {/* Dark radial gradient background */}
            <div className="absolute inset-0 bg-[radial-gradient(120%_100%_at_65%_60%,_rgb(18,48,32)_0%,_black_50%)]"></div>
            <div className="relative z-10">
              {/* Top row: Greeting icon + Weather */}
              <div className="flex items-center justify-between">
                <div className="flex items-center justify-center w-10 h-10 rounded-full bg-white dark:bg-[rgb(45_52_57)]">
                  <GreetingIcon className="w-6 h-6" style={{ color: '#FFD700' }} />
                </div>
                {/* Weather Display */}
                <div className="flex flex-col items-end">
                  {weatherLoading ? (
                    <>
                      <div className="flex items-center text-emerald-500">
                        <div className="text-2xl font-light text-white">--°C</div>
                      </div>
                      <div className="text-sm text-emerald-500 mt-1">
                        <div className="font-light">Loading...</div>
                      </div>
                    </>
                  ) : weatherError || !weatherData ? (
                    <>
                      <div className="flex items-center text-emerald-500">
                        <div className="text-2xl font-light text-white">N/A</div>
                      </div>
                      <div className="text-sm text-emerald-500 mt-1">
                        <div className="font-light">Weather unavailable</div>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="flex items-center text-emerald-500">
                        <img
                          alt={weatherData.current.condition.text}
                          loading="lazy"
                          width="32"
                          height="32"
                          decoding="async"
                          className="w-8 h-8"
                          src={`https:${weatherData.current.condition.icon}`}
                          style={{ color: 'transparent' }}
                        />
                        <div className="text-2xl font-light text-white">
                          {Math.round(weatherData.current.temp_c)}°C
                        </div>
                      </div>
                      <div className="text-sm text-emerald-500 mt-1">
                        <div className="font-light">
                          {weatherData.location.name}, {weatherData.current.condition.text}
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Middle: Hi + Time */}
              <div className="flex justify-between items-start mt-4">
                <div>
                  <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">
                    Hi {user.firstName},
                    <br />
                    <span className="text-emerald-300">{greeting}!</span>
                  </h1>
                </div>
                {/* Time Display */}
                <div className="flex flex-col items-end" style={{ marginTop: '-1rem' }}>
                  <div className="flex items-baseline gap-0">
                    <div dir="ltr" className="text-3xl sm:text-4xl font-bold text-emerald-300 tracking-tight flex items-baseline mt-2">
                      <span className="tabular-nums">{displayHours}</span>
                      <span>:</span>
                      <span className="tabular-nums">{String(minutes).padStart(2, '0')}</span>
                    </div>
                    <span className="text-lg sm:text-xl ml-1 font-semibold text-emerald-500 uppercase">
                      {period}
                    </span>
                  </div>
                  <div className="capitalize text-sm sm:text-base text-emerald-300">
                    {shortDate}
                  </div>
                </div>
              </div>

              {/* Bottom: Dashboard Overview */}
              <div className="mt-6">
                <h2 className="text-2xl font-bold mb-0">Dashboard Overview</h2>
                <p className="text-gray-200 mb-6">
                  Stay updated with key organisation metrics and activities!
                </p>
              </div>
            </div>
          </div>

          {/* Stats Cards - Right Side (2x2 Grid) */}
          <div className="grid grid-cols-2 gap-3 w-full lg:w-[60%]">
            {stats.map((stat) => (
              <StatCard key={stat.title} {...stat} />
            ))}
          </div>
        </div>

        {/* Analytics Charts */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-bold text-gray-900 dark:text-white" style={{ fontFamily: 'Afacad, sans-serif' }}>
                Analytics Overview
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                Budget trends, sector allocation, and project pipeline
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Area Chart - Budget Trend */}
            <div className="lg:col-span-2 bg-white dark:bg-[rgb(15,15,15)] rounded-xl border border-gray-100 dark:border-[rgb(30,30,30)] shadow-sm hover:shadow-md transition-shadow p-5">
              <div className="flex items-center gap-2 mb-4">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 text-white">
                  <TrendingUp className="h-4 w-4" />
                </div>
                <h3 className="text-base font-semibold text-foreground" style={{ fontFamily: 'Afacad, sans-serif' }}>
                  Budget Disbursement Trend ($M)
                </h3>
              </div>
              <ResponsiveContainer width="100%" height={240}>
                <AreaChart data={budgetTrendData} margin={{ top: 5, right: 20, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="disbursementGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#10b981" stopOpacity={0.6} />
                      <stop offset="100%" stopColor="#10b981" stopOpacity={0.1} />
                    </linearGradient>
                    <linearGradient id="allocationGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.6} />
                      <stop offset="100%" stopColor="#3b82f6" stopOpacity={0.1} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" className="dark:stroke-gray-700" />
                  <XAxis dataKey="month" tick={{ fill: '#9ca3af', fontSize: 12 }} tickLine={false} />
                  <YAxis tick={{ fill: '#9ca3af', fontSize: 12 }} tickLine={false} />
                  <Tooltip content={<GlassTooltip />} cursor={{ fill: 'transparent' }} />
                  <Legend content={<CustomLegend hiddenSeries={hiddenAreaSeries} onToggleSeries={toggleAreaSeries} />} />
                  {!hiddenAreaSeries.has('Allocation') && (
                    <Area type="monotone" dataKey="allocation" stroke="#3b82f6" fill="url(#allocationGradient)" strokeWidth={2} name="Allocation" />
                  )}
                  {!hiddenAreaSeries.has('Disbursement') && (
                    <Area type="monotone" dataKey="disbursement" stroke="#10b981" fill="url(#disbursementGradient)" strokeWidth={2} name="Disbursement" />
                  )}
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* Pie Chart - Sector Allocation */}
            <div className="bg-white dark:bg-[rgb(15,15,15)] rounded-xl border border-gray-100 dark:border-[rgb(30,30,30)] shadow-sm hover:shadow-md transition-shadow p-5">
              <div className="flex items-center gap-2 mb-4">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500 to-violet-600 text-white">
                  <Globe2 className="h-4 w-4" />
                </div>
                <h3 className="text-base font-semibold text-foreground" style={{ fontFamily: 'Afacad, sans-serif' }}>
                  Sector Allocation
                </h3>
              </div>
              <ResponsiveContainer width="100%" height={160}>
                <PieChart>
                  <Pie data={sectorData} cx="50%" cy="50%" innerRadius={40} outerRadius={65} dataKey="value" paddingAngle={2}>
                    {sectorData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip content={<GlassTooltip />} />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-1.5 mt-2">
                {sectorData.map((item) => (
                  <div key={item.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                      <span className="text-xs text-gray-600 dark:text-gray-400">{item.name}</span>
                    </div>
                    <span className="text-xs font-medium text-gray-900 dark:text-white">{item.value}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Bar Chart - Project Pipeline */}
          <div className="bg-white dark:bg-[rgb(15,15,15)] rounded-xl border border-gray-100 dark:border-[rgb(30,30,30)] shadow-sm hover:shadow-md transition-shadow p-5 mt-4">
            <div className="flex items-center gap-2 mb-4">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-500 to-emerald-600 text-white">
                <BarChart3 className="h-4 w-4" />
              </div>
              <h3 className="text-base font-semibold text-foreground" style={{ fontFamily: 'Afacad, sans-serif' }}>
                Quarterly Project Pipeline
              </h3>
            </div>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={projectPipeline} margin={{ top: 5, right: 20, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} className="dark:stroke-gray-700" />
                <XAxis dataKey="name" tick={{ fill: '#9ca3af', fontSize: 12 }} tickLine={false} />
                <YAxis yAxisId="left" tick={{ fill: '#9ca3af', fontSize: 12 }} tickLine={false} />
                <YAxis yAxisId="right" orientation="right" tick={{ fill: '#9ca3af', fontSize: 12 }} tickLine={false} />
                <Tooltip content={<GlassTooltip />} cursor={{ fill: 'transparent' }} />
                <Legend content={<CustomLegend hiddenSeries={hiddenBarSeries} onToggleSeries={toggleBarSeries} />} />
                {!hiddenBarSeries.has('Projects') && (
                  <Bar yAxisId="left" dataKey="projects" fill="#10b981" radius={[4, 4, 0, 0]} name="Projects" />
                )}
                {!hiddenBarSeries.has('Budget ($M)') && (
                  <Bar yAxisId="right" dataKey="budget" fill="#3b82f6" radius={[4, 4, 0, 0]} name="Budget ($M)" />
                )}
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Activity */}
          <div className="lg:col-span-2">
            <div className="bg-white dark:bg-[rgb(15,15,15)] rounded-xl border border-gray-100 dark:border-[rgb(30,30,30)] shadow-sm hover:shadow-md transition-shadow">
              <div className="p-5 border-b border-gray-100 dark:border-[rgb(30,30,30)]">
                <h3 className="text-base font-semibold text-foreground flex items-center gap-2" style={{ fontFamily: 'Afacad, sans-serif' }}>
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 text-white">
                    <Activity className="h-4 w-4" />
                  </div>
                  Recent Activity
                </h3>
              </div>
              <div className="p-5">
                <div className="space-y-1">
                  {recentActivity.map((item, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between py-3 px-3 rounded-lg hover:bg-gray-50 dark:hover:bg-[rgb(25,25,25)] transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-2 h-2 rounded-full flex-shrink-0 ${
                          item.status === 'active' ? 'bg-emerald-500' :
                          item.status === 'completed' ? 'bg-gray-300 dark:bg-[rgb(40,40,40)]' :
                          'bg-amber-500'
                        }`} />
                        <div>
                          <p className="text-sm font-medium text-foreground">{item.action}</p>
                          <p className="text-xs text-muted-foreground">{item.project}</p>
                        </div>
                      </div>
                      <span className="text-xs text-muted-foreground flex-shrink-0">{item.time}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* System Status */}
          <div>
            <div className="bg-white dark:bg-[rgb(15,15,15)] rounded-xl border border-gray-100 dark:border-[rgb(30,30,30)] shadow-sm hover:shadow-md transition-shadow">
              <div className="p-5 border-b border-gray-100 dark:border-[rgb(30,30,30)]">
                <h3 className="text-base font-semibold text-foreground flex items-center gap-2" style={{ fontFamily: 'Afacad, sans-serif' }}>
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-slate-500 to-slate-600 text-white">
                    <Shield className="h-4 w-4" />
                  </div>
                  System Status
                </h3>
              </div>
              <div className="p-5">
                <div className="space-y-3">
                  {systemStatus.map((item) => (
                    <div
                      key={item.name}
                      className="flex items-center justify-between py-2.5 px-3 rounded-lg bg-gray-50 dark:bg-[rgb(20,20,20)]"
                    >
                      <span className="text-sm text-foreground">{item.name}</span>
                      <span className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full ${
                        item.healthy
                          ? 'bg-green-50 text-green-700 dark:bg-green-950/30 dark:text-green-400'
                          : 'bg-amber-50 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400'
                      }`}>
                        {item.healthy ? (
                          <CheckCircle2 className="w-3 h-3" />
                        ) : (
                          <AlertTriangle className="w-3 h-3" />
                        )}
                        {item.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AuthenticatedLayout>
  );
}
