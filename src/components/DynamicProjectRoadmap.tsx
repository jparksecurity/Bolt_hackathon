import React from 'react';
import { CheckCircle, Circle, Clock, Plus, Edit3 } from 'lucide-react';
import { ProjectRoadmap as ProjectRoadmapType } from '../types/database';

interface DynamicProjectRoadmapProps {
  roadmap: ProjectRoadmapType[];
}

const getStatusProps = (status: string | null) => {
    if (status === 'completed') {
        return {
            Icon: CheckCircle,
            bgColor: 'bg-green-100',
            textColor: 'text-green-600',
            label: 'Completed',
            labelColor: 'bg-green-100 text-green-800',
        };
    }
    
    if (status === 'in-progress') {
        return {
            Icon: Clock,
            bgColor: 'bg-blue-100',
            textColor: 'text-blue-600',
            label: 'In Progress',
            labelColor: 'bg-blue-100 text-blue-800',
        };
    }

    return {
        Icon: Circle,
        bgColor: 'bg-gray-100',
        textColor: 'text-gray-400',
        label: 'Pending',
        labelColor: 'bg-gray-100 text-gray-600',
    };
};

const formatDate = (dateString: string | null) => {
    if (!dateString) return null;
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
};

export const DynamicProjectRoadmap: React.FC<DynamicProjectRoadmapProps> = ({ roadmap }) => {
  return (
    <div className="bg-white p-6 rounded-lg border">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-gray-900">Project Roadmap</h3>
        <button className="flex items-center space-x-2 px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors">
          <Plus className="w-4 h-4" />
          <span className="text-sm">Add Step</span>
        </button>
      </div>
      
      <div className="space-y-6">
        {roadmap.length > 0 ? (
          roadmap.map((step, index) => {
            const statusProps = getStatusProps(step.status);
            return (
              <div key={step.id} className="flex items-start space-x-4">
                <div className="flex flex-col items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${statusProps.bgColor} ${statusProps.textColor}`}>
                    <statusProps.Icon className="w-5 h-5" />
                  </div>
                  {index < roadmap.length - 1 && (
                    <div className="w-px h-16 bg-gray-200 mt-2" />
                  )}
                </div>
                
                <div className="flex-1 pb-8">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold text-gray-900">{step.title}</h4>
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${statusProps.labelColor}`}>
                        {statusProps.label}
                      </span>
                      <Edit3 className="w-4 h-4 text-gray-400 cursor-pointer hover:text-gray-600" />
                    </div>
                  </div>
                  <p className="text-gray-600 text-sm mb-2">{step.description}</p>
                  <div className="text-xs text-gray-500">
                    {step.status === 'completed' && step.completed_date ? (
                      <span>Completed: {formatDate(step.completed_date)}</span>
                    ) : (
                      <span>Target: {formatDate(step.expected_date)}</span>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        ) : (
            <p className="text-gray-500">No roadmap steps have been defined for this project.</p>
        )}
      </div>
    </div>
  );
}; 