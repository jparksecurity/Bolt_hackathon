import { useState } from "react";
import { useUser } from "@clerk/clerk-react";
import { DashboardLayout } from "../components/layout/DashboardLayout";
import toast from "react-hot-toast";
import {
  Bot,
  Send,
  CheckCircle,
  XCircle,
  Building,
  FileText,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { useAIProcessing } from "../hooks/useAIProcessing";
import { useSuggestionState } from "../hooks/useSuggestionState";
import { useDatabaseUpdate } from "../hooks/useDatabaseUpdate";
import { getFieldLabel } from "../utils/suggestionValidation";

export function AutomatedUpdatePage() {
  const { isLoaded } = useUser();
  const [inputText, setInputText] = useState("");

  // Use custom hooks for cleaner state management
  const {
    suggestions,
    processing,
    error,
    showSuggestions,
    processWithAI,
    clearSuggestions,
    clearError,
  } = useAIProcessing();

  const {
    approved: approvedSuggestions,
    rejected: rejectedSuggestions,
    approveSuggestion,
    rejectSuggestion,
    clearSuggestionState,
    getApprovedSuggestions,
  } = useSuggestionState();

  const { applying, updateResult, applyUpdates, clearUpdateResult } =
    useDatabaseUpdate();

  const handleProcessWithAI = async () => {
    if (!inputText.trim()) {
      toast.error("Please provide some information to process.");
      return;
    }

    clearError();
    clearSuggestionState();
    clearUpdateResult();

    await processWithAI(inputText);
  };

  const handleApplyUpdates = async () => {
    const approvedSuggestionsList = getApprovedSuggestions(suggestions);

    if (approvedSuggestionsList.length === 0) {
      toast.error("No suggestions approved for application.");
      return;
    }

    const result = await applyUpdates(approvedSuggestionsList);

    if (result.success) {
      if (result.processedCount > 0) {
        toast.success(
          `Successfully applied ${result.processedCount} update${result.processedCount > 1 ? "s" : ""}!`,
          { duration: 4000 },
        );
        // Clear successful suggestions and reset state
        clearSuggestions();
        clearSuggestionState();
        setInputText("");
      }
    } else {
      toast.error(
        `Failed to apply updates. ${result.processedCount} succeeded, ${result.failedCount} failed.`,
        { duration: 6000 },
      );

      // Show detailed errors if any
      if (result.errors.length > 0) {
        console.error("Update errors:", result.errors);
      }
    }
  };

  const toggleSuggestion = (suggestionId: string, approve: boolean) => {
    if (approve) {
      approveSuggestion(suggestionId);
    } else {
      rejectSuggestion(suggestionId);
    }
  };

  const getActionIcon = (action: string) => {
    switch (action) {
      case "update":
        return <FileText className="w-4 h-4" />;
      case "insert":
        return <Building className="w-4 h-4" />;
      default:
        return <FileText className="w-4 h-4" />;
    }
  };

  const getEntityTypeLabel = (entityType: string) => {
    switch (entityType) {
      case "project":
        return "Project";
      case "property":
        return "Property";
      case "client_requirement":
        return "Client Requirement";
      default:
        return entityType;
    }
  };

  if (!isLoaded) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto">
        {/* Introduction Card */}
        <div className="dashboard-card p-8">
          <div className="flex items-center space-x-4 mb-6">
            <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center">
              <Bot className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                AI-Powered Data Updates
              </h2>
              <p className="text-gray-600">
                Automatically extract and update existing project information
                using AI
              </p>
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <div className="flex items-start space-x-3">
              <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
              <div>
                <h3 className="font-semibold text-blue-900 mb-1">
                  How it works:
                </h3>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>
                    1. Paste any relevant information (emails, documents, notes)
                  </li>
                  <li>2. Optionally add instructions on what to extract</li>
                  <li>3. Click "Process with AI" and wait for analysis</li>
                  <li>
                    4. Review AI-generated update suggestions for existing
                    records
                  </li>
                  <li>5. Approve or reject each suggested update</li>
                  <li>6. Apply approved updates to your existing projects</li>
                </ul>
              </div>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <div className="flex items-center space-x-2">
                <XCircle className="w-5 h-5 text-red-600" />
                <span className="text-red-800">{error}</span>
              </div>
            </div>
          )}

          {updateResult && !updateResult.success && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
              <div className="flex items-start space-x-2">
                <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-yellow-800">
                    Update Results:
                  </h4>
                  <p className="text-yellow-800 text-sm">
                    {updateResult.processedCount} succeeded,{" "}
                    {updateResult.failedCount} failed
                  </p>
                  {updateResult.errors.length > 0 && (
                    <details className="mt-2">
                      <summary className="text-yellow-800 text-sm cursor-pointer">
                        View error details
                      </summary>
                      <ul className="mt-1 text-xs text-yellow-700 space-y-1">
                        {updateResult.errors.map((error, index) => (
                          <li key={index}>• {error}</li>
                        ))}
                      </ul>
                    </details>
                  )}
                </div>
              </div>
            </div>
          )}

          {!showSuggestions ? (
            <div className="space-y-6">
              {/* Single Text Input */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Information & Instructions
                </label>
                <textarea
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder="Paste emails, documents, notes, or any relevant information here. You can also include instructions like 'Extract move-in dates and square footage' at the beginning..."
                  rows={12}
                  className="form-input w-full px-4 py-3 rounded-lg"
                />
                <p className="text-xs text-gray-500 mt-2">
                  Example: "Extract move-in dates, square footage, and rental
                  costs. The client wants to move in by March 2024 and needs
                  15,000 sq ft at $25/sq ft..."
                </p>
              </div>

              {/* Process Button */}
              <div className="flex justify-end">
                <button
                  onClick={handleProcessWithAI}
                  disabled={processing || !inputText.trim()}
                  className="btn-primary flex items-center space-x-2 px-6 py-3 disabled:opacity-50"
                >
                  {processing ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>Processing with AI...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-5 h-5" />
                      <span>Process with AI</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Suggestions Header */}
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    AI Suggestions ({suggestions.length})
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">
                    Review and approve suggestions to apply them to your data
                  </p>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="text-sm text-gray-600">
                    <span className="text-green-600 font-medium">
                      {approvedSuggestions.size} approved
                    </span>
                    {" • "}
                    <span className="text-red-600 font-medium">
                      {rejectedSuggestions.size} rejected
                    </span>
                  </div>
                  <button
                    onClick={clearSuggestions}
                    className="text-sm text-gray-500 hover:text-gray-700"
                  >
                    ← Back to Input
                  </button>
                </div>
              </div>

              {/* Suggestions List */}
              <div className="space-y-4">
                {suggestions.map((suggestion) => {
                  const isApproved = approvedSuggestions.has(suggestion.id);
                  const isRejected = rejectedSuggestions.has(suggestion.id);

                  return (
                    <div
                      key={suggestion.id}
                      className={`border rounded-lg p-4 ${
                        isApproved
                          ? "border-green-200 bg-green-50"
                          : isRejected
                            ? "border-red-200 bg-red-50"
                            : "border-gray-200 bg-white"
                      }`}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center space-x-3">
                          <div
                            className={`p-2 rounded-lg ${
                              suggestion.action === "update"
                                ? "bg-blue-100 text-blue-600"
                                : "bg-green-100 text-green-600"
                            }`}
                          >
                            {getActionIcon(suggestion.action)}
                          </div>
                          <div>
                            <h4 className="font-medium text-gray-900">
                              {suggestion.action === "update"
                                ? "Update"
                                : "Create"}{" "}
                              {getEntityTypeLabel(suggestion.entityType)}
                            </h4>
                            <p className="text-sm text-gray-600">
                              {suggestion.entityName}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() =>
                              toggleSuggestion(suggestion.id, false)
                            }
                            className={`p-2 rounded-lg transition-colors ${
                              isRejected
                                ? "bg-red-100 text-red-600"
                                : "bg-gray-100 text-gray-400 hover:bg-red-100 hover:text-red-600"
                            }`}
                            title="Reject"
                          >
                            <XCircle className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() =>
                              toggleSuggestion(suggestion.id, true)
                            }
                            className={`p-2 rounded-lg transition-colors ${
                              isApproved
                                ? "bg-green-100 text-green-600"
                                : "bg-gray-100 text-gray-400 hover:bg-green-100 hover:text-green-600"
                            }`}
                            title="Approve"
                          >
                            <CheckCircle className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      {/* Values */}
                      <div className="space-y-2 mb-3">
                        {Object.entries(suggestion.values).map(
                          ([field, value]) => (
                            <div
                              key={field}
                              className="flex justify-between text-sm"
                            >
                              <span className="font-medium text-gray-700">
                                {getFieldLabel(field)}:
                              </span>
                              <span className="text-gray-600">
                                {value?.toString() || "null"}
                              </span>
                            </div>
                          ),
                        )}
                      </div>

                      {/* Reasoning */}
                      <div className="bg-gray-50 rounded p-3 text-sm text-gray-700">
                        <strong>AI Reasoning:</strong> {suggestion.reasoning}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Action Buttons */}
              <div className="flex justify-between items-center pt-4 border-t">
                <div className="text-sm text-gray-600">
                  {approvedSuggestions.size > 0 && (
                    <span>
                      Ready to apply {approvedSuggestions.size} approved
                      suggestion
                      {approvedSuggestions.size > 1 ? "s" : ""}
                    </span>
                  )}
                </div>
                <button
                  onClick={handleApplyUpdates}
                  disabled={applying || approvedSuggestions.size === 0}
                  className="btn-primary flex items-center space-x-2 px-6 py-3 disabled:opacity-50"
                >
                  {applying ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>Applying Updates...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-5 h-5" />
                      <span>Apply Updates ({approvedSuggestions.size})</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
