import React from 'react';
import { CheckCircle, Circle, Clock, Plus, Edit3 } from 'lucide-react';

interface ProjectRoadmapProps {
  projectId: string;
}

const roadmapSteps = [
  {
    id: 1,
    title: 'Initial Client Consultation',
    description: 'Gathered detailed requirements, timeline expectations, and timeline expectations from the client team.',
    status: 'completed',
    expectedDate: 'Jan 15, 2024',
    completedDate: 'Jan 15, 2024'
  },
  {
    id: 2,
    title: 'Market Research & Property Sourcing',
    description: 'Identifying suitable properties that match client criteria and conducting market analysis for competitive pricing.',
    status: 'in-progress',
    expectedDate: 'Feb 1, 2024',
    completedDate: null
  },
  {
    id: 3,
    title: 'Property Tours & Negotiations',
    description: 'Schedule property viewings with client and begin lease negotiations with preferred properties.',
    status: 'pending',
    expectedDate: 'Feb 15, 2024',
    completedDate: null
  }
];

export const ProjectRoadmap: React.FC<ProjectRoadmapProps> = () => {
  // TODO: Use projectId to fetch roadmap from database

  return (
    <div className="bg-white p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-gray-900">Project Roadmap</h3>
        <button className="flex items-center space-x-2 px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors">
          <Plus className="w-4 h-4" />
          <span className="text-sm">Add Step</span>
        </button>
      </div>
      
      <div className="space-y-6">
        {roadmapSteps.map((step, index) => (
          <div key={step.id} className="flex items-start space-x-4">
            <div className="flex flex-col items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                step.status === 'completed' 
                  ? 'bg-green-100 text-green-600' 
                  : step.status === 'in-progress'
                  ? 'bg-blue-100 text-blue-600'
                  : 'bg-gray-100 text-gray-400'
              }`}>
                {step.status === 'completed' ? (
                  <CheckCircle className="w-5 h-5" />
                ) : step.status === 'in-progress' ? (
                  <Clock className="w-5 h-5" />
                ) : (
                  <Circle className="w-5 h-5" />
                )}
              </div>
              {index < roadmapSteps.length - 1 && (
                <div className="w-px h-16 bg-gray-200 mt-2" />
              )}
            </div>
            
            <div className="flex-1 pb-8">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-semibold text-gray-900">{step.title}</h4>
                <div className="flex items-center space-x-2">
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                    step.status === 'completed' 
                      ? 'bg-green-100 text-green-800' 
                      : step.status === 'in-progress'
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-gray-100 text-gray-600'
                  }`}>
                    {step.status === 'completed' ? 'Completed' : step.status === 'in-progress' ? 'In Progress' : 'Pending'}
                  </span>
                  <Edit3 className="w-4 h-4 text-gray-400 cursor-pointer hover:text-gray-600" />
                </div>
              </div>
              <p className="text-gray-600 text-sm mb-2">{step.description}</p>
              <div className="text-xs text-gray-500">
                {step.completedDate ? (
                  <span>Completed: {step.completedDate}</span>
                ) : (
                  <span>Expected: {step.expectedDate}</span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};