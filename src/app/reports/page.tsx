'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { authUtils } from '@/lib/auth';
import { User } from '@/types';
import AuthenticatedLayout from '@/components/layout/AuthenticatedLayout';
import PageLoader from '@/components/ui/PageLoader';
import { FileText, Download, Calendar, BarChart3, PieChart as PieChartIcon, TrendingUp, DollarSign, Globe2, Activity } from 'lucide-react';

export default function ReportsPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    if (!authUtils.isAuthenticated()) { router.push('/login'); return; }
    setUser(authUtils.getUser());
  }, [router]);

  if (!user) return <PageLoader />;

  const reports = [
    { name: 'Q3 2026 Financial Summary', type: 'Financial', date: 'Aug 15, 2026', size: '2.4 MB', icon: BarChart3 },
    { name: 'Annual Portfolio Review', type: 'Portfolio', date: 'Jul 28, 2026', size: '5.1 MB', icon: PieChartIcon },
    { name: 'Regional Impact Assessment', type: 'Impact', date: 'Jul 10, 2026', size: '3.8 MB', icon: TrendingUp },
    { name: 'Budget Allocation Report', type: 'Financial', date: 'Jun 30, 2026', size: '1.2 MB', icon: BarChart3 },
    { name: 'Project Status Dashboard', type: 'Operations', date: 'Jun 15, 2026', size: '890 KB', icon: FileText },
  ];

  // Chart data
  const reportsByType = [
    { type: 'Financial', count: 18, color: '#10b981' },
    { type: 'Portfolio', count: 12, color: '#3b82f6' },
    { type: 'Impact', count: 8, color: '#8b5cf6' },
    { type: 'Operations', count: 10, color: '#f59e0b' },
  ];

  const monthlyTrend = [
    { month: 'Jan', count: 3 }, { month: 'Feb', count: 5 }, { month: 'Mar', count: 4 },
    { month: 'Apr', count: 6 }, { month: 'May', count: 8 }, { month: 'Jun', count: 7 },
    { month: 'Jul', count: 9 }, { month: 'Aug', count: 6 },
  ];

  const budgetDistribution = [
    { name: 'Infrastructure', value: 35, color: '#10b981' },
    { name: 'Transport', value: 25, color: '#3b82f6' },
    { name: 'Energy', value: 20, color: '#8b5cf6' },
    { name: 'Digital', value: 12, color: '#f59e0b' },
    { name: 'Other', value: 8, color: '#6b7280' },
  ];

  const maxTrend = Math.max(...monthlyTrend.map(m => m.count));
  const totalReports = reportsByType.reduce((sum, r) => sum + r.count, 0);

  // KPI Component
  const Kpi = ({ title, value, subtitle, color, icon: Icon }: { title: string; value: string; subtitle: string; color: string; icon: React.ElementType }) => {
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
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white" style={{ fontFamily: 'Afacad, sans-serif' }}>Reports</h1>
            <p className="text-sm text-muted-foreground mt-1">Generate and analyze project reports</p>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Kpi title="Total Reports" value="48" subtitle="All time" icon={FileText} color="green" />
          <Kpi title="This Month" value="6" subtitle="+2 from last month" icon={Calendar} color="blue" />
          <Kpi title="Pending Review" value="3" subtitle="Awaiting approval" icon={BarChart3} color="amber" />
          <Kpi title="Total Budget" value="$1.2B" subtitle="Across all projects" icon={DollarSign} color="purple" />
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Bar Chart - Reports by Type */}
          <div className="bg-white dark:bg-[rgb(15,15,15)] rounded-xl border border-gray-100 dark:border-[rgb(30,30,30)] shadow-sm hover:shadow-md transition-shadow">
            <div className="p-5 border-b border-gray-100 dark:border-[rgb(30,30,30)]">
              <h3 className="text-base font-semibold text-foreground flex items-center gap-2" style={{ fontFamily: 'Afacad, sans-serif' }}>
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 text-white">
                  <BarChart3 className="h-4 w-4" />
                </div>
                Reports by Type
              </h3>
            </div>
            <div className="p-5">
              <div className="space-y-3">
                {reportsByType.map((item) => (
                  <div key={item.type}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{item.type}</span>
                      <span className="text-sm text-gray-500 dark:text-gray-400">{item.count}</span>
                    </div>
                    <div className="h-2 bg-gray-100 dark:bg-[rgb(20,20,20)] rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{ width: `${(item.count / totalReports) * 100}%`, backgroundColor: item.color }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Line Chart - Monthly Trend */}
          <div className="bg-white dark:bg-[rgb(15,15,15)] rounded-xl border border-gray-100 dark:border-[rgb(30,30,30)] shadow-sm hover:shadow-md transition-shadow">
            <div className="p-5 border-b border-gray-100 dark:border-[rgb(30,30,30)]">
              <h3 className="text-base font-semibold text-foreground flex items-center gap-2" style={{ fontFamily: 'Afacad, sans-serif' }}>
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-500 to-emerald-600 text-white">
                  <TrendingUp className="h-4 w-4" />
                </div>
                Monthly Trend
              </h3>
            </div>
            <div className="p-5">
              <div className="flex items-end justify-between h-32 gap-1">
                {monthlyTrend.map((item, i) => (
                  <div key={item.month} className="flex flex-col items-center flex-1">
                    <div className="w-full relative flex items-end justify-center" style={{ height: '100px' }}>
                      <div
                        className="w-full max-w-[24px] bg-gradient-to-t from-emerald-500 to-emerald-400 rounded-t-sm hover:from-emerald-600 hover:to-emerald-500 transition-colors cursor-pointer"
                        style={{ height: `${(item.count / maxTrend) * 100}%` }}
                        title={`${item.month}: ${item.count} reports`}
                      />
                    </div>
                    <span className="text-[10px] text-gray-500 dark:text-gray-400 mt-1">{item.month}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Pie Chart - Budget Distribution */}
          <div className="bg-white dark:bg-[rgb(15,15,15)] rounded-xl border border-gray-100 dark:border-[rgb(30,30,30)] shadow-sm hover:shadow-md transition-shadow">
            <div className="p-5 border-b border-gray-100 dark:border-[rgb(30,30,30)]">
              <h3 className="text-base font-semibold text-foreground flex items-center gap-2" style={{ fontFamily: 'Afacad, sans-serif' }}>
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500 to-violet-600 text-white">
                  <PieChartIcon className="h-4 w-4" />
                </div>
                Budget Distribution
              </h3>
            </div>
            <div className="p-5">
              {/* Simple CSS Pie Chart */}
              <div className="flex items-center justify-center mb-4">
                <div className="relative w-24 h-24">
                  <svg viewBox="0 0 100 100" className="transform -rotate-90">
                    {budgetDistribution.reduce<{ elements: React.ReactNode[]; offset: number }>((acc, item, i) => {
                      const circumference = Math.PI * 2 * 40;
                      const strokeLength = (item.value / 100) * circumference;
                      const strokeOffset = -acc.offset;
                      acc.elements.push(
                        <circle
                          key={i}
                          cx="50"
                          cy="50"
                          r="40"
                          fill="none"
                          stroke={item.color}
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
                {budgetDistribution.map((item) => (
                  <div key={item.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                      <span className="text-xs text-gray-600 dark:text-gray-400">{item.name}</span>
                    </div>
                    <span className="text-xs font-medium text-gray-900 dark:text-white">{item.value}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Recent Reports List */}
        <div className="bg-white dark:bg-[rgb(15,15,15)] rounded-xl border border-gray-100 dark:border-[rgb(30,30,30)] shadow-sm hover:shadow-md transition-shadow">
          <div className="p-5 border-b border-gray-100 dark:border-[rgb(30,30,30)]">
            <h3 className="text-base font-semibold text-foreground flex items-center gap-2" style={{ fontFamily: 'Afacad, sans-serif' }}>
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-slate-500 to-slate-600 text-white">
                <FileText className="h-4 w-4" />
              </div>
              Recent Reports
            </h3>
          </div>
          <div className="divide-y divide-gray-50 dark:divide-gray-700/50">
            {reports.map((r, i) => {
              const Icon = r.icon;
              return (
                <div key={i} className="flex items-center justify-between px-5 py-4 hover:bg-gray-50 dark:hover:bg-[rgb(25,25,25)]/30 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-gray-50 dark:bg-[rgb(20,20,20)] flex items-center justify-center">
                      <Icon className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">{r.name}</p>
                      <p className="text-xs text-muted-foreground">{r.type} &middot; {r.date} &middot; {r.size}</p>
                    </div>
                  </div>
                  <button className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors">
                    <Download className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </AuthenticatedLayout>
  );
}
