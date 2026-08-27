'use client';
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { authUtils } from '@/lib/auth';
import { User } from '@/types';
import AfDBLogo from '@/components/ui/AfDBLogo';

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
    if (!authUtils.isAuthenticated()) { router.push('/login'); return; }
    setUser(authUtils.getUser());
  }, [router]);

  const handleLogout = () => { authUtils.clearAuth(); router.push('/login'); };
  if (!user) return null;

  const totalBudget = mockProjects.reduce((s, p) => s + p.budget, 0);
  const activeCount = mockProjects.filter(p => p.status === 'active').length;
  const countries = [...new Set(mockProjects.map(p => p.country))].length;

  return (
    <div className="min-h-screen bg-afdb-gray">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <AfDBLogo size={36} />
            <div>
              <h1 className="text-sm font-bold text-afdb-navy leading-tight">Enterprise Data Platform</h1>
              <p className="text-xs text-afdb-gray-dark">Core Dashboard</p>
            </div>
          </div>
          <nav className="hidden md:flex items-center gap-6">
            <a href="/dashboard" className="text-sm font-medium text-afdb-green border-b-2 border-afdb-green pb-1">Dashboard</a>
            <a href="/projects" className="text-sm font-medium text-gray-500 hover:text-afdb-green transition-colors">Projects</a>
            <a href="/reports" className="text-sm font-medium text-gray-500 hover:text-afdb-green transition-colors">Reports</a>
          </nav>
          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-medium text-gray-800">{user.firstName} {user.lastName}</p>
              <p className="text-xs text-gray-500 capitalize">{user.role}</p>
            </div>
            <div className="w-10 h-10 bg-afdb-green rounded-full flex items-center justify-center text-white font-bold text-sm">{user.firstName[0]}{user.lastName[0]}</div>
            <button onClick={handleLogout} className="text-sm text-gray-500 hover:text-red-600 transition-colors font-medium">Sign Out</button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-afdb-navy">Project Portfolio Overview</h2>
          <p className="text-gray-500 mt-1">Real-time data from the AfDB enterprise data engine</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {[
            { label: 'Total Projects', value: mockProjects.length.toString(), icon: '📊', accent: 'border-afdb-green' },
            { label: 'Active Projects', value: activeCount.toString(), icon: '🟢', accent: 'border-afdb-gold' },
            { label: 'Total Portfolio', value: `$${(totalBudget / 1e9).toFixed(2)}B`, icon: '💰', accent: 'border-afdb-navy' },
            { label: 'Countries', value: countries.toString(), icon: '🌍', accent: 'border-blue-500' },
          ].map((stat) => (
            <div key={stat.label} className={`bg-white rounded-xl p-6 border-l-4 ${stat.accent} shadow-sm`}>
              <div className="flex items-center justify-between mb-3">
                <span className="text-2xl">{stat.icon}</span>
              </div>
              <p className="text-3xl font-bold text-afdb-navy">{stat.value}</p>
              <p className="text-sm text-gray-500 mt-1">{stat.label}</p>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-xl border border-gray-100 shadow-sm mb-8">
          <div className="p-6 border-b border-gray-100 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-afdb-navy">Project Portfolio</h3>
            <div className="flex items-center gap-2">
              <span className="text-xs bg-afdb-green/10 text-afdb-green px-3 py-1 rounded-full font-medium">Live Data</span>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-afdb-gray text-left">
                  <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Code</th>
                  <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Project Name</th>
                  <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Country</th>
                  <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Sector</th>
                  <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Budget (USD)</th>
                  <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Manager</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {mockProjects.map((project) => (
                  <tr key={project.id} className="hover:bg-afdb-gray/50 transition-colors">
                    <td className="px-6 py-4 text-sm font-mono text-afdb-navy font-medium">{project.code}</td>
                    <td className="px-6 py-4 text-sm text-gray-800 font-medium">{project.name}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{project.country}</td>
                    <td className="px-6 py-4"><span className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded-md font-medium">{project.sector}</span></td>
                    <td className="px-6 py-4 text-sm text-right font-mono text-gray-800">${(project.budget / 1e6).toFixed(0)}M</td>
                    <td className="px-6 py-4">
                      <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${
                        project.status === 'active' ? 'bg-green-50 text-green-700' :
                        project.status === 'completed' ? 'bg-gray-100 text-gray-600' :
                        'bg-yellow-50 text-yellow-700'
                      }`}>{project.status}</span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">{project.manager}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
            <h3 className="text-lg font-semibold text-afdb-navy mb-4">Budget by Sector</h3>
            <div className="space-y-3">
              {['Infrastructure', 'Energy', 'Agriculture', 'Water', 'Education'].map((sector) => {
                const sectorBudget = mockProjects.filter(p => p.sector === sector).reduce((s, p) => s + p.budget, 0);
                const pct = totalBudget > 0 ? (sectorBudget / totalBudget) * 100 : 0;
                return (
                  <div key={sector}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-700 font-medium">{sector}</span>
                      <span className="text-gray-500">${(sectorBudget / 1e6).toFixed(0)}M ({pct.toFixed(0)}%)</span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full bg-afdb-green rounded-full transition-all" style={{ width: `${pct}%` }}></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
            <h3 className="text-lg font-semibold text-afdb-navy mb-4">Regional Distribution</h3>
            <div className="space-y-3">
              {[
                { region: 'East Africa', count: 1, budget: 450 },
                { region: 'West Africa', count: 1, budget: 320 },
                { region: 'Central Africa', count: 1, budget: 95 },
                { region: 'North Africa', count: 1, budget: 275 },
                { region: 'Southern Africa', count: 1, budget: 150 },
                { region: 'Sahel', count: 1, budget: 180 },
              ].map((r) => (
                <div key={r.region} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-afdb-gold"></div>
                    <span className="text-sm text-gray-700">{r.region}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-medium text-afdb-navy">${r.budget}M</span>
                    <span className="text-xs text-gray-400 ml-2">({r.count} project{r.count > 1 ? 's' : ''})</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>

      <footer className="border-t border-gray-200 mt-12 py-6 bg-white">
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
          <p className="text-xs text-gray-400">&copy; 2026 African Development Bank Group</p>
          <p className="text-xs text-gray-400">Core Frontend v1.0 — Enterprise Data Platform</p>
        </div>
      </footer>
    </div>
  );
}
