import React, { useState } from 'react';
import { Building, MapPin, FileText, Plus, Edit3, Trash2 } from 'lucide-react';
import { Modal } from './ui/Modal';
import { FormButton } from './ui/FormButton';

interface Requirement {
  id: string;
  category: string;
  requirement_text: string;
}

interface RequirementFormData {
  category: string;
  requirement_text: string;
}

interface ClientRequirementsSectionProps {
  requirements: Requirement[];
  loading: boolean;
  readonly?: boolean;
  onSave: (formData: RequirementFormData, editingId?: string) => Promise<void>;
  onDelete: (requirementId: string) => Promise<void>;
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

export const ClientRequirementsSection: React.FC<ClientRequirementsSectionProps> = ({
  requirements,
  loading,
  readonly = false,
  onSave,
  onDelete
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editingRequirement, setEditingRequirement] = useState<Requirement | null>(null);
  const [formData, setFormData] = useState<RequirementFormData>({
    category: 'Space Requirements',
    requirement_text: ''
  });

  const resetForm = () => {
    setFormData({
      category: 'Space Requirements',
      requirement_text: ''
    });
    setEditingRequirement(null);
  };

  const openAddModal = () => {
    resetForm();
    setIsModalOpen(true);
  };

  const openEditModal = (requirement: Requirement) => {
    setFormData({
      category: requirement.category,
      requirement_text: requirement.requirement_text
    });
    setEditingRequirement(requirement);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    resetForm();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.requirement_text.trim()) return;
    
    setSaving(true);
    try {
      await onSave(formData, editingRequirement?.id);
      setIsModalOpen(false);
      resetForm();
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (requirementId: string) => {
    if (!confirm('Are you sure you want to delete this requirement?')) return;
    await onDelete(requirementId);
  };

  const getRequirementsByCategory = (category: string) => {
    return requirements.filter(req => req.category === category);
  };

  return (
    <>
      <div className="bg-slate-50 rounded-xl p-6 border border-slate-200">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-slate-900">Client Requirements</h3>
          {!readonly && (
            <button onClick={openAddModal} title="Add Requirement">
              <Plus className="w-4 h-4 text-slate-400 cursor-pointer hover:text-indigo-600 transition-colors" />
            </button>
          )}
        </div>
        
        {loading ? (
          <div className="text-sm text-slate-600">Loading requirements...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {requirementCategories.map((category) => {
              const categoryRequirements = getRequirementsByCategory(category.id);
              return (
                <div key={category.id}>
                  <div className="flex items-center space-x-2 mb-3">
                    <category.icon className="w-4 h-4 text-indigo-600" />
                    <h4 className="font-medium text-slate-900 text-sm">{category.title}</h4>
                  </div>
                  <div className="space-y-2 ml-6">
                    {categoryRequirements.length > 0 ? (
                      categoryRequirements.map((req) => (
                        <div key={req.id} className="flex items-center justify-between group">
                          <div className="flex items-center space-x-2">
                            <div className="w-1.5 h-1.5 bg-indigo-600 rounded-full" />
                            <span className="text-sm text-slate-700">{req.requirement_text}</span>
                          </div>
                          {!readonly && (
                            <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button onClick={() => openEditModal(req)}>
                                <Edit3 className="w-3 h-3 text-slate-400 hover:text-indigo-600" />
                              </button>
                              <button onClick={() => handleDelete(req.id)}>
                                <Trash2 className="w-3 h-3 text-slate-400 hover:text-red-600" />
                              </button>
                            </div>
                          )}
                        </div>
                      ))
                    ) : (
                      <div className="flex items-center space-x-2">
                        <div className="w-1.5 h-1.5 bg-slate-400 rounded-full" />
                        <span className="text-sm text-slate-500">To be defined</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={closeModal}
        title={editingRequirement ? 'Edit Requirement' : 'Add Requirement'}
        size="md"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Category
            </label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="form-input w-full px-3 py-2 rounded-md"
            >
              {requirementCategories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.title}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Requirement
            </label>
            <textarea
              value={formData.requirement_text}
              onChange={(e) => setFormData({ ...formData, requirement_text: e.target.value })}
              placeholder="Enter requirement details..."
              rows={3}
              className="form-input w-full px-3 py-2 rounded-md"
              required
            />
          </div>
          
          <div className="flex justify-end space-x-3 pt-4">
            <FormButton variant="secondary" onClick={closeModal}>
              Cancel
            </FormButton>
            <FormButton 
              type="submit" 
              loading={saving}
              disabled={!formData.requirement_text.trim()}
            >
              {editingRequirement ? 'Update' : 'Add'} Requirement
            </FormButton>
          </div>
        </form>
      </Modal>
    </>
  );
};