import React, { useState } from 'react';
import { Check, Edit3 } from 'lucide-react';

const requirements = [
  { id: 1, text: '15,000 sq ft minimum', completed: true },
  { id: 2, text: 'Downtown location', completed: true },
  { id: 3, text: 'High-speed internet ready', completed: true },
  { id: 4, text: 'Flexible workspace design', completed: false },
  { id: 5, text: 'Public transport access', completed: true }
];

export const ClientRequirements: React.FC = () => {
  const [reqs, setReqs] = useState(requirements);

  const toggleRequirement = (id: number) => {
    setReqs(reqs.map(req => 
      req.id === id ? { ...req, completed: !req.completed } : req
    ));
  };

  return (
    <div className="bg-white p-6 border border-gray-200 rounded-lg">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Client Requirements</h3>
        <Edit3 className="w-4 h-4 text-gray-400 cursor-pointer hover:text-gray-600 transition-colors" />
      </div>
      
      <div className="space-y-3">
        {reqs.map((req) => (
          <div key={req.id} className="flex items-center space-x-3">
            <button
              onClick={() => toggleRequirement(req.id)}
              className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                req.completed 
                  ? 'bg-green-500 border-green-500 text-white' 
                  : 'border-gray-300 hover:border-gray-400'
              }`}
            >
              {req.completed && <Check className="w-3 h-3" />}
            </button>
            <span className={`text-sm ${req.completed ? 'text-gray-600 line-through' : 'text-gray-900'}`}>
              {req.text}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};