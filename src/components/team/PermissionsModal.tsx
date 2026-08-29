'use client';

import React, { useState, useEffect } from 'react';
import { X, Loader2, Shield, Check, ChevronDown } from 'lucide-react';
import coreApi from '@/lib/coreApi';
import { cn } from '@/lib/utils';

interface TeamMember {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  jobTitle: string;
  permissions: { resource: string; actions: string[] }[];
}

interface PermissionsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const resources = [
  { key: 'projects', label: 'Projects', description: 'Manage project data' },
  { key: 'reports', label: 'Reports', description: 'Access and generate reports' },
  { key: 'team', label: 'Team Members', description: 'Manage team and users' },
  { key: 'dashboard', label: 'Dashboard', description: 'View dashboard analytics' },
  { key: 'settings', label: 'Settings', description: 'Access system settings' },
  { key: 'finance', label: 'Finance', description: 'Manage budgets and payments' },
];

const actions = [
  { key: 'create', label: 'Create', color: 'text-green-600 dark:text-green-400' },
  { key: 'read', label: 'Read', color: 'text-blue-600 dark:text-blue-400' },
  { key: 'update', label: 'Update', color: 'text-amber-600 dark:text-amber-400' },
  { key: 'delete', label: 'Delete', color: 'text-red-600 dark:text-red-400' },
];

const roleBadge: Record<string, string> = {
  admin: 'bg-green-50 text-green-700 dark:bg-green-950/30 dark:text-green-400',
  manager: 'bg-blue-50 text-blue-700 dark:bg-blue-950/30 dark:text-blue-400',
  staff: 'bg-purple-50 text-purple-700 dark:bg-purple-950/30 dark:text-purple-400',
  viewer: 'bg-gray-100 text-gray-600 dark:bg-[rgb(20,20,20)] dark:text-gray-400',
};

export default function PermissionsModal({ isOpen, onClose }: PermissionsModalProps) {
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null);
  const [permissions, setPermissions] = useState<Record<string, string[]>>({});
  const [showMemberDropdown, setShowMemberDropdown] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchMembers();
    }
  }, [isOpen]);

  const fetchMembers = async () => {
    setLoading(true);
    try {
      const res = await coreApi.get('/team', { params: { limit: 100 } });
      const data = res.data.data;
      setMembers(data);
      if (data.length > 0 && !selectedMember) {
        selectMember(data[0]);
      }
    } catch (err) {
      console.error('Failed to fetch team members:', err);
    } finally {
      setLoading(false);
    }
  };

  const selectMember = (member: TeamMember) => {
    setSelectedMember(member);
    setShowMemberDropdown(false);
    // Convert permissions array to record for easier manipulation
    const permRecord: Record<string, string[]> = {};
    member.permissions?.forEach(p => {
      permRecord[p.resource] = p.actions;
    });
    setPermissions(permRecord);
  };

  const toggleAction = (resource: string, action: string) => {
    setPermissions(prev => {
      const current = prev[resource] || [];
      const updated = current.includes(action)
        ? current.filter(a => a !== action)
        : [...current, action];
      return { ...prev, [resource]: updated };
    });
  };

  const setAllActions = (resource: string, allActions: string[]) => {
    setPermissions(prev => ({ ...prev, [resource]: allActions }));
  };

  const handleSave = async () => {
    if (!selectedMember) return;
    setSaving(true);
    try {
      const permissionsArray = Object.entries(permissions)
        .filter(([, acts]) => acts.length > 0)
        .map(([resource, actions]) => ({ resource, actions }));
      
      await coreApi.put(`/team/${selectedMember._id}/permissions`, { permissions: permissionsArray });
      
      // Update local state
      setMembers(prev => prev.map(m => 
        m._id === selectedMember._id 
          ? { ...m, permissions: permissionsArray }
          : m
      ));
      setSelectedMember({ ...selectedMember, permissions: permissionsArray });
    } catch (err) {
      console.error('Failed to save permissions:', err);
    } finally {
      setSaving(false);
    }
  };

  const hasAction = (resource: string, action: string) => {
    return (permissions[resource] || []).includes(action);
  };

  const getActionCount = (resource: string) => {
    return (permissions[resource] || []).length;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 backdrop-blur-sm" style={{ backgroundColor: 'rgb(0 102 114 / 15%)' }} onClick={onClose} />

      {/* Modal */}
      <div className="relative w-full max-w-3xl max-h-[80vh] mx-4 bg-white dark:bg-[rgb(15,15,15)] rounded-2xl border border-gray-200 dark:border-[rgb(30,30,30)] shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-[rgb(30,30,30)]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-50 dark:bg-blue-950/30 flex items-center justify-center">
              <Shield className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white" style={{ fontFamily: 'Afacad, sans-serif' }}>
                Manage Permissions
              </h2>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                Configure access rights for team members
              </p>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-[rgb(25,25,25)] transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-5">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-6 h-6 text-gray-400 animate-spin" />
            </div>
          ) : (
            <div className="space-y-5">
              {/* Member Selector */}
              <div className="relative">
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5">Select Team Member</label>
                <button
                  onClick={() => setShowMemberDropdown(!showMemberDropdown)}
                  className="w-full flex items-center justify-between px-4 py-2.5 rounded-lg border border-gray-200 dark:border-[rgb(30,30,30)] bg-white dark:bg-[rgb(15,15,15)] text-left hover:bg-gray-50 dark:hover:bg-[rgb(25,25,25)] transition-colors"
                >
                  {selectedMember ? (
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-[#009A44] flex items-center justify-center text-white text-xs font-bold">
                        {`${selectedMember.firstName[0]}${selectedMember.lastName[0]}`.toUpperCase()}
                      </div>
                      <div>
                        <span className="text-sm font-medium text-gray-900 dark:text-white">
                          {selectedMember.firstName} {selectedMember.lastName}
                        </span>
                        <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">
                          {selectedMember.jobTitle}
                        </span>
                      </div>
                      <span className={cn('px-2 py-0.5 rounded-full text-[10px] font-medium', roleBadge[selectedMember.role])}>
                        {selectedMember.role}
                      </span>
                    </div>
                  ) : (
                    <span className="text-sm text-gray-400">Select a member...</span>
                  )}
                  <ChevronDown className={cn('w-4 h-4 text-gray-400 transition-transform', showMemberDropdown && 'rotate-180')} />
                </button>

                {showMemberDropdown && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-[rgb(15,15,15)] border border-gray-200 dark:border-[rgb(30,30,30)] rounded-lg shadow-lg max-h-60 overflow-y-auto z-10">
                    {members.map(member => (
                      <button
                        key={member._id}
                        onClick={() => selectMember(member)}
                        className={cn(
                          'w-full flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 dark:hover:bg-[rgb(25,25,25)] transition-colors text-left',
                          selectedMember?._id === member._id && 'bg-gray-50 dark:bg-[rgb(25,25,25)]'
                        )}
                      >
                        <div className="w-8 h-8 rounded-full bg-[#009A44] flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                          {`${member.firstName[0]}${member.lastName[0]}`.toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-gray-900 dark:text-white truncate">
                              {member.firstName} {member.lastName}
                            </span>
                            <span className={cn('px-1.5 py-0.5 rounded-full text-[10px] font-medium', roleBadge[member.role])}>
                              {member.role}
                            </span>
                          </div>
                          <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{member.email}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Permissions Grid */}
              {selectedMember && (
                <div className="space-y-3">
                  <label className="block text-xs font-medium text-gray-600 dark:text-gray-400">
                    Resource Permissions
                  </label>
                  <div className="border border-gray-200 dark:border-[rgb(30,30,30)] rounded-xl overflow-hidden">
                    {/* Header */}
                    <div className="grid grid-cols-[1fr_repeat(4,60px)] gap-2 px-4 py-2.5 bg-gray-50 dark:bg-[rgb(20,20,20)] border-b border-gray-200 dark:border-[rgb(30,30,30)]">
                      <span className="text-xs font-medium text-gray-500 dark:text-gray-400">Resource</span>
                      {actions.map(action => (
                        <span key={action.key} className={cn('text-xs font-medium text-center', action.color)}>
                          {action.label}
                        </span>
                      ))}
                    </div>

                    {/* Rows */}
                    {resources.map((resource, idx) => {
                      const count = getActionCount(resource.key);
                      return (
                        <div
                          key={resource.key}
                          className={cn(
                            'grid grid-cols-[1fr_repeat(4,60px)] gap-2 px-4 py-3 items-center',
                            idx !== resources.length - 1 && 'border-b border-gray-100 dark:border-[rgb(30,30,30)]'
                          )}
                        >
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-medium text-gray-900 dark:text-white">
                                {resource.label}
                              </span>
                              {count > 0 && (
                                <span className="px-1.5 py-0.5 rounded-full text-[10px] font-medium bg-blue-50 text-blue-600 dark:bg-blue-950/30 dark:text-blue-400">
                                  {count}/{actions.length}
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{resource.description}</p>
                          </div>
                          {actions.map(action => (
                            <button
                              key={action.key}
                              onClick={() => toggleAction(resource.key, action.key)}
                              className={cn(
                                'w-full h-8 rounded-lg flex items-center justify-center transition-all',
                                hasAction(resource.key, action.key)
                                  ? 'bg-green-50 dark:bg-green-950/30 text-green-600 dark:text-green-400 border border-green-200 dark:border-green-800'
                                  : 'bg-gray-50 dark:bg-[rgb(20,20,20)] text-gray-300 dark:text-gray-600 border border-gray-100 dark:border-[rgb(30,30,30)] hover:border-gray-200 dark:hover:border-[rgb(40,40,40)]'
                              )}
                            >
                              {hasAction(resource.key, action.key) ? (
                                <Check className="w-4 h-4" />
                              ) : (
                                <span className="w-4 h-4 rounded border border-current" />
                              )}
                            </button>
                          ))}
                        </div>
                      );
                    })}
                  </div>

                  {/* Quick Actions */}
                  <div className="flex items-center gap-2 pt-2">
                    <span className="text-xs text-gray-500 dark:text-gray-400">Quick actions:</span>
                    <button
                      onClick={() => {
                        const allPerms: Record<string, string[]> = {};
                        resources.forEach(r => { allPerms[r.key] = ['read']; });
                        setPermissions(allPerms);
                      }}
                      className="px-3 py-1 text-xs font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/30 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-950/50 transition-colors"
                    >
                      Read All
                    </button>
                    <button
                      onClick={() => {
                        const allPerms: Record<string, string[]> = {};
                        resources.forEach(r => { allPerms[r.key] = ['create', 'read', 'update', 'delete']; });
                        setPermissions(allPerms);
                      }}
                      className="px-3 py-1 text-xs font-medium text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-950/30 rounded-lg hover:bg-green-100 dark:hover:bg-green-950/50 transition-colors"
                    >
                      Full Access
                    </button>
                    <button
                      onClick={() => setPermissions({})}
                      className="px-3 py-1 text-xs font-medium text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-[rgb(20,20,20)] rounded-lg hover:bg-gray-200 dark:hover:bg-[rgb(30,30,30)] transition-colors"
                    >
                      Clear All
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100 dark:border-[rgb(30,30,30)]">
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {selectedMember && `${Object.values(permissions).flat().length} permissions configured`}
          </p>
          <div className="flex items-center gap-3">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-300 bg-white dark:bg-[rgb(20,20,20)] border border-gray-200 dark:border-[rgb(30,30,30)] rounded-lg hover:bg-gray-50 dark:hover:bg-[rgb(25,25,25)] transition-colors">
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving || !selectedMember}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-[#009A44] rounded-lg hover:bg-[#007a36] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {saving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              Save Permissions
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
