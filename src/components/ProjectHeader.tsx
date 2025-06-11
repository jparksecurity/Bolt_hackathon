import React, { useState, useEffect, useCallback } from 'react';
import { Edit3, Calendar, DollarSign, Info, Building, User, Phone, Mail } from 'lucide-react';
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
  
  const [projectFormData, setProjectFormData] = useState<ProjectFormData>({
    title: '',
    status: ProjectStatus.ACTIVE,
    start_date: '',
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

  const handleCompanyInfoSave = async (formData: CompanyInfoFormData) => {
    const { error: projectError } = await supabase
      .from('projects')
      .update({
        company_name: formData.company_name,
        expected_headcount: formData.expected_headcount,
      })
      .eq('id', project.id);

    if (projectError) throw projectError;

    const primaryContact = contacts.find(contact => contact.is_primary) || contacts[0];
    
    if (primaryContact) {
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
        return 'bg-[#27272a]';
    }
  };

  const primaryContact = contacts.find(contact => contact.is_primary) || contacts[0];

  return (
    <div className="gradient-card border-b border-[#27272a] p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center space-x-3">
            <span>{project.title}</span>
            {!readonly && (
              <button onClick={openProjectModal}>
                <Edit3 className="w-6 h-6 text-[#a1a1aa] cursor-pointer hover:text-[#6366f1] transition-colors" />
              </button>
            )}
          </h1>
          <div className="flex items-center space-x-4 mt-3">
            <span className={`px-3 py-1 text-white rounded-full font-medium text-sm ${getStatusColor(project.status)}`}>
              {project.status}
            </span>
          </div>
        </div>
      </div>

      {/* Project metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-[#1a1a2e]/50 rounded-xl p-4 border border-[#27272a]">
          <div className="flex items-center space-x-3">
            <Calendar className="w-5 h-5 text-[#6366f1]" />
            <div>
              <p className="text-[#a1a1aa] text-sm">Start Date</p>
              <p className="text-white font-semibold">
                {project.start_date ? new Date(project.start_date).toLocaleDateString() : 'Not set'}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-[#1a1a2e]/50 rounded-xl p-4 border border-[#27272a]">
          <div className="flex items-center space-x-3">
            <DollarSign className="w-5 h-5 text-[#10b981]" />
            <div>
              <p className="text-[#a1a1aa] text-sm">Expected Fee</p>
              <p className="text-white font-semibold">
                ${project.expected_fee ? project.expected_fee.toLocaleString() : '0'}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-[#1a1a2e]/50 rounded-xl p-4 border border-[#27272a] relative">
          <div className="flex items-center space-x-3">
            <Info className="w-5 h-5 text-[#8b5cf6]" />
            <div>
              <p className="text-[#a1a1aa] text-sm">Commission</p>
              <p className="text-white font-semibold">
                ${project.broker_commission ? project.broker_commission.toLocaleString() : '0'}
              </p>
            </div>
            {project.broker_commission && project.broker_commission > 0 && (
              <div 
                className="relative"
                onMouseEnter={() => setShowTooltip(true)}
                onMouseLeave={() => setShowTooltip(false)}
              >
                <Info className="w-4 h-4 text-[#a1a1aa] cursor-help hover:text-[#6366f1] transition-colors" />
                {showTooltip && (
                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-64 bg-[#1a1a2e] border border-[#27272a] text-white text-xs rounded-lg p-3 shadow-lg z-10">
                    <div className="space-y-1">
                      <div className="font-medium text-[#6366f1]">Commission Breakdown:</div>
                      <div>• Broker commission: ${project.broker_commission?.toLocaleString() || '0'}</div>
                      <div>• Paid by: {project.commission_paid_by || 'TBD'}</div>
                      <div>• Payment due: {project.payment_due || 'TBD'}</div>
                    </div>
                    <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-[#1a1a2e]"></div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Company Information Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <div className="bg-[#1a1a2e]/50 rounded-xl p-6 border border-[#27272a]">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white flex items-center space-x-2">
              <Building className="w-5 h-5 text-[#6366f1]" />
              <span>Company Information</span>
            </h3>
            {!readonly && (
              <button onClick={() => {}} title="Edit Company Information">
                <Edit3 className="w-4 h-4 text-[#a1a1aa] cursor-pointer hover:text-[#6366f1] transition-colors" />
              </button>
            )}
          </div>
          
          <div className="space-y-3">
            <div>
              <span className="text-[#a1a1aa] text-sm">Company Name:</span>
              <span className="ml-2 text-white font-medium">{project.company_name || 'Not specified'}</span>
            </div>
            <div>
              <span className="text-[#a1a1aa] text-sm">Expected Head Count:</span>
              <span className="ml-2 text-white">{project.expected_headcount || 'Not specified'}</span>
            </div>
          </div>
        </div>
        
        <div className="bg-[#1a1a2e]/50 rounded-xl p-6 border border-[#27272a]">
          <h4 className="font-semibold text-white mb-4 flex items-center space-x-2">
            <User className="w-5 h-5 text-[#8b5cf6]" />
            <span>Point of Contact</span>
          </h4>
          {loading ? (
            <div className="text-sm text-[#a1a1aa]">Loading contact...</div>
          ) : primaryContact ? (
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <User className="w-4 h-4 text-[#a1a1aa]" />
                <span className="text-white font-medium">{primaryContact.name}</span>
                {primaryContact.title && (
                  <span className="text-[#a1a1aa]">- {primaryContact.title}</span>
                )}
              </div>
              {primaryContact.phone && (
                <div className="flex items-center space-x-2">
                  <Phone className="w-4 h-4 text-[#a1a1aa]" />
                  <span className="text-white">{primaryContact.phone}</span>
                </div>
              )}
              {primaryContact.email && (
                <div className="flex items-center space-x-2">
                  <Mail className="w-4 h-4 text-[#a1a1aa]" />
                  <span className="text-white">{primaryContact.email}</span>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-3 text-[#a1a1aa]">
              <div className="flex items-center space-x-2">
                <User className="w-4 h-4" />
                <span>To be added - Contact Person</span>
              </div>
              <div className="flex items-center space-x-2">
                <Phone className="w-4 h-4" />
                <span>To be added</span>
              </div>
              <div className="flex items-center space-x-2">
                <Mail className="w-4 h-4" />
                <span>To be added</span>
              </div>
            </div>
          )}
        </div>
      </div>

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
              <label className="block text-sm font-medium text-[#a1a1aa] mb-1">
                Project Title
              </label>
              <input
                type="text"
                value={projectFormData.title}
                onChange={(e) => setProjectFormData({ ...projectFormData, title: e.target.value })}
                className="form-input w-full px-3 py-2 rounded-md"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#a1a1aa] mb-1">
                Status
              </label>
              <select
                value={projectFormData.status}
                onChange={(e) => setProjectFormData({ ...projectFormData, status: e.target.value as ProjectStatus })}
                className="form-input w-full px-3 py-2 rounded-md"
              >
                {Object.values(ProjectStatus).map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-[#a1a1aa] mb-1">
                Start Date
              </label>
              <input
                type="date"
                value={projectFormData.start_date}
                onChange={(e) => setProjectFormData({ ...projectFormData, start_date: e.target.value })}
                className="form-input w-full px-3 py-2 rounded-md"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#a1a1aa] mb-1">
                Expected Fee
              </label>
              <input
                type="number"
                value={projectFormData.expected_fee}
                onChange={(e) => setProjectFormData({ ...projectFormData, expected_fee: e.target.value })}
                className="form-input w-full px-3 py-2 rounded-md"
                min="0"
                step="0.01"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#a1a1aa] mb-1">
                Broker Commission
              </label>
              <input
                type="number"
                value={projectFormData.broker_commission}
                onChange={(e) => setProjectFormData({ ...projectFormData, broker_commission: e.target.value })}
                className="form-input w-full px-3 py-2 rounded-md"
                min="0"
                step="0.01"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#a1a1aa] mb-1">
                Commission Paid By
              </label>
              <input
                type="text"
                value={projectFormData.commission_paid_by}
                onChange={(e) => setProjectFormData({ ...projectFormData, commission_paid_by: e.target.value })}
                className="form-input w-full px-3 py-2 rounded-md"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-[#a1a1aa] mb-1">
                Payment Due
              </label>
              <input
                type="text"
                value={projectFormData.payment_due}
                onChange={(e) => setProjectFormData({ ...projectFormData, payment_due: e.target.value })}
                className="form-input w-full px-3 py-2 rounded-md"
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