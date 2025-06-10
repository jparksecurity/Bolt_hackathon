import React, { useEffect, useState, useCallback } from 'react';
import { FileText, BarChart3, Image, FileSpreadsheet, File, Plus, ExternalLink, Edit3 } from 'lucide-react';
import { useUser } from '@clerk/clerk-react';
import { useSupabaseClient } from '../lib/supabase';

interface ProjectDocumentsProps {
  projectId: string;
}

interface Document {
  id: string;
  name: string;
  file_type: string;
  file_url?: string | null;
  created_at: string;
}

const getFileIcon = (fileType: string) => {
  switch (fileType.toLowerCase()) {
    case 'pdf': return { icon: FileText, color: 'text-red-500' };
    case 'xlsx': case 'xls': return { icon: BarChart3, color: 'text-green-500' };
    case 'zip': case 'rar': return { icon: Image, color: 'text-blue-500' };
    case 'docx': case 'doc': return { icon: File, color: 'text-purple-500' };
    default: return { icon: FileSpreadsheet, color: 'text-orange-500' };
  }
};

export const ProjectDocuments: React.FC<ProjectDocumentsProps> = ({ projectId }) => {
  const { user } = useUser();
  const supabase = useSupabaseClient();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchDocuments = useCallback(async () => {
    try {
      if (!user) return;

      const { data, error } = await supabase
        .from('project_documents')
        .select('*')
        .eq('project_id', projectId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setDocuments(data || []);
    } catch (err) {
      console.error('Error fetching documents:', err);
    } finally {
      setLoading(false);
    }
  }, [user, supabase, projectId]);

  useEffect(() => {
    if (user && projectId) {
      fetchDocuments();
    }
  }, [user, projectId, fetchDocuments]);

  if (loading) {
    return (
      <div className="bg-white p-6 border border-gray-200 rounded-lg">
        <div className="text-center text-gray-500">Loading documents...</div>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 border border-gray-200 rounded-lg">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Project Documents</h3>
        <Plus className="w-4 h-4 text-gray-400 cursor-pointer hover:text-gray-600 transition-colors" />
      </div>
      
      {documents.length === 0 ? (
        <div className="text-center py-12">
          <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h4 className="text-lg font-semibold text-gray-900 mb-2">No documents yet</h4>
          <p className="text-gray-600 mb-6">Upload documents related to this project</p>
          <button className="flex items-center space-x-2 px-4 py-2 bg-gray-900 text-white text-sm rounded-lg hover:bg-gray-800 transition-colors mx-auto">
            <Plus className="w-4 h-4" />
            <span>Upload First Document</span>
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {documents.map((doc) => {
            const { icon: IconComponent, color } = getFileIcon(doc.file_type);
            return (
              <div key={doc.id} className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors group">
                <div className="flex items-center space-x-3">
                  <IconComponent className={`w-5 h-5 ${color}`} />
                  <span className="text-sm text-gray-900">{doc.name}</span>
                </div>
                <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <ExternalLink className="w-4 h-4 text-gray-400 cursor-pointer hover:text-gray-600" />
                  <Edit3 className="w-4 h-4 text-gray-400 cursor-pointer hover:text-gray-600" />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};