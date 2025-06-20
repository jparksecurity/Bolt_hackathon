import React, { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useUser } from "@clerk/clerk-react";
import { Share, Check, ArrowLeft } from "lucide-react";
import { useSupabaseClient } from "../services/supabase";
import { DashboardLayout } from "../components/layout/DashboardLayout";
import { ProjectHeader } from "../components/common/ProjectHeader";
import { ProjectRoadmap } from "../components/common/ProjectRoadmap";
import { ProjectDocuments } from "../components/common/ProjectDocuments";
import { PropertiesOfInterest } from "../components/common/PropertiesOfInterest";
import { RecentUpdates } from "../components/common/RecentUpdates";
import { ClientTourAvailabilityCard } from "../components/common/ClientTourAvailabilityCard";
import { DragDropList } from "../components/common/DragDropList";
import { BaseProjectData } from "../types/project";

interface ProjectData extends BaseProjectData {
  deleted_at?: string | null;
}

interface ProjectCard {
  id: string;
  type: 'updates' | 'availability' | 'properties' | 'roadmap' | 'documents';
  title: string;
  order_index: number;
}

const DEFAULT_CARD_ORDER: ProjectCard[] = [
  { id: 'updates', type: 'updates', title: 'Recent Updates', order_index: 0 },
  { id: 'availability', type: 'availability', title: 'Client Tour Availability', order_index: 1 },
  { id: 'properties', type: 'properties', title: 'Properties of Interest', order_index: 2 },
  { id: 'roadmap', type: 'roadmap', title: 'Project Roadmap', order_index: 3 },
  { id: 'documents', type: 'documents', title: 'Project Documents', order_index: 4 },
];

export function LeaseTrackerPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, isLoaded } = useUser();
  const supabase = useSupabaseClient();
  const [project, setProject] = useState<ProjectData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copySuccess, setCopySuccess] = useState(false);
  const [cardOrder, setCardOrder] = useState<ProjectCard[]>(DEFAULT_CARD_ORDER);

  const fetchProject = useCallback(async () => {
    if (!id) return;

    try {
      const { data, error } = await supabase
        .from("projects")
        .select("*")
        .eq("id", id)
        .is("deleted_at", null)
        .single();

      if (error) {
        setError("Failed to load project");
        return;
      }

      setProject(data);
    } catch {
      setError("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  }, [id, supabase]);

  // Load saved card order from localStorage
  useEffect(() => {
    if (id) {
      const savedOrder = localStorage.getItem(`project-card-order-${id}`);
      if (savedOrder) {
        try {
          const parsedOrder = JSON.parse(savedOrder);
          setCardOrder(parsedOrder);
        } catch {
          // If parsing fails, use default order
          setCardOrder(DEFAULT_CARD_ORDER);
        }
      }
    }
  }, [id]);

  // Save card order to localStorage
  const saveCardOrder = useCallback((newOrder: ProjectCard[]) => {
    if (id) {
      localStorage.setItem(`project-card-order-${id}`, JSON.stringify(newOrder));
    }
  }, [id]);

  const handleCardReorder = useCallback((oldIndex: number, newIndex: number) => {
    const newOrder = [...cardOrder];
    const [removed] = newOrder.splice(oldIndex, 1);
    newOrder.splice(newIndex, 0, removed);
    
    // Update order_index for all cards
    const updatedOrder = newOrder.map((card, index) => ({
      ...card,
      order_index: index,
    }));
    
    setCardOrder(updatedOrder);
    saveCardOrder(updatedOrder);
  }, [cardOrder, saveCardOrder]);

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
      const textArea = document.createElement("textarea");
      textArea.value = text;
      textArea.style.position = "fixed";
      textArea.style.opacity = "0";
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();

      const success = document.execCommand("copy");
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
          alert("Failed to copy link to clipboard. Please try again.");
        }
        return;
      }

      shareId = crypto.randomUUID();
      publicUrl = `${window.location.origin}/share/${shareId}`;

      const success = await copyToClipboard(publicUrl);
      if (!success) {
        alert("Failed to copy link to clipboard. Please try again.");
        return;
      }

      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);

      try {
        const { error } = await supabase
          .from("projects")
          .update({ public_share_id: shareId })
          .eq("id", project.id);

        if (!error) {
          setProject({ ...project, public_share_id: shareId });
        }
      } catch {
        // Link still works since we copied it first
      }
    } catch {
      alert("Failed to create share link. Please try again.");
    }
  };

  const renderCard = useCallback((card: ProjectCard) => {
    if (!project) return null;

    switch (card.type) {
      case 'updates':
        return <RecentUpdates key={card.id} projectId={project.id} />;
      case 'availability':
        return <ClientTourAvailabilityCard key={card.id} projectId={project.id} />;
      case 'properties':
        return <PropertiesOfInterest key={card.id} projectId={project.id} />;
      case 'roadmap':
        return <ProjectRoadmap key={card.id} projectId={project.id} />;
      case 'documents':
        return <ProjectDocuments key={card.id} projectId={project.id} />;
      default:
        return null;
    }
  }, [project]);

  useEffect(() => {
    if (isLoaded && user && id) {
      fetchProject();
    } else if (isLoaded && !user) {
      navigate("/");
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

  if (error || !project) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold text-slate-900 mb-4">
            Project not found
          </h2>
          <p className="text-slate-600 mb-6">
            {error ||
              "The project you're looking for doesn't exist or you don't have permission to view it."}
          </p>
          <button
            onClick={() => navigate("/projects")}
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
        onClick={() => navigate("/projects")}
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
        {/* Project Header - Always at top */}
        <ProjectHeader project={project} onProjectUpdate={fetchProject} />

        {/* Draggable Cards Section */}
        <div className="bg-gray-50 rounded-xl p-4">
          <div className="mb-4">
            <h3 className="text-sm font-medium text-gray-700 mb-1">
              Project Information
            </h3>
            <p className="text-xs text-gray-500">
              Drag cards to reorder them by importance. Your layout will be saved automatically.
            </p>
          </div>
          
          <DragDropList 
            items={cardOrder} 
            onReorder={handleCardReorder}
          >
            {(card) => (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                {renderCard(card)}
              </div>
            )}
          </DragDropList>
        </div>
      </div>
    </DashboardLayout>
  );
}