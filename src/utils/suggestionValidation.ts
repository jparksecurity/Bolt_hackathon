import { Constants } from "../types/database";

/**
 * Utility functions for validating and coercing suggestion values
 * Extracted from AutomatedUpdatePage to promote reusability
 */

// Define numeric fields for type coercion
const NUMERIC_FIELDS = new Set([
  "total_sqft",
  "unit_count",
  "estimated_budget",
  "lease_rate_psf_year",
  "lease_rate_psf_month",
  "required_sqft",
  "max_budget",
  "preferred_lease_rate",
  "order_key",
]);

/**
 * Parse and validate field values according to their expected types
 * Handles string-to-number conversion and enum validation
 */
export function parseFieldValue(
  field: string,
  value: string | number | boolean | null,
  entityType: "project" | "property" | "client_requirement",
): string | number | boolean | null {
  if (value === null || value === undefined) {
    return null;
  }

  // Handle numeric fields
  if (NUMERIC_FIELDS.has(field)) {
    if (typeof value === "number") return value;
    if (typeof value === "string") {
      const parsed = parseFloat(value);
      return isNaN(parsed) ? null : parsed;
    }
    return null;
  }

  // Handle boolean fields
  if (typeof value === "boolean") {
    return value;
  }

  // Handle string values that might represent booleans
  if (typeof value === "string") {
    const lowerValue = value.toLowerCase().trim();
    if (lowerValue === "true" || lowerValue === "yes" || lowerValue === "1") {
      return true;
    }
    if (lowerValue === "false" || lowerValue === "no" || lowerValue === "0") {
      return false;
    }
  }

  // Validate enum fields
  const stringValue = String(value).trim();

  // Project status validation
  if (field === "status" && entityType === "project") {
    return validateProjectStatus(stringValue);
  }

  // Property status validation
  if (field === "status" && entityType === "property") {
    return validatePropertyStatus(stringValue);
  }

  // Property current state validation
  if (field === "current_state" && entityType === "property") {
    return validatePropertyCurrentState(stringValue);
  }

  // Tour status validation
  if (field === "tour_status") {
    return validateTourStatus(stringValue);
  }

  // Handle deleted_at parsing
  if (field === "deleted_at") {
    return parseDeletedAt(stringValue);
  }

  return stringValue;
}

/**
 * Validate project status against allowed enum values
 */
function validateProjectStatus(value: string): string | null {
  const validStatuses = Constants.public.Enums.project_status;

  // Direct match
  if (validStatuses.includes(value as (typeof validStatuses)[number])) {
    return value;
  }

  // Try case-insensitive match
  const match = validStatuses.find(
    (status) => status.toLowerCase() === value.toLowerCase(),
  );

  return match || null;
}

/**
 * Validate property status against allowed enum values
 */
function validatePropertyStatus(value: string): string | null {
  const validStatuses = Constants.public.Enums.property_status;
  const normalizedValue = value.toLowerCase().replace(/\s+/g, "_");

  // Direct match
  if (validStatuses.includes(value as (typeof validStatuses)[number])) {
    return value;
  }

  // Try normalized match
  const match = validStatuses.find(
    (status) => status.toLowerCase() === normalizedValue,
  );

  return match || null;
}

/**
 * Validate property current state against allowed enum values
 */
function validatePropertyCurrentState(value: string): string | null {
  const validStates = Constants.public.Enums.property_current_state;

  // Direct match
  if (validStates.includes(value as (typeof validStates)[number])) {
    return value;
  }

  // Try case-insensitive match
  const match = validStates.find(
    (state) => state.toLowerCase() === value.toLowerCase(),
  );

  return match || null;
}

/**
 * Validate tour status against allowed enum values
 */
function validateTourStatus(value: string): string | null {
  const validStatuses = Constants.public.Enums.tour_status;

  // Direct match
  if (validStatuses.includes(value as (typeof validStatuses)[number])) {
    return value;
  }

  // Try case-insensitive match
  const match = validStatuses.find(
    (status) => status.toLowerCase() === value.toLowerCase(),
  );

  return match || null;
}

/**
 * Parse deleted_at field values
 */
function parseDeletedAt(value: string): string | null {
  if (
    !value ||
    value.toLowerCase() === "null" ||
    value.toLowerCase() === "false"
  ) {
    return null;
  }

  // If it's a valid ISO date string, return it
  if (value.includes("T") && value.includes("Z")) {
    return value;
  }

  // Otherwise return null (invalid format)
  return null;
}

/**
 * Get user-friendly field labels for display
 */
export function getFieldLabel(field: string): string {
  const labels: Record<string, string> = {
    total_sqft: "Total Sq Ft",
    unit_count: "Unit Count",
    estimated_budget: "Estimated Budget",
    lease_rate_psf_year: "Lease Rate ($/sq ft/year)",
    lease_rate_psf_month: "Lease Rate ($/sq ft/month)",
    required_sqft: "Required Sq Ft",
    max_budget: "Max Budget",
    preferred_lease_rate: "Preferred Lease Rate",
    property_type: "Property Type",
    move_in_date: "Move-in Date",
    deleted_at: "Deleted At",
    created_at: "Created At",
    updated_at: "Updated At",
    order_key: "Order Key",
  };

  return (
    labels[field] ||
    field.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())
  );
}
