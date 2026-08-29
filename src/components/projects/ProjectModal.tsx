'use client';

import React, { useState, useEffect } from 'react';
import { X, Loader2 } from 'lucide-react';
import coreApi from '@/lib/coreApi';
import { Input } from '@/components/ui/input';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { DatePicker } from '@/components/ui/datepicker';
import { useToast } from '@/components/ui/Toast';
import { cn } from '@/lib/utils';

export interface ProjectData {
  _id?: string;
  name: string;
  code: string;
  status: 'active' | 'completed' | 'on-hold';
  country: string;
  budget: number;
  currency: string;
  sector: string;
  startDate: string;
  endDate: string;
  manager: string;
  description: string;
}

interface ProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  project?: ProjectData | null;
}

const emptyForm: ProjectData = {
  name: '',
  code: '',
  status: 'active',
  country: '',
  budget: 0,
  currency: 'USD',
  sector: '',
  startDate: '',
  endDate: '',
  manager: '',
  description: '',
};

const sectors = [
  'Infrastructure', 'Energy', 'Digital', 'Agriculture',
  'Health', 'Education', 'Multi-sector', 'Finance', 'Transport',
];

export default function ProjectModal({ isOpen, onClose, onSuccess, project }: ProjectModalProps) {
  const [form, setForm] = useState<ProjectData>(emptyForm);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<keyof ProjectData, string>>>({});
  const { success, error: showError } = useToast();

  const isEdit = !!project?._id;

  useEffect(() => {
    if (project) {
      setForm({
        _id: project._id,
        name: project.name || '',
        code: project.code || '',
        status: project.status || 'active',
        country: project.country || '',
        budget: project.budget || 0,
        currency: project.currency || 'USD',
        sector: project.sector || '',
        startDate: project.startDate ? project.startDate.split('T')[0] : '',
        endDate: project.endDate ? project.endDate.split('T')[0] : '',
        manager: project.manager || '',
        description: project.description || '',
      });
    } else {
      setForm(emptyForm);
    }
    setErrors({});
  }, [project, isOpen]);

  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof ProjectData, string>> = {};
    if (!form.name.trim()) newErrors.name = 'Project name is required';
    if (!form.code.trim()) newErrors.code = 'Project code is required';
    if (!form.country.trim()) newErrors.country = 'Country is required';
    if (!form.sector) newErrors.sector = 'Sector is required';
    if (!form.startDate) newErrors.startDate = 'Start date is required';
    if (!form.manager.trim()) newErrors.manager = 'Project manager is required';
    if (form.budget < 0) newErrors.budget = 'Budget cannot be negative';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      const payload = {
        ...form,
        budget: Number(form.budget),
        startDate: new Date(form.startDate).toISOString(),
        endDate: form.endDate ? new Date(form.endDate).toISOString() : undefined,
      };

      if (isEdit) {
        await coreApi.put(`/projects/${project._id}`, payload);
        success('Project updated', 'The project has been successfully updated.');
      } else {
        await coreApi.post('/projects', payload);
        success('Project created', 'The project has been successfully created.');
      }
      onSuccess();
      onClose();
    } catch (error: any) {
      const msg = error.response?.data?.message || 'Something went wrong';
      setErrors({ name: msg });
      showError('Operation failed', msg);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: keyof ProjectData, value: string | number) => {
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

  const inputErrorClass = (field: keyof ProjectData) =>
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
              {isEdit ? 'Edit Project' : 'New Project'}
            </h2>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              {isEdit ? 'Update project details' : 'Add a new project to the portfolio'}
            </p>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-[rgb(25,25,25)] transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-6 py-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Project Name */}
            <div className="md:col-span-2">
              <label className={labelClass}>Project Name *</label>
              <Input value={form.name} onChange={(e) => handleChange('name', e.target.value)} placeholder="e.g. East Africa Transport Corridor" className={cn('dark:border-[rgb(30,30,30)] dark:bg-[rgb(15,15,15)]', inputErrorClass('name'))} />
              {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
            </div>

            {/* Project Code */}
            <div>
              <label className={labelClass}>Project Code *</label>
              <Input value={form.code} onChange={(e) => handleChange('code', e.target.value)} placeholder="e.g. AFDB-EAC-001" disabled={isEdit} className={cn('dark:border-[rgb(30,30,30)] dark:bg-[rgb(15,15,15)]', inputErrorClass('code'))} />
              {errors.code && <p className="text-xs text-red-500 mt-1">{errors.code}</p>}
            </div>

            {/* Sector */}
            <div>
              <label className={labelClass}>Sector *</label>
              <Select value={form.sector} onValueChange={(v) => handleChange('sector', v)}>
                <SelectTrigger className={cn('dark:border-[rgb(30,30,30)] dark:bg-[rgb(15,15,15)]', inputErrorClass('sector'))}>
                  <SelectValue placeholder="Select sector..." />
                </SelectTrigger>
                <SelectContent>
                  {sectors.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                </SelectContent>
              </Select>
              {errors.sector && <p className="text-xs text-red-500 mt-1">{errors.sector}</p>}
            </div>

            {/* Country */}
            <div>
              <label className={labelClass}>Country *</label>
              <Input value={form.country} onChange={(e) => handleChange('country', e.target.value)} placeholder="e.g. Kenya, Tanzania" className={cn('dark:border-[rgb(30,30,30)] dark:bg-[rgb(15,15,15)]', inputErrorClass('country'))} />
              {errors.country && <p className="text-xs text-red-500 mt-1">{errors.country}</p>}
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
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="on-hold">On Hold</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Budget */}
            <div>
              <label className={labelClass}>Budget</label>
              <div className="flex gap-2">
                <Input type="number" value={form.budget} onChange={(e) => handleChange('budget', e.target.value)} placeholder="0" className={cn('flex-1 dark:border-[rgb(30,30,30)] dark:bg-[rgb(15,15,15)]', inputErrorClass('budget'))} />
                <Select value={form.currency} onValueChange={(v) => handleChange('currency', v)}>
                  <SelectTrigger className="w-24 dark:border-[rgb(30,30,30)] dark:bg-[rgb(15,15,15)]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="USD">USD</SelectItem>
                    <SelectItem value="EUR">EUR</SelectItem>
                    <SelectItem value="XOF">XOF</SelectItem>
                    <SelectItem value="XAF">XAF</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {errors.budget && <p className="text-xs text-red-500 mt-1">{errors.budget}</p>}
            </div>

            {/* Project Manager */}
            <div>
              <label className={labelClass}>Project Manager *</label>
              <Input value={form.manager} onChange={(e) => handleChange('manager', e.target.value)} placeholder="e.g. James Mwangi" className={cn('dark:border-[rgb(30,30,30)] dark:bg-[rgb(15,15,15)]', inputErrorClass('manager'))} />
              {errors.manager && <p className="text-xs text-red-500 mt-1">{errors.manager}</p>}
            </div>

            {/* Start Date */}
            <div>
              <label className={labelClass}>Start Date *</label>
              <DatePicker value={form.startDate} onChange={(v) => handleChange('startDate', v)} placeholder="Select start date" error={!!errors.startDate} />
              {errors.startDate && <p className="text-xs text-red-500 mt-1">{errors.startDate}</p>}
            </div>

            {/* End Date */}
            <div>
              <label className={labelClass}>End Date</label>
              <DatePicker value={form.endDate} onChange={(v) => handleChange('endDate', v)} placeholder="Select end date" />
            </div>

            {/* Description */}
            <div className="md:col-span-2">
              <label className={labelClass}>Description</label>
              <textarea value={form.description} onChange={(e) => handleChange('description', e.target.value)} placeholder="Brief description of the project..." rows={3} className={cn('w-full px-3 py-2 rounded-lg border text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-[#009A44]/20 focus:border-[#009A44] border-gray-200 dark:border-[rgb(30,30,30)] bg-white dark:bg-[rgb(15,15,15)] text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 resize-none', inputErrorClass('description'))} />
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
            {isEdit ? 'Update Project' : 'Create Project'}
          </button>
        </div>
      </div>
    </div>
  );
}
