'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { authUtils } from '@/lib/auth';
import { User } from '@/types';
import AuthenticatedLayout from '@/components/layout/AuthenticatedLayout';
import PageLoader from '@/components/ui/PageLoader';
import ProjectModal, { ProjectData } from '@/components/projects/ProjectModal';
import coreApi from '@/lib/coreApi';
import {
  ArrowLeft,
  FolderKanban,
  Calendar,
  DollarSign,
  MapPin,
  Clock,
  Loader2,
  TrendingUp,
  AlertTriangle,
  Edit,
  User as UserIcon,
  FileText,
  CheckCircle2,
  Circle,
  Users,
  Flag,
} from 'lucide-react';

interface Milestone {
  name: string;
  status: 'completed' | 'in-progress' | 'pending';
  date: string;
}

interface TeamMember {
  name: string;
  role: string;
  initials: string;
  color: string;
}

interface Project {
  _id: string;
  name: string;
  code: string;
  status: string;
  country: string;
  budget: number;
  currency: string;
  sector: string;
  startDate: string;
  endDate?: string;
  manager: string;
  description: string;
  milestones: Milestone[];
  team: TeamMember[];
  progress: number;
  createdAt?: string;
  updatedAt?: string;
}

const statusBadge: Record<string, string> = {
  active: 'bg-green-50 text-green-700 dark:bg-green-950/30 dark:text-green-400',
  completed: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
  'on-hold': 'bg-amber-50 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400',
};

const statusLabel: Record<string, string> = {
  active: 'Active',
  completed: 'Completed',
  'on-hold': 'On Hold',
};

const formatBudget = (budget: number, currency: string = 'USD') => {
  if (budget >= 1_000_000) return `${currency === 'USD' ? '$' : currency} ${(budget / 1_000_000).toFixed(1)}M`;
  if (budget >= 1_000) return `${currency === 'USD' ? '$' : currency} ${(budget / 1_000).toFixed(0)}K`;
  return `${currency === 'USD' ? '$' : currency} ${budget.toLocaleString()}`;
};

export default function ProjectDetailPage() {
  const router = useRouter();
  const params = useParams();
  const [user, setUser] = useState<User | null>(null);
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<ProjectData | null>(null);

  useEffect(() => {
    if (!authUtils.isAuthenticated()) { router.push('/login'); return; }
    setUser(authUtils.getUser());
  }, [router]);

  const fetchProject = async () => {
    setLoading(true);
    setNotFound(false);
    try {
      const res = await coreApi.get(`/projects/${params.id}`);
      if (res.data.success) {
        setProject(res.data.data);
      } else {
        setNotFound(true);
      }
    } catch (err: any) {
      if (err.response?.status === 404) setNotFound(true);
      console.error('Failed to fetch project:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) fetchProject();
  }, [user, params.id]);

  if (!user) return <PageLoader />;

  const handleEdit = () => {
    if (!project) return;
    setEditingProject({
      _id: project._id,
      name: project.name,
      code: project.code,
      status: project.status as ProjectData['status'],
      country: project.country,
      budget: project.budget,
      currency: project.currency,
      sector: project.sector,
      startDate: project.startDate,
      endDate: project.endDate || '',
      manager: project.manager,
      description: project.description,
    });
    setModalOpen(true);
  };

  const handleModalSuccess = () => {
    fetchProject();
  };

  if (loading) {
    return (
      <AuthenticatedLayout>
        <div className="flex flex-col items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-[#009A44] mb-4" />
          <p className="text-sm text-gray-500 dark:text-gray-400">Loading project...</p>
        </div>
      </AuthenticatedLayout>
    );
  }

  if (notFound || !project) {
    return (
      <AuthenticatedLayout>
        <div className="flex flex-col items-center justify-center py-20">
          <AlertTriangle className="w-12 h-12 text-amber-500 mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2" style={{ fontFamily: 'Afacad, sans-serif' }}>Project Not Found</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">The project you are looking for does not exist.</p>
          <button onClick={() => router.push('/projects')} className="flex items-center gap-2 px-4 py-2 bg-[#009A44] text-white rounded-lg text-sm font-medium hover:bg-[#007a36] transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back to Projects
          </button>
        </div>
      </AuthenticatedLayout>
    );
  }

  const startDate = new Date(project.startDate);
  const endDate = project.endDate ? new Date(project.endDate) : null;

  return (
    <AuthenticatedLayout
      pageTitle={project.name}
      breadcrumbs={[{ label: 'Projects', href: '/projects' }, { label: project.name }]}
      pageActions={
        <div className="flex items-center gap-2">
          <button onClick={() => router.push('/projects')} className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-600 dark:text-gray-300 bg-white dark:bg-[rgb(15,15,15)] border border-gray-200 dark:border-[rgb(30,30,30)] rounded-lg hover:bg-gray-50 dark:hover:bg-[rgb(25,25,25)] transition-colors">
            <ArrowLeft className="w-3.5 h-3.5" /> Back
          </button>
          <button onClick={handleEdit} className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-[#009A44] rounded-lg hover:bg-[#007a36] transition-colors">
            <Edit className="w-3.5 h-3.5" /> Edit Project
          </button>
        </div>
      }
    >
      <div className="space-y-6">
        {/* Project Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-[rgb(15,15,15)] rounded-xl border border-gray-100 dark:border-[rgb(30,30,30)] p-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-green-50 dark:bg-green-950/30 flex items-center justify-center">
                <FolderKanban className="w-5 h-5 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">Status</p>
                <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${statusBadge[project.status] || ''}`}>{statusLabel[project.status] || project.status}</span>
              </div>
            </div>
          </div>
          <div className="bg-white dark:bg-[rgb(15,15,15)] rounded-xl border border-gray-100 dark:border-[rgb(30,30,30)] p-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-50 dark:bg-blue-950/30 flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">Budget</p>
                <p className="text-lg font-semibold text-gray-900 dark:text-white">{formatBudget(project.budget, project.currency)}</p>
              </div>
            </div>
          </div>
          <div className="bg-white dark:bg-[rgb(15,15,15)] rounded-xl border border-gray-100 dark:border-[rgb(30,30,30)] p-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-violet-50 dark:bg-violet-950/30 flex items-center justify-center">
                <MapPin className="w-5 h-5 text-violet-600 dark:text-violet-400" />
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">Countries</p>
                <p className="text-sm font-medium text-gray-900 dark:text-white">{project.country}</p>
              </div>
            </div>
          </div>
          <div className="bg-white dark:bg-[rgb(15,15,15)] rounded-xl border border-gray-100 dark:border-[rgb(30,30,30)] p-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-amber-50 dark:bg-amber-950/30 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-amber-600 dark:text-amber-400" />
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">Sector</p>
                <p className="text-sm font-medium text-gray-900 dark:text-white">{project.sector}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Progress & Description */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white dark:bg-[rgb(15,15,15)] rounded-xl border border-gray-100 dark:border-[rgb(30,30,30)] p-6">
            <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-3" style={{ fontFamily: 'Afacad, sans-serif' }}>About this Project</h3>
            <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed mb-6">{project.description || 'No description provided.'}</p>
            <div className="flex items-center gap-6 text-sm flex-wrap">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-gray-400" />
                <span className="text-gray-500 dark:text-gray-400">Start:</span>
                <span className="font-medium text-gray-900 dark:text-white">{startDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
              </div>
              {endDate && (
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-500 dark:text-gray-400">End:</span>
                  <span className="font-medium text-gray-900 dark:text-white">{endDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                </div>
              )}
            </div>
          </div>

          {/* Project Manager */}
          <div className="bg-white dark:bg-[rgb(15,15,15)] rounded-xl border border-gray-100 dark:border-[rgb(30,30,30)] p-6">
            <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-4" style={{ fontFamily: 'Afacad, sans-serif' }}>Project Manager</h3>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-[#009A44] flex items-center justify-center text-white font-bold text-sm">
                {project.manager.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">{project.manager}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Project Lead</p>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-gray-100 dark:border-[rgb(30,30,30)]">
              <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                <FileText className="w-3.5 h-3.5" />
                <span>Code: {project.code}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Project Progress */}
        <div className="bg-white dark:bg-[rgb(15,15,15)] rounded-xl border border-gray-100 dark:border-[rgb(30,30,30)] p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-semibold text-gray-900 dark:text-white flex items-center gap-2" style={{ fontFamily: 'Afacad, sans-serif' }}>
              <TrendingUp className="w-4 h-4 text-[#009A44]" /> Project Progress
            </h3>
            <span className="text-2xl font-bold text-[#009A44]">{project.progress}%</span>
          </div>
          <div className="w-full bg-gray-100 dark:bg-[rgb(25,25,25)] rounded-full h-3 overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${project.progress}%`,
                background: project.progress === 100
                  ? 'linear-gradient(90deg, #16A34A, #22C55E)'
                  : 'linear-gradient(90deg, #009A44, #00C853)',
              }}
            />
          </div>
          <div className="flex items-center justify-between mt-2 text-xs text-gray-500 dark:text-gray-400">
            <span>Started {startDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}</span>
            {endDate && <span>Due {endDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}</span>}
          </div>
        </div>

        {/* Milestones Timeline & Team Members */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Milestones Timeline */}
          {project.milestones && project.milestones.length > 0 && (
            <div className="bg-white dark:bg-[rgb(15,15,15)] rounded-xl border border-gray-100 dark:border-[rgb(30,30,30)] p-6">
              <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-5 flex items-center gap-2" style={{ fontFamily: 'Afacad, sans-serif' }}>
                <Flag className="w-4 h-4 text-[#009A44]" /> Milestone Progression
              </h3>
              <div className="relative">
                {/* Timeline line */}
                <div className="absolute left-[15px] top-2 bottom-2 w-0.5 bg-gray-200 dark:bg-[rgb(30,30,30)]" />
                <div className="space-y-5">
                  {project.milestones.map((ms, idx) => {
                    const isCompleted = ms.status === 'completed';
                    const isInProgress = ms.status === 'in-progress';
                    const msDate = new Date(ms.date);
                    return (
                      <div key={idx} className="relative flex items-start gap-4 pl-0">
                        {/* Dot */}
                        <div className={`relative z-10 flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center border-2 ${
                          isCompleted
                            ? 'bg-[#009A44] border-[#009A44]'
                            : isInProgress
                              ? 'bg-white dark:bg-[rgb(15,15,15)] border-[#009A44]'
                              : 'bg-white dark:bg-[rgb(15,15,15)] border-gray-300 dark:border-[rgb(40,40,40)]'
                        }`}>
                          {isCompleted ? (
                            <CheckCircle2 className="w-4 h-4 text-white" />
                          ) : isInProgress ? (
                            <div className="w-3 h-3 rounded-full bg-[#009A44] animate-pulse" />
                          ) : (
                            <Circle className="w-4 h-4 text-gray-300 dark:text-gray-600" />
                          )}
                        </div>
                        {/* Content */}
                        <div className="flex-1 pt-1">
                          <div className="flex items-center justify-between">
                            <p className={`text-sm font-medium ${
                              isCompleted ? 'text-gray-900 dark:text-white' :
                              isInProgress ? 'text-[#009A44] dark:text-green-400' :
                              'text-gray-400 dark:text-gray-500'
                            }`}>{ms.name}</p>
                            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                              isCompleted ? 'bg-green-50 text-green-700 dark:bg-green-950/30 dark:text-green-400' :
                              isInProgress ? 'bg-blue-50 text-blue-700 dark:bg-blue-950/30 dark:text-blue-400' :
                              'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400'
                            }`}>
                              {isCompleted ? 'Completed' : isInProgress ? 'In Progress' : 'Pending'}
                            </span>
                          </div>
                          <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                            {msDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Team Members */}
          {project.team && project.team.length > 0 && (
            <div className="bg-white dark:bg-[rgb(15,15,15)] rounded-xl border border-gray-100 dark:border-[rgb(30,30,30)] p-6">
              <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-5 flex items-center gap-2" style={{ fontFamily: 'Afacad, sans-serif' }}>
                <Users className="w-4 h-4 text-[#009A44]" /> Project Team
                <span className="text-xs font-normal text-gray-400 dark:text-gray-500 ml-1">({project.team.length} members)</span>
              </h3>
              <div className="space-y-3">
                {project.team.map((member, idx) => (
                  <div key={idx} className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 dark:bg-[rgb(20,20,20)] border border-gray-100 dark:border-[rgb(25,25,25)]">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-xs ${member.color || 'bg-blue-500'}`}>
                      {member.initials}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{member.name}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{member.role}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Additional Details */}
        <div className="bg-white dark:bg-[rgb(15,15,15)] rounded-xl border border-gray-100 dark:border-[rgb(30,30,30)] p-6">
          <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-4" style={{ fontFamily: 'Afacad, sans-serif' }}>Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Currency</p>
              <p className="text-sm font-medium text-gray-900 dark:text-white">{project.currency}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Created</p>
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                {project.createdAt ? new Date(project.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '-'}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Last Updated</p>
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                {project.updatedAt ? new Date(project.updatedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '-'}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Project ID</p>
              <p className="text-sm font-medium text-gray-900 dark:text-white font-mono text-xs">{project._id}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Project Modal */}
      <ProjectModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSuccess={handleModalSuccess}
        project={editingProject}
      />
    </AuthenticatedLayout>
  );
}
