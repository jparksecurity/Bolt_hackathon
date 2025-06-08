import React from 'react';
import { Header } from './components/Header';
import { ProjectHeader } from './components/ProjectHeader';
import { ProjectRoadmap } from './components/ProjectRoadmap';
import { ProjectDocuments } from './components/ProjectDocuments';
import { PropertiesOfInterest } from './components/PropertiesOfInterest';
import { RecentUpdates } from './components/RecentUpdates';

function App() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-7xl mx-auto">
        <ProjectHeader />
        
        <div className="p-6">
          {/* Recent Updates - Full Width */}
          <div className="mb-6">
            <RecentUpdates />
          </div>
        </div>
        
        {/* Properties Section - Full Width */}
        <div className="px-6 pb-6">
          <PropertiesOfInterest />
        </div>
        
        {/* Project Roadmap - Full Width */}
        <div className="px-6 pb-6">
          <ProjectRoadmap />
        </div>
        
        {/* Project Documents - Full Width at Bottom */}
        <div className="px-6 pb-6">
          <ProjectDocuments />
        </div>
      </div>
    </div>
  );
}

export default App;