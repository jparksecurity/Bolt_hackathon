import React, { useState, useEffect, useCallback } from 'react';
import { Edit3, Calendar, DollarSign, Info, Building, User, Phone, Mail, MapPin } from 'lucide-react';
import { useUser } from '@clerk/clerk-react';
import { useSupabaseClient } from '../lib/supabase';
import { ProjectStatus, BaseProjectData } from '../types/project';
import { useProjectData } from '../hooks/useProjectData';
import { ClientRequirementsSection } from './ClientRequirementsSection';
import { Modal } from './ui/Modal';
import { FormButton } from './ui/FormButton';

interface ProjectHeaderProps {
  project: BaseProjectData;
  onProjectUpdate?: () => void;
  readonly?: boolean;
  shareId?: string;
}

interface Contact {
  id: string;
  name: string;
  title?: string | null;
  phone?: string | null;
  email?: string | null;
  is_primary: boolean;
}

interface Requirement {
  id: string;
  category: string;
  requirement_text: string;
}

interface ProjectFormData {
  title: string;
  status: ProjectStatus;
  start_date: string;
  desired_move_in_date: string;
  expected_fee: string;
  broker_commission: string;
  commission_paid_by: string;
  payment_due: string;
}

interface RequirementFormData {
  category: string;
  requirement_text: string;
}

export const ProjectHeader: React.FC<ProjectHeaderProps> = ({ 
  project, 
  onProjectUpdate, 
  readonly = false, 
  shareId 
}) => {
  const { user } = useUser();
  const supabase = useSupabaseClient();
  const [showTooltip, setShowTooltip] = useState(false);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [requirements, setRequirements] = useState<Requirement[]>([]);
  const [loading, setLoading] = useState(true);
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  
  const [projectFormData, setProjectFormData] = useState<ProjectFormData>({
    title: '',
    status: ProjectStatus.ACTIVE,
    start_date: '',
    desired_move_in_date: '',
    expected_fee: '',
    broker_commission: '',
    commission_paid_by: '',
    payment_due: ''
  });

  const { 
    data: publicContacts, 
    loading: publicContactsLoading 
  } = useProjectData<Contact>({ 
    shareId: readonly && shareId ? shareId : undefined,
    projectId: !readonly ? project.id : undefined,
    dataType: 'contacts' 
  });

  const { 
    data: publicRequirements, 
    loading: publicRequirementsLoading,
    refetch: refetchRequirements
  } = useProjectData<Requirement>({ 
    shareId: readonly && shareId ? shareId : undefined,
    projectId: !readonly ? project.id : undefined,
    dataType: 'requirements' 
  });

  const fetchContactsAndRequirements = useCallback(async () => {
    try {
      setContacts(publicContacts);
      setRequirements(publicRequirements);
      setLoading(publicContactsLoading || publicRequirementsLoading);
    } catch {
      // Error fetching contacts and requirements - use empty arrays
    }
  }, [publicContacts, publicRequirements, publicContactsLoading, publicRequirementsLoading]);

  useEffect(() => {
    if (readonly || (user && project.id)) {
      fetchContactsAndRequirements();
    }
  }, [user, project.id, fetchContactsAndRequirements, readonly]);

  const resetProjectForm = () => {
    setProjectFormData({
      title: project.title,
      status: project.status,
      start_date: project.start_date || '',
      desired_move_in_date: (project as any).desired_move_in_date || '',
      expected_fee: project.expected_fee?.toString() || '',
      broker_commission: project.broker_commission?.toString() || '',
      commission_paid_by: project.commission_paid_by || '',
      payment_due: project.payment_due || ''
    });
  };

  const openProjectModal = () => {
    resetProjectForm();
    setIsProjectModalOpen(true);
  };

  const closeProjectModal = () => {
    setIsProjectModalOpen(false);
  };

  const saveProject = async () => {
    setSaving(true);
    try {
      const updateData = {
        title: projectFormData.title.trim(),
        status: projectFormData.status,
        start_date: projectFormData.start_date || null,
        desired_move_in_date: projectFormData.desired_move_in_date || null,
        expected_fee: projectFormData.expected_fee ? parseFloat(projectFormData.expected_fee) : null,
        broker_commission: projectFormData.broker_commission ? parseFloat(projectFormData.broker_commission) : null,
        commission_paid_by: projectFormData.commission_paid_by.trim() || null,
        payment_due: projectFormData.payment_due.trim() || null,
        updated_at: new Date().toISOString()
      };

      const { error } = await supabase
        .from('projects')
        .update(updateData)
        .eq('id', project.id);

      if (error) throw error;

      setIsProjectModalOpen(false);
      onProjectUpdate?.();
    } catch {
      alert('Error updating project. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleRequirementSave = async (formData: RequirementFormData, editingId?: string) => {
    const requirementData = {
      project_id: project.id,
      category: formData.category,
      requirement_text: formData.requirement_text.trim()
    };

    if (editingId) {
      const { error } = await supabase
        .from('client_requirements')
        .update(requirementData)
        .eq('id', editingId);

      if (error) throw error;
    } else {
      const { error } = await supabase
        .from('client_requirements')
        .insert([requirementData]);

      if (error) throw error;
    }

    await refetchRequirements();
  };

  const handleRequirementDelete = async (requirementId: string) => {
    const { error } = await supabase
      .from('client_requirements')
      .delete()
      .eq('id', requirementId);

    if (error) throw error;
    await refetchRequirements();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active':
        return 'status-active';
      case 'Pending':
        return 'status-pending';
      case 'Completed':
        return 'status-completed';
      case 'On Hold':
        return 'status-on-hold';
      default:
        return 'bg-gray-500';
    }
  };

  const primaryContact = contacts.find(contact => contact.is_primary) || contacts[0];

  return (
    <div className="dashboard-card p-8">
      <div className="flex items-start justify-between mb-8">
        <div className="flex-1">
          <div className="flex items-center space-x-4 mb-4">
            <h1 className="text-3xl font-bold text-gray-900">{project.title}</h1>
            {!readonly && (
              <button onClick={openProjectModal} className="p-2 text-gray-400 hover:text-gray-800 transition-colors rounded-lg hover:bg-gray-50">
                <Edit3 className="w-5 h-5" />
              </button>
            )}
          </div>
          <div className="flex items-center space-x-4">
            <span className={`px-4 py-2 text-white rounded-full font-semibold text-sm ${getStatusColor(project.status)}`}>
              {project.status}
            </span>
            {project.company_name && (
              <div className="flex items-center space-x-2 text-gray-600">
                <Building className="w-4 h-4" />
                <span className="font-medium">{project.company_name}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Project metrics */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
        <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-6 border border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center">
              <Calendar className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-gray-700 text-sm font-medium">Start Date</p>
              <p className="text-gray-900 font-bold text-lg">
                {project.start_date ? new Date(project.start_date).toLocaleDateString() : 'Not set'}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 border border-blue-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
              <MapPin className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-blue-700 text-sm font-medium">Desired Move-in</p>
              <p className="text-blue-900 font-bold text-lg">
                {(project as any).desired_move_in_date ? new Date((project as any).desired_move_in_date).toLocaleDateString() : 'Not set'}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-6 border border-green-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-green-700 text-sm font-medium">Expected Fee</p>
              <p className="text-green-900 font-bold text-lg">
                ${project.expected_fee ? project.expected_fee.toLocaleString() : '0'}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-6 border border-gray-200 relative">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gray-700 rounded-lg flex items-center justify-center">
              <Info className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1">
              <p className="text-gray-700 text-sm font-medium">Commission</p>
              <p className="text-gray-900 font-bold text-lg">
                ${project.broker_commission ? project.broker_commission.toLocaleString() : '0'}
              </p>
            </div>
            {project.broker_commission && project.broker_commission > 0 && (
              <div 
                className="relative"
                onMouseEnter={() => setShowTooltip(true)}
                onMouseLeave={() => setShowTooltip(false)}
              >
                <Info className="w-4 h-4 text-gray-400 cursor-help hover:text-gray-600 transition-colors" />
                {showTooltip && (
                  <div className="absolute bottom-full right-0 mb-2 w-64 bg-gray-900 text-white text-xs rounded-lg p-3 shadow-lg z-10">
                    <div className="space-y-1">
                      <div className="font-medium text-gray-300">Commission Details:</div>
                      <div>• Amount: ${project.broker_commission?.toLocaleString() || '0'}</div>
                      <div>• Paid by: {project.commission_paid_by || 'TBD'}</div>
                      <div>• Payment due: {project.payment_due || 'TBD'}</div>
                    </div>
                    <div className="absolute top-full right-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-6 border border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gray-600 rounded-lg flex items-center justify-center">
              <User className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-gray-700 text-sm font-medium">Head Count</p>
              <p className="text-gray-900 font-bold text-lg">
                {project.expected_headcount || 'Not set'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Contact Information */}
      {primaryContact && (
        <div className="bg-gray-50 rounded-xl p-6 mb-8 border border-gray-200">
          <h4 className="font-bold text-gray-900 mb-4 flex items-center space-x-2">
            <User className="w-5 h-5 text-gray-800" />
            <span>Primary Contact</span>
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center">
                <User className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="font-semibold text-gray-900">{primaryContact.name}</p>
                {primaryContact.title && <p className="text-sm text-gray-600">{primaryContact.title}</p>}
              </div>
            </div>
            {primaryContact.phone && (
              <div className="flex items-center space-x-3">
                <Phone className="w-5 h-5 text-gray-400" />
                <span className="text-gray-900">{primaryContact.phone}</span>
              </div>
            )}
            {primaryContact.email && (
              <div className="flex items-center space-x-3">
                <Mail className="w-5 h-5 text-gray-400" />
                <span className="text-gray-900">{primaryContact.email}</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Client Requirements Section */}
      <ClientRequirementsSection
        requirements={requirements}
        loading={loading}
        readonly={readonly}
        onSave={handleRequirementSave}
        onDelete={handleRequirementDelete}
      />
      
      {/* Project Edit Modal */}
      <Modal
        isOpen={isProjectModalOpen}
        onClose={closeProjectModal}
        title="Edit Project Details"
        size="lg"
      >
        <form onSubmit={(e) => { e.preventDefault(); saveProject(); }} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Project Title
              </label>
              <input
                type="text"
                value={projectFormData.title}
                onChange={(e) => setProjectFormData({ ...projectFormData, title: e.target.value })}
                className="form-input w-full px-4 py-3 rounded-lg"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Status
              </label>
              <select
                value={projectFormData.status}
                onChange={(e) => setProjectFormData({ ...projectFormData, status: e.target.value as ProjectStatus })}
                className="form-input w-full px-4 py-3 rounded-lg"
              >
                {Object.values(ProjectStatus).map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Start Date
              </label>
              <input
                type="date"
                value={projectFormData.start_date}
                onChange={(e) => setProjectFormData({ ...projectFormData, start_date: e.target.value })}
                className="form-input w-full px-4 py-3 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Desired Move-in Date
              </label>
              <input
                type="date"
                value={projectFormData.desired_move_in_date}
                onChange={(e) => setProjectFormData({ ...projectFormData, desired_move_in_date: e.target.value })}
                className="form-input w-full px-4 py-3 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Expected Fee ($)
              </label>
              <input
                type="number"
                value={projectFormData.expected_fee}
                onChange={(e) => setProjectFormData({ ...projectFormData, expected_fee: e.target.value })}
                className="form-input w-full px-4 py-3 rounded-lg"
                min="0"
                step="0.01"
                placeholder="0.00"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Broker Commission ($)
              </label>
              <input
                type="number"
                value={projectFormData.broker_commission}
                onChange={(e) => setProjectFormData({ ...projectFormData, broker_commission: e.target.value })}
                className="form-input w-full px-4 py-3 rounded-lg"
                min="0"
                step="0.01"
                placeholder="0.00"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Commission Paid By
              </label>
              <input
                type="text"
                value={projectFormData.commission_paid_by}
                onChange={(e) => setProjectFormData({ ...projectFormData, commission_paid_by: e.target.value })}
                className="form-input w-full px-4 py-3 rounded-lg"
                placeholder="e.g., Landlord, Tenant"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Payment Due
              </label>
              <input
                type="text"
                value={projectFormData.payment_due}
                onChange={(e) => setProjectFormData({ ...projectFormData, payment_due: e.target.value })}
                className="form-input w-full px-4 py-3 rounded-lg"
                placeholder="e.g., Upon lease signing, 30 days after closing"
              />
            </div>
          </div>
          
          <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
            <FormButton variant="secondary" onClick={closeProjectModal}>
              Cancel
            </FormButton>
            <FormButton 
              type="submit" 
              loading={saving}
              disabled={!projectFormData.title.trim()}
            >
              Save Changes
            </FormButton>
          </div>
        </form>
      </Modal>
    </div>
  );
};