import React from 'react';
import { FileText, BarChart3, Image, FileSpreadsheet, File, Plus, ExternalLink, Edit3 } from 'lucide-react';

const documents = [
  { id: 1, name: 'Client Requirements.pdf', type: 'pdf', icon: FileText, color: 'text-red-500' },
  { id: 2, name: 'Market Analysis.xlsx', type: 'xlsx', icon: BarChart3, color: 'text-green-500' },
  { id: 3, name: 'Property Photos.zip', type: 'zip', icon: Image, color: 'text-blue-500' },
  { id: 4, name: 'Lease Template.docx', type: 'docx', icon: File, color: 'text-purple-500' },
  { id: 5, name: 'Financial Projections.pdf', type: 'pdf', icon: FileSpreadsheet, color: 'text-orange-500' }
];

export const ProjectDocuments: React.FC = () => {
  return (
    <div className="bg-white p-6 border border-gray-200 rounded-lg">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Project Documents</h3>
        <Plus className="w-4 h-4 text-gray-400 cursor-pointer hover:text-gray-600 transition-colors" />
      </div>
      
      <div className="space-y-3">
        {documents.map((doc) => (
          <div key={doc.id} className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors group">
            <div className="flex items-center space-x-3">
              <doc.icon className={`w-5 h-5 ${doc.color}`} />
              <span className="text-sm text-gray-900">{doc.name}</span>
            </div>
            <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <ExternalLink className="w-4 h-4 text-gray-400 cursor-pointer hover:text-gray-600" />
              <Edit3 className="w-4 h-4 text-gray-400 cursor-pointer hover:text-gray-600" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};