import { Header } from './Header';
import { ProjectHeader } from './ProjectHeader';
import { ProjectRoadmap } from './ProjectRoadmap';
import { ProjectDocuments } from './ProjectDocuments';
import { PropertiesOfInterest } from './PropertiesOfInterest';
import { RecentUpdates } from './RecentUpdates';

export function LeaseTrackerPage() {
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