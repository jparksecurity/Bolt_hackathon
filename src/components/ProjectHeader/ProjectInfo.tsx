import React from "react";
import { Edit3, Building, MapPin } from "lucide-react";
import type { Database } from "../../types/database";
import { formatLocation, getStatusColor } from "../../utils/displayUtils";

type ProjectRow = Database["public"]["Tables"]["projects"]["Row"];

interface ProjectInfoProps {
  project: ProjectRow;
  readonly?: boolean;
  onOpenProjectModal: () => void;
}

export const ProjectInfo: React.FC<ProjectInfoProps> = ({
  project,
  readonly = false,
  onOpenProjectModal,
}) => {
  const locationDisplay = formatLocation(project.city, project.state);

  return (
    <div className="flex items-start justify-between mb-8">
      <div className="flex-1">
        <div className="flex items-center space-x-4 mb-4">
          <h1 className="text-3xl font-bold text-gray-900">{project.title}</h1>
          {locationDisplay && (
            <div className="flex items-center space-x-1 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
              <MapPin className="w-3 h-3" />
              <span>{locationDisplay}</span>
            </div>
          )}
          {!readonly && (
            <button
              onClick={onOpenProjectModal}
              className="p-2 text-gray-400 hover:text-gray-800 transition-colors rounded-lg hover:bg-gray-50"
            >
              <Edit3 className="w-5 h-5" />
            </button>
          )}
        </div>
        <div className="flex items-center space-x-4">
          <span
            className={`px-4 py-2 text-white rounded-full font-semibold text-sm ${getStatusColor(
              project.status,
            )}`}
          >
            {project.status}
          </span>
          {project.company_name && (
            <div className="flex items-center space-x-2 text-gray-600">
              <Building className="w-4 h-4" />
              <span className="font-medium">{project.company_name}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
