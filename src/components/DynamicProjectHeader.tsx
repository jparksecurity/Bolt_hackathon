import React, { useState } from 'react';
import { Building, Calendar, DollarSign, Users, Mail, Phone, FileText, Info, Edit3 } from 'lucide-react';
import { Project, ProjectContact, ClientRequirement } from '../types/database';
import { formatCurrency, formatDate } from '../utils/formatters';

interface DynamicProjectHeaderProps {
  project: Project;
  contacts: ProjectContact[];
  requirements: ClientRequirement[];
}


const groupRequirementsByCategory = (requirements: ClientRequirement[]) => {
  return requirements.reduce((groups, req) => {
    const category = req.category || 'Other';
    if (!groups[category]) {
      groups[category] = [];
    }
    groups[category].push(req);
    return groups;
  }, {} as Record<string, ClientRequirement[]>);
};

export const DynamicProjectHeader: React.FC<DynamicProjectHeaderProps> = ({ project, contacts, requirements }) => {
  const [showTooltip, setShowTooltip] = useState(false);
  const primaryContact = contacts.find(c => c.is_primary) || contacts[0];
  const requirementGroups = groupRequirementsByCategory(requirements);
  
  return (
    <div className="bg-white p-6 border-b border-gray-200">
      {/* Project Title and Status */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <h2 className="text-2xl font-bold text-gray-900">{project.title}</h2>
          <Edit3 className="w-5 h-5 text-gray-400 cursor-pointer hover:text-gray-600 transition-colors" />
        </div>
        <span className="px-3 py-1 bg-blue-100 text-blue-800 text-sm font-medium rounded-full">
          {project.status}
        </span>
      </div>
      
      {/* Project Meta */}
      <div className="flex items-center space-x-6 mb-4 text-sm text-gray-600">
        <div className="flex items-center space-x-1">
          <Calendar className="w-4 h-4" />
          <span>Started: {formatDate(project.start_date)}</span>
        </div>
        <div className="flex items-center space-x-1">
          <DollarSign className="w-4 h-4" />
          <span>Expected Fee for Tenant: {formatCurrency(project.expected_fee)}</span>
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
                  <div>• Broker commission: {formatCurrency(project.broker_commission)}</div>
                  <div>• Paid by: {project.commission_paid_by}</div>
                  <div>• Payment due: {project.payment_due ? formatDate(project.payment_due) : 'N/A'}</div>
                </div>
                <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Company and Contact Information */}
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
                <span className="ml-2 font-medium">{project.company_name || 'N/A'}</span>
              </div>
              <div>
                <span className="text-gray-600">Expected Head Count:</span>
                <span className="ml-2">{project.expected_headcount || 'N/A'}</span>
              </div>
            </div>
          </div>
          
          {primaryContact && (
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Point of Contact</h4>
              <div className="space-y-2 text-sm">
                <div className="flex items-center space-x-2">
                  <Users className="w-4 h-4 text-gray-400" />
                  <span className="font-medium">{primaryContact.name}</span>
                  {primaryContact.title && <span className="text-gray-600">- {primaryContact.title}</span>}
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
            </div>
          )}
        </div>
      </div>

      {/* Client Requirements Section */}
      {Object.keys(requirementGroups).length > 0 && (
        <div className="bg-gray-50 rounded-lg p-4 mb-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-semibold text-gray-900">Client Requirements</h3>
            <Edit3 className="w-4 h-4 text-gray-400 cursor-pointer hover:text-gray-600 transition-colors" />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {Object.entries(requirementGroups).map(([category, reqs]) => (
              <div key={category}>
                <div className="flex items-center space-x-2 mb-3">
                  <FileText className="w-4 h-4 text-blue-600" />
                  <h4 className="font-medium text-gray-900 text-sm">{category}</h4>
                </div>
                <div className="space-y-2 ml-6">
                  {reqs.map((req) => (
                    <div key={req.id} className="flex items-center space-x-2">
                      <div className="w-1.5 h-1.5 bg-gray-400 rounded-full" />
                      <span className="text-sm text-gray-700">{req.requirement_text}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}; 