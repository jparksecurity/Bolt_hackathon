import React from 'react';
import { Share, User } from 'lucide-react';

export const Header: React.FC = () => {
  return (
    <header className="bg-white text-gray-900 px-6 py-4 border-b border-gray-200">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <img 
            src="/src/assets/design/Jigo_Tenant_BW_Transparent_Edges.png" 
            alt="Jigo Tenant Logo" 
            className="w-8 h-8"
          />
          <h1 className="text-xl font-bold">LeaseTracker Pro</h1>
        </div>
        <div className="flex items-center space-x-4">
          <button className="flex items-center space-x-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors">
            <Share className="w-4 h-4" />
            <span className="text-sm">Copy Public Link</span>
          </button>
          <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
            <User className="w-4 h-4 text-white" />
          </div>
        </div>
      </div>
    </header>
  );
};