import React from 'react';
import { Calendar, Plus, Edit3 } from 'lucide-react';
import { ProjectUpdate } from '../types/database';

interface DynamicRecentUpdatesProps {
  updates: ProjectUpdate[];
}

const formatDate = (dateString: string | null) => {
  if (!dateString) return 'N/A';
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

export const DynamicRecentUpdates: React.FC<DynamicRecentUpdatesProps> = ({ updates }) => {
  return (
    <div className="bg-white p-6 rounded-lg border">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-gray-900">Recent Updates</h3>
        <button className="flex items-center space-x-2 px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors">
          <Plus className="w-4 h-4" />
          <span className="text-sm">Add Update</span>
        </button>
      </div>
      
      <div className="space-y-6">
        {updates.length > 0 ? (
          updates.map((update) => (
            <div key={update.id} className="border-l-4 border-blue-200 pl-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2 text-sm text-gray-500">
                  <Calendar className="w-4 h-4" />
                  <span>{formatDate(update.update_date)}</span>
                </div>
                <Edit3 className="w-4 h-4 text-gray-400 cursor-pointer hover:text-gray-600 transition-colors" />
              </div>
              <p className="text-gray-700 leading-relaxed">{update.content}</p>
            </div>
          ))
        ) : (
          <p className="text-gray-500">No recent updates for this project.</p>
        )}
      </div>
    </div>
  );
}; 