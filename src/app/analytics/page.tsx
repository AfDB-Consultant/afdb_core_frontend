'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { authUtils } from '@/lib/auth';
import { User } from '@/types';
import AuthenticatedLayout from '@/components/layout/AuthenticatedLayout';
import PageLoader from '@/components/ui/PageLoader';
import { BarChart3, TrendingUp, Globe2, DollarSign, ArrowUpRight, ArrowDownRight } from 'lucide-react';

export default function AnalyticsPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    if (!authUtils.isAuthenticated()) { router.push('/login'); return; }
    setUser(authUtils.getUser());
  }, [router]);

  if (!user) return <PageLoader />;

  const metrics = [
    { label: 'Total Disbursements', value: '$4.2B', change: '+18%', up: true, icon: DollarSign },
    { label: 'Active Countries', value: '42', change: '+3', up: true, icon: Globe2 },
    { label: 'Project Success Rate', value: '87%', change: '+5%', up: true, icon: TrendingUp },
    { label: 'Avg. Processing Time', value: '12 days', change: '-2 days', up: true, icon: BarChart3 },
  ];

  const topProjects = [
    { name: 'North Africa Infrastructure', budget: '$200M', return: '12.4%' },
    { name: 'East Africa Transport Corridor', budget: '$120M', return: '9.8%' },
    { name: 'West Africa Power Pool', budget: '$85M', return: '7.2%' },
    { name: 'Sahel Region Development', budget: '$45M', return: '5.1%' },
  ];

  return (
    <AuthenticatedLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white" style={{ fontFamily: 'Afacad, sans-serif' }}>Analytics</h1>
        <p className="text-sm text-muted-foreground mt-1">Performance metrics and insights</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {metrics.map((m) => {
          const Icon = m.icon;
          return (
            <div key={m.label} className="bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-100 dark:border-gray-700">
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 rounded-lg bg-green-50 dark:bg-green-950/30 flex items-center justify-center">
                  <Icon className="w-5 h-5 text-green-600 dark:text-green-400" />
                </div>
                <div className={`flex items-center gap-0.5 text-xs font-medium ${m.up ? 'text-green-600 dark:text-green-400' : 'text-red-600'}`}>
                  {m.up ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                  {m.change}
                </div>
              </div>
              <p className="text-2xl font-bold text-foreground" style={{ fontFamily: 'Afacad, sans-serif' }}>{m.value}</p>
              <p className="text-xs text-muted-foreground mt-1">{m.label}</p>
            </div>
          );
        })}
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-5">
        <h3 className="text-base font-semibold text-foreground mb-4" style={{ fontFamily: 'Afacad, sans-serif' }}>Top Projects by ROI</h3>
        <div className="space-y-3">
          {topProjects.map((p, i) => (
            <div key={i} className="flex items-center justify-between py-3 px-4 rounded-lg bg-gray-50 dark:bg-gray-700/50">
              <div className="flex items-center gap-3">
                <span className="w-6 h-6 rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 flex items-center justify-center text-xs font-bold">{i + 1}</span>
                <span className="text-sm font-medium text-gray-900 dark:text-white">{p.name}</span>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-sm text-gray-500 dark:text-gray-400">{p.budget}</span>
                <span className="text-sm font-semibold text-green-600 dark:text-green-400">{p.return}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </AuthenticatedLayout>
  );
}
