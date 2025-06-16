import React, { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useUser } from '@clerk/clerk-react';
import { useSupabaseClient } from '../lib/supabase';
import { Building, DollarSign, TrendingUp, Activity, Calendar, User, ArrowRight, Maximize } from 'lucide-react';
import { ProjectStatus, BaseProjectData } from '../types/project';
import { DashboardLayout } from './DashboardLayout';

interface Project extends BaseProjectData {
  deleted_at?: string | null;
}

interface Property {
  id: string;
  project_id: string;
  sf?: string | null;
}

export function DashboardPage() {
  const { user, isLoaded } = useUser();
  const supabase = useSupabaseClient();
  const [projects, setProjects] = useState<Project[]>([]);
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
    }
  }, [user, supabase]);

  const fetchProperties = useCallback(async () => {
    try {
      if (!user) return;
      
      // Get properties for projects that are completed or in progress (Active/Pending)
      const { data, error } = await supabase
        .from('properties')
        .select(`
          id,
          project_id,
          sf
        `)
        .in('project_id', projects
          .filter(p => p.status === 'Active' || p.status === 'Pending' || p.status === 'Completed')
          .map(p => p.id)
        );

      if (error) throw error;
      setProperties(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch properties');
    }
  }, [user, supabase, projects]);

  useEffect(() => {
    if (isLoaded && user) {
      fetchProjects();
    }
  }, [isLoaded, user, fetchProjects]);

  useEffect(() => {
    if (projects.length > 0) {
      fetchProperties();
    }
  }, [projects, fetchProperties]);

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
        return 'bg-gray-500';
    }
  };

  // Helper function to format dates consistently
  const formatDate = (dateString: string | null) => {
    if (!dateString) return null;
    return new Date(dateString + 'T00:00:00').toLocaleDateString();
  };

  // Calculate total square feet from properties of completed and in-progress projects
  const calculateTotalSquareFeet = () => {
    const relevantProjectIds = projects
      .filter(p => p.status === 'Active' || p.status === 'Pending' || p.status === 'Completed')
      .map(p => p.id);
    
    return properties
      .filter(prop => relevantProjectIds.includes(prop.project_id))
      .reduce((total, prop) => {
        if (prop.sf) {
          // Parse the square footage string (remove commas and non-numeric characters)
          const sfNumber = parseFloat(prop.sf.replace(/[^0-9.]/g, ''));
          return total + (isNaN(sfNumber) ? 0 : sfNumber);
        }
        return total;
      }, 0);
  };

  const ongoingProjects = projects.filter(p => p.status === 'Active' || p.status === 'Pending');
  const totalValue = projects.reduce((sum, p) => sum + (p.expected_fee || 0), 0);
  const totalCommission = projects.reduce((sum, p) => sum + (p.broker_commission || 0), 0);
  const totalSquareFeet = calculateTotalSquareFeet();

  if (!isLoaded || loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      </DashboardLayout>
    );
  }

  if (!user) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Please sign in to view your dashboard</h2>
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout>
        <div className="text-center text-red-600 py-12">Error: {error}</div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
        <div className="dashboard-card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium mb-1">Total Projects</p>
              <p className="text-3xl font-bold text-gray-900">{projects.length}</p>
              <p className="text-xs text-gray-500 mt-1">All time</p>
            </div>
            <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center">
              <Building className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>
        
        <div className="dashboard-card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium mb-1">Active Projects</p>
              <p className="text-3xl font-bold text-gray-900">{projects.filter(p => p.status === 'Active').length}</p>
              <p className="text-xs text-green-600 mt-1">+12% this month</p>
            </div>
            <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center">
              <Activity className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>
        
        <div className="dashboard-card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium mb-1">Total Square Feet</p>
              <p className="text-3xl font-bold text-gray-900">
                {totalSquareFeet.toLocaleString()}
              </p>
              <p className="text-xs text-indigo-600 mt-1">Active & completed</p>
            </div>
            <div className="w-12 h-12 bg-indigo-500 rounded-xl flex items-center justify-center">
              <Maximize className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>
        
        <div className="dashboard-card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium mb-1">Total Value</p>
              <p className="text-3xl font-bold text-gray-900">
                ${totalValue.toLocaleString()}
              </p>
              <p className="text-xs text-blue-600 mt-1">Expected revenue</p>
            </div>
            <div className="w-12 h-12 bg-purple-500 rounded-xl flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>
        
        <div className="dashboard-card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium mb-1">Total Commission</p>
              <p className="text-3xl font-bold text-gray-900">
                ${totalCommission.toLocaleString()}
              </p>
              <p className="text-xs text-orange-600 mt-1">Expected earnings</p>
            </div>
            <div className="w-12 h-12 bg-orange-500 rounded-xl flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Ongoing Projects Section */}
      <div className="dashboard-card">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-gray-900">Ongoing Projects</h2>
              <p className="text-gray-600 text-sm mt-1">Active and pending projects requiring attention</p>
            </div>
            <Link
              to="/projects"
              className="btn-secondary flex items-center space-x-2"
            >
              <span>View All</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

        <div className="p-6">
          {ongoingProjects.length === 0 ? (
            <div className="text-center py-12">
              <Building className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No ongoing projects</h3>
              <p className="text-gray-600 mb-6">All your projects are either completed or on hold</p>
              <Link
                to="/projects"
                className="btn-primary inline-flex items-center space-x-2"
              >
                <Building className="w-4 h-4" />
                <span>View All Projects</span>
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {ongoingProjects.slice(0, 5).map((project) => (
                <Link
                  key={project.id}
                  to={`/projects/${project.id}`}
                  className="block p-4 border border-gray-200 rounded-lg hover:border-gray-300 hover:shadow-md transition-all duration-200"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="font-semibold text-gray-900">{project.title}</h3>
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full text-white ${getStatusColor(project.status)}`}>
                          {project.status}
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                        <div className="flex items-center space-x-2 text-gray-600">
                          <Building className="w-4 h-4" />
                          <span>{project.company_name || 'No company specified'}</span>
                        </div>
                        
                        <div className="flex items-center space-x-2 text-gray-600">
                          <DollarSign className="w-4 h-4" />
                          <span>
                            {project.broker_commission 
                              ? `$${project.broker_commission.toLocaleString()} commission`
                              : 'Commission not set'
                            }
                          </span>
                        </div>
                        
                        <div className="flex items-center space-x-2 text-gray-600">
                          <Calendar className="w-4 h-4" />
                          <span>
                            {project.desired_move_in_date 
                              ? `Move-in: ${formatDate(project.desired_move_in_date)}`
                              : project.start_date
                              ? `Started: ${formatDate(project.start_date)}`
                              : 'No date set'
                            }
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="ml-4">
                      <ArrowRight className="w-5 h-5 text-gray-400" />
                    </div>
                  </div>
                </Link>
              ))}
              
              {ongoingProjects.length > 5 && (
                <div className="text-center pt-4 border-t border-gray-200">
                  <Link
                    to="/projects"
                    className="text-blue-600 hover:text-blue-800 font-medium text-sm"
                  >
                    View {ongoingProjects.length - 5} more ongoing projects →
                  </Link>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}