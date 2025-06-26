import type { UpdateSuggestion } from "../types/aiSuggestions";
import { Constants } from "../types/database";
import type { ProjectValidationService } from "../services/projectValidationService";

/**
 * Validation result interface
 */
interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

/**
 * Async validation result interface for validations that require database access
 */
interface AsyncValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  projectValidationErrors: string[];
}

/**
 * Required fields for each entity type when inserting
 */
const REQUIRED_FIELDS = {
  project: ["title"],
  property: ["name", "project_id"],
  client_requirement: ["category", "project_id", "requirement_text"],
} as const;

/**
 * Default values for entity inserts
 */
const DEFAULT_VALUES = {
  property: {
    status: "new" as const,
    current_state: "Available" as const,
  },
  client_requirement: {},
  project: {
    status: "Active" as const,
  },
} as const;

/**
 * Validate a suggestion payload before database operation (basic validation only)
 */
function validateSuggestion(suggestion: UpdateSuggestion): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Skip validation for updates (they don't need all required fields)
  if (suggestion.action === "update") {
    return { isValid: true, errors, warnings };
  }

  // Validate required fields for inserts
  const entityType = suggestion.entityType as keyof typeof REQUIRED_FIELDS;
  const requiredFields = REQUIRED_FIELDS[entityType] || [];

  for (const field of requiredFields) {
    const value = suggestion.values[field];
    if (!value || (typeof value === "string" && !value.trim())) {
      errors.push(`Missing required field: ${field}`);
    }
  }

  // Entity-specific validations
  switch (suggestion.entityType) {
    case "property":
      validatePropertySuggestion(suggestion, errors, warnings);
      break;
    case "client_requirement":
      validateClientRequirementSuggestion(suggestion, errors, warnings);
      break;
    case "project":
      validateProjectSuggestion(suggestion, errors);
      break;
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Validate suggestion with project access validation (async)
 */
export async function validateSuggestionWithProjectAccess(
  suggestion: UpdateSuggestion,
  projectValidationService: ProjectValidationService,
): Promise<AsyncValidationResult> {
  // First run basic validation
  const basicValidation = validateSuggestion(suggestion);
  const projectValidationErrors: string[] = [];

  // Extract project IDs that need validation
  const projectIdsToValidate: string[] = [];

  if (
    suggestion.entityType === "property" ||
    suggestion.entityType === "client_requirement"
  ) {
    const projectId = suggestion.values.project_id as string;
    if (projectId) {
      projectIdsToValidate.push(projectId);
    }
  }

  // For project updates, validate the entity ID
  if (
    suggestion.entityType === "project" &&
    suggestion.action === "update" &&
    suggestion.entityId
  ) {
    projectIdsToValidate.push(suggestion.entityId);
  }

  // Validate project access for all relevant project IDs
  if (projectIdsToValidate.length > 0) {
    try {
      const validationResults =
        await projectValidationService.validateMultipleProjects(
          projectIdsToValidate,
        );

      for (const [projectId, result] of validationResults.entries()) {
        if (!result.isValid) {
          if (result.error) {
            projectValidationErrors.push(
              `Project ${projectId}: ${result.error}`,
            );
          } else if (!result.exists) {
            projectValidationErrors.push(`Project ${projectId} does not exist`);
          } else if (!result.hasAccess) {
            projectValidationErrors.push(`No access to project ${projectId}`);
          } else {
            projectValidationErrors.push(`Invalid project ${projectId}`);
          }
        }
      }
    } catch (error) {
      projectValidationErrors.push(
        `Project validation failed: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }
  }

  // Combine all validation results
  const allErrors = [...basicValidation.errors, ...projectValidationErrors];

  return {
    isValid: allErrors.length === 0,
    errors: basicValidation.errors,
    warnings: basicValidation.warnings,
    projectValidationErrors,
  };
}

/**
 * Apply default values to a suggestion payload
 */
export function applyDefaultValues(
  suggestion: UpdateSuggestion,
): Record<string, string | number | boolean | null> {
  const entityType = suggestion.entityType as keyof typeof DEFAULT_VALUES;
  const defaults = DEFAULT_VALUES[entityType] || {};

  // Start with suggestion values
  const payload: Record<string, string | number | boolean | null> = {
    ...suggestion.values,
  };

  // Apply defaults for missing fields
  for (const [field, defaultValue] of Object.entries(defaults)) {
    if (
      !(field in payload) ||
      payload[field] === null ||
      payload[field] === undefined
    ) {
      payload[field] = defaultValue as string | number | boolean | null;
    }
  }

  // Add system fields for inserts
  if (suggestion.action === "insert") {
    if (!payload.id) {
      payload.id = crypto.randomUUID();
    }
  }

  return payload;
}

/**
 * Validate property-specific requirements
 */
function validatePropertySuggestion(
  suggestion: UpdateSuggestion,
  errors: string[],
  warnings: string[],
): void {
  const { values } = suggestion;

  // Validate project_id exists (this should be a foreign key check)
  if (!values.project_id) {
    errors.push("Property must have a valid project_id");
  }

  // Validate status if provided
  if (values.status) {
    const validStatuses = Constants.public.Enums.property_status;
    if (
      !validStatuses.includes(values.status as (typeof validStatuses)[number])
    ) {
      errors.push(
        `Invalid property status: ${values.status}. Must be one of: ${validStatuses.join(", ")}`,
      );
    }
  }

  // Validate current_state if provided
  if (values.current_state) {
    const validStates = Constants.public.Enums.property_current_state;
    if (
      !validStates.includes(
        values.current_state as (typeof validStates)[number],
      )
    ) {
      errors.push(
        `Invalid property current_state: ${values.current_state}. Must be one of: ${validStates.join(", ")}`,
      );
    }
  }

  // Warn about missing important fields
  if (!values.address) {
    warnings.push("Property address not provided");
  }
}

/**
 * Validate client requirement-specific requirements
 */
function validateClientRequirementSuggestion(
  suggestion: UpdateSuggestion,
  errors: string[],
  _warnings: string[],
): void {
  const { values } = suggestion;

  // Validate category
  if (!values.category || typeof values.category !== "string") {
    errors.push("Client requirement must have a valid category");
  }

  // Validate requirement_text
  if (!values.requirement_text || typeof values.requirement_text !== "string") {
    errors.push("Client requirement must have requirement_text");
  } else if ((values.requirement_text as string).length < 10) {
    _warnings.push(
      "Requirement text is very short, consider adding more detail",
    );
  }

  // Validate project_id
  if (!values.project_id) {
    errors.push("Client requirement must have a valid project_id");
  }
}

/**
 * Validate project-specific requirements
 */
function validateProjectSuggestion(
  suggestion: UpdateSuggestion,
  errors: string[],
): void {
  const { values } = suggestion;

  // Validate title/name
  if (!values.title && !values.name) {
    errors.push("Project must have a title or name");
  }

  // Validate status if provided
  if (values.status) {
    const validStatuses = Constants.public.Enums.project_status;
    if (
      !validStatuses.includes(values.status as (typeof validStatuses)[number])
    ) {
      errors.push(
        `Invalid project status: ${values.status}. Must be one of: ${validStatuses.join(", ")}`,
      );
    }
  }
}
