import React, { useState, useEffect, useCallback } from 'react';
import { Edit3, Calendar, DollarSign, Info, Building, User, Phone, Mail, MapPin, FileText } from 'lucide-react';
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

export const ProjectHeader: React.FC<ProjectHeaderProps> = ({ project }) => {
  const { user } = useUser();
  const supabase = useSupabaseClient();
  const [showTooltip, setShowTooltip] = useState(false);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [requirements, setRequirements] = useState<Requirement[]>([]);
  const [loading, setLoading] = useState(true);

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
            <Edit3 className="w-5 h-5 text-gray-400 cursor-pointer hover:text-gray-600 transition-colors" />
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
          <Edit3 className="w-4 h-4 text-gray-400 cursor-pointer hover:text-gray-600 transition-colors" />
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

      {/* Client Requirements Section */}
      <div className="bg-gray-50 rounded-lg p-4 mb-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold text-gray-900">Client Requirements</h3>
          <Edit3 className="w-4 h-4 text-gray-400 cursor-pointer hover:text-gray-600 transition-colors" />
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
                        <div key={req.id} className="flex items-center space-x-2">
                          <div className="w-1.5 h-1.5 bg-blue-600 rounded-full" />
                          <span className="text-sm text-gray-700">{req.requirement_text}</span>
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
      
      <p className="text-gray-700 leading-relaxed">
        {project.title === 'Untitled Project' 
          ? 'Project description to be added. Click the edit icon to update project details.'
          : `Project: ${project.title}. Click the edit icon to update project details.`
        }
        <Edit3 className="w-4 h-4 text-gray-400 inline ml-2 cursor-pointer hover:text-gray-600 transition-colors" />
      </p>
    </div>
  );
};