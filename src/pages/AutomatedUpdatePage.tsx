import { useState } from "react";
import { useUser } from "@clerk/clerk-react";
import { useSupabaseClient } from "../services/supabase";
import { DashboardLayout } from "../components/layout/DashboardLayout";
import { nowISO } from "../utils/dateUtils";
import {
  Bot,
  Send,
  CheckCircle,
  XCircle,
  Calendar,
  Building,
  User,
  DollarSign,
  MapPin,
  FileText,
  Loader2,
  AlertCircle,
} from "lucide-react";
import {
  PROPERTY_STATUSES,
  PROPERTY_CURRENT_STATES,
  TOUR_STATUSES,
} from "../utils/validation";

interface UpdateSuggestion {
  id: string;
  type: "project" | "property" | "client_requirement";
  entityId: string;
  entityName: string;
  field: string;
  currentValue: string | null;
  suggestedValue: string;
  reasoning: string;
}

export function AutomatedUpdatePage() {
  const { isLoaded } = useUser();
  const supabase = useSupabaseClient();
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form state - simplified to single text input
  const [inputText, setInputText] = useState("");
  const [suggestions, setSuggestions] = useState<UpdateSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [approvedSuggestions, setApprovedSuggestions] = useState<Set<string>>(
    new Set(),
  );
  const [rejectedSuggestions, setRejectedSuggestions] = useState<Set<string>>(
    new Set(),
  );

  const processWithAI = async () => {
    if (!inputText.trim()) {
      alert("Please provide some information to process.");
      return;
    }

    setProcessing(true);
    setError(null);

    try {
      // Call the Supabase project-intelligence function
      const { data, error } = await supabase.functions.invoke(
        "project-intelligence",
        {
          body: {
            inputText,
          },
        },
      );

      if (error) {
        throw new Error(error.message || "Failed to process with AI");
      }

      if (data?.suggestions) {
        // Ensure each suggestion has a **unique** id so that React keys are not duplicated and
        // approving/rejecting one suggestion does not mutate the state of another suggestion
        // that happened to share the same id coming from the API.
        const uniqueSuggestions: UpdateSuggestion[] = data.suggestions.map(
          (s: UpdateSuggestion, idx: number) => ({
            // Preserve all original fields but guarantee a unique id per entry.
            ...s,
            id: s.id ? `${s.id}-${idx}` : `suggestion-${idx}`,
          }),
        );

        setSuggestions(uniqueSuggestions);
        setShowSuggestions(true);
        setApprovedSuggestions(new Set());
        setRejectedSuggestions(new Set());
      } else {
        throw new Error("No suggestions received from AI");
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to process with AI. Please try again.",
      );
    } finally {
      setProcessing(false);
    }
  };

  const toggleSuggestion = (suggestionId: string, approve: boolean) => {
    if (approve) {
      setApprovedSuggestions((prev) => new Set([...prev, suggestionId]));
      setRejectedSuggestions((prev) => {
        const newSet = new Set(prev);
        newSet.delete(suggestionId);
        return newSet;
      });
    } else {
      setRejectedSuggestions((prev) => new Set([...prev, suggestionId]));
      setApprovedSuggestions((prev) => {
        const newSet = new Set(prev);
        newSet.delete(suggestionId);
        return newSet;
      });
    }
  };

  const applyApprovedSuggestions = async () => {
    const approvedSuggestionsList = suggestions.filter((s) =>
      approvedSuggestions.has(s.id),
    );

    if (approvedSuggestionsList.length === 0) {
      alert("No suggestions approved for application.");
      return;
    }

    setProcessing(true);
    try {
      // Helper function to coerce values to appropriate types with validation
      const coerceValue = (
        value: string,
        field: string,
      ): string | number | null => {
        // Numeric fields that should be converted to numbers
        const numericFields = [
          "expected_fee",
          "broker_commission",
          "monthly_cost",
          "expected_monthly_cost",
          "price_per_sf",
          "people_capacity",
          "expected_headcount",
          "order_index",
        ];

        if (numericFields.includes(field)) {
          const numValue = parseFloat(value);
          return isNaN(numValue) ? null : numValue;
        }

        // Validate constrained fields
        if (field === "status") {
          return PROPERTY_STATUSES.includes(
            value.toLowerCase() as (typeof PROPERTY_STATUSES)[number],
          )
            ? value.toLowerCase()
            : "new";
        }

        if (field === "current_state") {
          return PROPERTY_CURRENT_STATES.includes(
            value as (typeof PROPERTY_CURRENT_STATES)[number],
          )
            ? value
            : null;
        }

        if (field === "tour_status") {
          return TOUR_STATUSES.includes(value as (typeof TOUR_STATUSES)[number])
            ? value
            : null;
        }

        return value || null;
      };

      // Process all suggestions in parallel with error tracking
      const updatePromises = approvedSuggestionsList.map(async (suggestion) => {
        try {
          const updateData: Record<string, string | number | null> = {
            [suggestion.field]: coerceValue(
              suggestion.suggestedValue,
              suggestion.field,
            ),
            updated_at: nowISO(),
          };

          // Determine table name and update data based on suggestion type
          let tableName: "projects" | "properties" | "client_requirements";
          if (suggestion.type === "project") {
            tableName = "projects";
          } else if (suggestion.type === "property") {
            tableName = "properties";
          } else {
            tableName = "client_requirements";
            // Client requirements don't need updated_at
            delete updateData.updated_at;
          }

          const { error } = await supabase
            .from(tableName)
            .update(updateData)
            .eq("id", suggestion.entityId);

          if (error) {
            throw new Error(
              `Failed to update ${suggestion.type} "${suggestion.entityName}": ${error.message}`,
            );
          }

          return {
            success: true,
            name: `${suggestion.entityName} (${suggestion.field})`,
            suggestion,
          };
        } catch (error) {
          const errorMessage =
            error instanceof Error ? error.message : "Unknown error occurred";
          console.error(
            `Error processing suggestion for ${suggestion.entityName}:`,
            error,
          );
          return {
            success: false,
            error: errorMessage,
            suggestion,
          };
        }
      });

      // Wait for all updates to complete
      const results = await Promise.all(updatePromises);

      // Separate successful and failed results
      const successful = results
        .filter((result) => result.success)
        .map((result) => result.name as string);

      const failed = results
        .filter((result) => !result.success)
        .map((result) => ({
          suggestion: result.suggestion,
          error: result.error as string,
        }));

      // Provide success/error feedback
      if (failed.length === 0) {
        alert(`Successfully updated ${successful.length} fields.`);
      } else {
        if (successful.length > 0) {
          alert(
            `Partially successful: ${successful.length} updates applied, ${failed.length} failed. Check console for details.`,
          );
        } else {
          alert(
            `All ${failed.length} updates failed. Check console for details.`,
          );
        }

        // Log detailed error information
        console.error("Failed suggestions:", failed);
      }

      setShowSuggestions(false);
      setSuggestions([]);
      setInputText("");
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error occurred";
      setError(`Failed to apply updates: ${errorMessage}`);
      console.error("Error applying suggestions:", error);
    } finally {
      setProcessing(false);
    }
  };

  const getFieldIcon = (field: string) => {
    switch (field) {
      case "desired_move_in_date":
      case "start_date":
        return Calendar;
      case "company_name":
        return Building;
      case "contact_name":
        return User;
      case "broker_commission":
      case "expected_fee":
      case "monthly_cost":
      case "expected_monthly_cost":
        return DollarSign;
      case "sf":
      case "address":
        return MapPin;
      case "category":
      case "requirement_text":
        return FileText;
      default:
        return FileText;
    }
  };

  const getFieldLabel = (field: string) => {
    // Gracefully handle null/undefined field values
    if (!field) return "Field";

    const labels: Record<string, string> = {
      desired_move_in_date: "Desired Move-in Date",
      start_date: "Start Date",
      company_name: "Company Name",
      contact_name: "Contact Name",
      broker_commission: "Broker Commission",
      expected_fee: "Expected Fee",
      monthly_cost: "Monthly Cost",
      expected_monthly_cost: "Expected Monthly Cost",
      sf: "Square Feet",
      address: "Address",
      category: "Category",
      requirement_text: "Requirement Text",
    };
    return (
      labels[field] ||
      field.replace("_", " ").replace(/\b\w/g, (l) => l.toUpperCase())
    );
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
                  onClick={processWithAI}
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
                <h3 className="text-lg font-semibold text-gray-900">
                  AI Suggestions ({suggestions.length})
                </h3>
                <div className="flex items-center space-x-4">
                  <span className="text-sm text-gray-600">
                    {approvedSuggestions.size} approved,{" "}
                    {rejectedSuggestions.size} rejected
                  </span>
                  <button
                    onClick={() => {
                      setShowSuggestions(false);
                      setSuggestions([]);
                      setApprovedSuggestions(new Set());
                      setRejectedSuggestions(new Set());
                    }}
                    className="btn-secondary px-4 py-2"
                  >
                    Start Over
                  </button>
                </div>
              </div>

              {/* Suggestions List */}
              <div className="space-y-4">
                {suggestions.map((suggestion) => {
                  const IconComponent = getFieldIcon(suggestion.field);
                  const isApproved = approvedSuggestions.has(suggestion.id);
                  const isRejected = rejectedSuggestions.has(suggestion.id);

                  return (
                    <div
                      key={suggestion.id}
                      className={`border rounded-lg p-4 transition-all ${
                        isApproved
                          ? "border-green-300 bg-green-50"
                          : isRejected
                            ? "border-red-300 bg-red-50"
                            : "border-gray-200 bg-white"
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <IconComponent className="w-5 h-5 text-gray-600" />
                            <div>
                              <h4 className="font-semibold text-gray-900">
                                {suggestion.entityName} -{" "}
                                {getFieldLabel(suggestion.field)}
                              </h4>
                              <div className="flex items-center space-x-2 text-sm text-gray-600">
                                <span className="capitalize">
                                  {suggestion.type}
                                </span>
                                <span>•</span>
                                <span>Update</span>
                              </div>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-4 mb-3">
                            <div>
                              <p className="text-xs font-medium text-gray-500 mb-1">
                                Current Value
                              </p>
                              <p className="text-sm text-gray-900 overflow-x-auto">
                                {(() => {
                                  if (
                                    suggestion.currentValue === null ||
                                    suggestion.currentValue === undefined ||
                                    suggestion.currentValue === ""
                                  ) {
                                    return (
                                      <em className="text-gray-400">Not set</em>
                                    );
                                  }

                                  return typeof suggestion.currentValue ===
                                    "object"
                                    ? JSON.stringify(suggestion.currentValue)
                                    : String(suggestion.currentValue);
                                })()}
                              </p>
                            </div>
                            <div>
                              <p className="text-xs font-medium text-gray-500 mb-1">
                                Suggested Value
                              </p>
                              <p className="text-sm font-semibold text-gray-900 overflow-x-auto">
                                {typeof suggestion.suggestedValue === "object"
                                  ? JSON.stringify(suggestion.suggestedValue)
                                  : String(suggestion.suggestedValue)}
                              </p>
                            </div>
                          </div>

                          <p className="text-sm text-gray-600 bg-gray-50 rounded p-2">
                            <strong>Reasoning:</strong> {suggestion.reasoning}
                          </p>
                        </div>

                        <div className="flex items-center space-x-2 ml-4">
                          <button
                            onClick={() =>
                              toggleSuggestion(suggestion.id, false)
                            }
                            className={`p-2 rounded-lg transition-colors ${
                              isRejected
                                ? "bg-red-600 text-white"
                                : "bg-gray-100 text-gray-600 hover:bg-red-100 hover:text-red-600"
                            }`}
                            title="Reject"
                          >
                            <XCircle className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() =>
                              toggleSuggestion(suggestion.id, true)
                            }
                            className={`p-2 rounded-lg transition-colors ${
                              isApproved
                                ? "bg-green-600 text-white"
                                : "bg-gray-100 text-gray-600 hover:bg-green-100 hover:text-green-600"
                            }`}
                            title="Approve"
                          >
                            <CheckCircle className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Apply Button */}
              {approvedSuggestions.size > 0 && (
                <div className="flex justify-end pt-4 border-t border-gray-200">
                  <button
                    onClick={applyApprovedSuggestions}
                    disabled={processing}
                    className="btn-primary flex items-center space-x-2 px-6 py-3"
                  >
                    {processing ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        <span>Applying Updates...</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle className="w-5 h-5" />
                        <span>
                          Apply {approvedSuggestions.size} Approved Updates
                        </span>
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
