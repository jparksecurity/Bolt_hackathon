import React from 'react';
import { Header } from './components/Header';
import { ProjectHeader } from './components/ProjectHeader';
import { ProjectRoadmap } from './components/ProjectRoadmap';
import { ClientRequirements } from './components/ClientRequirements';
import { ProjectDocuments } from './components/ProjectDocuments';
import { PropertiesOfInterest } from './components/PropertiesOfInterest';
import { RecentUpdates } from './components/RecentUpdates';

function App() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-7xl mx-auto">
        <ProjectHeader />
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 p-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            <ProjectRoadmap />
            <RecentUpdates />
          </div>
          
          {/* Sidebar */}
          <div className="space-y-6">
            <ClientRequirements />
            <ProjectDocuments />
          </div>
        </div>
        
        {/* Properties Section - Full Width */}
        <div className="px-6 pb-6">
          <PropertiesOfInterest />
        </div>
      </div>
    </div>
  );
}

export default App;