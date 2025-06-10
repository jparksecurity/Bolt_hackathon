import React, { useState } from 'react';
import { Square, Calendar, Plus, Edit3, X, MessageSquare, Building2, DollarSign } from 'lucide-react';

interface Property {
  id: number;
  name: string;
  size: string;
  rent: string;
  availability: string;
  description: string;
  features: string[];
  status: 'active' | 'new' | 'pending' | 'declined';
  declineReason?: string;
  leaseType: 'Direct Lease' | 'Sublease' | 'Sub-sublease';
  serviceType: 'Full Service' | 'NNN' | 'Modified Gross';
}

const initialProperties: Property[] = [
  {
    id: 1,
    name: 'Downtown Tech Tower - 5th Street',
    size: '18,500 sq ft',
    rent: '$24/sq ft',
    availability: 'Available March 2024',
    description: 'Modern Class A office space with exposed brick, high ceilings, and floor-to-ceiling windows. Fiber internet ready, flexible open floor plan perfect for collaborative workspaces. 2 blocks from metro station.',
    features: ['Virtual Tour', 'Brochure'],
    status: 'active',
    leaseType: 'Direct Lease',
    serviceType: 'Full Service'
  },
  {
    id: 2,
    name: 'Innovation District Plaza',
    size: '16,200 sq ft',
    rent: '$32/sq ft',
    availability: 'Available April 2024',
    description: 'Brand new construction in the Innovation District. Features include rooftop terrace, bike storage, and state-of-the-art HVAC. One block south from light rail with incredible views for maximum flexibility.',
    features: ['Virtual Tour', 'Brochure Coming Soon'],
    status: 'new',
    leaseType: 'Direct Lease',
    serviceType: 'NNN'
  },
  {
    id: 3,
    name: 'Historic Warehouse Conversion',
    size: '22,000 sq ft',
    rent: '$24/sq ft',
    availability: 'Available February 2024',
    description: 'Converted warehouse with industrial charm. High ceilings, polished concrete floors, and abundant natural light. Includes parking garage and loading dock. Great for companies wanting unique character.',
    features: ['Virtual Tour Pending', 'Brochure'],
    status: 'declined',
    declineReason: 'Client concerned about noise levels from nearby construction and lack of modern HVAC system.',
    leaseType: 'Sublease',
    serviceType: 'Modified Gross'
  }
];

const getLeaseTypeColor = (leaseType: string) => {
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

const getServiceTypeColor = (serviceType: string) => {
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

interface PropertiesOfInterestProps {
  projectId: string;
}

export const PropertiesOfInterest: React.FC<PropertiesOfInterestProps> = () => {
  const [properties, setProperties] = useState<Property[]>(initialProperties);
  const [showDeclineModal, setShowDeclineModal] = useState<number | null>(null);
  const [declineReason, setDeclineReason] = useState('');

  const handleDeclineProperty = (propertyId: number) => {
    setProperties(properties.map(property => 
      property.id === propertyId 
        ? { ...property, status: 'declined', declineReason }
        : property
    ));
    setShowDeclineModal(null);
    setDeclineReason('');
  };

  const handleRestoreProperty = (propertyId: number) => {
    setProperties(properties.map(property => 
      property.id === propertyId 
        ? { ...property, status: 'active', declineReason: undefined }
        : property
    ));
  };

  const openDeclineModal = (propertyId: number) => {
    setShowDeclineModal(propertyId);
    setDeclineReason('');
  };

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
        {properties.map((property) => (
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
            
            {property.status === 'declined' && property.declineReason && (
              <div className="mb-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-start space-x-2">
                  <MessageSquare className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <span className="text-sm font-medium text-red-800">Decline Reason:</span>
                    <p className="text-sm text-red-700 mt-1">{property.declineReason}</p>
                  </div>
                </div>
              </div>
            )}
            
            <div className={`flex items-center space-x-6 mb-3 text-sm text-gray-600 ${
              property.status === 'declined' ? 'line-through' : ''
            }`}>
              <div className="flex items-center space-x-1">
                <Square className="w-4 h-4" />
                <span>{property.size}</span>
              </div>
              <div className="flex items-center space-x-1">
                <DollarSign className="w-4 h-4" />
                <span className="font-medium">{property.rent}</span>
              </div>
              <div className="flex items-center space-x-1">
                <Calendar className="w-4 h-4" />
                <span>{property.availability}</span>
              </div>
            </div>

            {/* Lease and Service Type Information */}
            <div className="flex items-center space-x-3 mb-3">
              <div className="flex items-center space-x-2">
                <Building2 className="w-4 h-4 text-gray-500" />
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${getLeaseTypeColor(property.leaseType)} ${
                  property.status === 'declined' ? 'opacity-50' : ''
                }`}>
                  {property.leaseType}
                </span>
              </div>
              <span className={`px-2 py-1 text-xs font-medium rounded-full ${getServiceTypeColor(property.serviceType)} ${
                property.status === 'declined' ? 'opacity-50' : ''
              }`}>
                {property.serviceType}
              </span>
            </div>
            
            <p className={`text-gray-700 text-sm mb-4 leading-relaxed ${
              property.status === 'declined' ? 'line-through' : ''
            }`}>
              {property.description}
            </p>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                {property.features.map((feature, index) => (
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
        ))}
      </div>

      {/* Decline Modal */}
      {showDeclineModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Decline Property</h3>
              <button
                onClick={() => setShowDeclineModal(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Reason for declining this property:
              </label>
              <textarea
                value={declineReason}
                onChange={(e) => setDeclineReason(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                rows={4}
                placeholder="Enter the reason why this property doesn't meet the client's requirements..."
              />
            </div>
            
            <div className="flex items-center justify-end space-x-3">
              <button
                onClick={() => setShowDeclineModal(null)}
                className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeclineProperty(showDeclineModal)}
                disabled={!declineReason.trim()}
                className="px-4 py-2 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Decline Property
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};