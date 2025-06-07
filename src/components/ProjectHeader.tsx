import React from 'react';
import { Edit3, Calendar, DollarSign } from 'lucide-react';

export const ProjectHeader: React.FC = () => {
  return (
    <div className="bg-white p-6 border-b border-gray-200">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <h2 className="text-2xl font-bold text-gray-900">Downtown Tech Hub - Office Lease</h2>
          <Edit3 className="w-5 h-5 text-gray-400 cursor-pointer hover:text-gray-600 transition-colors" />
        </div>
        <span className="px-3 py-1 bg-blue-100 text-blue-800 text-sm font-medium rounded-full">
          In Progress
        </span>
      </div>
      
      <div className="flex items-center space-x-6 mb-4 text-sm text-gray-600">
        <div className="flex items-center space-x-1">
          <Calendar className="w-4 h-4" />
          <span>Started: Jan 15, 2024</span>
        </div>
        <div className="flex items-center space-x-1">
          <DollarSign className="w-4 h-4" />
          <span>Commission: $15,000</span>
        </div>
      </div>
      
      <p className="text-gray-700 leading-relaxed">
        Securing a modern 15,000 sq ft office space in the heart of downtown for a rapidly growing tech startup. 
        The client requires flexible workspace design, high-speed internet infrastructure, and proximity to public transportation.
        <Edit3 className="w-4 h-4 text-gray-400 inline ml-2 cursor-pointer hover:text-gray-600 transition-colors" />
      </p>
    </div>
  );
};