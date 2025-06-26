/**
 * Type definitions for AI-generated suggestions
 */

export interface UpdateSuggestion {
  id: string;
  entityType: "project" | "property" | "client_requirement";
  action: "update" | "insert";
  entityId: string | null; // required for update, null for insert
  entityName: string;
  values: { [columnName: string]: string | number | boolean | null }; // complete set of new values
  reasoning: string;
}

export interface SuggestionState {
  approved: Set<string>;
  rejected: Set<string>;
}

export interface DatabaseUpdateResult {
  success: boolean;
  processedCount: number;
  failedCount: number;
  errors: string[];
}
