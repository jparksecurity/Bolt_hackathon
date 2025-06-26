import { SupabaseClient } from "@supabase/supabase-js";
import { Database } from "../types/database";
import type {
  UpdateSuggestion,
  DatabaseUpdateResult,
} from "../types/aiSuggestions";
import { parseFieldValue } from "../utils/suggestionValidation";
import {
  validateSuggestionWithProjectAccess,
  applyDefaultValues,
} from "../utils/entityValidation";
import { ProjectValidationService } from "./projectValidationService";
import { keyBeforeAll } from "../utils/orderKey";
import { nowISO } from "../utils/dateUtils";

/**
 * Service for handling database update operations
 * Centralizes all Supabase operations for applying AI suggestions
 */
export class DatabaseUpdateService {
  private projectValidationService: ProjectValidationService;

  constructor(private supabase: SupabaseClient<Database>) {
    this.projectValidationService = new ProjectValidationService(supabase);
  }

  /**
   * Apply approved suggestions to the database
   * Handles both updates and inserts across all entity types
   */
  async applyApprovedSuggestions(
    suggestions: UpdateSuggestion[],
  ): Promise<DatabaseUpdateResult> {
    if (suggestions.length === 0) {
      return {
        success: true,
        processedCount: 0,
        failedCount: 0,
        errors: [],
      };
    }

    let processedCount = 0;
    let failedCount = 0;
    const errors: string[] = [];

    // Group suggestions by entity type and action for more efficient processing
    const groupedSuggestions =
      this.groupSuggestionsByTypeAndAction(suggestions);

    try {
      // Process each group
      for (const [entityType, actionGroups] of groupedSuggestions.entries()) {
        for (const [action, suggestionGroup] of actionGroups.entries()) {
          const result = await this.processSuggestionGroup(
            entityType,
            action,
            suggestionGroup,
          );
          processedCount += result.processedCount;
          failedCount += result.failedCount;
          errors.push(...result.errors);
        }
      }

      return {
        success: failedCount === 0,
        processedCount,
        failedCount,
        errors,
      };
    } catch (error) {
      return {
        success: false,
        processedCount,
        failedCount: suggestions.length - processedCount,
        errors: [
          error instanceof Error ? error.message : "Unexpected error occurred",
        ],
      };
    }
  }

  /**
   * Group suggestions by entity type and action for batch processing
   */
  private groupSuggestionsByTypeAndAction(suggestions: UpdateSuggestion[]) {
    const grouped = new Map<string, Map<string, UpdateSuggestion[]>>();

    for (const suggestion of suggestions) {
      if (!grouped.has(suggestion.entityType)) {
        grouped.set(suggestion.entityType, new Map());
      }

      const actionMap = grouped.get(suggestion.entityType)!;
      if (!actionMap.has(suggestion.action)) {
        actionMap.set(suggestion.action, []);
      }

      actionMap.get(suggestion.action)!.push(suggestion);
    }

    return grouped;
  }

  /**
   * Process a group of suggestions for the same entity type and action
   */
  private async processSuggestionGroup(
    entityType: string,
    action: string,
    suggestions: UpdateSuggestion[],
  ): Promise<
    Pick<DatabaseUpdateResult, "processedCount" | "failedCount" | "errors">
  > {
    let processedCount = 0;
    let failedCount = 0;
    const errors: string[] = [];

    // For properties, we need to handle order_key generation for inserts
    if (entityType === "property" && action === "insert") {
      return await this.processPropertyInserts(suggestions);
    }

    // Process other entity types or updates
    const results = await Promise.allSettled(
      suggestions.map((suggestion) => this.processSingleSuggestion(suggestion)),
    );

    for (const [index, result] of results.entries()) {
      if (result.status === "fulfilled" && result.value.success) {
        processedCount++;
      } else {
        failedCount++;
        const suggestion = suggestions[index];
        const error =
          result.status === "rejected" ? result.reason : result.value.error;
        errors.push(
          `Failed to ${suggestion.action} ${suggestion.entityType} "${suggestion.entityName}": ${error}`,
        );
      }
    }

    return { processedCount, failedCount, errors };
  }

  /**
   * Handle property inserts with proper order_key generation
   * Groups by project to minimize database calls
   */
  private async processPropertyInserts(
    suggestions: UpdateSuggestion[],
  ): Promise<
    Pick<DatabaseUpdateResult, "processedCount" | "failedCount" | "errors">
  > {
    let processedCount = 0;
    let failedCount = 0;
    const errors: string[] = [];

    // Group property inserts by project_id
    const propertiesByProject = new Map<string, UpdateSuggestion[]>();

    for (const suggestion of suggestions) {
      // Validate each property suggestion including project access
      const validation = await validateSuggestionWithProjectAccess(
        suggestion,
        this.projectValidationService,
      );

      if (!validation.isValid) {
        failedCount++;
        const allErrors = [
          ...validation.errors,
          ...validation.projectValidationErrors,
        ];
        console.error("Property validation failed:", {
          suggestion: suggestion.entityName,
          projectId: suggestion.values.project_id,
          errors: allErrors,
        });
        errors.push(
          `Property "${suggestion.entityName}" validation failed: ${allErrors.join(", ")}`,
        );
        continue;
      }

      const projectId = suggestion.values.project_id as string;
      if (!projectId) {
        failedCount++;
        errors.push(`Property "${suggestion.entityName}" missing project_id`);
        continue;
      }

      if (!propertiesByProject.has(projectId)) {
        propertiesByProject.set(projectId, []);
      }
      propertiesByProject.get(projectId)!.push(suggestion);
    }

    // Process each project's properties
    for (const [
      projectId,
      projectProperties,
    ] of propertiesByProject.entries()) {
      try {
        // Get existing order_keys for this project
        const { data: existingProperties, error: fetchError } =
          await this.supabase
            .from("properties")
            .select("order_key")
            .eq("project_id", projectId);

        // Check for fetch errors
        if (fetchError) {
          failedCount += projectProperties.length;
          console.error("Failed to fetch existing properties:", {
            projectId,
            error: fetchError.message,
            details: fetchError.details,
            hint: fetchError.hint,
          });
          errors.push(
            `Failed to fetch existing properties for project ${projectId}: ${fetchError.message}`,
          );
          continue;
        }

        const existingOrderKeys =
          existingProperties?.map((p) => ({ order_key: p.order_key })) || [];

        // Generate order_keys for new properties
        let currentOrderKey = keyBeforeAll(existingOrderKeys);

        const propertiesToInsert = projectProperties.map((suggestion) => {
          const payload = this.buildDatabasePayload(suggestion);
          payload.order_key = currentOrderKey;

          // Generate next order_key for subsequent properties
          existingOrderKeys.push({ order_key: currentOrderKey });
          currentOrderKey = keyBeforeAll(existingOrderKeys);

          return payload;
        });

        // Batch insert properties for this project
        const { error } = await this.supabase
          .from("properties")
          .insert(
            propertiesToInsert as Database["public"]["Tables"]["properties"]["Insert"][],
          );

        if (error) {
          failedCount += projectProperties.length;
          console.error("Property insert error:", {
            projectId,
            error: error.message,
            details: error.details,
            hint: error.hint,
            code: error.code,
            payloads: propertiesToInsert,
          });

          // Provide user-friendly error message
          let userFriendlyError = error.message;
          if (error.message.includes("violates row-level security policy")) {
            userFriendlyError = `Access denied: You don't have permission to create properties for this project`;
          } else if (
            error.message.includes("violates foreign key constraint")
          ) {
            userFriendlyError = `Invalid project: The specified project does not exist or is not accessible`;
          } else if (error.message.includes("duplicate key value")) {
            userFriendlyError = `Duplicate property names or order keys detected`;
          }

          errors.push(
            `Failed to insert properties for project ${projectId}: ${userFriendlyError}`,
          );
        } else {
          processedCount += projectProperties.length;
        }
      } catch (error) {
        failedCount += projectProperties.length;
        errors.push(
          `Error processing properties for project ${projectId}: ${error instanceof Error ? error.message : "Unknown error"}`,
        );
      }
    }

    return { processedCount, failedCount, errors };
  }

  /**
   * Process a single suggestion (update or non-property insert)
   */
  private async processSingleSuggestion(
    suggestion: UpdateSuggestion,
  ): Promise<{ success: boolean; error?: string }> {
    try {
      // Validate suggestion before processing including project access
      const validation = await validateSuggestionWithProjectAccess(
        suggestion,
        this.projectValidationService,
      );

      if (!validation.isValid) {
        const allErrors = [
          ...validation.errors,
          ...validation.projectValidationErrors,
        ];
        console.error("Suggestion validation failed:", {
          entityType: suggestion.entityType,
          entityName: suggestion.entityName,
          action: suggestion.action,
          errors: allErrors,
        });
        return {
          success: false,
          error: `Validation failed: ${allErrors.join(", ")}`,
        };
      }

      const payload = this.buildDatabasePayload(suggestion);

      if (suggestion.action === "update") {
        return await this.performUpdate(suggestion, payload);
      } else {
        return await this.performInsert(suggestion, payload);
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  /**
   * Build database payload from suggestion with proper type coercion
   */
  private buildDatabasePayload(
    suggestion: UpdateSuggestion,
  ): Record<string, unknown> {
    // Apply default values first
    const valuesWithDefaults = applyDefaultValues(suggestion);

    const payload: Record<string, unknown> = {};

    // Add timestamp fields based on table schema
    if (suggestion.action === "insert") {
      payload.created_at = nowISO();
    }

    // Only projects & properties have updated_at column
    if (
      suggestion.entityType === "project" ||
      suggestion.entityType === "property"
    ) {
      payload.updated_at = nowISO();
    }

    // Process and validate all field values
    for (const [field, value] of Object.entries(valuesWithDefaults)) {
      payload[field] = parseFieldValue(field, value, suggestion.entityType);
    }

    return payload;
  }

  /**
   * Perform database update operation
   */
  private async performUpdate(
    suggestion: UpdateSuggestion,
    payload: Record<string, unknown>,
  ): Promise<{ success: boolean; error?: string }> {
    if (!suggestion.entityId) {
      return { success: false, error: "Missing entity ID for update" };
    }

    const { error } = await this.supabase
      .from(this.getTableName(suggestion.entityType))
      .update(payload)
      .eq("id", suggestion.entityId);

    return error ? { success: false, error: error.message } : { success: true };
  }

  /**
   * Perform database insert operation
   */
  private async performInsert(
    suggestion: UpdateSuggestion,
    payload: Record<string, unknown>,
  ): Promise<{ success: boolean; error?: string }> {
    const tableName = this.getTableName(suggestion.entityType);
    let result;

    // Handle different table types with proper typing
    if (tableName === "properties") {
      result = await this.supabase
        .from("properties")
        .insert([
          payload as Database["public"]["Tables"]["properties"]["Insert"],
        ]);
    } else if (tableName === "projects") {
      result = await this.supabase
        .from("projects")
        .insert([
          payload as Database["public"]["Tables"]["projects"]["Insert"],
        ]);
    } else if (tableName === "client_requirements") {
      result = await this.supabase
        .from("client_requirements")
        .insert([
          payload as Database["public"]["Tables"]["client_requirements"]["Insert"],
        ]);
    } else {
      return { success: false, error: `Unknown table: ${tableName}` };
    }

    if (result.error) {
      const errorInfo = {
        entityType: suggestion.entityType,
        entityName: suggestion.entityName,
        error: result.error.message,
        details: result.error.details,
        hint: result.error.hint,
        code: result.error.code,
        payload: payload,
      };

      console.error(`${tableName} insert error:`, errorInfo);

      // Categorize the error for better user feedback
      let userFriendlyError = result.error.message;

      if (result.error.message.includes("violates row-level security policy")) {
        userFriendlyError = `Access denied: You don't have permission to create ${suggestion.entityType} records for this project`;
      } else if (
        result.error.message.includes("violates foreign key constraint")
      ) {
        userFriendlyError = `Invalid reference: The specified project does not exist or is not accessible`;
      } else if (result.error.message.includes("violates check constraint")) {
        userFriendlyError = `Invalid data: ${result.error.details || result.error.message}`;
      } else if (result.error.message.includes("duplicate key value")) {
        userFriendlyError = `Duplicate entry: This ${suggestion.entityType} already exists`;
      } else if (
        result.error.message.includes("violates not-null constraint")
      ) {
        userFriendlyError = `Missing required field: ${result.error.details || "A required field is missing"}`;
      }

      return { success: false, error: userFriendlyError };
    }

    return { success: true };
  }

  /**
   * Get table name from entity type
   */
  private getTableName(
    entityType: string,
  ): "projects" | "properties" | "client_requirements" {
    switch (entityType) {
      case "project":
        return "projects";
      case "property":
        return "properties";
      case "client_requirement":
        return "client_requirements";
      default:
        throw new Error(`Unknown entity type: ${entityType}`);
    }
  }
}
