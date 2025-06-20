import React, { useState } from "react";
import {
  FileText,
  BarChart3,
  Image,
  FileSpreadsheet,
  File,
  Plus,
  ExternalLink,
  X,
  Trash2,
  Edit3,
  Save,
  Link,
  Globe,
} from "lucide-react";
import { useUser } from "@clerk/clerk-react";
import { useSupabaseClient } from "../../services/supabase";
import { DragDropList } from "./DragDropList";
import { useProjectData } from "../../hooks/useProjectData";
import { Database } from "../../types/database";
import { updateItemOrder } from "../../utils/updateOrder";
import { DateTime } from "luxon";

interface ProjectDocumentsProps {
  projectId?: string;
  shareId?: string;
  readonly?: boolean;
}

type Document = Database["public"]["Tables"]["project_documents"]["Row"];

const getFileIcon = (fileType: string, sourceType: string) => {
  // Show different icons based on source
  if (sourceType === "google_drive") {
    return { icon: Globe, color: "text-blue-500" };
  }
  if (sourceType === "onedrive") {
    return { icon: Globe, color: "text-blue-600" };
  }
  if (sourceType === "url") {
    return { icon: Link, color: "text-purple-500" };
  }

  // Default file type icons for uploads
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

const getSourceLabel = (sourceType: string) => {
  switch (sourceType) {
    case "google_drive":
      return "Google Drive";
    case "onedrive":
      return "OneDrive";
    case "url":
      return "External Link";
    case "upload":
    default:
      return "Uploaded";
  }
};

export const ProjectDocuments: React.FC<ProjectDocumentsProps> = ({
  projectId,
  shareId,
  readonly = false,
}) => {
  const { user } = useUser();
  const supabase = useSupabaseClient();

  // Use unified data hook for both public and authenticated modes
  const {
    data: documents,
    loading,
    refetch: fetchDocuments,
  } = useProjectData<Document>({
    projectId,
    shareId,
    dataType: "documents",
  });

  const [showAddModal, setShowAddModal] = useState(false);
  const [showRenameModal, setShowRenameModal] = useState(false);
  const [renamingDocument, setRenamingDocument] = useState<Document | null>(
    null,
  );
  const [newDocumentName, setNewDocumentName] = useState("");
  const [renaming, setRenaming] = useState(false);
  const [saving, setSaving] = useState(false);

  // Form state for adding documents
  const [documentForm, setDocumentForm] = useState({
    name: "",
    url: "",
    sourceType:
      "google_drive" as Database["public"]["Enums"]["document_source_type"],
  });

  const addDocumentByUrl = async () => {
    try {
      if (
        !user ||
        readonly ||
        !projectId ||
        !documentForm.name.trim() ||
        !documentForm.url.trim()
      ) {
        return;
      }

      setSaving(true);

      // Validate URL format
      try {
        new URL(documentForm.url);
      } catch {
        alert("Please enter a valid URL");
        return;
      }

      // Determine file type from URL or name
      const urlPath = new URL(documentForm.url).pathname;
      const extension =
        urlPath.split(".").pop()?.toLowerCase() ||
        documentForm.name.split(".").pop()?.toLowerCase() ||
        "unknown";

      // Save document metadata to database
      const { error: dbError } = await supabase
        .from("project_documents")
        .insert({
          project_id: projectId,
          name: documentForm.name.trim(),
          file_type: extension,
          document_url: documentForm.url.trim(),
          source_type: documentForm.sourceType,
          order_index: documents.length,
        });

      if (dbError) throw dbError;

      // Refresh documents list
      await fetchDocuments();
      setShowAddModal(false);
      setDocumentForm({ name: "", url: "", sourceType: "google_drive" });
    } catch (error) {
      console.error("Error adding document:", error);
      alert("Failed to add document. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const deleteDocument = async (doc: Document) => {
    if (
      readonly ||
      !confirm(`Are you sure you want to delete "${doc.name}"?`)
    ) {
      return;
    }

    try {
      if (!user) return;

      // Note: Storage deletion is no longer handled here
      // Documents are managed externally (Google Drive, OneDrive, URLs)

      // Delete from database
      const { error } = await supabase
        .from("project_documents")
        .delete()
        .eq("id", doc.id);

      if (error) throw error;

      // Refresh documents list
      await fetchDocuments();
    } catch (error) {
      console.error("Error deleting document:", error);
      alert("Failed to delete document. Please try again.");
    }
  };

  const renameDocument = async () => {
    if (!renamingDocument || !newDocumentName.trim() || readonly) return;

    setRenaming(true);
    try {
      const { error } = await supabase
        .from("project_documents")
        .update({ name: newDocumentName.trim() })
        .eq("id", renamingDocument.id);

      if (error) throw error;

      // Refresh documents list
      await fetchDocuments();
      setShowRenameModal(false);
      setRenamingDocument(null);
      setNewDocumentName("");
    } catch (error) {
      console.error("Error renaming document:", error);
      alert("Failed to rename document. Please try again.");
    } finally {
      setRenaming(false);
    }
  };

  const openRenameModal = (doc: Document) => {
    setRenamingDocument(doc);
    setNewDocumentName(doc.name);
    setShowRenameModal(true);
  };

  const closeRenameModal = () => {
    setShowRenameModal(false);
    setRenamingDocument(null);
    setNewDocumentName("");
  };

  const handleReorder = async (oldIndex: number, newIndex: number) => {
    if (readonly) return;

    try {
      await updateItemOrder(
        documents,
        oldIndex,
        newIndex,
        "project_documents",
        supabase,
      );
      await fetchDocuments();
    } catch (error) {
      console.error("Error reordering documents:", error);
      alert("Error reordering documents. Please try again.");
    }
  };

  const openDocument = async (doc: Document) => {
    try {
      if (doc.document_url) {
        // Open the document in a new tab
        window.open(doc.document_url, "_blank", "noopener,noreferrer");
      } else {
        alert("Document URL is not available.");
      }
    } catch (error) {
      console.error("Error opening document:", error);
      alert("Failed to open document. Please try again.");
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
        {!readonly && (
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center space-x-2 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg hover:bg-gray-800 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Connect Document</span>
          </button>
        )}
      </div>

      {documents.length === 0 ? (
        <div className="text-center py-12">
          <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h4 className="text-lg font-semibold text-gray-900 mb-2">
            No documents yet
          </h4>
          <p className="text-gray-600 mb-6">
            {readonly
              ? "No documents have been connected for this project"
              : "Connect documents from Google Drive, OneDrive, or add external links"}
          </p>
          {!readonly && (
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center space-x-2 px-4 py-2 bg-gray-900 text-white text-sm rounded-lg hover:bg-gray-800 transition-colors mx-auto"
            >
              <Plus className="w-4 h-4" />
              <span>Connect First Document</span>
            </button>
          )}
        </div>
      ) : readonly ? (
        // Static view for readonly mode
        <div className="space-y-3">
          {documents.map((doc) => {
            const { icon: IconComponent, color } = getFileIcon(
              doc.file_type,
              doc.source_type,
            );
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
                      {getSourceLabel(doc.source_type)} •{" "}
                      {doc.created_at
                        ? DateTime.fromISO(doc.created_at, { zone: "utc" })
                            .toLocal()
                            .toLocaleString(DateTime.DATE_SHORT)
                        : "No date"}
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => openDocument(doc)}
                    className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                    title="Open document"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        // Interactive view for authenticated mode
        <DragDropList items={documents} onReorder={handleReorder}>
          {(doc) => {
            const { icon: IconComponent, color } = getFileIcon(
              doc.file_type,
              doc.source_type,
            );
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
                      {getSourceLabel(doc.source_type)} •{" "}
                      {doc.created_at
                        ? DateTime.fromISO(doc.created_at, { zone: "utc" })
                            .toLocal()
                            .toLocaleString(DateTime.DATE_SHORT)
                        : "No date"}
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => openDocument(doc)}
                    className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                    title="Open document"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => openRenameModal(doc)}
                    className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                    title="Rename"
                  >
                    <Edit3 className="w-4 h-4" />
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
          }}
        </DragDropList>
      )}

      {/* Add Document Modal - only show if not readonly */}
      {showAddModal && !readonly && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96 max-w-90vw">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Connect Document
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-gray-400 hover:text-gray-600"
                disabled={saving}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Document Source
                </label>
                <select
                  value={documentForm.sourceType}
                  onChange={(e) =>
                    setDocumentForm({
                      ...documentForm,
                      sourceType: e.target
                        .value as Database["public"]["Enums"]["document_source_type"],
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500"
                  disabled={saving}
                >
                  <option value="google_drive">Google Drive</option>
                  <option value="onedrive">OneDrive</option>
                  <option value="url">External Link</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Document Name
                </label>
                <input
                  type="text"
                  value={documentForm.name}
                  onChange={(e) =>
                    setDocumentForm({ ...documentForm, name: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500"
                  placeholder="Enter document name"
                  disabled={saving}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Document URL
                </label>
                <input
                  type="url"
                  value={documentForm.url}
                  onChange={(e) =>
                    setDocumentForm({ ...documentForm, url: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500"
                  placeholder={
                    documentForm.sourceType === "google_drive"
                      ? "https://drive.google.com/file/d/..."
                      : documentForm.sourceType === "onedrive"
                        ? "https://1drv.ms/..."
                        : "https://example.com/document.pdf"
                  }
                  disabled={saving}
                  required
                />
              </div>

              <div className="text-xs text-gray-500">
                {documentForm.sourceType === "google_drive" && (
                  <p>
                    Make sure the Google Drive document is shared with "Anyone
                    with the link can view"
                  </p>
                )}
                {documentForm.sourceType === "onedrive" && (
                  <p>
                    Make sure the OneDrive document is shared with "Anyone with
                    the link can view"
                  </p>
                )}
                {documentForm.sourceType === "url" && (
                  <p>Enter any publicly accessible document URL</p>
                )}
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
                  disabled={saving}
                >
                  Cancel
                </button>
                <button
                  onClick={addDocumentByUrl}
                  disabled={
                    saving ||
                    !documentForm.name.trim() ||
                    !documentForm.url.trim()
                  }
                  className="flex items-center space-x-2 px-4 py-2 bg-gray-900 text-white rounded-md hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {saving ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Connecting...</span>
                    </>
                  ) : (
                    <>
                      <Link className="w-4 h-4" />
                      <span>Connect Document</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Rename Modal - only show if not readonly */}
      {showRenameModal && renamingDocument && !readonly && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="flex items-center justify-between p-6 border-b">
              <h3 className="text-lg font-semibold text-gray-900">
                Rename Document
              </h3>
              <button
                onClick={closeRenameModal}
                className="text-gray-400 hover:text-gray-600 transition-colors"
                disabled={renaming}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6">
              <div className="mb-4">
                <label
                  htmlFor="document-name"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Document Name
                </label>
                <input
                  id="document-name"
                  type="text"
                  value={newDocumentName}
                  onChange={(e) => setNewDocumentName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500"
                  placeholder="Enter document name"
                  disabled={renaming}
                />
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  onClick={closeRenameModal}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
                  disabled={renaming}
                >
                  Cancel
                </button>
                <button
                  onClick={renameDocument}
                  disabled={
                    renaming ||
                    !newDocumentName.trim() ||
                    newDocumentName.trim() === renamingDocument.name
                  }
                  className="flex items-center space-x-2 px-4 py-2 bg-gray-900 text-white rounded-md hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Save className="w-4 h-4" />
                  <span>{renaming ? "Renaming..." : "Rename"}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
