import React, { useState, useEffect, useCallback } from 'react';
import { Edit3, MapPin, Building, FileText, Plus, Trash2, X, Save } from 'lucide-react';
import { useUser } from '@clerk/clerk-react';
import { useSupabaseClient } from '../lib/supabase';

interface ClientRequirementsProps {
  projectId: string;
}

interface Requirement {
  id: string;
  category: string;
  requirement_text: string;
  project_id: string;
  created_at: string;
}

interface RequirementFormData {
  category: string;
  requirement_text: string;
}

const requirementCategories = [
  {
    id: 'Space Requirements',
    title: 'Space Requirements',
    icon: Building,
  },
  {
    id: 'Location',
    title: 'Location',
    icon: MapPin,
  },
  {
    id: 'Other',
    title: 'Other',
    icon: FileText,
  }
];

export const ClientRequirements: React.FC<ClientRequirementsProps> = ({ projectId }) => {
  const { user } = useUser();
  const supabase = useSupabaseClient();
  const [requirements, setRequirements] = useState<Requirement[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingRequirement, setEditingRequirement] = useState<Requirement | null>(null);
  const [saving, setSaving] = useState(false);
  
  const [formData, setFormData] = useState<RequirementFormData>({
    category: 'Space Requirements',
    requirement_text: ''
  });

  const fetchRequirements = useCallback(async () => {
    try {
      if (!user) return;

      const { data, error } = await supabase
        .from('client_requirements')
        .select('*')
        .eq('project_id', projectId)
        .order('category, created_at');

      if (error) throw error;
      setRequirements(data || []);
    } catch {
      // Error fetching requirements - use empty array
    } finally {
      setLoading(false);
    }
  }, [user, supabase, projectId]);

  useEffect(() => {
    if (user && projectId) {
      fetchRequirements();
    }
  }, [user, projectId, fetchRequirements]);

  const resetForm = () => {
    setFormData({
      category: 'Space Requirements',
      requirement_text: ''
    });
    setEditingRequirement(null);
  };

  const openModal = (requirement?: Requirement) => {
    if (requirement) {
      setFormData({
        category: requirement.category,
        requirement_text: requirement.requirement_text
      });
      setEditingRequirement(requirement);
    } else {
      resetForm();
    }
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    resetForm();
  };

  const saveRequirement = async () => {
    if (!formData.requirement_text.trim()) return;

    setSaving(true);
    try {
      const requirementData = {
        project_id: projectId,
        category: formData.category,
        requirement_text: formData.requirement_text.trim()
      };

      if (editingRequirement) {
        const { error } = await supabase
          .from('client_requirements')
          .update(requirementData)
          .eq('id', editingRequirement.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('client_requirements')
          .insert([requirementData]);

        if (error) throw error;
      }

      await fetchRequirements();
      closeModal();
    } catch {
      alert('Error saving requirement. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const deleteRequirement = async (requirementId: string) => {
    if (!confirm('Are you sure you want to delete this requirement?')) return;

    try {
      const { error } = await supabase
        .from('client_requirements')
        .delete()
        .eq('id', requirementId);

      if (error) throw error;
      await fetchRequirements();
    } catch {
      alert('Error deleting requirement. Please try again.');
    }
  };

  const getRequirementsByCategory = (category: string) => {
    return requirements.filter(req => req.category === category);
  };

  if (loading) {
    return (
      <div className="bg-white p-6 border border-gray-200 rounded-lg">
        <div className="text-center text-gray-500">Loading requirements...</div>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 border border-gray-200 rounded-lg">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Client Requirements</h3>
        <button onClick={() => openModal()} title="Add Requirement">
          <Plus className="w-4 h-4 text-gray-400 cursor-pointer hover:text-gray-600 transition-colors" />
        </button>
      </div>
      
      <div className="space-y-6">
        {requirementCategories.map((category) => {
          const categoryRequirements = getRequirementsByCategory(category.id);
          return (
            <div key={category.id}>
              <div className="flex items-center space-x-2 mb-3">
                <category.icon className="w-4 h-4 text-blue-600" />
                <h4 className="font-medium text-gray-900 text-sm">{category.title}</h4>
              </div>
              <div className="space-y-2 ml-6">
                {categoryRequirements.length > 0 ? (
                  categoryRequirements.map((req) => (
                    <div key={req.id} className="flex items-center justify-between group">
                      <div className="flex items-center space-x-2">
                        <div className="w-1.5 h-1.5 bg-blue-600 rounded-full" />
                        <span className="text-sm text-gray-700">{req.requirement_text}</span>
                      </div>
                      <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => openModal(req)}>
                          <Edit3 className="w-3 h-3 text-gray-400 hover:text-gray-600" />
                        </button>
                        <button onClick={() => deleteRequirement(req.id)}>
                          <Trash2 className="w-3 h-3 text-gray-400 hover:text-red-600" />
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="flex items-center space-x-2">
                    <div className="w-1.5 h-1.5 bg-gray-400 rounded-full" />
                    <span className="text-sm text-gray-500 italic">No requirements set for this category</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {requirements.length === 0 && (
        <div className="text-center py-8">
          <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h4 className="text-lg font-semibold text-gray-900 mb-2">No Requirements Yet</h4>
          <p className="text-gray-600 mb-6">Add client requirements to help track project needs</p>
          <button
            onClick={() => openModal()}
            className="flex items-center space-x-2 px-4 py-2 bg-gray-900 text-white text-sm rounded-lg hover:bg-gray-800 transition-colors mx-auto"
          >
            <Plus className="w-4 h-4" />
            <span>Add First Requirement</span>
          </button>
        </div>
      )}

      {/* Requirement Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="flex items-center justify-between p-6 border-b">
              <h3 className="text-lg font-semibold text-gray-900">
                {editingRequirement ? 'Edit Requirement' : 'Add Requirement'}
              </h3>
              <button onClick={closeModal}>
                <X className="w-5 h-5 text-gray-400 hover:text-gray-600" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500"
                  disabled={saving}
                >
                  {requirementCategories.map(category => (
                    <option key={category.id} value={category.id}>{category.title}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Requirement *</label>
                <textarea
                  value={formData.requirement_text}
                  onChange={(e) => setFormData(prev => ({ ...prev, requirement_text: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500"
                  rows={3}
                  placeholder="Enter requirement details"
                  disabled={saving}
                  required
                />
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  onClick={closeModal}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
                  disabled={saving}
                >
                  Cancel
                </button>
                <button
                  onClick={saveRequirement}
                  disabled={saving || !formData.requirement_text.trim()}
                  className="flex items-center space-x-2 px-4 py-2 bg-gray-900 text-white rounded-md hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Save className="w-4 h-4" />
                  <span>{saving ? 'Saving...' : editingRequirement ? 'Update Requirement' : 'Add Requirement'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};