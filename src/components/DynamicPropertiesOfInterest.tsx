import React, { useState } from 'react';
import { Square, Calendar, Plus, Edit3, X, MessageSquare, Building2, DollarSign } from 'lucide-react';
import { Property } from '../types/database';
import { formatDate } from '../utils/formatters';

interface DynamicPropertiesOfInterestProps {
  properties: Property[];
  onUpdatePropertyStatus: (propertyId: string, status: Property['status'], reason?: string) => void;
}

const getLeaseTypeColor = (leaseType: string | null) => {
  switch (leaseType) {
    case 'Direct Lease':
      return 'bg-green-100 text-green-800';
    case 'Sublease':
      return 'bg-blue-100 text-blue-800';
    case 'Sub-sublease':
      return 'bg-purple-100 text-purple-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

const getServiceTypeColor = (serviceType: string | null) => {
  switch (serviceType) {
    case 'Full Service':
      return 'bg-emerald-100 text-emerald-800';
    case 'NNN':
      return 'bg-orange-100 text-orange-800';
    case 'Modified Gross':
      return 'bg-yellow-100 text-yellow-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};


export const DynamicPropertiesOfInterest: React.FC<DynamicPropertiesOfInterestProps> = ({ properties, onUpdatePropertyStatus }) => {
  const [showDeclineModal, setShowDeclineModal] = useState<string | null>(null);
  const [declineReason, setDeclineReason] = useState('');

  const handleDeclineProperty = (propertyId: string) => {
    onUpdatePropertyStatus(propertyId, 'declined', declineReason);
    setShowDeclineModal(null);
    setDeclineReason('');
  };
  
  const handleRestoreProperty = (propertyId: string) => {
    onUpdatePropertyStatus(propertyId, 'active');
  };

  const openDeclineModal = (propertyId: string) => {
    setShowDeclineModal(propertyId);
    setDeclineReason('');
  };

  // Placeholder for features as they are not in the DB
  const getFeatures = (propertyId: string) => {
      // This is a placeholder. In a real app, this would come from the DB.
      if (propertyId.includes('e8400')) return ['Virtual Tour', 'Brochure'];
      return ['Virtual Tour', 'Brochure Coming Soon'];
  }

  return (
    <div className="bg-white p-6 border border-gray-200 rounded-lg">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Properties of Interest</h3>
        <button className="flex items-center space-x-2 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg hover:bg-gray-800 transition-colors">
          <Plus className="w-4 h-4" />
          <span>Add Property</span>
        </button>
      </div>
      
      <div className="space-y-6">
        {properties.length > 0 ? (
          properties.map((property) => (
            <div key={property.id} className={`border border-gray-200 rounded-lg p-4 transition-all ${
              property.status === 'declined' 
                ? 'opacity-60 bg-gray-50' 
                : 'hover:shadow-md'
            }`}>
              <div className="flex items-start justify-between mb-3">
                <h4 className={`font-semibold text-gray-900 text-lg ${
                  property.status === 'declined' ? 'line-through' : ''
                }`}>
                  {property.name}
                </h4>
                <div className="flex items-center space-x-2">
                  {property.status === 'declined' ? (
                    <button
                      onClick={() => handleRestoreProperty(property.id)}
                      className="px-3 py-1.5 text-sm bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors font-medium"
                    >
                      Restore
                    </button>
                  ) : (
                    <button
                      onClick={() => openDeclineModal(property.id)}
                      className="px-3 py-1.5 text-sm bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors font-medium"
                    >
                      Decline
                    </button>
                  )}
                  <Edit3 className="w-4 h-4 text-gray-400 cursor-pointer hover:text-gray-600 transition-colors" />
                </div>
              </div>
              
              {property.status === 'declined' && property.decline_reason && (
                <div className="mb-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex items-start space-x-2">
                    <MessageSquare className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <span className="text-sm font-medium text-red-800">Decline Reason:</span>
                      <p className="text-sm text-red-700 mt-1">{property.decline_reason}</p>
                    </div>
                  </div>
                </div>
              )}
              
              <div className={`flex flex-wrap items-center gap-x-6 gap-y-2 mb-3 text-sm text-gray-600 ${
                property.status === 'declined' ? 'line-through' : ''
              }`}>
                <div className="flex items-center space-x-1">
                  <Square className="w-4 h-4" />
                  <span>{property.size || 'N/A'}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <DollarSign className="w-4 h-4" />
                  <span className="font-medium">{property.rent || 'N/A'}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Calendar className="w-4 h-4" />
                  <span>Available: {formatDate(property.availability)}</span>
                </div>
              </div>

              <div className="flex items-center space-x-3 mb-3">
                <div className="flex items-center space-x-2">
                  <Building2 className="w-4 h-4 text-gray-500" />
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${getLeaseTypeColor(property.lease_type)}`}>
                    {property.lease_type || 'N/A'}
                  </span>
                </div>
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${getServiceTypeColor(property.service_type)}`}>
                  {property.service_type || 'N/A'}
                </span>
              </div>
              
              <p className={`text-gray-700 text-sm mb-4 leading-relaxed ${
                property.status === 'declined' ? 'line-through' : ''
              }`}>
                {property.description}
              </p>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  {getFeatures(property.id).map((feature, index) => (
                    <span
                      key={index}
                      className={`px-2 py-1 text-xs rounded-full ${
                        feature.includes('Tour') 
                          ? 'bg-blue-100 text-blue-700' 
                          : 'bg-green-100 text-green-700'
                      } ${property.status === 'declined' ? 'opacity-50' : ''}`}
                    >
                      {feature}
                    </span>
                  ))}
                </div>
                <div className="flex items-center space-x-2">
                  <button className={`px-3 py-1 text-xs bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors ${
                    property.status === 'declined' ? 'opacity-50 cursor-not-allowed' : ''
                  }`}>
                    See More
                  </button>
                  {property.status === 'new' && (
                    <button className="px-3 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors">
                      New Construction
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))
        ) : (
            <p className="text-gray-500">No properties of interest have been added for this project yet.</p>
        )}
      </div>

      {/* Decline Modal */}
      {showDeclineModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Decline Property</h3>
              <button onClick={() => setShowDeclineModal(null)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <textarea
              value={declineReason}
              onChange={(e) => setDeclineReason(e.target.value)}
              placeholder="Enter reason for declining..."
              className="w-full h-24 p-2 border border-gray-300 rounded-md mb-4 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
            <div className="flex justify-end">
              <button
                onClick={() => handleDeclineProperty(showDeclineModal)}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
              >
                Confirm Decline
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}; 