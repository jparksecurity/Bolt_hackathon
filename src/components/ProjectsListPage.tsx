import React, { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Header } from './Header';
import { useUser } from '@clerk/clerk-react';
import { useSupabaseClient } from '../lib/supabase';
import { Plus, Calendar, DollarSign, Building, User, Trash2, X } from 'lucide-react';

interface Project {
  id: string;
  title: string;
  status: string;
  start_date?: string | null;
  expected_fee?: number | null;
  broker_commission?: number | null;
  company_name?: string | null;
  expected_headcount?: string | null;
  created_at: string;
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
        .is('deleted_at', null) // Explicitly filter out soft-deleted projects
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
        status: 'Planning'
      };

      const { error } = await supabase
        .from('projects')
        .insert(newProject)
        .select()
        .single();

      if (error) throw error;
      
      // Refresh the projects list
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
        .eq('clerk_user_id', user.id); // Additional security check

      if (error) throw error;
      
      // Remove from local state immediately for better UX
      setProjects(prevProjects => prevProjects.filter(p => p.id !== projectId));
      
      // Close confirmation dialog
      setDeleteConfirmation({ show: false, projectId: '', projectTitle: '' });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete project');
    } finally {
      setDeleting(null);
    }
  }, [user, supabase]);

  const handleDeleteClick = useCallback((projectId: string, projectTitle: string, e: React.MouseEvent) => {
    e.preventDefault(); // Prevent navigation to project page
    e.stopPropagation(); // Stop event bubbling
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

  useEffect(() => {
    if (isLoaded && user) {
      fetchProjects();
    }
  }, [isLoaded, user, fetchProjects]);

  if (!isLoaded || loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="text-center">Loading projects...</div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Please sign in to view your projects</h2>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="text-center text-red-600">Error: {error}</div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-gray-50">
        <Header />
        
        <div className="max-w-7xl mx-auto px-6 py-8">
          {/* Page Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">My Projects</h1>
              <p className="text-gray-600 mt-2">Track and manage your commercial real estate projects</p>
            </div>
            <button 
              onClick={createEmptyProject}
              disabled={creating}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Plus className="w-4 h-4 mr-2" />
              {creating ? 'Creating...' : 'New Project'}
            </button>
          </div>

          {/* Projects Grid */}
          {projects.length === 0 ? (
            <div className="text-center py-12">
              <Building className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No projects yet</h3>
              <p className="text-gray-600 mb-6">Create your first lease tracking project to get started</p>
              <button 
                onClick={createEmptyProject}
                disabled={creating}
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Plus className="w-4 h-4 mr-2" />
                {creating ? 'Creating...' : 'Create Project'}
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {projects.map((project) => (
                <div
                  key={project.id}
                  className="relative block bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-lg hover:border-blue-200 transition-all duration-200 group"
                >
                  {/* Delete button */}
                  <button
                    onClick={(e) => handleDeleteClick(project.id, project.title, e)}
                    disabled={deleting === project.id}
                    className="absolute top-4 right-4 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-200 p-2 rounded-full bg-red-50 hover:bg-red-100 text-red-600 hover:text-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    title="Delete project"
                  >
                    {deleting === project.id ? (
                      <div className="w-4 h-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <Trash2 className="w-4 h-4" />
                    )}
                  </button>

                  {/* Project content - wrapped in Link */}
                  <Link to={`/projects/${project.id}`} className="block p-6">
                    {/* Status badge */}
                    <div className="flex justify-start mb-3">
                      <span className="px-3 py-1 bg-blue-100 text-blue-800 text-xs font-semibold rounded-full">
                        {project.status}
                      </span>
                    </div>
                    
                    {/* Title and company */}
                    <div className="mb-4 pr-8"> {/* Add right padding to prevent overlap with delete button */}
                      <h3 className="text-xl font-bold text-gray-900 mb-1" title={project.title}>
                        {project.title}
                      </h3>
                      <p className="text-sm text-gray-500 font-medium">{project.company_name || 'No company specified'}</p>
                    </div>

                    {/* Project details */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center space-x-2 text-gray-600">
                          <User className="w-4 h-4" />
                          <span>{project.expected_headcount || 'Not specified'}</span>
                        </div>
                        <div className="flex items-center space-x-2 text-gray-600">
                          <Calendar className="w-4 h-4" />
                          <span>{project.start_date ? new Date(project.start_date).toLocaleDateString() : 'Not set'}</span>
                        </div>
                      </div>

                      {/* Fee prominently displayed */}
                      <div className="pt-3 border-t border-gray-100">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-gray-700">Expected Fee</span>
                          <div className="flex items-center space-x-1">
                            <DollarSign className="w-4 h-4 text-green-600" />
                            <span className="text-lg font-bold text-green-600">
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Delete Project</h3>
                <button
                  onClick={handleCancelDelete}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <p className="text-gray-600 mb-6">
                Are you sure you want to delete <strong>"{deleteConfirmation.projectTitle}"</strong>? 
                This action cannot be undone.
              </p>
              
              <div className="flex justify-end space-x-3">
                <button
                  onClick={handleCancelDelete}
                  className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmDelete}
                  disabled={deleting !== null}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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