import React, { useState } from 'react';
import { Edit3, Calendar, DollarSign, Info } from 'lucide-react';

export const ProjectHeader: React.FC = () => {
  const [showTooltip, setShowTooltip] = useState(false);

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
        <div className="flex items-center space-x-1 relative">
          <DollarSign className="w-4 h-4" />
          <span>Expected Fee: $15,000</span>
          <div 
            className="relative"
            onMouseEnter={() => setShowTooltip(true)}
            onMouseLeave={() => setShowTooltip(false)}
          >
            <Info className="w-4 h-4 text-gray-400 cursor-help hover:text-gray-600 transition-colors" />
            {showTooltip && (
              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-64 bg-gray-900 text-white text-xs rounded-lg p-3 shadow-lg z-10">
                <div className="space-y-1">
                  <div className="font-medium">Commission Breakdown:</div>
                  <div>• Broker commission: $15,000</div>
                  <div>• Paid by: Landlord</div>
                  <div>• Payment due: Upon lease signing</div>
                </div>
                <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
              </div>
            )}
          </div>
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