import React from 'react';
import { FileText, BarChart3, Image, FileSpreadsheet, File, Plus, ExternalLink, Edit3 } from 'lucide-react';
import { ProjectDocument } from '../types/database';

interface DynamicProjectDocumentsProps {
  documents: ProjectDocument[];
}

const getFileIcon = (fileType: string) => {
    const type = fileType.toLowerCase();
    if (type.includes('pdf')) return { Icon: FileText, color: 'text-red-500' };
    if (type.includes('xls')) return { Icon: BarChart3, color: 'text-green-500' };
    if (type.includes('zip') || type.includes('rar')) return { Icon: Image, color: 'text-blue-500' };
    if (type.includes('doc')) return { Icon: File, color: 'text-purple-500' };
    if (type.includes('projection') || type.includes('financial')) return { Icon: FileSpreadsheet, color: 'text-orange-500' };
    return { Icon: File, color: 'text-gray-500' };
};

export const DynamicProjectDocuments: React.FC<DynamicProjectDocumentsProps> = ({ documents }) => {
  return (
    <div className="bg-white p-6 border border-gray-200 rounded-lg">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Project Documents</h3>
        <button className="flex items-center space-x-2 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg hover:bg-gray-800 transition-colors">
            <Plus className="w-4 h-4" />
            <span>Upload</span>
        </button>
      </div>
      
      <div className="space-y-3">
        {documents.length > 0 ? (
            documents.map((doc) => {
                const { Icon, color } = getFileIcon(doc.file_type);
                return (
                    <div key={doc.id} className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors group">
                        <div className="flex items-center space-x-3">
                        <Icon className={`w-5 h-5 ${color}`} />
                        <span className="text-sm text-gray-900">{doc.name}</span>
                        </div>
                        <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        {doc.file_url && (
                            <a href={doc.file_url} target="_blank" rel="noopener noreferrer" title="Open in new tab">
                                <ExternalLink className="w-4 h-4 text-gray-400 cursor-pointer hover:text-gray-600" />
                            </a>
                        )}
                        <Edit3 className="w-4 h-4 text-gray-400 cursor-pointer hover:text-gray-600" />
                        </div>
                    </div>
                );
            })
        ) : (
            <p className="text-gray-500">No documents have been uploaded for this project.</p>
        )}
      </div>
    </div>
  );
}; 