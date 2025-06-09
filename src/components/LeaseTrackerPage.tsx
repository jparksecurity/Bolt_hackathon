import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useUser } from '@clerk/clerk-react';
import { useSupabaseClient } from '../lib/supabase';
import { Header } from './Header';
import { ProjectHeader } from './ProjectHeader';
import { ProjectRoadmap } from './ProjectRoadmap';
import { ProjectDocuments } from './ProjectDocuments';
import { PropertiesOfInterest } from './PropertiesOfInterest';
import { RecentUpdates } from './RecentUpdates';

interface ProjectData {
  id: string;
  title: string;
  status: string;
  start_date: string;
  expected_fee: number;
  broker_commission: number;
  commission_paid_by: string;
  payment_due: string;
  company_name: string;
  expected_headcount: string;
  created_at: string;
  updated_at: string;
}

export function LeaseTrackerPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, isLoaded } = useUser();
  const supabase = useSupabaseClient();
  const [project, setProject] = useState<ProjectData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isLoaded && user && id) {
      fetchProject();
    } else if (isLoaded && !user) {
      navigate('/');
    }
  }, [isLoaded, user, id, navigate]);

  const fetchProject = async () => {
    if (!id) return;
    
    try {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      setProject(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch project');
    } finally {
      setLoading(false);
    }
  };

  if (!isLoaded || loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="text-center">Loading project...</div>
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
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Please sign in to view this project</h2>
          </div>
        </div>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Project not found</h2>
            <p className="text-gray-600 mb-6">{error || 'The project you\'re looking for doesn\'t exist or you don\'t have permission to view it.'}</p>
            <button
              onClick={() => navigate('/projects')}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
            >
              Back to Projects
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-7xl mx-auto">
        <ProjectHeader />
        
        <div className="p-6">
          {/* Recent Updates - Full Width */}
          <div className="mb-6">
            <RecentUpdates />
          </div>
        </div>
        
        {/* Properties Section - Full Width */}
        <div className="px-6 pb-6">
          <PropertiesOfInterest />
        </div>
        
        {/* Project Roadmap - Full Width */}
        <div className="px-6 pb-6">
          <ProjectRoadmap />
        </div>
        
        {/* Project Documents - Full Width at Bottom */}
        <div className="px-6 pb-6">
          <ProjectDocuments />
        </div>
      </div>
    </div>
  );
}