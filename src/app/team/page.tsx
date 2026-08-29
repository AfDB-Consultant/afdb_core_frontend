'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { authUtils } from '@/lib/auth';
import { User } from '@/types';
import AuthenticatedLayout from '@/components/layout/AuthenticatedLayout';
import PageLoader from '@/components/ui/PageLoader';
import coreApi from '@/lib/coreApi';
import TeamMemberModal, { TeamMemberData } from '@/components/team/TeamMemberModal';
import PermissionsModal from '@/components/team/PermissionsModal';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Users, Mail, MapPin, Shield, Plus, Search, Filter } from 'lucide-react';

interface TeamMember {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  role: 'admin' | 'manager' | 'staff' | 'viewer';
  department: string;
  location: string;
  jobTitle: string;
  bio: string;
  permissions: { resource: string; actions: string[] }[];
  status: 'active' | 'inactive' | 'suspended';
  lastLogin: string;
  createdAt: string;
  updatedAt: string;
}

const colorMap: Record<string, string> = {
  admin: 'bg-green-500',
  manager: 'bg-blue-500',
  staff: 'bg-purple-500',
  viewer: 'bg-amber-500',
};

const roleBadge: Record<string, string> = {
  admin: 'bg-green-50 text-green-700 dark:bg-green-950/30 dark:text-green-400',
  manager: 'bg-blue-50 text-blue-700 dark:bg-blue-950/30 dark:text-blue-400',
  staff: 'bg-purple-50 text-purple-700 dark:bg-purple-950/30 dark:text-purple-400',
  viewer: 'bg-gray-100 text-gray-600 dark:bg-[rgb(20,20,20)] dark:text-gray-400',
};

const statusBadge: Record<string, string> = {
  active: 'bg-green-50 text-green-700 dark:bg-green-950/30 dark:text-green-400',
  inactive: 'bg-gray-100 text-gray-600 dark:bg-[rgb(20,20,20)] dark:text-gray-400',
  suspended: 'bg-red-50 text-red-700 dark:bg-red-950/30 dark:text-red-400',
};

export default function TeamPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editMember, setEditMember] = useState<TeamMemberData | null>(null);
  const [showPermissions, setShowPermissions] = useState(false);

  useEffect(() => {
    if (!authUtils.isAuthenticated()) { router.push('/login'); return; }
    setUser(authUtils.getUser());
    fetchMembers();
  }, [router]);

  const fetchMembers = async () => {
    try {
      setLoading(true);
      const res = await coreApi.get('/team', { params: { limit: 100 } });
      setMembers(res.data.data);
    } catch (err) {
      console.error('Failed to fetch team members:', err);
    } finally {
      setLoading(false);
    }
  };

  const filtered = members.filter(m => {
    const matchSearch = !search ||
      `${m.firstName} ${m.lastName}`.toLowerCase().includes(search.toLowerCase()) ||
      m.email.toLowerCase().includes(search.toLowerCase()) ||
      m.department.toLowerCase().includes(search.toLowerCase());
    const matchRole = !roleFilter || m.role === roleFilter;
    return matchSearch && matchRole;
  });

  const stats = [
    { label: 'Total Members', value: `${members.length}`, icon: Users, color: 'text-green-600 bg-green-50 dark:text-green-400 dark:bg-green-950/30' },
    { label: 'Admins', value: `${members.filter(m => m.role === 'admin').length}`, icon: Shield, color: 'text-blue-600 bg-blue-50 dark:text-blue-400 dark:bg-blue-950/30' },
    { label: 'Active', value: `${members.filter(m => m.status === 'active').length}`, icon: Users, color: 'text-amber-600 bg-amber-50 dark:text-amber-400 dark:bg-amber-950/30' },
    { label: 'Departments', value: `${new Set(members.map(m => m.department)).size}`, icon: MapPin, color: 'text-purple-600 bg-purple-50 dark:text-purple-400 dark:bg-purple-950/30' },
  ];

  if (!user) return <PageLoader />;

  return (
    <AuthenticatedLayout>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white" style={{ fontFamily: 'Afacad, sans-serif' }}>User Management</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage team members, roles, and permissions</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowPermissions(true)}
            className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-[rgb(15,15,15)] hover:bg-gray-50 dark:hover:bg-[rgb(25,25,25)] text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-[rgb(30,30,30)] rounded-lg text-sm font-medium transition-colors"
          >
            <Shield className="w-4 h-4" /> Permissions
          </button>
          <button
            onClick={() => { setEditMember(null); setShowModal(true); }}
            className="flex items-center gap-2 px-4 py-2 bg-[#009A44] hover:bg-[#007a36] text-white rounded-lg text-sm font-medium transition-colors"
          >
            <Plus className="w-4 h-4" /> Add Member
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-6">
        {stats.map((s) => {
          const Icon = s.icon;
          return (
            <div key={s.label} className="bg-white dark:bg-[rgb(15,15,15)] rounded-xl p-5 border border-gray-100 dark:border-[rgb(30,30,30)]">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${s.color}`}><Icon className="w-5 h-5" /></div>
                <div>
                  <p className="text-2xl font-bold text-foreground" style={{ fontFamily: 'Afacad, sans-serif' }}>{s.value}</p>
                  <p className="text-xs text-muted-foreground">{s.label}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Search & Filter */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name, email, or department..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-white dark:bg-[rgb(15,15,15)] border border-gray-200 dark:border-[rgb(30,30,30)] text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-[#009A44]/30"
          />
        </div>
        <div className="relative">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 z-10" />
          <Select value={roleFilter} onValueChange={(v) => setRoleFilter(v)}>
            <SelectTrigger className="pl-10 pr-8 py-2.5 rounded-lg bg-white dark:bg-[rgb(15,15,15)] border border-gray-200 dark:border-[rgb(30,30,30)] text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-[#009A44]/30 w-[140px]">
              <SelectValue placeholder="All Roles" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Roles</SelectItem>
              <SelectItem value="admin">Admin</SelectItem>
              <SelectItem value="manager">Manager</SelectItem>
              <SelectItem value="staff">Staff</SelectItem>
              <SelectItem value="viewer">Viewer</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Members Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin w-8 h-8 border-2 border-[#009A44] border-t-transparent rounded-full" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map((m) => {
            const initials = `${m.firstName[0] || ''}${m.lastName[0] || ''}`.toUpperCase();
            const color = colorMap[m.role] || 'bg-gray-500';
            return (
              <div
                key={m._id}
                onClick={() => router.push(`/team/${m._id}`)}
                className="bg-white dark:bg-[rgb(15,15,15)] rounded-xl border border-gray-100 dark:border-[rgb(30,30,30)] p-5 hover:shadow-md transition-shadow cursor-pointer"
              >
                <div className="flex items-start gap-4">
                  <div className={`w-12 h-12 rounded-full ${color} flex items-center justify-center text-white font-bold text-sm flex-shrink-0`}>
                    {initials}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <h3 className="text-sm font-semibold text-gray-900 dark:text-white truncate">{m.firstName} {m.lastName}</h3>
                      <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-medium ${roleBadge[m.role] || ''}`}>{m.role}</span>
                      <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-medium ${statusBadge[m.status] || ''}`}>{m.status}</span>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">{m.jobTitle}</p>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground mb-1">
                      <Mail className="w-3 h-3" /> {m.email}
                    </div>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <MapPin className="w-3 h-3" /> {m.location}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Team Member Modal */}
      <TeamMemberModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onSuccess={fetchMembers}
        member={editMember}
      />

      {/* Permissions Modal */}
      <PermissionsModal
        isOpen={showPermissions}
        onClose={() => setShowPermissions(false)}
      />
    </AuthenticatedLayout>
  );
}
