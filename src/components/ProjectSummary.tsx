import React from 'react';
import { Edit3 } from 'lucide-react';

export const ProjectSummary: React.FC = () => {
  const progress = 35;
  
  return (
    <div className="bg-gray-900 text-white p-6 rounded-lg">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold">Project Summary</h3>
        <Edit3 className="w-4 h-4 text-gray-400 cursor-pointer hover:text-gray-300 transition-colors" />
      </div>
      
      <div className="space-y-4">
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-300">Progress</span>
            <span className="text-sm font-medium">{progress}%</span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-2">
            <div 
              className="bg-blue-500 h-2 rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <span className="text-sm text-gray-300 block">Timeline</span>
            <span className="text-sm font-medium">6-8 weeks</span>
          </div>
          <div>
            <span className="text-sm text-gray-300 block">Budget Range</span>
            <span className="text-sm font-medium">$25-35k/sq ft</span>
          </div>
        </div>
      </div>
    </div>
  );
};