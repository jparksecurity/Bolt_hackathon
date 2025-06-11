import React, { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Header } from './Header';
import { useUser } from '@clerk/clerk-react';
import { useSupabaseClient } from '../lib/supabase';
import { Plus, Calendar, DollarSign, Building, User, Trash2, X, TrendingUp, Activity } from 'lucide-react';
import { ProjectStatus, BaseProjectData } from '../types/project';

interface Project extends BaseProjectData {
  deleted_at?: string | null;
}

export function ProjectsListPage() {
  const { user, isLoaded } = useUser();
  const supabase = useSupabaseClient();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [deleteConfirmation, setDeleteConfirmation] = useState<{ show: boolean; projectId: string; projectTitle: string }>({
    show: false,
    projectId: '',
    projectTitle: ''
  });

  const fetchProjects = useCallback(async () => {
    try {
      if (!user) return;
      
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .is('deleted_at', null)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProjects(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch projects');
    } finally {
      setLoading(false);
    }
  }, [user, supabase]);

  const createEmptyProject = useCallback(async () => {
    try {
      if (!user) return;
      
      setCreating(true);
      setError(null);
      
      const newProject = {
        clerk_user_id: user.id,
        title: 'Untitled Project',
        status: ProjectStatus.PENDING
      };

      const { error } = await supabase
        .from('projects')
        .insert(newProject)
        .select()
        .single();

      if (error) throw error;
      
      await fetchProjects();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create project');
    } finally {
      setCreating(false);
    }
  }, [user, supabase, fetchProjects]);

  const softDeleteProject = useCallback(async (projectId: string) => {
    try {
      if (!user) return;
      
      setDeleting(projectId);
      setError(null);
      
      const { error } = await supabase
        .from('projects')
        .update({ deleted_at: new Date().toISOString() })
        .eq('id', projectId)
        .eq('clerk_user_id', user.id);

      if (error) throw error;
      
      setProjects(prevProjects => prevProjects.filter(p => p.id !== projectId));
      setDeleteConfirmation({ show: false, projectId: '', projectTitle: '' });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete project');
    } finally {
      setDeleting(null);
    }
  }, [user, supabase]);

  const handleDeleteClick = useCallback((projectId: string, projectTitle: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDeleteConfirmation({ show: true, projectId, projectTitle });
  }, []);

  const handleConfirmDelete = useCallback(() => {
    if (deleteConfirmation.projectId) {
      softDeleteProject(deleteConfirmation.projectId);
    }
  }, [deleteConfirmation.projectId, softDeleteProject]);

  const handleCancelDelete = useCallback(() => {
    setDeleteConfirmation({ show: false, projectId: '', projectTitle: '' });
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active':
        return 'status-active';
      case 'Pending':
        return 'status-pending';
      case 'Completed':
        return 'status-completed';
      case 'On Hold':
        return 'status-on-hold';
      default:
        return 'bg-[#27272a]';
    }
  };

  useEffect(() => {
    if (isLoaded && user) {
      fetchProjects();
    }
  }, [isLoaded, user, fetchProjects]);

  if (!isLoaded || loading) {
    return (
      <div className="min-h-screen bg-[#0f0f23]">
        <Header />
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#6366f1] mx-auto mb-4"></div>
            <p className="text-[#a1a1aa]">Loading projects...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-[#0f0f23]">
        <Header />
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-white mb-4">Please sign in to view your projects</h2>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#0f0f23]">
        <Header />
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="text-center text-[#ef4444]">Error: {error}</div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-[#0f0f23]">
        <Header />
        
        <div className="max-w-7xl mx-auto px-6 py-8">
          {/* Page Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">My Projects</h1>
              <p className="text-[#a1a1aa]">Track and manage your commercial real estate projects</p>
            </div>
            <button 
              onClick={createEmptyProject}
              disabled={creating}
              className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-[#6366f1] to-[#8b5cf6] text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-[#6366f1]/25 transition-all duration-300 hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Plus className="w-5 h-5 mr-2" />
              {creating ? 'Creating...' : 'New Project'}
            </button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="gradient-card p-6 rounded-xl">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[#a1a1aa] text-sm">Total Projects</p>
                  <p className="text-2xl font-bold text-white">{projects.length}</p>
                </div>
                <div className="w-12 h-12 bg-gradient-to-r from-[#6366f1] to-[#8b5cf6] rounded-xl flex items-center justify-center">
                  <Building className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>
            
            <div className="gradient-card p-6 rounded-xl">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[#a1a1aa] text-sm">Active</p>
                  <p className="text-2xl font-bold text-white">{projects.filter(p => p.status === 'Active').length}</p>
                </div>
                <div className="w-12 h-12 bg-gradient-to-r from-[#10b981] to-[#059669] rounded-xl flex items-center justify-center">
                  <Activity className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>
            
            <div className="gradient-card p-6 rounded-xl">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[#a1a1aa] text-sm">Total Value</p>
                  <p className="text-2xl font-bold text-white">
                    ${projects.reduce((sum, p) => sum + (p.expected_fee || 0), 0).toLocaleString()}
                  </p>
                </div>
                <div className="w-12 h-12 bg-gradient-to-r from-[#06b6d4] to-[#0891b2] rounded-xl flex items-center justify-center">
                  <DollarSign className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>
            
            <div className="gradient-card p-6 rounded-xl">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[#a1a1aa] text-sm">Completed</p>
                  <p className="text-2xl font-bold text-white">{projects.filter(p => p.status === 'Completed').length}</p>
                </div>
                <div className="w-12 h-12 bg-gradient-to-r from-[#8b5cf6] to-[#a855f7] rounded-xl flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>
          </div>

          {/* Projects Grid */}
          {projects.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-20 h-20 bg-gradient-to-r from-[#6366f1] to-[#8b5cf6] rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Building className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">No projects yet</h3>
              <p className="text-[#a1a1aa] mb-8">Create your first lease tracking project to get started</p>
              <button 
                onClick={createEmptyProject}
                disabled={creating}
                className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-[#6366f1] to-[#8b5cf6] text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-[#6366f1]/25 transition-all duration-300 hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Plus className="w-5 h-5 mr-2" />
                {creating ? 'Creating...' : 'Create Project'}
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {projects.map((project) => (
                <div
                  key={project.id}
                  className="relative gradient-card rounded-xl hover-lift group overflow-hidden"
                >
                  {/* Delete button */}
                  <button
                    onClick={(e) => handleDeleteClick(project.id, project.title, e)}
                    disabled={deleting === project.id}
                    className="absolute top-4 right-4 z-10 opacity-0 group-hover:opacity-100 transition-all duration-300 p-2 rounded-full bg-[#ef4444]/20 hover:bg-[#ef4444]/30 text-[#ef4444] disabled:opacity-50 disabled:cursor-not-allowed"
                    title="Delete project"
                  >
                    {deleting === project.id ? (
                      <div className="w-4 h-4 border-2 border-[#ef4444] border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <Trash2 className="w-4 h-4" />
                    )}
                  </button>

                  {/* Project content */}
                  <Link to={`/projects/${project.id}`} className="block p-6">
                    {/* Status badge */}
                    <div className="flex justify-start mb-4">
                      <span className={`px-3 py-1 text-xs font-semibold rounded-full text-white ${getStatusColor(project.status)}`}>
                        {project.status}
                      </span>
                    </div>
                    
                    {/* Title and company */}
                    <div className="mb-6 pr-8">
                      <h3 className="text-xl font-bold text-white mb-2 line-clamp-2" title={project.title}>
                        {project.title}
                      </h3>
                      <p className="text-sm text-[#a1a1aa] font-medium">{project.company_name || 'No company specified'}</p>
                    </div>

                    {/* Project details */}
                    <div className="space-y-4">
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center space-x-2 text-[#a1a1aa]">
                          <User className="w-4 h-4" />
                          <span>{project.expected_headcount || 'Not specified'}</span>
                        </div>
                        <div className="flex items-center space-x-2 text-[#a1a1aa]">
                          <Calendar className="w-4 h-4" />
                          <span>{project.start_date ? new Date(project.start_date).toLocaleDateString() : 'Not set'}</span>
                        </div>
                      </div>

                      {/* Fee prominently displayed */}
                      <div className="pt-4 border-t border-[#27272a]">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-[#a1a1aa]">Expected Fee</span>
                          <div className="flex items-center space-x-1">
                            <DollarSign className="w-4 h-4 text-[#10b981]" />
                            <span className="text-lg font-bold text-[#10b981]">
                              {project.expected_fee != null ? `${project.expected_fee.toLocaleString()}` : 'Not set'}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirmation.show && (
        <div className="fixed inset-0 modal-backdrop flex items-center justify-center z-50 p-4">
          <div className="gradient-card rounded-xl shadow-2xl max-w-md w-full mx-4 border border-[#27272a]">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white">Delete Project</h3>
                <button
                  onClick={handleCancelDelete}
                  className="text-[#a1a1aa] hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <p className="text-[#a1a1aa] mb-6">
                Are you sure you want to delete <strong className="text-white">"{deleteConfirmation.projectTitle}"</strong>? 
                This action cannot be undone.
              </p>
              
              <div className="flex justify-end space-x-3">
                <button
                  onClick={handleCancelDelete}
                  className="px-4 py-2 text-[#a1a1aa] bg-[#1a1a2e] border border-[#27272a] hover:bg-[#16213e] hover:border-[#6366f1] rounded-lg transition-all duration-300"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmDelete}
                  disabled={deleting !== null}
                  className="px-4 py-2 bg-gradient-to-r from-[#ef4444] to-[#dc2626] text-white rounded-lg hover:shadow-lg hover:shadow-[#ef4444]/25 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {deleting ? 'Deleting...' : 'Delete Project'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}