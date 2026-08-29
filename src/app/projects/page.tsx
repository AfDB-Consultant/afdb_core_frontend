'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { authUtils } from '@/lib/auth';
import { User } from '@/types';
import AuthenticatedLayout from '@/components/layout/AuthenticatedLayout';
import PageLoader from '@/components/ui/PageLoader';
import ProjectModal, { ProjectData } from '@/components/projects/ProjectModal';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import { useToast } from '@/components/ui/Toast';
import coreApi from '@/lib/coreApi';
import { FolderKanban, Plus, Search, Filter, Loader2, Eye, Pencil, Trash2, ChevronLeft, ChevronRight, DollarSign, Globe, TrendingUp, CheckCircle2, FileText } from 'lucide-react';

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
}

const formatBudget = (budget: number, currency: string = 'USD') => {
  if (budget >= 1_000_000) return `${currency === 'USD' ? '$' : currency} ${(budget / 1_000_000).toFixed(0)}M`;
  if (budget >= 1_000) return `${currency === 'USD' ? '$' : currency} ${(budget / 1_000).toFixed(0)}K`;
  return `${currency === 'USD' ? '$' : currency} ${budget}`;
};

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

export default function ProjectsPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [allProjects, setAllProjects] = useState<Project[]>([]);

  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<ProjectData | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState<string | null>(null);
  const { success, error: showError } = useToast();

  useEffect(() => {
    if (!authUtils.isAuthenticated()) { router.push('/login'); return; }
    setUser(authUtils.getUser());
  }, [router]);

  const fetchProjects = useCallback(async () => {
    setLoading(true);
    try {
      const res = await coreApi.get('/projects', { params: { page, limit: 10 } });
      if (res.data.success) {
        setProjects(res.data.data);
        setTotalPages(res.data.pagination.pages);
        setTotal(res.data.pagination.total);
      }
    } catch (err) {
      console.error('Failed to fetch projects:', err);
    } finally {
      setLoading(false);
    }
  }, [page]);

  const fetchAllProjects = useCallback(async () => {
    try {
      const res = await coreApi.get('/projects', { params: { page: 1, limit: 200 } });
      if (res.data.success) setAllProjects(res.data.data);
    } catch { /* stats are non-critical */ }
  }, []);

  useEffect(() => {
    if (user) {
      fetchProjects();
      fetchAllProjects();
    }
  }, [user, fetchProjects, fetchAllProjects]);

  if (!user) return <PageLoader />;

  const handleCreate = () => {
    setEditingProject(null);
    setModalOpen(true);
  };

  const handleEdit = (e: React.MouseEvent, project: Project) => {
    e.stopPropagation();
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

  const handleDelete = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setProjectToDelete(id);
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    if (!projectToDelete) return;
    setDeletingId(projectToDelete);
    try {
      await coreApi.delete(`/projects/${projectToDelete}`);
      success('Project deleted', 'The project has been successfully removed.');
      fetchProjects();
      fetchAllProjects();
    } catch (err) {
      console.error('Failed to delete project:', err);
      showError('Delete failed', 'Failed to delete the project.');
    } finally {
      setDeletingId(null);
      setShowDeleteConfirm(false);
      setProjectToDelete(null);
    }
  };

  const handleModalSuccess = () => {
    fetchProjects();
    fetchAllProjects();
  };

  // Compute stats from all projects
  const stats = {
    total: allProjects.length,
    active: allProjects.filter(p => p.status === 'active').length,
    totalBudget: allProjects.reduce((sum, p) => sum + p.budget, 0),
    countries: new Set(allProjects.flatMap(p => p.country.split(', ').flatMap(c => c.trim()))).size,
  };

  const Kpi = ({ title, value, subtitle, color, icon: Icon }: { title: string; value: string | number; subtitle: string; color: string; icon: React.ElementType }) => {
    const gradients: Record<string, string> = {
      blue: 'bg-gradient-to-br from-blue-500 to-blue-600 dark:from-blue-600 dark:to-blue-700',
      green: 'bg-gradient-to-br from-emerald-500 to-emerald-600 dark:from-emerald-600 dark:to-emerald-700',
      amber: 'bg-gradient-to-br from-amber-500 to-amber-600 dark:from-amber-600 dark:to-amber-700',
      red: 'bg-gradient-to-br from-rose-500 to-rose-600 dark:from-rose-600 dark:to-rose-700',
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

  const filtered = projects.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.country.toLowerCase().includes(search.toLowerCase()) ||
    p.code.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <AuthenticatedLayout>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white" style={{ fontFamily: 'Afacad, sans-serif' }}>Projects</h1>
          <p className="text-sm text-muted-foreground mt-1">{total} project{total !== 1 ? 's' : ''} in portfolio</p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => router.push('/reports')} className="flex items-center gap-2 px-4 py-2 border border-gray-200 dark:border-[rgb(30,30,30)] bg-white dark:bg-[rgb(15,15,15)] text-gray-700 dark:text-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50 dark:hover:bg-[rgb(25,25,25)] transition-colors">
            <FileText className="w-4 h-4" /> Project Reports
          </button>
          <button onClick={handleCreate} className="flex items-center gap-2 px-4 py-2 bg-[#009A44] text-white rounded-lg text-sm font-medium hover:bg-[#007a36] transition-colors">
            <Plus className="w-4 h-4" /> New Project
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-4">
        <Kpi title="Total Projects" value={stats.total} subtitle="In portfolio" icon={FolderKanban} color="blue" />
        <Kpi title="Active Projects" value={stats.active} subtitle="Currently running" icon={CheckCircle2} color="green" />
        <Kpi title="Total Budget" value={formatBudget(stats.totalBudget)} subtitle="Across all projects" icon={DollarSign} color="amber" />
        <Kpi title="Countries" value={stats.countries} subtitle="Regions covered" icon={Globe} color="red" />
      </div>

      <div className="flex items-center gap-3 mb-6">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search projects..." className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 dark:border-[rgb(30,30,30)] bg-white dark:bg-[rgb(15,15,15)] text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-[#009A44]/20 focus:border-[#009A44]" />
        </div>
        <button className="flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-200 dark:border-[rgb(30,30,30)] bg-white dark:bg-[rgb(15,15,15)] text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-[rgb(25,25,25)]">
          <Filter className="w-4 h-4" /> Filter
        </button>
      </div>

      <div className="bg-white dark:bg-[rgb(15,15,15)] rounded-xl border border-gray-100 dark:border-[rgb(30,30,30)] overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-100 dark:border-[rgb(30,30,30)]">
              <th className="text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider px-5 py-3">Project</th>
              <th className="text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider px-5 py-3">Country</th>
              <th className="text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider px-5 py-3">Budget</th>
              <th className="text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider px-5 py-3">Status</th>
              <th className="text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider px-5 py-3">Sector</th>
              <th className="text-right text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider px-5 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} className="px-5 py-16 text-center">
                  <Loader2 className="w-6 h-6 animate-spin text-[#009A44] mx-auto mb-2" />
                  <p className="text-sm text-gray-500 dark:text-gray-400">Loading projects...</p>
                </td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-5 py-16 text-center">
                  <FolderKanban className="w-10 h-10 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    {search ? 'No projects match your search' : 'No projects yet'}
                  </p>
                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                    {search ? 'Try a different search term' : 'Click "New Project" to add one'}
                  </p>
                </td>
              </tr>
            ) : (
              filtered.map((p) => (
                <tr key={p._id} onClick={() => router.push(`/projects/${p._id}`)} className="border-b border-gray-50 dark:border-[rgb(30,30,30)]/50 hover:bg-gray-50 dark:hover:bg-[rgb(25,25,25)]/30 transition-colors cursor-pointer">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-green-50 dark:bg-green-950/30 flex items-center justify-center">
                        <FolderKanban className="w-4 h-4 text-green-600 dark:text-green-400" />
                      </div>
                      <div>
                        <span className="text-sm font-medium text-gray-900 dark:text-white block">{p.name}</span>
                        <span className="text-xs text-gray-400 dark:text-gray-500">{p.code}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4 text-sm text-gray-600 dark:text-gray-300">{p.country}</td>
                  <td className="px-5 py-4 text-sm font-medium text-gray-900 dark:text-white">{formatBudget(p.budget, p.currency)}</td>
                  <td className="px-5 py-4">
                    <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${statusBadge[p.status] || ''}`}>{statusLabel[p.status] || p.status}</span>
                  </td>
                  <td className="px-5 py-4 text-sm text-gray-600 dark:text-gray-300">{p.sector}</td>
                  <td className="px-5 py-4">
                    <div className="flex items-center justify-end gap-1">
                      <button onClick={(e) => { e.stopPropagation(); router.push(`/projects/${p._id}`); }} className="w-7 h-7 rounded-md flex items-center justify-center text-gray-400 hover:text-[#009A44] hover:bg-green-50 dark:hover:bg-green-950/30 transition-colors" title="View">
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={(e) => handleEdit(e, p)} className="w-7 h-7 rounded-md flex items-center justify-center text-gray-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-950/30 transition-colors" title="Edit">
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={(e) => handleDelete(e, p._id)} disabled={deletingId === p._id} className="w-7 h-7 rounded-md flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors disabled:opacity-50" title="Delete">
                        {deletingId === p._id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-5 py-3 border-t border-gray-100 dark:border-[rgb(30,30,30)]">
            <span className="text-xs text-gray-500 dark:text-gray-400">Page {page} of {totalPages}</span>
            <div className="flex items-center gap-1">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="w-7 h-7 rounded-md flex items-center justify-center text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-[rgb(25,25,25)] disabled:opacity-30 disabled:cursor-not-allowed transition-colors">
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="w-7 h-7 rounded-md flex items-center justify-center text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-[rgb(25,25,25)] disabled:opacity-30 disabled:cursor-not-allowed transition-colors">
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Project Modal */}
      <ProjectModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSuccess={handleModalSuccess}
        project={editingProject}
      />

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showDeleteConfirm}
        title="Delete Project"
        message="Are you sure you want to delete this project? This action cannot be undone."
        confirmLabel="Delete"
        cancelLabel="Cancel"
        variant="danger"
        loading={deletingId !== null}
        onConfirm={confirmDelete}
        onCancel={() => {
          setShowDeleteConfirm(false);
          setProjectToDelete(null);
        }}
      />
    </AuthenticatedLayout>
  );
}
