import React from 'react';
import { Calendar, Plus, Edit3 } from 'lucide-react';

const updates = [
  {
    id: 1,
    date: 'Jan 29, 2024',
    content: 'Found 3 potential properties that match your criteria. Scheduling tours for next week. The downtown location on 5th Street looks particularly promising with modern infrastructure and competitive pricing.',
    editIcon: true
  },
  {
    id: 2,
    date: 'Jan 22, 2024',
    content: 'Completed market research phase. Identified 15 potential properties within your budget range and location preferences. Moving to property evaluation phase.',
    editIcon: true
  }
];

export const RecentUpdates: React.FC = () => {
  return (
    <div className="bg-white p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-gray-900">Recent Updates</h3>
        <button className="flex items-center space-x-2 px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors">
          <Plus className="w-4 h-4" />
          <span className="text-sm">Add Update</span>
        </button>
      </div>
      
      <div className="space-y-6">
        {updates.map((update) => (
          <div key={update.id} className="border-l-4 border-blue-200 pl-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2 text-sm text-gray-500">
                <Calendar className="w-4 h-4" />
                <span>{update.date}</span>
              </div>
              {update.editIcon && (
                <Edit3 className="w-4 h-4 text-gray-400 cursor-pointer hover:text-gray-600 transition-colors" />
              )}
            </div>
            <p className="text-gray-700 leading-relaxed">{update.content}</p>
          </div>
        ))}
      </div>
    </div>
  );
};