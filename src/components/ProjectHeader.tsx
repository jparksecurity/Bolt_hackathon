import React, { useState, useEffect, useCallback } from 'react';
import { Edit3, Calendar, DollarSign, Info } from 'lucide-react';
import { useUser } from '@clerk/clerk-react';
import { useSupabaseClient } from '../lib/supabase';
import { ProjectStatus, BaseProjectData } from '../types/project';
import { useProjectData } from '../hooks/useProjectData';
import { CompanyInfoSection } from './CompanyInfoSection';
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
  expected_fee: string;
  broker_commission: string;
  commission_paid_by: string;
  payment_due: string;
}

interface RequirementFormData {
  category: string;
  requirement_text: string;
}

interface CompanyInfoFormData {
  company_name: string;
  expected_headcount: string;
  contact_name: string;
  contact_title: string;
  contact_phone: string;
  contact_email: string;
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
  
  // Project form data
  const [projectFormData, setProjectFormData] = useState<ProjectFormData>({
    title: '',
    status: ProjectStatus.ACTIVE,
    start_date: '',
    expected_fee: '',
    broker_commission: '',
    commission_paid_by: '',
    payment_due: ''
  });

  // Use data hooks for public mode
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

  // Project form functions
  const resetProjectForm = () => {
    setProjectFormData({
      title: project.title,
      status: project.status,
      start_date: project.start_date || '',
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

  // Company info save handler
  const handleCompanyInfoSave = async (formData: CompanyInfoFormData) => {
    // Update project with company details
    const { error: projectError } = await supabase
      .from('projects')
      .update({
        company_name: formData.company_name,
        expected_headcount: formData.expected_headcount,
      })
      .eq('id', project.id);

    if (projectError) throw projectError;

    // Handle primary contact
    const primaryContact = contacts.find(contact => contact.is_primary) || contacts[0];
    
    if (primaryContact) {
      // Update existing primary contact
      const { error: contactError } = await supabase
        .from('project_contacts')
        .update({
          name: formData.contact_name,
          title: formData.contact_title,
          phone: formData.contact_phone,
          email: formData.contact_email,
          is_primary: true,
        })
        .eq('id', primaryContact.id);

      if (contactError) throw contactError;
    } else {
      // Create new primary contact
      const { error: contactError } = await supabase
        .from('project_contacts')
        .insert([
          {
            project_id: project.id,
            name: formData.contact_name,
            title: formData.contact_title,
            phone: formData.contact_phone,
            email: formData.contact_email,
            is_primary: true,
          }
        ]);

      if (contactError) throw contactError;
    }

    await fetchContactsAndRequirements();
    onProjectUpdate?.();
  };

  // Requirements save handler
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

  // Requirements delete handler
  const handleRequirementDelete = async (requirementId: string) => {
    const { error } = await supabase
      .from('client_requirements')
      .delete()
      .eq('id', requirementId);

    if (error) throw error;
    await refetchRequirements();
  };

  return (
    <div className="bg-white p-6 border-b border-gray-200">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center space-x-2">
            <span>{project.title}</span>
            {!readonly && (
              <button onClick={openProjectModal}>
                <Edit3 className="w-5 h-5 text-gray-400 cursor-pointer hover:text-gray-600 transition-colors" />
              </button>
            )}
          </h1>
          <div className="flex items-center space-x-4 mt-2 text-sm text-gray-600">
            <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full font-medium">
              {project.status}
            </span>
          </div>
        </div>
      </div>

      {/* Project metrics */}
      <div className="flex items-center space-x-6 mb-6 text-sm text-gray-600">
        <div className="flex items-center space-x-1">
          <Calendar className="w-4 h-4" />
          <span>Started: {project.start_date ? new Date(project.start_date).toLocaleDateString() : 'Not set'}</span>
        </div>
        <div className="flex items-center space-x-1 relative">
          <DollarSign className="w-4 h-4" />
          <span>Expected Fee: ${project.expected_fee ? project.expected_fee.toLocaleString() : '0'}</span>
          {project.broker_commission && project.broker_commission > 0 && (
            <div 
              className="relative"
              onMouseEnter={() => setShowTooltip(true)}
              onMouseLeave={() => setShowTooltip(false)}
            >
              <Info className="w-4 h-4 text-gray-400 cursor-help hover:text-gray-600 transition-colors" />
              {showTooltip && (
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-64 bg-gray-900 text-white text-xs rounded-lg p-3 shadow-lg z-10">
                  <div className="space-y-1">
                    <div className="font-medium">Commission Breakdown:</div>
                    <div>• Broker commission: ${project.broker_commission?.toLocaleString() || '0'}</div>
                    <div>• Paid by: {project.commission_paid_by || 'TBD'}</div>
                    <div>• Payment due: {project.payment_due || 'TBD'}</div>
                  </div>
                  <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Company Information Section */}
      <CompanyInfoSection
        project={project}
        contacts={contacts}
        loading={loading}
        readonly={readonly}
        onSave={handleCompanyInfoSave}
      />

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
        title="Edit Project"
        size="lg"
      >
        <form onSubmit={(e) => { e.preventDefault(); saveProject(); }} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Project Title
              </label>
              <input
                type="text"
                value={projectFormData.title}
                onChange={(e) => setProjectFormData({ ...projectFormData, title: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <select
                value={projectFormData.status}
                onChange={(e) => setProjectFormData({ ...projectFormData, status: e.target.value as ProjectStatus })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {Object.values(ProjectStatus).map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Start Date
              </label>
              <input
                type="date"
                value={projectFormData.start_date}
                onChange={(e) => setProjectFormData({ ...projectFormData, start_date: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Expected Fee
              </label>
              <input
                type="number"
                value={projectFormData.expected_fee}
                onChange={(e) => setProjectFormData({ ...projectFormData, expected_fee: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                min="0"
                step="0.01"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Broker Commission
              </label>
              <input
                type="number"
                value={projectFormData.broker_commission}
                onChange={(e) => setProjectFormData({ ...projectFormData, broker_commission: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                min="0"
                step="0.01"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Commission Paid By
              </label>
              <input
                type="text"
                value={projectFormData.commission_paid_by}
                onChange={(e) => setProjectFormData({ ...projectFormData, commission_paid_by: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Payment Due
              </label>
              <input
                type="text"
                value={projectFormData.payment_due}
                onChange={(e) => setProjectFormData({ ...projectFormData, payment_due: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          
          <div className="flex justify-end space-x-3 pt-4">
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