import React from 'react';
import { Building2, Share, User } from 'lucide-react';

export const Header: React.FC = () => {
  return (
    <header className="bg-gray-900 text-white px-6 py-4 border-b border-gray-800">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Building2 className="w-6 h-6 text-blue-400" />
          <h1 className="text-xl font-bold">LeaseTracker Pro</h1>
        </div>
        <div className="flex items-center space-x-4">
          <button className="flex items-center space-x-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors">
            <Share className="w-4 h-4" />
            <span className="text-sm">Copy Public Link</span>
          </button>
          <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
            <User className="w-4 h-4" />
          </div>
        </div>
      </div>
    </header>
  );
};