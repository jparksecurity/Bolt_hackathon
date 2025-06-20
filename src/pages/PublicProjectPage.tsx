import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Eye, Lock, Calendar } from "lucide-react";
import { useSupabaseClient } from "../services/supabase";
import type { Database } from "../types/database";
import { Header } from "../components/layout/Header";
import { ProjectHeader } from "../components/common/ProjectHeader";
import { RecentUpdates } from "../components/common/RecentUpdates";
import { PropertiesOfInterest } from "../components/common/PropertiesOfInterest";
import { ProjectRoadmap } from "../components/common/ProjectRoadmap";
import { ProjectDocuments } from "../components/common/ProjectDocuments";
import { ClientTourAvailabilityModal } from "../components/common/ClientTourAvailabilityModal";
import { ClientTourAvailabilityCard } from "../components/common/ClientTourAvailabilityCard";
import { ProjectCard } from "../types/project";

const DEFAULT_CARD_ORDER: ProjectCard[] = [
  { id: "updates", type: "updates", title: "Recent Updates", order_index: 0 },
  {
    id: "availability",
    type: "availability", 
    title: "Client Tour Availability",
    order_index: 1,
  },
  {
    id: "properties",
    type: "properties",
    title: "Properties of Interest",
    order_index: 2,
  },
  { id: "roadmap", type: "roadmap", title: "Project Roadmap", order_index: 3 },
  {
    id: "documents",
    type: "documents",
    title: "Project Documents",
    order_index: 4,
  },
];

export function PublicProjectPage() {
  const { shareId } = useParams<{ shareId: string }>();
  const supabase = useSupabaseClient();
  const [project, setProject] = useState<
    Database["public"]["Tables"]["projects"]["Row"] | null
  >(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAvailabilityModal, setShowAvailabilityModal] = useState(false);
  const [cardOrder, setCardOrder] = useState<ProjectCard[]>(DEFAULT_CARD_ORDER);

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

        const projectData = data[0];
        setProject(projectData);

        // Load dashboard card order from database if available
        if (projectData.dashboard_card_order) {
          setCardOrder(projectData.dashboard_card_order as ProjectCard[]);
        }
      } catch {
        setError("An error occurred while loading the project");
      } finally {
        setLoading(false);
      }
    };

    fetchProject();
  }, [shareId, supabase]);

  const renderCard = (card: ProjectCard) => {
    if (!project) return null;

    switch (card.type) {
      case "updates":
        return (
          <div key={card.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden mb-6">
            <RecentUpdates shareId={shareId!} readonly={true} />
          </div>
        );
      case "availability":
        return (
          <div key={card.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden mb-6">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900">
                  Tour Availability
                </h3>
                <button
                  onClick={() => setShowAvailabilityModal(true)}
                  className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Calendar className="w-4 h-4" />
                  <span>I'm Available for Tours</span>
                </button>
              </div>
              <ClientTourAvailabilityCard shareId={shareId!} readonly={true} />
            </div>
          </div>
        );
      case "properties":
        return (
          <div key={card.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden mb-6">
            <div className="p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-6">
                Properties of Interest
              </h3>
              <PropertiesOfInterest shareId={shareId!} readonly={true} />
            </div>
          </div>
        );
      case "roadmap":
        return (
          <div key={card.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden mb-6">
            <ProjectRoadmap shareId={shareId!} readonly={true} />
          </div>
        );
      case "documents":
        return (
          <div key={card.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden mb-6">
            <ProjectDocuments shareId={shareId!} readonly={true} />
          </div>
        );
      default:
        return null;
    }
  };

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

  // Sort cards by order_index
  const sortedCards = [...cardOrder].sort((a, b) => a.order_index - b.order_index);

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
          {/* Render cards in order */}
          {sortedCards.map((card) => renderCard(card))}
        </div>
      </div>

      {/* Tour Availability Modal */}
      <ClientTourAvailabilityModal
        isOpen={showAvailabilityModal}
        onClose={() => setShowAvailabilityModal(false)}
        shareId={shareId!}
      />
    </div>
  );
}
