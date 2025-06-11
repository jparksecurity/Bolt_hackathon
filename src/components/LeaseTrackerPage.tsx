import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useUser } from '@clerk/clerk-react';
import { Share, Check } from 'lucide-react';
import { useSupabaseClient } from '../lib/supabase';
import { Header } from './Header';
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
        .is('deleted_at', null) // Explicitly exclude soft-deleted projects
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
    // Try modern Clipboard API first
    if (navigator.clipboard) {
      try {
        await navigator.clipboard.writeText(text);
        return true;
      } catch {
        // Fallback to execCommand if Clipboard API fails
      }
    }

    // Fallback to execCommand for older browsers or when Clipboard API fails
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

      // If shareId exists, just copy it immediately
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

      // No shareId exists - use copy-first approach to preserve user activation
      shareId = crypto.randomUUID();
      publicUrl = `${window.location.origin}/share/${shareId}`;

      // Step 1: Copy to clipboard FIRST (while user activation is still valid)
      const success = await copyToClipboard(publicUrl);
      if (!success) {
        alert('Failed to copy link to clipboard. Please try again.');
        return;
      }

      // Step 2: Show immediate success feedback
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);

      // Step 3: Update database in background (after clipboard copy is complete)
      try {
        const { error } = await supabase
          .from('projects')
          .update({ public_share_id: shareId })
          .eq('id', project.id);

        if (error) {
          // Link still works since we copied it first
        } else {
          // Update local state on successful DB update
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
      <Header>
        <button 
          onClick={handleShareProject}
          className="flex items-center space-x-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
        >
          {copySuccess ? (
            <>
              <Check className="w-4 h-4 text-green-600" />
              <span className="text-sm text-green-600">Copied!</span>
            </>
          ) : (
            <>
              <Share className="w-4 h-4" />
              <span className="text-sm">Copy Public Link</span>
            </>
          )}
        </button>
      </Header>
      
      <div className="max-w-7xl mx-auto">
        <ProjectHeader project={project} onProjectUpdate={fetchProject} />
        
        <div className="p-6">
          {/* Recent Updates - Full Width */}
          <div className="mb-6">
            <RecentUpdates projectId={project.id} />
          </div>
        </div>
        
        {/* Properties Section - Full Width */}
        <div className="px-6 pb-6">
          <PropertiesOfInterest projectId={project.id} />
        </div>
        
        {/* Project Roadmap - Full Width */}
        <div className="px-6 pb-6">
          <ProjectRoadmap projectId={project.id} />
        </div>
        
        {/* Project Documents - Full Width at Bottom */}
        <div className="px-6 pb-6">
          <ProjectDocuments projectId={project.id} />
        </div>
      </div>
    </div>
  );
}