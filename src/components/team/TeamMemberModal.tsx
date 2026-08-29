'use client';

import React, { useState, useEffect } from 'react';
import { X, Loader2 } from 'lucide-react';
import coreApi from '@/lib/coreApi';
import { Input } from '@/components/ui/input';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { useToast } from '@/components/ui/Toast';
import { cn } from '@/lib/utils';

export interface TeamMemberData {
  _id?: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  role: 'admin' | 'manager' | 'staff' | 'viewer';
  department: string;
  location: string;
  jobTitle: string;
  bio: string;
  status: 'active' | 'inactive' | 'suspended';
}

interface TeamMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  member?: TeamMemberData | null;
}

const emptyForm: TeamMemberData = {
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  role: 'viewer',
  department: '',
  location: '',
  jobTitle: '',
  bio: '',
  status: 'active',
};

const departments = [
  'Administration', 'Operations', 'Engineering', 'Finance',
  'Digital', 'Health', 'Energy', 'Agriculture', 'Education', 'Trade',
];

export default function TeamMemberModal({ isOpen, onClose, onSuccess, member }: TeamMemberModalProps) {
  const [form, setForm] = useState<TeamMemberData>(emptyForm);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<keyof TeamMemberData, string>>>({});
  const { success, error: showError } = useToast();

  const isEdit = !!member?._id;

  useEffect(() => {
    if (member) {
      setForm({
        _id: member._id,
        firstName: member.firstName || '',
        lastName: member.lastName || '',
        email: member.email || '',
        phone: member.phone || '',
        role: member.role || 'viewer',
        department: member.department || '',
        location: member.location || '',
        jobTitle: member.jobTitle || '',
        bio: member.bio || '',
        status: member.status || 'active',
      });
    } else {
      setForm(emptyForm);
    }
    setErrors({});
  }, [member, isOpen]);

  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof TeamMemberData, string>> = {};
    if (!form.firstName.trim()) newErrors.firstName = 'First name is required';
    if (!form.lastName.trim()) newErrors.lastName = 'Last name is required';
    if (!form.email.trim()) newErrors.email = 'Email is required';
    if (!form.department) newErrors.department = 'Department is required';
    if (!form.location.trim()) newErrors.location = 'Location is required';
    if (!form.jobTitle.trim()) newErrors.jobTitle = 'Job title is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      if (isEdit) {
        await coreApi.put(`/team/${member._id}`, form);
        success('Member updated', 'Team member has been successfully updated.');
      } else {
        await coreApi.post('/team', form);
        success('Member created', 'Team member has been successfully created.');
      }
      onSuccess();
      onClose();
    } catch (error: any) {
      const msg = error.response?.data?.message || 'Something went wrong';
      setErrors({ email: msg });
      showError('Operation failed', msg);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: keyof TeamMemberData, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  if (!isOpen) return null;

  const labelClass = 'block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1';

  const inputErrorClass = (field: keyof TeamMemberData) =>
    errors[field] ? 'border-red-300 dark:border-red-700 bg-red-50 dark:bg-red-950/20' : '';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 backdrop-blur-sm" style={{ backgroundColor: 'rgb(0 102 114 / 15%)' }} onClick={onClose} />

      {/* Modal */}
      <div className="relative w-full max-w-2xl max-h-[75vh] mx-4 bg-white dark:bg-[rgb(15,15,15)] rounded-2xl border border-gray-200 dark:border-[rgb(30,30,30)] shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-[rgb(30,30,30)]">
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white" style={{ fontFamily: 'Afacad, sans-serif' }}>
              {isEdit ? 'Edit Team Member' : 'New Team Member'}
            </h2>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              {isEdit ? 'Update member details' : 'Add a new member to the team'}
            </p>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-[rgb(25,25,25)] transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-6 py-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* First Name */}
            <div>
              <label className={labelClass}>First Name *</label>
              <Input value={form.firstName} onChange={(e) => handleChange('firstName', e.target.value)} placeholder="e.g. Amara" className={cn('dark:border-[rgb(30,30,30)] dark:bg-[rgb(15,15,15)]', inputErrorClass('firstName'))} />
              {errors.firstName && <p className="text-xs text-red-500 mt-1">{errors.firstName}</p>}
            </div>

            {/* Last Name */}
            <div>
              <label className={labelClass}>Last Name *</label>
              <Input value={form.lastName} onChange={(e) => handleChange('lastName', e.target.value)} placeholder="e.g. Diallo" className={cn('dark:border-[rgb(30,30,30)] dark:bg-[rgb(15,15,15)]', inputErrorClass('lastName'))} />
              {errors.lastName && <p className="text-xs text-red-500 mt-1">{errors.lastName}</p>}
            </div>

            {/* Email */}
            <div>
              <label className={labelClass}>Email *</label>
              <Input type="email" value={form.email} onChange={(e) => handleChange('email', e.target.value)} placeholder="e.g. amara.diallo@afdb.org" className={cn('dark:border-[rgb(30,30,30)] dark:bg-[rgb(15,15,15)]', inputErrorClass('email'))} />
              {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email}</p>}
            </div>

            {/* Phone */}
            <div>
              <label className={labelClass}>Phone</label>
              <Input value={form.phone} onChange={(e) => handleChange('phone', e.target.value)} placeholder="e.g. +225 20 20 30 00" className="dark:border-[rgb(30,30,30)] dark:bg-[rgb(15,15,15)]" />
            </div>

            {/* Role */}
            <div>
              <label className={labelClass}>Role *</label>
              <Select value={form.role} onValueChange={(v) => handleChange('role', v)}>
                <SelectTrigger className="dark:border-[rgb(30,30,30)] dark:bg-[rgb(15,15,15)]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="manager">Manager</SelectItem>
                  <SelectItem value="staff">Staff</SelectItem>
                  <SelectItem value="viewer">Viewer</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Department */}
            <div>
              <label className={labelClass}>Department *</label>
              <Select value={form.department} onValueChange={(v) => handleChange('department', v)}>
                <SelectTrigger className={cn('dark:border-[rgb(30,30,30)] dark:bg-[rgb(15,15,15)]', inputErrorClass('department'))}>
                  <SelectValue placeholder="Select department..." />
                </SelectTrigger>
                <SelectContent>
                  {departments.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}
                </SelectContent>
              </Select>
              {errors.department && <p className="text-xs text-red-500 mt-1">{errors.department}</p>}
            </div>

            {/* Location */}
            <div>
              <label className={labelClass}>Location *</label>
              <Input value={form.location} onChange={(e) => handleChange('location', e.target.value)} placeholder="e.g. Abidjan, Côte d'Ivoire" className={cn('dark:border-[rgb(30,30,30)] dark:bg-[rgb(15,15,15)]', inputErrorClass('location'))} />
              {errors.location && <p className="text-xs text-red-500 mt-1">{errors.location}</p>}
            </div>

            {/* Job Title */}
            <div>
              <label className={labelClass}>Job Title *</label>
              <Input value={form.jobTitle} onChange={(e) => handleChange('jobTitle', e.target.value)} placeholder="e.g. System Administrator" className={cn('dark:border-[rgb(30,30,30)] dark:bg-[rgb(15,15,15)]', inputErrorClass('jobTitle'))} />
              {errors.jobTitle && <p className="text-xs text-red-500 mt-1">{errors.jobTitle}</p>}
            </div>

            {/* Status */}
            <div>
              <label className={labelClass}>Status</label>
              <Select value={form.status} onValueChange={(v) => handleChange('status', v)}>
                <SelectTrigger className="dark:border-[rgb(30,30,30)] dark:bg-[rgb(15,15,15)]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                  <SelectItem value="suspended">Suspended</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Bio */}
            <div className="md:col-span-2">
              <label className={labelClass}>Bio</label>
              <textarea value={form.bio} onChange={(e) => handleChange('bio', e.target.value)} placeholder="Brief description of the team member..." rows={3} className="w-full px-3 py-2 rounded-lg border text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-[#009A44]/20 focus:border-[#009A44] border-gray-200 dark:border-[rgb(30,30,30)] bg-white dark:bg-[rgb(15,15,15)] text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 resize-none" />
            </div>
          </div>
        </form>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-100 dark:border-[rgb(30,30,30)]">
          <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-300 bg-white dark:bg-[rgb(20,20,20)] border border-gray-200 dark:border-[rgb(30,30,30)] rounded-lg hover:bg-gray-50 dark:hover:bg-[rgb(25,25,25)] transition-colors">
            Cancel
          </button>
          <button type="submit" onClick={handleSubmit} disabled={loading} className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-[#009A44] rounded-lg hover:bg-[#007a36] disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
            {loading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
            {isEdit ? 'Update Member' : 'Create Member'}
          </button>
        </div>
      </div>
    </div>
  );
}
