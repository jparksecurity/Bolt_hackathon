import React from 'react';
import { MapPin, Square, Calendar, Eye, FileText, Plus, Edit3 } from 'lucide-react';

const properties = [
  {
    id: 1,
    name: 'Downtown Tech Tower - 5th Street',
    size: '18,500 sq ft',
    rent: '$24/sq ft',
    availability: 'Available March 2024',
    description: 'Modern Class A office space with exposed brick, high ceilings, and floor-to-ceiling windows. Fiber internet ready, flexible open floor plan perfect for collaborative workspaces. 2 blocks from metro station.',
    features: ['Virtual Tour', 'Brochure'],
    status: 'active'
  },
  {
    id: 2,
    name: 'Innovation District Plaza',
    size: '16,200 sq ft',
    rent: '$32/sq ft',
    availability: 'Available April 2024',
    description: 'Brand new construction in the Innovation District. Features include rooftop terrace, bike storage, and state-of-the-art HVAC. One block south from light rail with incredible views for maximum flexibility.',
    features: ['Virtual Tour', 'Brochure Coming Soon'],
    status: 'new'
  },
  {
    id: 3,
    name: 'Historic Warehouse Conversion',
    size: '22,000 sq ft',
    rent: '$24/sq ft',
    availability: 'Available February 2024',
    description: 'Converted warehouse with industrial charm. High ceilings, polished concrete floors, and abundant natural light. Includes parking garage and loading dock. Great for companies wanting unique character.',
    features: ['Virtual Tour Pending', 'Brochure'],
    status: 'pending'
  }
];

export const PropertiesOfInterest: React.FC = () => {
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
          <div key={property.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-3">
              <h4 className="font-semibold text-gray-900 text-lg">{property.name}</h4>
              <Edit3 className="w-4 h-4 text-gray-400 cursor-pointer hover:text-gray-600 transition-colors" />
            </div>
            
            <div className="flex items-center space-x-6 mb-3 text-sm text-gray-600">
              <div className="flex items-center space-x-1">
                <Square className="w-4 h-4" />
                <span>{property.size}</span>
              </div>
              <div className="flex items-center space-x-1">
                <span className="font-medium">{property.rent}</span>
              </div>
              <div className="flex items-center space-x-1">
                <Calendar className="w-4 h-4" />
                <span>{property.availability}</span>
              </div>
            </div>
            
            <p className="text-gray-700 text-sm mb-4 leading-relaxed">{property.description}</p>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                {property.features.map((feature, index) => (
                  <span
                    key={index}
                    className={`px-2 py-1 text-xs rounded-full ${
                      feature.includes('Tour') 
                        ? 'bg-blue-100 text-blue-700' 
                        : 'bg-green-100 text-green-700'
                    }`}
                  >
                    {feature}
                  </span>
                ))}
              </div>
              <div className="flex items-center space-x-2">
                <button className="px-3 py-1 text-xs bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors">
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
    </div>
  );
};