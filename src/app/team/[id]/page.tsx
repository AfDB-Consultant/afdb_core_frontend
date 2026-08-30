'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { authUtils } from '@/lib/auth';
import { User } from '@/types';
import AuthenticatedLayout from '@/components/layout/AuthenticatedLayout';
import PageLoader from '@/components/ui/PageLoader';
import coreApi from '@/lib/coreApi';
import TeamMemberModal, { TeamMemberData } from '@/components/team/TeamMemberModal';
import { Input } from '@/components/ui/input';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/components/ui/Toast';
import { cn } from '@/lib/utils';
import { ArrowLeft, Mail, Phone, MapPin, Shield, Clock, Edit3, Save, X, Trash2 } from 'lucide-react';

interface Permission {
  resource: string;
  actions: string[];
}

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
  permissions: Permission[];
  status: 'active' | 'inactive' | 'suspended';
  lastLogin: string;
  createdAt: string;
  updatedAt: string;
}

const allResources = ['users', 'projects', 'reports', 'settings', 'monitoring'];
const allActions = ['create', 'read', 'update', 'delete'];

const rolePermissions: Record<string, Permission[]> = {
  admin: [
    { resource: 'users', actions: ['create', 'read', 'update', 'delete'] },
    { resource: 'projects', actions: ['create', 'read', 'update', 'delete'] },
    { resource: 'reports', actions: ['create', 'read', 'update', 'delete'] },
    { resource: 'settings', actions: ['read', 'update'] },
    { resource: 'monitoring', actions: ['read'] },
  ],
  manager: [
    { resource: 'users', actions: ['read'] },
    { resource: 'projects', actions: ['create', 'read', 'update'] },
    { resource: 'reports', actions: ['create', 'read', 'update'] },
    { resource: 'monitoring', actions: ['read'] },
  ],
  staff: [
    { resource: 'projects', actions: ['read', 'update'] },
    { resource: 'reports', actions: ['read'] },
  ],
  viewer: [
    { resource: 'projects', actions: ['read'] },
    { resource: 'reports', actions: ['read'] },
  ],
};

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

export default function TeamMemberDetailPage() {
  const router = useRouter();
  const params = useParams();
  const [user, setUser] = useState<User | null>(null);
  const [member, setMember] = useState<TeamMember | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState<Partial<TeamMember>>({});
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'profile' | 'permissions'>('profile');
  const [editPermissions, setEditPermissions] = useState<Permission[]>([]);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const { success, error: showError } = useToast();

  useEffect(() => {
    if (!authUtils.isAuthenticated()) { router.push('/login'); return; }
    setUser(authUtils.getUser());
    fetchMember();
  }, [router, params.id]);

  const fetchMember = async () => {
    try {
      setLoading(true);
      const res = await coreApi.get(`/team/${params.id}`);
      setMember(res.data.data);
      setEditPermissions(res.data.data.permissions || []);
    } catch (err) {
      console.error('Failed to fetch member:', err);
    } finally {
      setLoading(false);
    }
  };

  const startEdit = () => {
    setEditForm({
      firstName: member!.firstName,
      lastName: member!.lastName,
      email: member!.email,
      phone: member!.phone,
      role: member!.role,
      department: member!.department,
      location: member!.location,
      jobTitle: member!.jobTitle,
      bio: member!.bio,
      status: member!.status,
    });
    setEditing(true);
  };

  const saveEdit = async () => {
    try {
      setSaving(true);
      const res = await coreApi.put(`/team/${params.id}`, editForm);
      setMember(res.data.data);
      setEditing(false);
      success('Profile updated', 'Team member has been successfully updated.');
    } catch (err) {
      console.error('Failed to update member:', err);
      showError('Update failed', 'Failed to update team member.');
    } finally {
      setSaving(false);
    }
  };

  const savePermissions = async () => {
    try {
      setSaving(true);
      const res = await coreApi.put(`/team/${params.id}/permissions`, { permissions: editPermissions });
      setMember(res.data.data);
      success('Permissions saved', 'User permissions have been successfully updated.');
    } catch (err) {
      console.error('Failed to update permissions:', err);
      showError('Save failed', 'Failed to save permissions.');
    } finally {
      setSaving(false);
    }
  };

  const applyRolePermissions = (role: string) => {
    setEditPermissions(rolePermissions[role] || []);
  };

  const togglePermissionAction = (resource: string, action: string) => {
    setEditPermissions(prev => {
      const existing = prev.find(p => p.resource === resource);
      if (existing) {
        const hasAction = existing.actions.includes(action);
        return prev.map(p =>
          p.resource === resource
            ? { ...p, actions: hasAction ? p.actions.filter(a => a !== action) : [...p.actions, action] }
            : p
        ).filter(p => p.actions.length > 0);
      }
      return [...prev, { resource, actions: [action] }];
    });
  };

  const deleteMember = async () => {
    try {
      await coreApi.delete(`/team/${params.id}`);
      success('Member deleted', 'Team member has been successfully removed.');
      router.push('/team');
    } catch (err) {
      console.error('Failed to delete member:', err);
      showError('Delete failed', 'Failed to delete team member.');
    }
  };

  if (!user) return <PageLoader />;

  if (loading) {
    return (
      <AuthenticatedLayout>
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin w-8 h-8 border-2 border-[#009A44] border-t-transparent rounded-full" />
        </div>
      </AuthenticatedLayout>
    );
  }

  if (!member) {
    return (
      <AuthenticatedLayout>
        <div className="text-center py-20">
          <p className="text-gray-500 dark:text-gray-400">Member not found</p>
          <button onClick={() => router.push('/team')} className="mt-4 text-[#009A44] hover:underline text-sm">Back to Team</button>
        </div>
      </AuthenticatedLayout>
    );
  }

  const initials = `${member.firstName[0] || ''}${member.lastName[0] || ''}`.toUpperCase();
  const color = colorMap[member.role] || 'bg-gray-500';
  return (
    <AuthenticatedLayout>
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <button onClick={() => router.push('/team')} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-[rgb(30,30,30)] transition-colors">
          <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
        </button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white" style={{ fontFamily: 'Afacad, sans-serif' }}>
            {member.firstName} {member.lastName}
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">{member.jobTitle} &middot; {member.department}</p>
        </div>
        <div className="flex items-center gap-2">
          {editing ? (
            <>
              <button onClick={() => setEditing(false)} className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-[rgb(30,30,30)] transition-colors">
                <X className="w-4 h-4" /> Cancel
              </button>
              <button onClick={saveEdit} disabled={saving} className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium bg-[#009A44] hover:bg-[#007a36] text-white disabled:opacity-50 transition-colors">
                <Save className="w-4 h-4" /> {saving ? 'Saving...' : 'Save'}
              </button>
            </>
          ) : (
            <>
              <button onClick={() => setShowDeleteConfirm(true)} className="p-2 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors">
                <Trash2 className="w-4 h-4" />
              </button>
              <button onClick={startEdit} className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium bg-[#009A44] hover:bg-[#007a36] text-white transition-colors">
                <Edit3 className="w-4 h-4" /> Edit
              </button>
            </>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Card */}
        <div className="lg:col-span-1">
          <div className="bg-white dark:bg-[rgb(15,15,15)] rounded-xl border border-gray-100 dark:border-[rgb(30,30,30)] p-6">
            <div className="text-center mb-6">
              <div className={`w-20 h-20 rounded-full ${color} flex items-center justify-center text-white font-bold text-2xl mx-auto mb-4`}>
                {initials}
              </div>
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">{member.firstName} {member.lastName}</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">{member.jobTitle}</p>
              <div className="flex items-center justify-center gap-2 mt-2">
                <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${roleBadge[member.role]}`}>{member.role}</span>
                <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${member.status === 'active' ? 'bg-green-50 text-green-700 dark:bg-green-950/30 dark:text-green-400' : 'bg-gray-100 text-gray-600 dark:bg-[rgb(20,20,20)] dark:text-gray-400'}`}>{member.status}</span>
              </div>
            </div>
            <div className="space-y-3 text-sm">
              <div className="flex items-center gap-3 text-gray-600 dark:text-gray-400">
                <Mail className="w-4 h-4 flex-shrink-0" />
                <span className="truncate">{member.email}</span>
              </div>
              {member.phone && (
                <div className="flex items-center gap-3 text-gray-600 dark:text-gray-400">
                  <Phone className="w-4 h-4 flex-shrink-0" />
                  <span>{member.phone}</span>
                </div>
              )}
              <div className="flex items-center gap-3 text-gray-600 dark:text-gray-400">
                <MapPin className="w-4 h-4 flex-shrink-0" />
                <span>{member.location}</span>
              </div>
              <div className="flex items-center gap-3 text-gray-600 dark:text-gray-400">
                <Shield className="w-4 h-4 flex-shrink-0" />
                <span>{member.department}</span>
              </div>
              {member.lastLogin && (
                <div className="flex items-center gap-3 text-gray-600 dark:text-gray-400">
                  <Clock className="w-4 h-4 flex-shrink-0" />
                  <span>Last login: {new Date(member.lastLogin).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                </div>
              )}
            </div>
            {member.bio && (
              <div className="mt-4 pt-4 border-t border-gray-100 dark:border-[rgb(30,30,30)]">
                <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{member.bio}</p>
              </div>
            )}
          </div>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-2">
          {/* Tabs */}
          <div className="flex gap-1 mb-4 bg-gray-100 dark:bg-[rgb(20,20,20)] rounded-lg p-1">
            {(['profile', 'permissions'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 py-2 rounded-md text-sm font-medium transition-colors ${
                  activeTab === tab
                    ? 'bg-white dark:bg-[rgb(15,15,15)] text-gray-900 dark:text-white shadow-sm'
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                }`}
              >
                {tab === 'profile' ? 'Profile Details' : 'Permissions'}
              </button>
            ))}
          </div>

          {/* Profile Tab */}
          {activeTab === 'profile' && (
            <div className="bg-white dark:bg-[rgb(15,15,15)] rounded-xl border border-gray-100 dark:border-[rgb(30,30,30)] p-6">
              {editing ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">First Name</label>
                      <Input value={editForm.firstName || ''} onChange={e => setEditForm({ ...editForm, firstName: e.target.value })} className="dark:border-[rgb(30,30,30)] dark:bg-[rgb(15,15,15)]" />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Last Name</label>
                      <Input value={editForm.lastName || ''} onChange={e => setEditForm({ ...editForm, lastName: e.target.value })} className="dark:border-[rgb(30,30,30)] dark:bg-[rgb(15,15,15)]" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Email</label>
                    <Input type="email" value={editForm.email || ''} onChange={e => setEditForm({ ...editForm, email: e.target.value })} className="dark:border-[rgb(30,30,30)] dark:bg-[rgb(15,15,15)]" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Phone</label>
                    <Input value={editForm.phone || ''} onChange={e => setEditForm({ ...editForm, phone: e.target.value })} className="dark:border-[rgb(30,30,30)] dark:bg-[rgb(15,15,15)]" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Role</label>
                      <Select value={editForm.role || 'viewer'} onValueChange={(v) => setEditForm({ ...editForm, role: v as any })}>
                        <SelectTrigger className="dark:border-[rgb(30,30,30)] dark:bg-[rgb(15,15,15)]"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="viewer">Viewer</SelectItem>
                          <SelectItem value="staff">Staff</SelectItem>
                          <SelectItem value="manager">Manager</SelectItem>
                          <SelectItem value="admin">Admin</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Status</label>
                      <Select value={editForm.status || 'active'} onValueChange={(v) => setEditForm({ ...editForm, status: v as any })}>
                        <SelectTrigger className="dark:border-[rgb(30,30,30)] dark:bg-[rgb(15,15,15)]"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="active">Active</SelectItem>
                          <SelectItem value="inactive">Inactive</SelectItem>
                          <SelectItem value="suspended">Suspended</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Department</label>
                      <Input value={editForm.department || ''} onChange={e => setEditForm({ ...editForm, department: e.target.value })} className="dark:border-[rgb(30,30,30)] dark:bg-[rgb(15,15,15)]" />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Location</label>
                      <Input value={editForm.location || ''} onChange={e => setEditForm({ ...editForm, location: e.target.value })} className="dark:border-[rgb(30,30,30)] dark:bg-[rgb(15,15,15)]" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Job Title</label>
                    <Input value={editForm.jobTitle || ''} onChange={e => setEditForm({ ...editForm, jobTitle: e.target.value })} className="dark:border-[rgb(30,30,30)] dark:bg-[rgb(15,15,15)]" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Bio</label>
                    <textarea className="w-full px-3 py-2 rounded-lg border text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-[#009A44]/20 focus:border-[#009A44] border-gray-200 dark:border-[rgb(30,30,30)] bg-white dark:bg-[rgb(15,15,15)] text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 resize-none" rows={3} value={editForm.bio || ''} onChange={e => setEditForm({ ...editForm, bio: e.target.value })} />
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-6">
                    {[
                      { label: 'Full Name', value: `${member.firstName} ${member.lastName}` },
                      { label: 'Email', value: member.email },
                      { label: 'Phone', value: member.phone || '—' },
                      { label: 'Department', value: member.department },
                      { label: 'Job Title', value: member.jobTitle },
                      { label: 'Location', value: member.location },
                      { label: 'Role', value: member.role.charAt(0).toUpperCase() + member.role.slice(1) },
                      { label: 'Status', value: member.status.charAt(0).toUpperCase() + member.status.slice(1) },
                    ].map(field => (
                      <div key={field.label}>
                        <p className="text-xs font-medium text-gray-400 dark:text-gray-500 mb-1">{field.label}</p>
                        <p className="text-sm text-gray-900 dark:text-gray-100">{field.value}</p>
                      </div>
                    ))}
                  </div>
                  <div>
                    <p className="text-xs font-medium text-gray-400 dark:text-gray-500 mb-1">Bio</p>
                    <p className="text-sm text-gray-900 dark:text-gray-100">{member.bio || '—'}</p>
                  </div>
                  <div className="pt-4 border-t border-gray-100 dark:border-[rgb(30,30,30)]">
                    <p className="text-xs text-gray-400 dark:text-gray-500">
                      Member since {new Date(member.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                      &middot; Last updated {new Date(member.updatedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Permissions Tab */}
          {activeTab === 'permissions' && (
            <div className="bg-white dark:bg-[rgb(15,15,15)] rounded-xl border border-gray-100 dark:border-[rgb(30,30,30)] p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Resource Permissions</h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Manage what this user can do across resources</p>
                </div>
                <div className="flex items-center gap-2">
                  <Select onValueChange={(v) => { if (v) applyRolePermissions(v); }}>
                    <SelectTrigger className="w-44 h-8 text-xs dark:border-[rgb(30,30,30)] dark:bg-[rgb(15,15,15)]">
                      <SelectValue placeholder="Apply role preset..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="admin">Admin</SelectItem>
                      <SelectItem value="manager">Manager</SelectItem>
                      <SelectItem value="staff">Staff</SelectItem>
                      <SelectItem value="viewer">Viewer</SelectItem>
                    </SelectContent>
                  </Select>
                  <button
                    onClick={savePermissions}
                    disabled={saving}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-[#009A44] hover:bg-[#007a36] text-white disabled:opacity-50 transition-colors"
                  >
                    <Save className="w-3.5 h-3.5" /> {saving ? 'Saving...' : 'Save'}
                  </button>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-100 dark:border-[rgb(30,30,30)]">
                      <th className="text-left py-3 px-2 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Resource</th>
                      {allActions.map(action => (
                        <th key={action} className="text-center py-3 px-2 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">{action}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {allResources.map(resource => {
                      const perm = editPermissions.find(p => p.resource === resource);
                      return (
                        <tr key={resource} className="border-b border-gray-50 dark:border-[rgb(25,25,25)]">
                          <td className="py-3 px-2 font-medium text-gray-900 dark:text-gray-100 capitalize">{resource}</td>
                          {allActions.map(action => {
                            const checked = perm?.actions.includes(action) || false;
                            return (
                              <td key={action} className="text-center py-3 px-2">
                                <Checkbox
                                  checked={checked}
                                  onCheckedChange={() => togglePermissionAction(resource, action)}
                                />
                              </td>
                            );
                          })}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              <div className="mt-4 pt-4 border-t border-gray-100 dark:border-[rgb(30,30,30)]">
                <p className="text-xs text-gray-400 dark:text-gray-500">
                  {editPermissions.reduce((sum, p) => sum + p.actions.length, 0)} permission(s) assigned across {editPermissions.length} resource(s)
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={() => setShowDeleteConfirm(false)} />
          <div className="relative bg-white dark:bg-[rgb(15,15,15)] rounded-xl border border-gray-200 dark:border-[rgb(30,30,30)] shadow-2xl p-6 max-w-sm mx-4">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Delete Member</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Are you sure you want to remove <strong>{member.firstName} {member.lastName}</strong>? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <button onClick={() => setShowDeleteConfirm(false)} className="px-4 py-2 rounded-lg text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-[rgb(30,30,30)] transition-colors">Cancel</button>
              <button onClick={deleteMember} className="px-4 py-2 rounded-lg text-sm font-medium bg-red-600 hover:bg-red-700 text-white transition-colors">Delete</button>
            </div>
          </div>
        </div>
      )}
    </AuthenticatedLayout>
  );
}
