import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Header } from './Header';
import { useUser } from '@clerk/clerk-react';
import { useSupabaseClient } from '../lib/supabase';
import { Plus, Calendar, DollarSign, Building, User } from 'lucide-react';

interface Project {
  id: string;
  title: string;
  status: string;
  start_date: string;
  expected_fee: number;
  broker_commission: number;
  company_name: string;
  expected_headcount: string;
  created_at: string;
}

export function ProjectsListPage() {
  const { user, isLoaded } = useUser();
  const supabase = useSupabaseClient();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isLoaded && user) {
      fetchProjects();
    }
  }, [isLoaded, user]);

  const fetchProjects = async () => {
    try {
      if (!user) return;
      
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProjects(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch projects');
    } finally {
      setLoading(false);
    }
  };

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
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Page Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">My Projects</h1>
            <p className="text-gray-600 mt-2">Track and manage your commercial real estate projects</p>
          </div>
          <button className="inline-flex items-center px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors">
            <Plus className="w-4 h-4 mr-2" />
            New Project
          </button>
        </div>

        {/* Projects Grid */}
        {projects.length === 0 ? (
          <div className="text-center py-12">
            <Building className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No projects yet</h3>
            <p className="text-gray-600 mb-6">Create your first lease tracking project to get started</p>
            <button className="inline-flex items-center px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors">
              <Plus className="w-4 h-4 mr-2" />
              Create Project
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project) => (
              <Link
                key={project.id}
                to={`/projects/${project.id}`}
                className="block bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-lg hover:border-blue-200 transition-all duration-200"
              >
                <div className="p-6">
                  {/* Status badge on its own line */}
                  <div className="flex justify-end mb-3">
                    <span className="px-3 py-1 bg-green-100 text-green-800 text-xs font-semibold rounded-full">
                      {project.status}
                    </span>
                  </div>
                  
                  {/* Title and company with full width */}
                  <div className="mb-4">
                    <h3 className="text-xl font-bold text-gray-900 mb-1" title={project.title}>
                      {project.title}
                    </h3>
                    <p className="text-sm text-gray-500 font-medium">{project.company_name}</p>
                  </div>

                  {/* Project details */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center space-x-2 text-gray-600">
                        <User className="w-4 h-4" />
                        <span>{project.expected_headcount} employees</span>
                      </div>
                      <div className="flex items-center space-x-2 text-gray-600">
                        <Calendar className="w-4 h-4" />
                        <span>{new Date(project.start_date).toLocaleDateString()}</span>
                      </div>
                    </div>

                    {/* Fee prominently displayed */}
                    <div className="pt-3 border-t border-gray-100">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-700">Expected Fee</span>
                        <div className="flex items-center space-x-1">
                          <DollarSign className="w-4 h-4 text-green-600" />
                          <span className="text-lg font-bold text-green-600">
                            {project.expected_fee.toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
} 