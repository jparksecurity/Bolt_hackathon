import React, { useEffect, useState, useCallback } from 'react';
import { CheckCircle, Circle, Clock, Plus, Edit3, Trash2, X, Save } from 'lucide-react';
import { useUser } from '@clerk/clerk-react';
import { useSupabaseClient } from '../lib/supabase';

interface ProjectRoadmapProps {
  projectId: string;
}

interface RoadmapStep {
  id: string;
  title: string;
  description?: string | null;
  status: 'completed' | 'in-progress' | 'pending';
  expected_date?: string | null;
  completed_date?: string | null;
  order_index?: number | null;
}

interface RoadmapFormData {
  title: string;
  description: string;
  status: 'completed' | 'in-progress' | 'pending';
  expected_date: string;
}

export const ProjectRoadmap: React.FC<ProjectRoadmapProps> = ({ projectId }) => {
  const { user } = useUser();
  const supabase = useSupabaseClient();
  const [roadmapSteps, setRoadmapSteps] = useState<RoadmapStep[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStep, setEditingStep] = useState<RoadmapStep | null>(null);
  const [formData, setFormData] = useState<RoadmapFormData>({
    title: '',
    description: '',
    status: 'pending',
    expected_date: ''
  });
  const [saving, setSaving] = useState(false);

  const fetchRoadmap = useCallback(async () => {
    try {
      if (!user) return;

      const { data, error } = await supabase
        .from('project_roadmap')
        .select('*')
        .eq('project_id', projectId)
        .order('order_index', { ascending: true });

      if (error) throw error;
      setRoadmapSteps(data || []);
    } catch (err) {
      console.error('Error fetching roadmap:', err);
    } finally {
      setLoading(false);
    }
  }, [user, supabase, projectId]);

  useEffect(() => {
    if (user && projectId) {
      fetchRoadmap();
    }
  }, [user, projectId, fetchRoadmap]);

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      status: 'pending',
      expected_date: ''
    });
    setEditingStep(null);
  };

  const openAddModal = () => {
    resetForm();
    setIsModalOpen(true);
  };

  const openEditModal = (step: RoadmapStep) => {
    setFormData({
      title: step.title,
      description: step.description || '',
      status: step.status,
      expected_date: step.expected_date || ''
    });
    setEditingStep(step);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    resetForm();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !formData.title.trim()) return;

    setSaving(true);
    try {
      const stepData = {
        project_id: projectId,
        title: formData.title.trim(),
        description: formData.description.trim() || null,
        status: formData.status,
        expected_date: formData.expected_date || null,
        completed_date: formData.status === 'completed' ? new Date().toISOString().split('T')[0] : null,
        order_index: editingStep ? editingStep.order_index : roadmapSteps.length
      };

      if (editingStep) {
        // Update existing step
        const { error } = await supabase
          .from('project_roadmap')
          .update(stepData)
          .eq('id', editingStep.id);

        if (error) throw error;
      } else {
        // Create new step
        const { error } = await supabase
          .from('project_roadmap')
          .insert([stepData]);

        if (error) throw error;
      }

      await fetchRoadmap();
      closeModal();
    } catch (err) {
      console.error('Error saving roadmap step:', err);
      alert('Error saving roadmap step. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (stepId: string) => {
    if (!confirm('Are you sure you want to delete this roadmap step?')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('project_roadmap')
        .delete()
        .eq('id', stepId);

      if (error) throw error;

      await fetchRoadmap();
    } catch (err) {
      console.error('Error deleting roadmap step:', err);
      alert('Error deleting roadmap step. Please try again.');
    }
  };

  const handleStatusUpdate = async (stepId: string, newStatus: 'completed' | 'in-progress' | 'pending') => {
    try {
      const updateData: Partial<RoadmapStep> = {
        status: newStatus,
        completed_date: newStatus === 'completed' ? new Date().toISOString().split('T')[0] : null
      };

      const { error } = await supabase
        .from('project_roadmap')
        .update(updateData)
        .eq('id', stepId);

      if (error) throw error;

      await fetchRoadmap();
    } catch (err) {
      console.error('Error updating roadmap step status:', err);
      alert('Error updating status. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="bg-white p-6">
        <div className="text-center text-gray-500">Loading roadmap...</div>
      </div>
    );
  }

  return (
    <div className="bg-white p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-gray-900">Project Roadmap</h3>
        <button 
          onClick={openAddModal}
          className="flex items-center space-x-2 px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span className="text-sm">Add Step</span>
        </button>
      </div>
      
      {roadmapSteps.length === 0 ? (
        <div className="text-center py-12">
          <Clock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h4 className="text-lg font-semibold text-gray-900 mb-2">No roadmap steps yet</h4>
          <p className="text-gray-600 mb-6">Create a roadmap to track your project's progress</p>
          <button 
            onClick={openAddModal}
            className="flex items-center space-x-2 px-4 py-2 bg-gray-900 text-white text-sm rounded-lg hover:bg-gray-800 transition-colors mx-auto"
          >
            <Plus className="w-4 h-4" />
            <span>Add First Step</span>
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {roadmapSteps.map((step, index) => (
          <div key={step.id} className="flex items-start space-x-4">
            <div className="flex flex-col items-center">
              <div 
                className={`w-8 h-8 rounded-full flex items-center justify-center cursor-pointer ${
                  step.status === 'completed' 
                    ? 'bg-green-100 text-green-600' 
                    : step.status === 'in-progress'
                    ? 'bg-blue-100 text-blue-600'
                    : 'bg-gray-100 text-gray-400'
                }`}
                onClick={() => {
                  const statuses: ('pending' | 'in-progress' | 'completed')[] = ['pending', 'in-progress', 'completed'];
                  const currentIndex = statuses.indexOf(step.status);
                  const nextStatus = statuses[(currentIndex + 1) % statuses.length];
                  handleStatusUpdate(step.id, nextStatus);
                }}
                title="Click to cycle through status"
              >
                {step.status === 'completed' ? (
                  <CheckCircle className="w-5 h-5" />
                ) : step.status === 'in-progress' ? (
                  <Clock className="w-5 h-5" />
                ) : (
                  <Circle className="w-5 h-5" />
                )}
              </div>
              {index < roadmapSteps.length - 1 && (
                <div className="w-px h-16 bg-gray-200 mt-2" />
              )}
            </div>
            
            <div className="flex-1 pb-8">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-semibold text-gray-900">{step.title}</h4>
                <div className="flex items-center space-x-2">
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                    step.status === 'completed' 
                      ? 'bg-green-100 text-green-800' 
                      : step.status === 'in-progress'
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-gray-100 text-gray-600'
                  }`}>
                    {step.status === 'completed' ? 'Completed' : step.status === 'in-progress' ? 'In Progress' : 'Pending'}
                  </span>
                  <button
                    onClick={() => openEditModal(step)}
                    className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                    title="Edit step"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(step.id)}
                    className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                    title="Delete step"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              {step.description && (
                <p className="text-gray-600 text-sm mb-2">{step.description}</p>
              )}
              <div className="text-xs text-gray-500">
                {step.completed_date ? (
                  <span>Completed: {new Date(step.completed_date).toLocaleDateString()}</span>
                ) : step.expected_date ? (
                  <span>Expected: {new Date(step.expected_date).toLocaleDateString()}</span>
                ) : (
                  <span>No date set</span>
                )}
              </div>
            </div>
            </div>
          ))}
        </div>
      )}

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b">
              <h3 className="text-lg font-semibold text-gray-900">
                {editingStep ? 'Edit Roadmap Step' : 'Add New Roadmap Step'}
              </h3>
              <button
                onClick={closeModal}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                  Title *
                </label>
                <input
                  id="title"
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500"
                  placeholder="Enter step title"
                  required
                />
              </div>

              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500"
                  placeholder="Enter step description"
                  rows={3}
                />
              </div>

              <div>
                <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <select
                  id="status"
                  value={formData.status}
                  onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as 'completed' | 'in-progress' | 'pending' }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500"
                >
                  <option value="pending">Pending</option>
                  <option value="in-progress">In Progress</option>
                  <option value="completed">Completed</option>
                </select>
              </div>

              <div>
                <label htmlFor="expected_date" className="block text-sm font-medium text-gray-700 mb-1">
                  Expected Date
                </label>
                <input
                  id="expected_date"
                  type="date"
                  value={formData.expected_date}
                  onChange={(e) => setFormData(prev => ({ ...prev, expected_date: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500"
                />
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving || !formData.title.trim()}
                  className="flex items-center space-x-2 px-4 py-2 bg-gray-900 text-white rounded-md hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Save className="w-4 h-4" />
                  <span>{saving ? 'Saving...' : editingStep ? 'Update Step' : 'Add Step'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};