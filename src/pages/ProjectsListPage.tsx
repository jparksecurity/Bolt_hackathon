import React, { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { useUser } from "@clerk/clerk-react";
import { useSupabaseClient } from "../services/supabase";
import {
  Plus,
  Calendar,
  DollarSign,
  Building,
  User,
  Trash2,
  X,
  Search,
  Filter,
  MapPin,
} from "lucide-react";
import { ProjectStatus, BaseProjectData } from "../types/project";
import { DashboardLayout } from "../components/layout/DashboardLayout";
import { formatDate } from "../utils/dateUtils";

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
  const [searchTerm, setSearchTerm] = useState("");
  const [deleteConfirmation, setDeleteConfirmation] = useState<{
    show: boolean;
    projectId: string;
    projectTitle: string;
  }>({
    show: false,
    projectId: "",
    projectTitle: "",
  });

  const fetchProjects = useCallback(async () => {
    try {
      if (!user) return;

      const { data, error } = await supabase
        .from("projects")
        .select("*")
        .is("deleted_at", null)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setProjects(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch projects");
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
        title: "Untitled Project",
        status: ProjectStatus.PENDING,
      };

      const { error } = await supabase
        .from("projects")
        .insert(newProject)
        .select()
        .single();

      if (error) throw error;

      await fetchProjects();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create project");
    } finally {
      setCreating(false);
    }
  }, [user, supabase, fetchProjects]);

  const softDeleteProject = useCallback(
    async (projectId: string) => {
      try {
        if (!user) return;

        setDeleting(projectId);
        setError(null);

        const { error } = await supabase
          .from("projects")
          .update({ deleted_at: new Date().toISOString() })
          .eq("id", projectId)
          .eq("clerk_user_id", user.id);

        if (error) throw error;

        setProjects((prevProjects) =>
          prevProjects.filter((p) => p.id !== projectId),
        );
        setDeleteConfirmation({ show: false, projectId: "", projectTitle: "" });
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to delete project",
        );
      } finally {
        setDeleting(null);
      }
    },
    [user, supabase],
  );

  const handleDeleteClick = useCallback(
    (projectId: string, projectTitle: string, e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setDeleteConfirmation({ show: true, projectId, projectTitle });
    },
    [],
  );

  const handleConfirmDelete = useCallback(() => {
    if (deleteConfirmation.projectId) {
      softDeleteProject(deleteConfirmation.projectId);
    }
  }, [deleteConfirmation.projectId, softDeleteProject]);

  const handleCancelDelete = useCallback(() => {
    setDeleteConfirmation({ show: false, projectId: "", projectTitle: "" });
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Active":
        return "status-active";
      case "Pending":
        return "status-pending";
      case "Completed":
        return "status-completed";
      case "On Hold":
        return "status-on-hold";
      default:
        return "bg-gray-500";
    }
  };

  const filteredProjects = projects.filter(
    (project) =>
      project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (project.company_name &&
        project.company_name
          .toLowerCase()
          .includes(searchTerm.toLowerCase())) ||
      (project.city &&
        project.city.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (project.state &&
        project.state.toLowerCase().includes(searchTerm.toLowerCase())),
  );

  // Helper function to format location display
  const formatLocation = (city?: string | null, state?: string | null) => {
    if (!city && !state) return null;
    if (city && state) return `${city}, ${state}`;
    if (city) return city;
    if (state) return state;
    return null;
  };

  useEffect(() => {
    if (isLoaded && user) {
      fetchProjects();
    }
  }, [isLoaded, user, fetchProjects]);

  if (!isLoaded || loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
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

  const headerContent = (
    <div className="flex items-center space-x-4">
      <div className="relative">
        <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          placeholder="Search projects..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="form-input pl-10 pr-4 py-2.5 w-64 text-sm"
        />
      </div>
      <button className="btn-secondary flex items-center space-x-2 px-4 py-2.5">
        <Filter className="w-4 h-4" />
        <span>Filter</span>
      </button>
      <button
        onClick={createEmptyProject}
        disabled={creating}
        className="btn-primary flex items-center space-x-2 px-6 py-2.5"
      >
        <Plus className="w-4 h-4" />
        <span>{creating ? "Creating..." : "New Project"}</span>
      </button>
    </div>
  );

  return (
    <DashboardLayout headerContent={headerContent}>
      {/* Projects Grid */}
      {filteredProjects.length === 0 ? (
        <div className="dashboard-card p-12 text-center">
          <div className="w-20 h-20 bg-blue-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Building className="w-10 h-10 text-white" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-3">
            {searchTerm ? "No projects found" : "No projects yet"}
          </h3>
          <p className="text-gray-600 mb-8 max-w-md mx-auto">
            {searchTerm
              ? "Try adjusting your search terms to find what you're looking for"
              : "Create your first lease tracking project to get started with managing your commercial real estate deals"}
          </p>
          {!searchTerm && (
            <button
              onClick={createEmptyProject}
              disabled={creating}
              className="btn-primary flex items-center space-x-2 mx-auto px-8 py-3"
            >
              <Plus className="w-5 h-5" />
              <span>
                {creating ? "Creating..." : "Create Your First Project"}
              </span>
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map((project) => {
            const locationDisplay = formatLocation(project.city, project.state);

            return (
              <div key={project.id} className="project-card group">
                {/* Delete button */}
                <button
                  onClick={(e) =>
                    handleDeleteClick(project.id, project.title, e)
                  }
                  disabled={deleting === project.id}
                  className="absolute top-4 right-4 z-10 opacity-0 group-hover:opacity-100 transition-all duration-200 p-2 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 disabled:opacity-50"
                  title="Delete project"
                >
                  {deleting === project.id ? (
                    <div className="w-4 h-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Trash2 className="w-4 h-4" />
                  )}
                </button>

                {/* Project content */}
                <Link to={`/projects/${project.id}`} className="block">
                  {/* Status badge and location */}
                  <div className="flex justify-between items-start mb-4">
                    <span
                      className={`px-3 py-1.5 text-xs font-semibold rounded-full text-white ${getStatusColor(
                        project.status,
                      )}`}
                    >
                      {project.status}
                    </span>
                    {locationDisplay && (
                      <div className="flex items-center space-x-1 px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                        <MapPin className="w-3 h-3" />
                        <span>{locationDisplay}</span>
                      </div>
                    )}
                  </div>

                  {/* Title and company */}
                  <div className="mb-6 pr-8">
                    <h3
                      className="text-lg font-bold text-gray-900 mb-2 line-clamp-2"
                      title={project.title}
                    >
                      {project.title}
                    </h3>
                    <p className="text-sm text-gray-600 font-medium">
                      {project.company_name || "No company specified"}
                    </p>
                  </div>

                  {/* Project details */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center space-x-2 text-gray-600">
                        <User className="w-4 h-4" />
                        <span>
                          {project.expected_headcount || "Not specified"}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2 text-gray-600">
                        <Calendar className="w-4 h-4" />
                        <span>
                          {formatDate(project.start_date) || "Not set"}
                        </span>
                      </div>
                    </div>

                    {/* Broker Commission */}
                    <div className="pt-4 border-t border-gray-100">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-600">
                          Broker Commission
                        </span>
                        <div className="flex items-center space-x-1">
                          <DollarSign className="w-4 h-4 text-green-600" />
                          <span className="text-lg font-bold text-green-600">
                            {project.broker_commission != null
                              ? `${project.broker_commission.toLocaleString()}`
                              : "Not set"}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              </div>
            );
          })}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmation.show && (
        <div className="fixed inset-0 modal-backdrop flex items-center justify-center z-50 p-4">
          <div className="dashboard-card max-w-md w-full mx-4">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900">
                  Delete Project
                </h3>
                <button
                  onClick={handleCancelDelete}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <p className="text-gray-600 mb-8">
                Are you sure you want to delete{" "}
                <strong className="text-gray-900">
                  "{deleteConfirmation.projectTitle}"
                </strong>
                ? This action cannot be undone and all project data will be
                permanently removed.
              </p>

              <div className="flex justify-end space-x-3">
                <button
                  onClick={handleCancelDelete}
                  className="btn-secondary px-6 py-2.5"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmDelete}
                  disabled={deleting !== null}
                  className="px-6 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 font-medium"
                >
                  {deleting ? "Deleting..." : "Delete Project"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
