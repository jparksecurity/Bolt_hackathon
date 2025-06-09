import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useUser } from '@clerk/clerk-react'
import { useAuthGuard } from '../hooks/useAuthGuard'
import { useSupabaseQuery, useSupabaseMutation } from '../hooks/useSupabaseQuery'
import { Plus, Calendar, DollarSign, Users, ArrowRight } from 'lucide-react'
import { Project } from '../types/database'
import { Header } from './Header'
import { formatCurrency, formatDate } from '../utils/formatters'

export function ProjectsListPage() {
  const { user } = useUser()
  const { isSignedIn, renderAuthRequired } = useAuthGuard()
  const navigate = useNavigate()
  const [showNewProjectForm, setShowNewProjectForm] = useState(false)
  const [newProject, setNewProject] = useState({
    title: '',
    company_name: '',
    status: 'Initial Consultation',
    expected_headcount: ''
  })

  // Use the new data fetching hook
  const { data: projects, loading, refetch } = useSupabaseQuery<Project[]>(
    'projects',
    {
      select: '*',
      order: { column: 'created_at', ascending: false }
    },
    [isSignedIn]
  )

  // Use the mutation hook for creating projects
  const { mutate: mutateProject } = useSupabaseMutation<Project>('projects')

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newProject.title.trim() || !user) return

    const result = await mutateProject('insert', {
      ...newProject,
      clerk_user_id: user.id,
    })

    if (result && result[0]) {
      setNewProject({ title: '', company_name: '', status: 'Initial Consultation', expected_headcount: '' })
      setShowNewProjectForm(false)
      refetch() // Refresh the projects list
      // Navigate to the new project
      navigate(`/projects/${result[0].id}`)
    }
  }


  if (!isSignedIn) {
    return renderAuthRequired("Please sign in to access your lease tracking projects.")
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Page Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">My Projects</h1>
            <p className="text-gray-600 mt-1">
              {projects.length === 0 ? 'No projects yet' : `${projects.length} project${projects.length === 1 ? '' : 's'}`}
            </p>
          </div>
          <button
            onClick={() => setShowNewProjectForm(true)}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
          >
            <Plus className="w-5 h-5" />
            <span>New Project</span>
          </button>
        </div>

        {/* New Project Form Modal */}
        {showNewProjectForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
              <h2 className="text-xl font-bold mb-4">Create New Project</h2>
              <form onSubmit={handleCreateProject} className="space-y-4">
                <div>
                  <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                    Project Title
                  </label>
                  <input
                    id="title"
                    type="text"
                    value={newProject.title}
                    onChange={(e) => setNewProject({ ...newProject, title: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., Downtown Office Lease"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="company_name" className="block text-sm font-medium text-gray-700 mb-1">
                    Company Name
                  </label>
                  <input
                    id="company_name"
                    type="text"
                    value={newProject.company_name}
                    onChange={(e) => setNewProject({ ...newProject, company_name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., Tech Innovations Inc."
                  />
                </div>
                <div>
                  <label htmlFor="expected_headcount" className="block text-sm font-medium text-gray-700 mb-1">
                    Expected Headcount
                  </label>
                  <input
                    id="expected_headcount"
                    type="text"
                    value={newProject.expected_headcount}
                    onChange={(e) => setNewProject({ ...newProject, expected_headcount: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., 50-75 employees"
                  />
                </div>
                <div className="flex space-x-3 pt-4">
                  <button
                    type="submit"
                    className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    Create Project
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowNewProjectForm(false)}
                    className="flex-1 bg-gray-200 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Projects Grid */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-gray-600 mt-4">Loading projects...</p>
          </div>
        ) : !projects || projects.length === 0 ? (
          <div className="text-center py-12">
            <img 
              src="/src/assets/design/Jigo_Tenant_BW_TP.png" 
              alt="Jigo Logo" 
              className="w-16 h-16 mx-auto mb-4 opacity-50"
            />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No projects yet</h3>
            <p className="text-gray-600 mb-6">Get started by creating your first lease tracking project.</p>
            <button
              onClick={() => setShowNewProjectForm(true)}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Create Your First Project
            </button>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {projects?.map((project) => (
              <Link
                key={project.id}
                to={`/projects/${project.id}`}
                className="bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow group"
              >
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                      {project.title}
                    </h3>
                    <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-blue-600 transition-colors" />
                  </div>
                  
                  <div className="space-y-3">
                    {project.company_name && (
                      <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <Users className="w-4 h-4" />
                        <span>{project.company_name}</span>
                      </div>
                    )}
                    
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <Calendar className="w-4 h-4" />
                      <span>Started {formatDate(project.start_date)}</span>
                    </div>
                    
                    {project.broker_commission && (
                      <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <DollarSign className="w-4 h-4" />
                        <span>{formatCurrency(project.broker_commission)} commission</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <span className="inline-block px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded">
                      {project.status}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
} 