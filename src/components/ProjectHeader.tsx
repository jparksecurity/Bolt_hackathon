import React, { useState, useEffect, useCallback } from 'react';
import { Edit3, Calendar, DollarSign, Info, Building, User, Phone, Mail, MapPin, FileText, X, Save, Plus, Trash2 } from 'lucide-react';
import { useUser } from '@clerk/clerk-react';
import { useSupabaseClient } from '../lib/supabase';

interface ProjectData {
  id: string;
  title: string;
  status: string;
  start_date?: string | null;
  expected_fee?: number | null;
  broker_commission?: number | null;
  commission_paid_by?: string | null;
  payment_due?: string | null;
  company_name?: string | null;
  expected_headcount?: string | null;
  created_at: string;
  updated_at: string;
}

interface ProjectHeaderProps {
  project: ProjectData;
  onProjectUpdate?: () => void;
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
  status: string;
  start_date: string;
  expected_fee: string;
  broker_commission: string;
  commission_paid_by: string;
  payment_due: string;
  company_name: string;
  expected_headcount: string;
}

interface ContactFormData {
  name: string;
  title: string;
  phone: string;
  email: string;
  is_primary: boolean;
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

export const ProjectHeader: React.FC<ProjectHeaderProps> = ({ project, onProjectUpdate }) => {
  const { user } = useUser();
  const supabase = useSupabaseClient();
  const [showTooltip, setShowTooltip] = useState(false);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [requirements, setRequirements] = useState<Requirement[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal states
  const [showProjectModal, setShowProjectModal] = useState(false);
  const [showContactModal, setShowContactModal] = useState(false);
  const [showRequirementModal, setShowRequirementModal] = useState(false);

  // Editing states
  const [editingContact, setEditingContact] = useState<Contact | null>(null);
  const [editingRequirement, setEditingRequirement] = useState<Requirement | null>(null);

  // Form data states
  const [projectFormData, setProjectFormData] = useState<ProjectFormData>({
    title: '',
    status: '',
    start_date: '',
    expected_fee: '',
    broker_commission: '',
    commission_paid_by: '',
    payment_due: '',
    company_name: '',
    expected_headcount: ''
  });

  const [contactFormData, setContactFormData] = useState<ContactFormData>({
    name: '',
    title: '',
    phone: '',
    email: '',
    is_primary: false
  });

  const [requirementFormData, setRequirementFormData] = useState<RequirementFormData>({
    category: 'Space Requirements',
    requirement_text: ''
  });

  const [saving, setSaving] = useState(false);

  const fetchContactsAndRequirements = useCallback(async () => {
    try {
      if (!user) return;

      // Fetch contacts
      const { data: contactsData, error: contactsError } = await supabase
        .from('project_contacts')
        .select('*')
        .eq('project_id', project.id)
        .order('is_primary', { ascending: false });

      if (contactsError) throw contactsError;

      // Fetch requirements
      const { data: requirementsData, error: requirementsError } = await supabase
        .from('client_requirements')
        .select('*')
        .eq('project_id', project.id)
        .order('category');

      if (requirementsError) throw requirementsError;

      setContacts(contactsData || []);
      setRequirements(requirementsData || []);
    } catch (err) {
      console.error('Error fetching contacts and requirements:', err);
    } finally {
      setLoading(false);
    }
  }, [user, supabase, project.id]);

  useEffect(() => {
    if (user && project.id) {
      fetchContactsAndRequirements();
    }
  }, [user, project.id, fetchContactsAndRequirements]);

  // Reset form functions
  const resetProjectForm = () => {
    setProjectFormData({
      title: project.title,
      status: project.status,
      start_date: project.start_date || '',
      expected_fee: project.expected_fee?.toString() || '',
      broker_commission: project.broker_commission?.toString() || '',
      commission_paid_by: project.commission_paid_by || '',
      payment_due: project.payment_due || '',
      company_name: project.company_name || '',
      expected_headcount: project.expected_headcount || ''
    });
  };

  const resetContactForm = () => {
    setContactFormData({
      name: '',
      title: '',
      phone: '',
      email: '',
      is_primary: false
    });
    setEditingContact(null);
  };

  const resetRequirementForm = () => {
    setRequirementFormData({
      category: 'Space Requirements',
      requirement_text: ''
    });
    setEditingRequirement(null);
  };

  // Modal open functions
  const openProjectModal = () => {
    resetProjectForm();
    setShowProjectModal(true);
  };

  const openContactModal = (contact?: Contact) => {
    if (contact) {
      setContactFormData({
        name: contact.name,
        title: contact.title || '',
        phone: contact.phone || '',
        email: contact.email || '',
        is_primary: contact.is_primary
      });
      setEditingContact(contact);
    } else {
      resetContactForm();
    }
    setShowContactModal(true);
  };

  const openRequirementModal = (requirement?: Requirement) => {
    if (requirement) {
      setRequirementFormData({
        category: requirement.category,
        requirement_text: requirement.requirement_text
      });
      setEditingRequirement(requirement);
    } else {
      resetRequirementForm();
    }
    setShowRequirementModal(true);
  };

  // Save functions
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
        company_name: projectFormData.company_name.trim() || null,
        expected_headcount: projectFormData.expected_headcount.trim() || null,
        updated_at: new Date().toISOString()
      };

      const { error } = await supabase
        .from('projects')
        .update(updateData)
        .eq('id', project.id);

      if (error) throw error;

      setShowProjectModal(false);
      onProjectUpdate?.();
    } catch (err) {
      console.error('Error updating project:', err);
      alert('Error updating project. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const saveContact = async () => {
    setSaving(true);
    try {
      const contactData = {
        project_id: project.id,
        name: contactFormData.name.trim(),
        title: contactFormData.title.trim() || null,
        phone: contactFormData.phone.trim() || null,
        email: contactFormData.email.trim() || null,
        is_primary: contactFormData.is_primary
      };

      if (editingContact) {
        const { error } = await supabase
          .from('project_contacts')
          .update(contactData)
          .eq('id', editingContact.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('project_contacts')
          .insert([contactData]);

        if (error) throw error;
      }

      setShowContactModal(false);
      resetContactForm();
      await fetchContactsAndRequirements();
    } catch (err) {
      console.error('Error saving contact:', err);
      alert('Error saving contact. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const saveRequirement = async () => {
    setSaving(true);
    try {
      const requirementData = {
        project_id: project.id,
        category: requirementFormData.category,
        requirement_text: requirementFormData.requirement_text.trim()
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

      setShowRequirementModal(false);
      resetRequirementForm();
      await fetchContactsAndRequirements();
    } catch (err) {
      console.error('Error saving requirement:', err);
      alert('Error saving requirement. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  // Delete functions
  const deleteContact = async (contactId: string) => {
    if (!confirm('Are you sure you want to delete this contact?')) return;

    try {
      const { error } = await supabase
        .from('project_contacts')
        .delete()
        .eq('id', contactId);

      if (error) throw error;
      await fetchContactsAndRequirements();
    } catch (err) {
      console.error('Error deleting contact:', err);
      alert('Error deleting contact. Please try again.');
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
      await fetchContactsAndRequirements();
    } catch (err) {
      console.error('Error deleting requirement:', err);
      alert('Error deleting requirement. Please try again.');
    }
  };

  const primaryContact = contacts.find(contact => contact.is_primary) || contacts[0];
  
  const getRequirementsByCategory = (category: string) => {
    return requirements.filter(req => req.category === category);
  };

  return (
    <div className="bg-white p-6 border-b border-gray-200">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center space-x-2">
            <span>{project.title}</span>
            <button onClick={openProjectModal}>
              <Edit3 className="w-5 h-5 text-gray-400 cursor-pointer hover:text-gray-600 transition-colors" />
            </button>
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

      {/* Company and Contact Information Section */}
      <div className="bg-gray-50 rounded-lg p-4 mb-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
            <Building className="w-5 h-5" />
            <span>Company Information</span>
          </h3>
          <div className="flex items-center space-x-2">
            <button onClick={() => openContactModal()} title="Add Contact">
              <Plus className="w-4 h-4 text-gray-400 cursor-pointer hover:text-gray-600 transition-colors" />
            </button>
            <button onClick={openProjectModal}>
              <Edit3 className="w-4 h-4 text-gray-400 cursor-pointer hover:text-gray-600 transition-colors" />
            </button>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h4 className="font-medium text-gray-900 mb-2">Company Details</h4>
            <div className="space-y-2 text-sm">
              <div>
                <span className="text-gray-600">Company Name:</span>
                <span className="ml-2 font-medium">{project.company_name || 'Not specified'}</span>
              </div>
              <div>
                <span className="text-gray-600">Expected Head Count:</span>
                <span className="ml-2">{project.expected_headcount || 'Not specified'}</span>
              </div>
            </div>
          </div>
          
          <div>
            <h4 className="font-medium text-gray-900 mb-2">Point of Contact</h4>
            {loading ? (
              <div className="text-sm text-gray-500">Loading contact...</div>
            ) : primaryContact ? (
              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <User className="w-4 h-4 text-gray-400" />
                    <span className="font-medium">{primaryContact.name}</span>
                    {primaryContact.title && (
                      <span className="text-gray-600">- {primaryContact.title}</span>
                    )}
                  </div>
                  <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => openContactModal(primaryContact)}>
                      <Edit3 className="w-3 h-3 text-gray-400 hover:text-gray-600" />
                    </button>
                    <button onClick={() => deleteContact(primaryContact.id)}>
                      <Trash2 className="w-3 h-3 text-gray-400 hover:text-red-600" />
                    </button>
                  </div>
                </div>
                {primaryContact.phone && (
                  <div className="flex items-center space-x-2">
                    <Phone className="w-4 h-4 text-gray-400" />
                    <span>{primaryContact.phone}</span>
                  </div>
                )}
                {primaryContact.email && (
                  <div className="flex items-center space-x-2">
                    <Mail className="w-4 h-4 text-gray-400" />
                    <span>{primaryContact.email}</span>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-2 text-sm">
                <div className="flex items-center space-x-2">
                  <User className="w-4 h-4 text-gray-400" />
                  <span className="font-medium">To be added</span>
                  <span className="text-gray-600">- Contact Person</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Phone className="w-4 h-4 text-gray-400" />
                  <span>To be added</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Mail className="w-4 h-4 text-gray-400" />
                  <span>To be added</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Client Requirements Section */}
      <div className="bg-gray-50 rounded-lg p-4 mb-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold text-gray-900">Client Requirements</h3>
          <button onClick={() => openRequirementModal()} title="Add Requirement">
            <Plus className="w-4 h-4 text-gray-400 cursor-pointer hover:text-gray-600 transition-colors" />
          </button>
        </div>
        
        {loading ? (
          <div className="text-sm text-gray-500">Loading requirements...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
                            <button onClick={() => openRequirementModal(req)}>
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
                        <span className="text-sm text-gray-700">To be defined</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Project Edit Modal */}
      {showProjectModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b">
              <h3 className="text-lg font-semibold text-gray-900">Edit Project Details</h3>
              <button onClick={() => setShowProjectModal(false)}>
                <X className="w-5 h-5 text-gray-400 hover:text-gray-600" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Project Title *</label>
                  <input
                    type="text"
                    value={projectFormData.title}
                    onChange={(e) => setProjectFormData(prev => ({ ...prev, title: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <select
                    value={projectFormData.status}
                    onChange={(e) => setProjectFormData(prev => ({ ...prev, status: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500"
                  >
                    <option value="Active">Active</option>
                    <option value="Pending">Pending</option>
                    <option value="Completed">Completed</option>
                    <option value="On Hold">On Hold</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                  <input
                    type="date"
                    value={projectFormData.start_date}
                    onChange={(e) => setProjectFormData(prev => ({ ...prev, start_date: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Expected Fee</label>
                  <input
                    type="number"
                    value={projectFormData.expected_fee}
                    onChange={(e) => setProjectFormData(prev => ({ ...prev, expected_fee: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500"
                    placeholder="0"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Broker Commission</label>
                  <input
                    type="number"
                    value={projectFormData.broker_commission}
                    onChange={(e) => setProjectFormData(prev => ({ ...prev, broker_commission: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500"
                    placeholder="0"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Commission Paid By</label>
                  <input
                    type="text"
                    value={projectFormData.commission_paid_by}
                    onChange={(e) => setProjectFormData(prev => ({ ...prev, commission_paid_by: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500"
                    placeholder="e.g., Landlord, Tenant"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Payment Due</label>
                  <input
                    type="text"
                    value={projectFormData.payment_due}
                    onChange={(e) => setProjectFormData(prev => ({ ...prev, payment_due: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500"
                    placeholder="e.g., Upon lease signing"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Company Name</label>
                  <input
                    type="text"
                    value={projectFormData.company_name}
                    onChange={(e) => setProjectFormData(prev => ({ ...prev, company_name: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500"
                    placeholder="Client company name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Expected Headcount</label>
                  <input
                    type="text"
                    value={projectFormData.expected_headcount}
                    onChange={(e) => setProjectFormData(prev => ({ ...prev, expected_headcount: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500"
                    placeholder="e.g., 50-75 employees"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  onClick={() => setShowProjectModal(false)}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={saveProject}
                  disabled={saving || !projectFormData.title.trim()}
                  className="flex items-center space-x-2 px-4 py-2 bg-gray-900 text-white rounded-md hover:bg-gray-800 transition-colors disabled:opacity-50"
                >
                  <Save className="w-4 h-4" />
                  <span>{saving ? 'Saving...' : 'Save Changes'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Contact Modal */}
      {showContactModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="flex items-center justify-between p-6 border-b">
              <h3 className="text-lg font-semibold text-gray-900">
                {editingContact ? 'Edit Contact' : 'Add Contact'}
              </h3>
              <button onClick={() => setShowContactModal(false)}>
                <X className="w-5 h-5 text-gray-400 hover:text-gray-600" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                <input
                  type="text"
                  value={contactFormData.name}
                  onChange={(e) => setContactFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                <input
                  type="text"
                  value={contactFormData.title}
                  onChange={(e) => setContactFormData(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500"
                  placeholder="e.g., CEO, Facility Manager"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                <input
                  type="tel"
                  value={contactFormData.phone}
                  onChange={(e) => setContactFormData(prev => ({ ...prev, phone: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500"
                  placeholder="(555) 123-4567"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  value={contactFormData.email}
                  onChange={(e) => setContactFormData(prev => ({ ...prev, email: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500"
                  placeholder="contact@company.com"
                />
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="is_primary"
                  checked={contactFormData.is_primary}
                  onChange={(e) => setContactFormData(prev => ({ ...prev, is_primary: e.target.checked }))}
                  className="mr-2"
                />
                <label htmlFor="is_primary" className="text-sm text-gray-700">Primary contact</label>
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  onClick={() => setShowContactModal(false)}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={saveContact}
                  disabled={saving || !contactFormData.name.trim()}
                  className="flex items-center space-x-2 px-4 py-2 bg-gray-900 text-white rounded-md hover:bg-gray-800 transition-colors disabled:opacity-50"
                >
                  <Save className="w-4 h-4" />
                  <span>{saving ? 'Saving...' : editingContact ? 'Update Contact' : 'Add Contact'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Requirement Modal */}
      {showRequirementModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="flex items-center justify-between p-6 border-b">
              <h3 className="text-lg font-semibold text-gray-900">
                {editingRequirement ? 'Edit Requirement' : 'Add Requirement'}
              </h3>
              <button onClick={() => setShowRequirementModal(false)}>
                <X className="w-5 h-5 text-gray-400 hover:text-gray-600" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <select
                  value={requirementFormData.category}
                  onChange={(e) => setRequirementFormData(prev => ({ ...prev, category: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500"
                >
                  {requirementCategories.map(category => (
                    <option key={category.id} value={category.id}>{category.title}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Requirement *</label>
                <textarea
                  value={requirementFormData.requirement_text}
                  onChange={(e) => setRequirementFormData(prev => ({ ...prev, requirement_text: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500"
                  rows={3}
                  placeholder="Enter requirement details"
                  required
                />
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  onClick={() => setShowRequirementModal(false)}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={saveRequirement}
                  disabled={saving || !requirementFormData.requirement_text.trim()}
                  className="flex items-center space-x-2 px-4 py-2 bg-gray-900 text-white rounded-md hover:bg-gray-800 transition-colors disabled:opacity-50"
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