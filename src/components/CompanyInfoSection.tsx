import React, { useState } from 'react';
import { Building, User, Phone, Mail, Edit3 } from 'lucide-react';
import { Modal } from './ui/Modal';
import { FormButton } from './ui/FormButton';
import { BaseProjectData } from '../types/project';

interface Contact {
  id: string;
  name: string;
  title?: string | null;
  phone?: string | null;
  email?: string | null;
  is_primary: boolean;
}

interface CompanyInfoFormData {
  company_name: string;
  expected_headcount: string;
  contact_name: string;
  contact_title: string;
  contact_phone: string;
  contact_email: string;
}

interface CompanyInfoSectionProps {
  project: BaseProjectData;
  contacts: Contact[];
  loading: boolean;
  readonly?: boolean;
  onSave: (formData: CompanyInfoFormData) => Promise<void>;
}

export const CompanyInfoSection: React.FC<CompanyInfoSectionProps> = ({
  project,
  contacts,
  loading,
  readonly = false,
  onSave
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState<CompanyInfoFormData>({
    company_name: '',
    expected_headcount: '',
    contact_name: '',
    contact_title: '',
    contact_phone: '',
    contact_email: ''
  });

  const primaryContact = contacts.find(contact => contact.is_primary) || contacts[0];

  const resetForm = () => {
    setFormData({
      company_name: project.company_name || '',
      expected_headcount: project.expected_headcount || '',
      contact_name: primaryContact?.name || '',
      contact_title: primaryContact?.title || '',
      contact_phone: primaryContact?.phone || '',
      contact_email: primaryContact?.email || ''
    });
  };

  const openModal = () => {
    resetForm();
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.company_name.trim() || !formData.contact_name.trim()) return;
    
    setSaving(true);
    try {
      await onSave(formData);
      setIsModalOpen(false);
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <div className="bg-gray-50 rounded-lg p-4 mb-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
            <Building className="w-5 h-5" />
            <span>Company Information</span>
          </h3>
          {!readonly && (
            <button onClick={openModal} title="Edit Company Information">
              <Edit3 className="w-4 h-4 text-gray-400 cursor-pointer hover:text-gray-600 transition-colors" />
            </button>
          )}
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
                <div className="flex items-center space-x-2">
                  <User className="w-4 h-4 text-gray-400" />
                  <span className="font-medium">{primaryContact.name}</span>
                  {primaryContact.title && (
                    <span className="text-gray-600">- {primaryContact.title}</span>
                  )}
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

      <Modal
        isOpen={isModalOpen}
        onClose={closeModal}
        title="Edit Company Information"
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Company Name *
              </label>
              <input
                type="text"
                value={formData.company_name}
                onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Expected Head Count
              </label>
              <input
                type="text"
                value={formData.expected_headcount}
                onChange={(e) => setFormData({ ...formData, expected_headcount: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="border-t border-gray-200 pt-4">
            <h4 className="font-medium text-gray-900 mb-3">Primary Contact</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Contact Name *
                </label>
                <input
                  type="text"
                  value={formData.contact_name}
                  onChange={(e) => setFormData({ ...formData, contact_name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Title
                </label>
                <input
                  type="text"
                  value={formData.contact_title}
                  onChange={(e) => setFormData({ ...formData, contact_title: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone
                </label>
                <input
                  type="tel"
                  value={formData.contact_phone}
                  onChange={(e) => setFormData({ ...formData, contact_phone: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  value={formData.contact_email}
                  onChange={(e) => setFormData({ ...formData, contact_email: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>
          
          <div className="flex justify-end space-x-3 pt-4">
            <FormButton variant="secondary" onClick={closeModal}>
              Cancel
            </FormButton>
            <FormButton 
              type="submit" 
              loading={saving}
              disabled={!formData.company_name.trim() || !formData.contact_name.trim()}
            >
              Save Changes
            </FormButton>
          </div>
        </form>
      </Modal>
    </>
  );
}; 