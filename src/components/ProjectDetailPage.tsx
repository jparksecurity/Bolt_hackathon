import { useParams, Link } from 'react-router-dom'
import { useAuthGuard } from '../hooks/useAuthGuard'
import { useSupabaseQuery, useSupabaseMutation } from '../hooks/useSupabaseQuery'
import { Project, Property, ProjectUpdate, ClientRequirement, ProjectContact, ProjectRoadmap, ProjectDocument } from '../types/database'

import { Header } from './Header'
import { DynamicProjectHeader } from './DynamicProjectHeader'
import { DynamicRecentUpdates } from './DynamicRecentUpdates'
import { DynamicPropertiesOfInterest } from './DynamicPropertiesOfInterest'
import { DynamicProjectRoadmap } from './DynamicProjectRoadmap'
import { DynamicProjectDocuments } from './DynamicProjectDocuments'

export function ProjectDetailPage() {
  const { projectId } = useParams<{ projectId: string }>()
  const { isSignedIn, renderAuthRequired } = useAuthGuard()
  
  // Use the new data fetching hooks for each data source
  const { data: project, loading: projectLoading, error: projectError } = useSupabaseQuery<Project>(
    'projects',
    {
      select: '*',
      eq: { id: projectId },
      single: true
    },
    [projectId, isSignedIn]
  )

  const { data: properties } = useSupabaseQuery<Property[]>(
    'properties',
    {
      select: '*',
      eq: { project_id: projectId },
      order: { column: 'created_at', ascending: false }
    },
    [projectId, isSignedIn]
  )

  const { data: updates } = useSupabaseQuery<ProjectUpdate[]>(
    'project_updates',
    {
      select: '*',
      eq: { project_id: projectId },
      order: { column: 'update_date', ascending: false }
    },
    [projectId, isSignedIn]
  )

  const { data: requirements } = useSupabaseQuery<ClientRequirement[]>(
    'client_requirements',
    {
      select: '*',
      eq: { project_id: projectId }
    },
    [projectId, isSignedIn]
  )

  const { data: contacts } = useSupabaseQuery<ProjectContact[]>(
    'project_contacts',
    {
      select: '*',
      eq: { project_id: projectId }
    },
    [projectId, isSignedIn]
  )

  const { data: roadmap } = useSupabaseQuery<ProjectRoadmap[]>(
    'project_roadmap',
    {
      select: '*',
      eq: { project_id: projectId },
      order: { column: 'order_index', ascending: true }
    },
    [projectId, isSignedIn]
  )

  const { data: documents } = useSupabaseQuery<ProjectDocument[]>(
    'project_documents',
    {
      select: '*',
      eq: { project_id: projectId },
      order: { column: 'created_at', ascending: false }
    },
    [projectId, isSignedIn]
  )

  // Mutation hook for updating properties
  const { mutate: updateProperty } = useSupabaseMutation<Property>('properties')


  const handleUpdatePropertyStatus = async (propertyId: string, status: Property['status'], reason?: string) => {
    await updateProperty('update', 
      { status: status, decline_reason: reason },
      { eq: { id: propertyId } }
    )
    // The useSupabaseQuery hook will automatically refetch when dependencies change
  }

  if (projectLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-600 mt-4">Loading project...</p>
        </div>
      </div>
    )
  }

  if (!isSignedIn) {
    return renderAuthRequired("Please sign in to access this project.")
  }

  if (projectError || !project) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md mx-auto text-center p-6 bg-white rounded-lg shadow-md">
          <h2 className="text-2xl font-bold mb-4">Error</h2>
          <p className="text-gray-600 mb-6">{projectError || 'The project could not be loaded.'}</p>
          <Link to="/projects" className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700">Back to Projects</Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header showBackButton={true} backTo="/projects" />

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <DynamicProjectHeader project={project} contacts={contacts || []} requirements={requirements || []} />

          <div className="mt-8 grid grid-cols-1 gap-8">
            <DynamicRecentUpdates updates={updates || []} />
            <DynamicPropertiesOfInterest properties={properties || []} onUpdatePropertyStatus={handleUpdatePropertyStatus} />
            <DynamicProjectRoadmap roadmap={roadmap || []} />
            <DynamicProjectDocuments documents={documents || []} />
          </div>
        </div>
      </main>
    </div>
  )
} 