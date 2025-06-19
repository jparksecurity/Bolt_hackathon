import React, { useState } from "react";
import { Edit3, Plus, X, Trash2, Save, Clock, ChevronDown, ChevronUp } from "lucide-react";
import { useUser } from "@clerk/clerk-react";
import { useSupabaseClient } from "../../services/supabase";
import { useProjectData } from "../../hooks/useProjectData";
import { formatDateWithOptions } from "../../utils/dateUtils";

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
  readonly = false,
}) => {
  const { user } = useUser();
  const supabase = useSupabaseClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUpdate, setEditingUpdate] = useState<Update | null>(null);
  const [formData, setFormData] = useState<UpdateFormData>({
    content: "",
    update_date: new Date().toISOString().split("T")[0],
  });
  const [saving, setSaving] = useState(false);
  const [showAllUpdates, setShowAllUpdates] = useState(false);

  const {
    data: updates,
    loading: dataLoading,
    refetch: fetchUpdates,
  } = useProjectData<Update>({
    projectId,
    shareId,
    dataType: "updates",
  });

  const loading = dataLoading;

  const resetForm = () => {
    setFormData({
      content: "",
      update_date: new Date().toLocaleDateString("en-CA"), // YYYY-MM-DD format in local timezone
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
      update_date: update.update_date,
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
        update_date: formData.update_date,
      };

      if (editingUpdate) {
        const { error } = await supabase
          .from("project_updates")
          .update(updateData)
          .eq("id", editingUpdate.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("project_updates")
          .insert([updateData]);

        if (error) throw error;
      }

      await fetchUpdates();
      closeModal();
    } catch {
      alert("Error saving update. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (updateId: string) => {
    if (!confirm("Are you sure you want to delete this update?") || readonly) {
      return;
    }

    try {
      const { error } = await supabase
        .from("project_updates")
        .delete()
        .eq("id", updateId);

      if (error) throw error;

      await fetchUpdates();
    } catch {
      alert("Error deleting update. Please try again.");
    }
  };

  const toggleShowAllUpdates = () => {
    setShowAllUpdates(!showAllUpdates);
  };

  // Determine which updates to display
  const displayedUpdates = showAllUpdates ? updates : updates.slice(0, 2);
  const hasMoreUpdates = updates.length > 2;

  if (loading) {
    return (
      <div className="dashboard-card p-6">
        <h2 className="text-xl font-semibold text-slate-900 mb-4">
          Recent Updates
        </h2>
        <div className="text-center py-8">
          <div className="text-slate-500">Loading updates...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-card">
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-2">
            <Clock className="w-5 h-5 text-blue-600" />
            <h2 className="text-xl font-semibold text-slate-900">
              Recent Updates
            </h2>
          </div>
          {!readonly && (
            <button
              onClick={openAddModal}
              className="btn-primary flex items-center space-x-2"
            >
              <Plus className="w-4 h-4" />
              <span>Add Update</span>
            </button>
          )}
        </div>

        {updates.length === 0 ? (
          <div className="text-center py-12">
            <Clock className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-500 mb-2">No updates yet</p>
            {!readonly && (
              <>
                <p className="text-slate-400 text-sm mb-6">
                  Project updates will appear here
                </p>
                <button
                  onClick={openAddModal}
                  className="btn-primary flex items-center space-x-2 mx-auto"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add First Update</span>
                </button>
              </>
            )}
          </div>
        ) : (
          <>
            <div className="space-y-4">
              {displayedUpdates.map((update) => (
                <div
                  key={update.id}
                  className="border-l-4 border-blue-200 pl-4 py-3 bg-slate-50 rounded-r-lg group"
                >
                  <div className="flex justify-between items-start mb-2">
                    <div className="text-sm text-slate-600 font-medium">
                      {formatDateWithOptions(update.update_date)}
                    </div>
                    {!readonly && (
                      <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity ml-2">
                        <button
                          onClick={() => openEditModal(update)}
                          className="p-1 text-slate-400 hover:text-blue-600 transition-colors"
                          title="Edit update"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(update.id)}
                          className="p-1 text-slate-400 hover:text-red-600 transition-colors"
                          title="Delete update"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>
                  <p className="text-slate-900 whitespace-pre-wrap">
                    {update.content}
                  </p>
                </div>
              ))}
            </div>

            {/* Show More/Less Button */}
            {hasMoreUpdates && (
              <div className="mt-6 text-center">
                <button
                  onClick={toggleShowAllUpdates}
                  className="flex items-center space-x-2 mx-auto px-4 py-2 text-sm text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  {showAllUpdates ? (
                    <>
                      <ChevronUp className="w-4 h-4" />
                      <span>Show Less Updates</span>
                    </>
                  ) : (
                    <>
                      <ChevronDown className="w-4 h-4" />
                      <span>Show {updates.length - 2} More Updates</span>
                    </>
                  )}
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Add/Edit Modal */}
      {isModalOpen && !readonly && (
        <div className="fixed inset-0 modal-backdrop flex items-center justify-center p-4 z-50">
          <div className="dashboard-card w-full max-w-md">
            <div className="flex items-center justify-between p-4 border-b border-slate-200">
              <h3 className="text-lg font-semibold text-slate-900">
                {editingUpdate ? "Edit Update" : "Add Update"}
              </h3>
              <button
                onClick={closeModal}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Update Date
                </label>
                <input
                  type="date"
                  value={formData.update_date}
                  onChange={(e) =>
                    setFormData({ ...formData, update_date: e.target.value })
                  }
                  className="form-input w-full px-3 py-2 rounded-md"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Update Content
                </label>
                <textarea
                  value={formData.content}
                  onChange={(e) =>
                    setFormData({ ...formData, content: e.target.value })
                  }
                  placeholder="Enter update content..."
                  rows={4}
                  className="form-input w-full px-3 py-2 rounded-md"
                  required
                />
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={closeModal}
                  className="btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving || !formData.content.trim()}
                  className="btn-primary flex items-center space-x-2 disabled:opacity-50"
                >
                  {saving ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      <span>{editingUpdate ? "Update" : "Add Update"}</span>
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