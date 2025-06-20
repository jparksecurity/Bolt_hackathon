import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Eye, Lock } from "lucide-react";
import { useSupabaseClient } from "../services/supabase";
import { BaseProjectData } from "../types/project";
import { Header } from "../components/layout/Header";
import { ProjectHeader } from "../components/common/ProjectHeader";
import { RecentUpdates } from "../components/common/RecentUpdates";
import { PropertiesOfInterest } from "../components/common/PropertiesOfInterest";
import { ProjectRoadmap } from "../components/common/ProjectRoadmap";
import { ProjectDocuments } from "../components/common/ProjectDocuments";
import { ClientAvailabilitySection } from "../components/common/ClientAvailabilitySection";

export function PublicProjectPage() {
  const { shareId } = useParams<{ shareId: string }>();
  const supabase = useSupabaseClient();
  const [project, setProject] = useState<BaseProjectData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProject = async () => {
      if (!shareId) {
        setError("Invalid share link");
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase.rpc("get_public_project", {
          share_id: shareId,
        });

        if (error) {
          setError("Project not found");
          return;
        }

        if (!data || data.length === 0) {
          setError("Project not found or not shared publicly");
          return;
        }

        setProject(data[0]);
      } catch {
        setError("An error occurred while loading the project");
      } finally {
        setLoading(false);
      }
    };

    fetchProject();
  }, [shareId, supabase]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header>
          <div className="flex items-center space-x-2">
            <Eye className="w-4 h-4 text-blue-600" />
            <span className="text-sm text-blue-600">
              Loading shared project...
            </span>
          </div>
        </Header>
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading project...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header>
          <div className="flex items-center space-x-2">
            <Lock className="w-4 h-4 text-red-600" />
            <span className="text-sm text-red-600">Access Denied</span>
          </div>
        </Header>
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Project not found
            </h2>
            <p className="text-gray-600 mb-6">
              {error ||
                "The project you're looking for doesn't exist or is not shared publicly."}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header with Logo and Navigation */}
      <Header>
        <div className="flex items-center space-x-2">
          <Eye className="w-4 h-4 text-blue-600" />
          <span className="text-sm font-medium text-blue-600">
            Public View - Read Only
          </span>
        </div>
      </Header>

      <div className="max-w-7xl mx-auto">
        <ProjectHeader project={project} readonly={true} shareId={shareId!} />

        <div className="p-6">
          {/* Recent Updates - Full Width */}
          <div className="mb-6">
            <RecentUpdates shareId={shareId!} readonly={true} />
          </div>
        </div>

        {/* Properties Section with Client Availability */}
        <div className="px-6 pb-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-gray-900">
              Properties of Interest
            </h3>
          </div>
          
          {/* Client Availability Section */}
          <div className="mb-6">
            <ClientAvailabilitySection 
              projectId={project.id} 
              shareId={shareId!} 
            />
          </div>
          
          {/* Properties List */}
          <PropertiesOfInterest shareId={shareId!} readonly={true} />
        </div>

        {/* Project Roadmap - Full Width */}
        <div className="px-6 pb-6">
          <ProjectRoadmap shareId={shareId!} readonly={true} />
        </div>

        {/* Project Documents - Full Width at Bottom */}
        <div className="px-6 pb-6">
          <ProjectDocuments shareId={shareId!} readonly={true} />
        </div>
      </div>
    </div>
  );
}