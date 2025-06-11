import React, { useState } from 'react';
import { Edit3, Plus, X, Trash2, Save, Clock } from 'lucide-react';
import { useUser } from '@clerk/clerk-react';
import { useSupabaseClient } from '../lib/supabase';
import { useProjectData } from '../hooks/useProjectData';

interface RecentUpdatesProps {
  projectId?: string;
  shareId?: string;
  readonly?: boolean;
}

interface Update {
  id: string;
  content: string;
  update_date: string;
  created_at: string;
}

interface UpdateFormData {
  content: string;
  update_date: string;
}

export const RecentUpdates: React.FC<RecentUpdatesProps> = ({ 
  projectId, 
  shareId, 
  readonly = false 
}) => {
  const { user } = useUser();
  const supabase = useSupabaseClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUpdate, setEditingUpdate] = useState<Update | null>(null);
  const [formData, setFormData] = useState<UpdateFormData>({
    content: '',
    update_date: new Date().toISOString().split('T')[0]
  });
  const [saving, setSaving] = useState(false);

  // Use the unified data hook for updates
  const { 
    data: updates, 
    loading: dataLoading, 
    refetch: fetchUpdates 
  } = useProjectData<Update>({ 
    projectId, 
    shareId, 
    dataType: 'updates' 
  });

  const loading = dataLoading;

  const resetForm = () => {
    setFormData({
      content: '',
      update_date: new Date().toISOString().split('T')[0]
    });
    setEditingUpdate(null);
  };

  const openAddModal = () => {
    resetForm();
    setIsModalOpen(true);
  };

  const openEditModal = (update: Update) => {
    setFormData({
      content: update.content,
      update_date: update.update_date
    });
    setEditingUpdate(update);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    resetForm();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !formData.content.trim() || !projectId || readonly) return;

    setSaving(true);
    try {
      const updateData = {
        project_id: projectId,
        content: formData.content.trim(),
        update_date: formData.update_date
      };

      if (editingUpdate) {
        // Update existing update
        const { error } = await supabase
          .from('project_updates')
          .update(updateData)
          .eq('id', editingUpdate.id);

        if (error) throw error;
      } else {
        // Create new update
        const { error } = await supabase
          .from('project_updates')
          .insert([updateData]);

        if (error) throw error;
      }

      await fetchUpdates();
      closeModal();
    } catch {
      alert('Error saving update. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (updateId: string) => {
    if (!confirm('Are you sure you want to delete this update?') || readonly) {
      return;
    }

    try {
      const { error } = await supabase
        .from('project_updates')
        .delete()
        .eq('id', updateId);

      if (error) throw error;

      await fetchUpdates();
    } catch {
      alert('Error deleting update. Please try again.');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Recent Updates</h2>
        <div className="text-center py-8">
          <div className="text-gray-500">Loading updates...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-2">
            <Clock className="w-5 h-5 text-gray-400" />
            <h2 className="text-xl font-semibold text-gray-900">Recent Updates</h2>
          </div>
          {!readonly && (
            <button
              onClick={openAddModal}
              className="flex items-center space-x-1 p-1 text-gray-400 hover:text-gray-600 transition-colors"
              title="Add update"
            >
              <Plus className="w-4 h-4" />
            </button>
          )}
        </div>
        
        {updates.length === 0 ? (
          <div className="text-center py-8">
            <Clock className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No updates yet</p>
            {!readonly && (
              <>
                <p className="text-gray-400 text-xs mt-1">Project updates will appear here</p>
                <button
                  onClick={openAddModal}
                  className="mt-3 flex items-center space-x-2 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg hover:bg-gray-800 transition-colors mx-auto"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add First Update</span>
                </button>
              </>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {updates.map((update) => (
              <div key={update.id} className="border-l-4 border-blue-200 pl-4 py-2">
                <div className="flex justify-between items-start mb-1">
                  <div className="text-sm text-gray-500">
                    {formatDate(update.update_date)}
                  </div>
                  {!readonly && (
                    <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity ml-2">
                      <button
                        onClick={() => openEditModal(update)}
                        className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                        title="Edit update"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(update.id)}
                        className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                        title="Delete update"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
                <p className="text-gray-900 whitespace-pre-wrap">{update.content}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {isModalOpen && !readonly && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg w-full max-w-md">
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">
                {editingUpdate ? 'Edit Update' : 'Add Update'}
              </h3>
              <button
                onClick={closeModal}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Update Date
                </label>
                <input
                  type="date"
                  value={formData.update_date}
                  onChange={(e) => setFormData({ ...formData, update_date: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Update Content
                </label>
                <textarea
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  placeholder="Enter update content..."
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              
              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving || !formData.content.trim()}
                  className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
                >
                  {saving ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      <span>{editingUpdate ? 'Update' : 'Add Update'}</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};