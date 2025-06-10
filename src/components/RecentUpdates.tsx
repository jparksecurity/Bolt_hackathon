import React from 'react';
import { Calendar, Edit3, Plus } from 'lucide-react';

interface RecentUpdatesProps {
  projectId: string;
}

const updates = [
  { id: 1, content: 'Initial consultation completed with TechFlow team. Requirements documented and project timeline established.', date: 'Jan 15, 2024' },
  { id: 2, content: 'Market research phase initiated. Identified 12 potential properties in downtown core matching client criteria.', date: 'Jan 18, 2024' },
  { id: 3, content: 'Property shortlist refined to 5 top candidates. Scheduled tours for next week with client team.', date: 'Jan 22, 2024' }
];

export const RecentUpdates: React.FC<RecentUpdatesProps> = () => {
  // TODO: Use projectId to fetch updates from database
  return (
    <div className="bg-white p-6 border border-gray-200 rounded-lg">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Recent Updates</h3>
        <Plus className="w-4 h-4 text-gray-400 cursor-pointer hover:text-gray-600 transition-colors" />
      </div>
      
      <div className="space-y-4">
        {updates.map((update) => (
          <div key={update.id} className="border-l-4 border-blue-200 pl-4 group">
            <div className="flex items-start justify-between">
              <p className="text-sm text-gray-700 leading-relaxed">{update.content}</p>
              <Edit3 className="w-4 h-4 text-gray-400 cursor-pointer hover:text-gray-600 transition-colors opacity-0 group-hover:opacity-100 ml-2 mt-0.5 flex-shrink-0" />
            </div>
            <div className="flex items-center space-x-1 mt-2">
              <Calendar className="w-3 h-3 text-gray-400" />
              <span className="text-xs text-gray-500">{update.date}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};