'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { authUtils } from '@/lib/auth';
import { User } from '@/types';
import AuthenticatedLayout from '@/components/layout/AuthenticatedLayout';
import {
  FolderKanban,
  DollarSign,
  Globe2,
  Activity,
  TrendingUp,
} from 'lucide-react';

const mockProjects = [
  { id: '1', code: 'AFDB-EATC-001', name: 'East Africa Transport Corridor', country: 'Kenya', sector: 'Infrastructure', budget: 450000000, status: 'active', manager: 'Amina Diallo' },
  { id: '2', code: 'AFDB-WAPP-002', name: 'West Africa Power Pool', country: 'Nigeria', sector: 'Energy', budget: 320000000, status: 'active', manager: 'Kwame Mensah' },
  { id: '3', code: 'AFDB-SRD-003', name: 'Sahel Region Development', country: 'Burkina Faso', sector: 'Agriculture', budget: 180000000, status: 'active', manager: 'Fatou Ndiaye' },
  { id: '4', code: 'AFDB-NAI-004', name: 'North Africa Infrastructure', country: 'Morocco', sector: 'Infrastructure', budget: 275000000, status: 'on-hold', manager: 'Youssef Benali' },
  { id: '5', code: 'AFDB-CAWF-005', name: 'Central Africa Water & Sanitation', country: 'Cameroon', sector: 'Water', budget: 95000000, status: 'active', manager: 'Marie Eboue' },
  { id: '6', code: 'AFDB-SAED-006', name: 'Southern Africa Education', country: 'South Africa', sector: 'Education', budget: 150000000, status: 'completed', manager: 'Thabo Molefe' },
];

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    if (!authUtils.isAuthenticated()) {
      router.push('/login');
      return;
    }
    setUser(authUtils.getUser());
  }, [router]);

  if (!user) return null;

  const totalBudget = mockProjects.reduce((s, p) => s + p.budget, 0);
  const activeCount = mockProjects.filter((p) => p.status === 'active').length;
  const countries = [...new Set(mockProjects.map((p) => p.country))].length;

  const stats = [
    { label: 'Total Projects', value: mockProjects.length.toString(), change: '+3', icon: FolderKanban, color: 'text-primary bg-primary/10' },
    { label: 'Active Projects', value: activeCount.toString(), change: '+2', icon: Activity, color: 'text-amber-600 bg-amber-50 dark:text-amber-400 dark:bg-amber-950/30' },
    { label: 'Total Portfolio', value: `$${(totalBudget / 1e9).toFixed(2)}B`, change: '+12%', icon: DollarSign, color: 'text-blue-600 bg-blue-50 dark:text-blue-400 dark:bg-blue-950/30' },
    { label: 'Countries', value: countries.toString(), change: '+1', icon: Globe2, color: 'text-purple-600 bg-purple-50 dark:text-purple-400 dark:bg-purple-950/30' },
  ];

  return (
    <AuthenticatedLayout
      pageTitle="Project Portfolio"
      breadcrumbs={[{ label: 'Home', href: '/dashboard' }, { label: 'Dashboard' }]}
      pageActions={
        <span className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full bg-green-50 text-green-700 dark:bg-green-950/30 dark:text-green-400 border border-green-200 dark:border-green-800">
          <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
          Live Data
        </span>
      }
    >
      {/* Welcome */}
      <div className="mb-6">
        <p className="text-sm text-muted-foreground" style={{ fontFamily: 'Afacad, sans-serif' }}>
          Real-time data from the AfDB enterprise data engine. Welcome, <span className="font-semibold text-foreground">{user.firstName}</span>.
        </p>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.label}
              className="bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-100 dark:border-gray-700 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${stat.color}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div className="flex items-center gap-1 text-xs font-medium text-green-600 dark:text-green-400">
                  <TrendingUp className="w-3 h-3" />
                  {stat.change}
                </div>
              </div>
              <p className="text-2xl font-bold text-foreground" style={{ fontFamily: 'Afacad, sans-serif' }}>
                {stat.value}
              </p>
              <p className="text-xs text-muted-foreground mt-1" style={{ fontFamily: 'Afacad, sans-serif' }}>
                {stat.label}
              </p>
            </div>
          );
        })}
      </div>

      {/* Project table */}
      <div className="mb-8">
        <h3 className="text-base font-semibold text-foreground mb-4 flex items-center gap-2" style={{ fontFamily: 'Afacad, sans-serif' }}>
          <FolderKanban className="w-4 h-4 text-primary" />
          Project Portfolio
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100 dark:border-gray-700">
                <th className="text-left text-[10px] uppercase tracking-wider text-muted-foreground font-semibold px-3 py-2" style={{ fontFamily: 'Afacad, sans-serif' }}>Code</th>
                <th className="text-left text-[10px] uppercase tracking-wider text-muted-foreground font-semibold px-3 py-2" style={{ fontFamily: 'Afacad, sans-serif' }}>Project Name</th>
                <th className="text-left text-[10px] uppercase tracking-wider text-muted-foreground font-semibold px-3 py-2" style={{ fontFamily: 'Afacad, sans-serif' }}>Country</th>
                <th className="text-left text-[10px] uppercase tracking-wider text-muted-foreground font-semibold px-3 py-2" style={{ fontFamily: 'Afacad, sans-serif' }}>Sector</th>
                <th className="text-right text-[10px] uppercase tracking-wider text-muted-foreground font-semibold px-3 py-2" style={{ fontFamily: 'Afacad, sans-serif' }}>Budget</th>
                <th className="text-left text-[10px] uppercase tracking-wider text-muted-foreground font-semibold px-3 py-2" style={{ fontFamily: 'Afacad, sans-serif' }}>Status</th>
                <th className="text-left text-[10px] uppercase tracking-wider text-muted-foreground font-semibold px-3 py-2" style={{ fontFamily: 'Afacad, sans-serif' }}>Manager</th>
              </tr>
            </thead>
            <tbody>
              {mockProjects.map((project) => (
                <tr key={project.id} className="border-b border-gray-50 dark:border-gray-700/50 hover:bg-accent/30 transition-colors">
                  <td className="px-3 py-3 text-sm font-mono text-foreground font-medium">{project.code}</td>
                  <td className="px-3 py-3 text-sm text-foreground font-medium">{project.name}</td>
                  <td className="px-3 py-3 text-sm text-muted-foreground">{project.country}</td>
                  <td className="px-3 py-3">
                    <span className="text-xs bg-blue-50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-400 px-2.5 py-1 rounded-full font-medium">{project.sector}</span>
                  </td>
                  <td className="px-3 py-3 text-sm text-right font-mono text-foreground">${(project.budget / 1e6).toFixed(0)}M</td>
                  <td className="px-3 py-3">
                    <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${
                      project.status === 'active' ? 'bg-green-50 text-green-700 dark:bg-green-950/30 dark:text-green-400' :
                      project.status === 'completed' ? 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400' :
                      'bg-amber-50 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400'
                    }`}>{project.status}</span>
                  </td>
                  <td className="px-3 py-3 text-sm text-muted-foreground">{project.manager}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Bottom grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Budget by Sector */}
        <div>
          <h3 className="text-base font-semibold text-foreground mb-4" style={{ fontFamily: 'Afacad, sans-serif' }}>
            Budget by Sector
          </h3>
          <div className="space-y-3">
            {['Infrastructure', 'Energy', 'Agriculture', 'Water', 'Education'].map((sector) => {
              const sectorBudget = mockProjects.filter((p) => p.sector === sector).reduce((s, p) => s + p.budget, 0);
              const pct = totalBudget > 0 ? (sectorBudget / totalBudget) * 100 : 0;
              return (
                <div key={sector}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-foreground font-medium">{sector}</span>
                    <span className="text-muted-foreground">${(sectorBudget / 1e6).toFixed(0)}M ({pct.toFixed(0)}%)</span>
                  </div>
                  <div className="h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Regional Distribution */}
        <div>
          <h3 className="text-base font-semibold text-foreground mb-4" style={{ fontFamily: 'Afacad, sans-serif' }}>
            Regional Distribution
          </h3>
          <div className="space-y-2">
            {[
              { region: 'East Africa', count: 1, budget: 450 },
              { region: 'West Africa', count: 1, budget: 320 },
              { region: 'Central Africa', count: 1, budget: 95 },
              { region: 'North Africa', count: 1, budget: 275 },
              { region: 'Southern Africa', count: 1, budget: 150 },
              { region: 'Sahel', count: 1, budget: 180 },
            ].map((r) => (
              <div key={r.region} className="flex items-center justify-between py-2 px-3 rounded-lg bg-gray-50 dark:bg-gray-700/50">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-accent" />
                  <span className="text-sm text-foreground">{r.region}</span>
                </div>
                <div className="text-right">
                  <span className="text-sm font-medium text-foreground">${r.budget}M</span>
                  <span className="text-xs text-muted-foreground ml-2">({r.count} project{r.count > 1 ? 's' : ''})</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AuthenticatedLayout>
  );
}
