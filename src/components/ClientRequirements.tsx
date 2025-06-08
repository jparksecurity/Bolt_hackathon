import React from 'react';
import { Edit3, MapPin, Building, FileText } from 'lucide-react';

const requirementCategories = [
  {
    id: 1,
    title: 'Space Requirements',
    icon: Building,
    items: [
      '15,000 sq ft minimum',
      'Open floor plan capability',
      'Private meeting rooms (4-6)',
      'Reception area'
    ]
  },
  {
    id: 2,
    title: 'Location',
    icon: MapPin,
    items: [
      'Downtown core preferred',
      'Public transport access',
      'Walking distance to restaurants',
      'Parking availability'
    ]
  },
  {
    id: 3,
    title: 'Other',
    icon: FileText,
    items: [
      'Move-in ready by March 2024',
      'Pet-friendly building preferred',
      'Natural light priority',
      'Flexible lease terms (3-5 years)'
    ]
  }
];

export const ClientRequirements: React.FC = () => {
  return (
    <div className="bg-white p-6 border border-gray-200 rounded-lg">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Client Requirements</h3>
        <Edit3 className="w-4 h-4 text-gray-400 cursor-pointer hover:text-gray-600 transition-colors" />
      </div>
      
      <div className="space-y-6">
        {requirementCategories.map((category) => (
          <div key={category.id}>
            <div className="flex items-center space-x-2 mb-3">
              <category.icon className="w-4 h-4 text-blue-600" />
              <h4 className="font-medium text-gray-900 text-sm">{category.title}</h4>
            </div>
            <div className="space-y-2 ml-6">
              {category.items.map((item, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <div className="w-1.5 h-1.5 bg-gray-400 rounded-full" />
                  <span className="text-sm text-gray-700">{item}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};