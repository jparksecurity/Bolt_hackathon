import React, { useEffect, useState, useCallback } from 'react';
import { Calendar, Edit3, Plus, X, Trash2, Save } from 'lucide-react';
import { useUser } from '@clerk/clerk-react';
import { useSupabaseClient } from '../lib/supabase';

interface RecentUpdatesProps {
  projectId: string;
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

export const RecentUpdates: React.FC<RecentUpdatesProps> = ({ projectId }) => {
  const { user } = useUser();
  const supabase = useSupabaseClient();
  const [updates, setUpdates] = useState<Update[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUpdate, setEditingUpdate] = useState<Update | null>(null);
  const [formData, setFormData] = useState<UpdateFormData>({
    content: '',
    update_date: new Date().toISOString().split('T')[0]
  });
  const [saving, setSaving] = useState(false);

  const fetchUpdates = useCallback(async () => {
    try {
      if (!user) return;

      const { data, error } = await supabase
        .from('project_updates')
        .select('*')
        .eq('project_id', projectId)
        .order('update_date', { ascending: false });

      if (error) throw error;
      setUpdates(data || []);
    } catch (err) {
      console.error('Error fetching updates:', err);
    } finally {
      setLoading(false);
    }
  }, [user, supabase, projectId]);

  useEffect(() => {
    if (user && projectId) {
      fetchUpdates();
    }
  }, [user, projectId, fetchUpdates]);

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
    if (!user || !formData.content.trim()) return;

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
    } catch (err) {
      console.error('Error saving update:', err);
      alert('Error saving update. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (updateId: string) => {
    if (!confirm('Are you sure you want to delete this update?')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('project_updates')
        .delete()
        .eq('id', updateId);

      if (error) throw error;

      await fetchUpdates();
    } catch (err) {
      console.error('Error deleting update:', err);
      alert('Error deleting update. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="bg-white p-6 border border-gray-200 rounded-lg">
        <div className="text-center text-gray-500">Loading updates...</div>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 border border-gray-200 rounded-lg">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Recent Updates</h3>
        <button
          onClick={openAddModal}
          className="flex items-center space-x-1 p-1 text-gray-400 hover:text-gray-600 transition-colors"
          title="Add update"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>
      
      {updates.length === 0 ? (
        <div className="text-center py-8">
          <Calendar className="w-8 h-8 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-500 text-sm">No updates yet</p>
          <p className="text-gray-400 text-xs mt-1">Project updates will appear here</p>
          <button
            onClick={openAddModal}
            className="mt-3 flex items-center space-x-2 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg hover:bg-gray-800 transition-colors mx-auto"
          >
            <Plus className="w-4 h-4" />
            <span>Add First Update</span>
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {updates.map((update) => (
            <div key={update.id} className="border-l-4 border-blue-200 pl-4 group">
              <div className="flex items-start justify-between">
                <p className="text-sm text-gray-700 leading-relaxed flex-1">{update.content}</p>
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
              </div>
              <div className="flex items-center space-x-1 mt-2">
                <Calendar className="w-3 h-3 text-gray-400" />
                <span className="text-xs text-gray-500">
                  {new Date(update.update_date).toLocaleDateString()}
                </span>
                {update.created_at !== update.update_date && (
                  <span className="text-xs text-gray-400 ml-2">
                    (Created: {new Date(update.created_at).toLocaleDateString()})
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b">
              <h3 className="text-lg font-semibold text-gray-900">
                {editingUpdate ? 'Edit Update' : 'Add New Update'}
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
                <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-1">
                  Update Content *
                </label>
                <textarea
                  id="content"
                  value={formData.content}
                  onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500"
                  placeholder="Enter update content"
                  rows={4}
                  required
                />
              </div>

              <div>
                <label htmlFor="update_date" className="block text-sm font-medium text-gray-700 mb-1">
                  Update Date
                </label>
                <input
                  id="update_date"
                  type="date"
                  value={formData.update_date}
                  onChange={(e) => setFormData(prev => ({ ...prev, update_date: e.target.value }))}
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
                  disabled={saving || !formData.content.trim()}
                  className="flex items-center space-x-2 px-4 py-2 bg-gray-900 text-white rounded-md hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Save className="w-4 h-4" />
                  <span>{saving ? 'Saving...' : editingUpdate ? 'Update' : 'Add Update'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};