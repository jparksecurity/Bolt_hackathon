import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useUser } from '@clerk/clerk-react';
import { Share, Check, ArrowLeft } from 'lucide-react';
import { useSupabaseClient } from '../lib/supabase';
import { DashboardLayout } from './DashboardLayout';
import { ProjectHeader } from './ProjectHeader';
import { ProjectRoadmap } from './ProjectRoadmap';
import { ProjectDocuments } from './ProjectDocuments';
import { PropertiesOfInterest } from './PropertiesOfInterest';
import { RecentUpdates } from './RecentUpdates';
import { BaseProjectData } from '../types/project';

interface ProjectData extends BaseProjectData {
  deleted_at?: string | null;
}

export function LeaseTrackerPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, isLoaded } = useUser();
  const supabase = useSupabaseClient();
  const [project, setProject] = useState<ProjectData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copySuccess, setCopySuccess] = useState(false);

  const fetchProject = useCallback(async () => {
    if (!id) return;
    
    try {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('id', id)
        .is('deleted_at', null)
        .single();

      if (error) {
        setError('Failed to load project');
        return;
      }

      setProject(data);
    } catch {
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  }, [id, supabase]);

  const copyToClipboard = async (text: string): Promise<boolean> => {
    if (navigator.clipboard) {
      try {
        await navigator.clipboard.writeText(text);
        return true;
      } catch {
        // Fallback to execCommand
      }
    }

    try {
      const textArea = document.createElement('textarea');
      textArea.value = text;
      textArea.style.position = 'fixed';
      textArea.style.opacity = '0';
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      
      const success = document.execCommand('copy');
      document.body.removeChild(textArea);
      
      return success;
    } catch {
      return false;
    }
  };

  const handleShareProject = async () => {
    if (!project || !user) return;

    try {
      let shareId = project.public_share_id;
      let publicUrl: string;

      if (shareId) {
        publicUrl = `${window.location.origin}/share/${shareId}`;
        const success = await copyToClipboard(publicUrl);
        
        if (success) {
          setCopySuccess(true);
          setTimeout(() => setCopySuccess(false), 2000);
        } else {
          alert('Failed to copy link to clipboard. Please try again.');
        }
        return;
      }

      shareId = crypto.randomUUID();
      publicUrl = `${window.location.origin}/share/${shareId}`;

      const success = await copyToClipboard(publicUrl);
      if (!success) {
        alert('Failed to copy link to clipboard. Please try again.');
        return;
      }

      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);

      try {
        const { error } = await supabase
          .from('projects')
          .update({ public_share_id: shareId })
          .eq('id', project.id);

        if (!error) {
          setProject({ ...project, public_share_id: shareId });
        }
      } catch {
        // Link still works since we copied it first
      }

    } catch {
      alert('Failed to create share link. Please try again.');
    }
  };

  useEffect(() => {
    if (isLoaded && user && id) {
      fetchProject();
    } else if (isLoaded && !user) {
      navigate('/');
    }
  }, [isLoaded, user, id, navigate, fetchProject]);

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
          <h2 className="text-2xl font-bold text-slate-900 mb-4">Please sign in to view this project</h2>
        </div>
      </DashboardLayout>
    );
  }

  if (error || !project) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold text-slate-900 mb-4">Project not found</h2>
          <p className="text-slate-600 mb-6">{error || 'The project you\'re looking for doesn\'t exist or you don\'t have permission to view it.'}</p>
          <button
            onClick={() => navigate('/projects')}
            className="btn-primary flex items-center space-x-2 mx-auto"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Projects</span>
          </button>
        </div>
      </DashboardLayout>
    );
  }

  const headerContent = (
    <div className="flex items-center space-x-4">
      <button
        onClick={() => navigate('/projects')}
        className="btn-secondary flex items-center space-x-2"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Projects</span>
      </button>
      <button 
        onClick={handleShareProject}
        className="btn-secondary flex items-center space-x-2"
      >
        {copySuccess ? (
          <>
            <Check className="w-4 h-4 text-green-600" />
            <span className="text-green-600">Copied!</span>
          </>
        ) : (
          <>
            <Share className="w-4 h-4" />
            <span>Share Project</span>
          </>
        )}
      </button>
    </div>
  );

  return (
    <DashboardLayout headerContent={headerContent}>
      <div className="space-y-6">
        {/* Project Header */}
        <ProjectHeader project={project} onProjectUpdate={fetchProject} />
        
        {/* Recent Updates */}
        <RecentUpdates projectId={project.id} />
        
        {/* Properties Section */}
        <PropertiesOfInterest projectId={project.id} />
        
        {/* Project Roadmap */}
        <ProjectRoadmap projectId={project.id} />
        
        {/* Project Documents */}
        <ProjectDocuments projectId={project.id} />
      </div>
    </DashboardLayout>
  );
}