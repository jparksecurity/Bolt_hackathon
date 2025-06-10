import React, { useState, useEffect, useCallback } from "react";
import {
  FileText,
  BarChart3,
  Image,
  FileSpreadsheet,
  File,
  Plus,
  ExternalLink,
  Upload,
  X,
  Trash2,
} from "lucide-react";
import { useUser } from "@clerk/clerk-react";
import { useSupabaseClient } from "../lib/supabase";

interface ProjectDocumentsProps {
  projectId: string;
}

interface Document {
  id: string;
  name: string;
  file_type: string;
  storage_path: string;
  created_at: string;
}

const getFileIcon = (fileType: string) => {
  switch (fileType.toLowerCase()) {
    case "pdf":
      return { icon: FileText, color: "text-red-500" };
    case "xlsx":
    case "xls":
      return { icon: BarChart3, color: "text-green-500" };
    case "zip":
    case "rar":
      return { icon: Image, color: "text-blue-500" };
    case "docx":
    case "doc":
      return { icon: File, color: "text-purple-500" };
    case "png":
    case "jpg":
    case "jpeg":
    case "gif":
      return { icon: Image, color: "text-blue-500" };
    default:
      return { icon: FileSpreadsheet, color: "text-orange-500" };
  }
};

export const ProjectDocuments: React.FC<ProjectDocumentsProps> = ({
  projectId,
}) => {
  const { user } = useUser();
  const supabase = useSupabaseClient();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const fetchDocuments = useCallback(async () => {
    try {
      if (!user) return;

      const { data, error } = await supabase
        .from("project_documents")
        .select("id, name, file_type, storage_path, created_at")
        .eq("project_id", projectId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setDocuments(data || []);
    } catch (err) {
      console.error("Error fetching documents:", err);
    } finally {
      setLoading(false);
    }
  }, [user, supabase, projectId]);

  useEffect(() => {
    if (user && projectId) {
      fetchDocuments();
    }
  }, [user, projectId, fetchDocuments]);

  const uploadFile = async (file: File) => {
    try {
      if (!user) throw new Error("User not authenticated");

      setUploading(true);
      setUploadProgress(0);

      // Create unique filename
      const fileExt = file.name.split(".").pop();
      const fileName = `${Date.now()}-${file.name}`;
      const filePath = `${user.id}/${projectId}/${fileName}`;

      // Upload file to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from("project-documents")
        .upload(filePath, file, {
          cacheControl: "3600",
          upsert: false,
        });

      if (uploadError) throw uploadError;

      // Get public URL
      // Save document metadata to database
      const { error: dbError } = await supabase
        .from("project_documents")
        .insert({
          project_id: projectId,
          name: file.name,
          file_type: fileExt || "unknown",
          storage_path: filePath,
        });

      if (dbError) throw dbError;

      // Refresh documents list
      await fetchDocuments();
      setShowUploadModal(false);
    } catch (err) {
      console.error("Error uploading file:", err);
      alert("Failed to upload file. Please try again.");
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const deleteDocument = async (doc: Document) => {
    try {
      if (!user) return;

      // Delete from storage using the correct path
      if (doc.storage_path) {
        const { error: storageError } = await supabase.storage
          .from("project-documents")
          .remove([doc.storage_path]);

        if (storageError) {
          console.error("Storage deletion error:", storageError);
        }
      }

      // Delete from database
      const { error } = await supabase
        .from("project_documents")
        .delete()
        .eq("id", doc.id);

      if (error) throw error;

      // Refresh documents list
      await fetchDocuments();
    } catch (err) {
      console.error("Error deleting document:", err);
      alert("Failed to delete document. Please try again.");
    }
  };

  const downloadDocument = async (doc: Document) => {
    try {
      if (!doc.storage_path) return;

      // Get a signed URL for downloading
      const { data, error } = await supabase.storage
        .from("project-documents")
        .createSignedUrl(doc.storage_path, 60); // 60 seconds expiry

      if (error) {
        console.error("Error creating signed URL:", error);
        alert("Failed to download document. Please try again.");
        return;
      }

      if (data?.signedUrl) {
        // Create a temporary link to trigger download
        const link = document.createElement("a");
        link.href = data.signedUrl;
        link.download = doc.name;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    } catch (err) {
      console.error("Error downloading document:", err);
      alert("Failed to download document. Please try again.");
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      uploadFile(file);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      uploadFile(file);
    }
  };

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
        <h3 className="text-lg font-semibold text-gray-900">
          Project Documents
        </h3>
        <button
          onClick={() => setShowUploadModal(true)}
          className="flex items-center space-x-2 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg hover:bg-gray-800 transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Upload Document</span>
        </button>
      </div>

      {documents.length === 0 ? (
        <div className="text-center py-12">
          <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h4 className="text-lg font-semibold text-gray-900 mb-2">
            No documents yet
          </h4>
          <p className="text-gray-600 mb-6">
            Upload documents related to this project
          </p>
          <button
            onClick={() => setShowUploadModal(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-gray-900 text-white text-sm rounded-lg hover:bg-gray-800 transition-colors mx-auto"
          >
            <Plus className="w-4 h-4" />
            <span>Upload First Document</span>
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {documents.map((doc) => {
            const { icon: IconComponent, color } = getFileIcon(doc.file_type);
            return (
              <div
                key={doc.id}
                className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors group"
              >
                <div className="flex items-center space-x-3">
                  <IconComponent className={`w-5 h-5 ${color}`} />
                  <div>
                    <span className="text-sm text-gray-900 font-medium">
                      {doc.name}
                    </span>
                    <div className="text-xs text-gray-500">
                      {doc.file_type.toUpperCase()} •{" "}
                      {new Date(doc.created_at).toLocaleDateString()}
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => downloadDocument(doc)}
                    className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                    title="Download"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => deleteDocument(doc)}
                    className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96 max-w-90vw">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Upload Document
              </h3>
              <button
                onClick={() => setShowUploadModal(false)}
                className="text-gray-400 hover:text-gray-600"
                disabled={uploading}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {uploading ? (
              <div className="text-center py-8">
                <Upload className="w-8 h-8 text-blue-600 mx-auto mb-4 animate-bounce" />
                <p className="text-gray-600 mb-4">Uploading document...</p>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
              </div>
            ) : (
              <div
                className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                  dragActive ? "border-blue-400 bg-blue-50" : "border-gray-300"
                }`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
              >
                <Upload className="w-8 h-8 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 mb-4">
                  Drag and drop a file here, or click to select
                </p>
                <input
                  type="file"
                  onChange={handleFileSelect}
                  className="hidden"
                  id="file-upload"
                  accept=".pdf,.doc,.docx,.xls,.xlsx,.zip,.png,.jpg,.jpeg,.gif,.txt"
                />
                <label
                  htmlFor="file-upload"
                  className="inline-flex items-center px-4 py-2 bg-gray-900 text-white text-sm rounded-lg hover:bg-gray-800 transition-colors cursor-pointer"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Select File
                </label>
                <p className="text-xs text-gray-500 mt-2">
                  Supported: PDF, DOC, DOCX, XLS, XLSX, ZIP, Images, TXT (Max
                  50MB)
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
