import { z } from "zod";
import { Database, Constants } from "../types/database";

// Use the Constants from the database schema for type safety
export const PROJECT_STATUSES = Constants.public.Enums.project_status;

export const ROADMAP_STATUSES = Constants.public.Enums.roadmap_status;

export const DOCUMENT_SOURCE_TYPES =
  Constants.public.Enums.document_source_type;

export const PROPERTY_STATUSES = Constants.public.Enums.property_status;

export const PROPERTY_CURRENT_STATES =
  Constants.public.Enums.property_current_state;

export const TOUR_STATUSES = Constants.public.Enums.tour_status;

// Zod schemas using the Constants
export const projectStatusSchema = z.enum(
  PROJECT_STATUSES as readonly [string, ...string[]],
);

export const roadmapStatusSchema = z.enum(
  ROADMAP_STATUSES as readonly [string, ...string[]],
);

export const documentSourceTypeSchema = z.enum(
  DOCUMENT_SOURCE_TYPES as readonly [string, ...string[]],
);

export const propertyStatusSchema = z.enum(
  PROPERTY_STATUSES as readonly [string, ...string[]],
);

export const propertyCurrentStateSchema = z.enum(
  PROPERTY_CURRENT_STATES as readonly [string, ...string[]],
);

export const tourStatusSchema = z.enum(
  TOUR_STATUSES as readonly [string, ...string[]],
);

// Base schemas for database tables
export const ProjectSchema = z.object({
  id: z.string().uuid(),
  clerk_user_id: z.string(),
  title: z.string().min(1, "Title is required"),
  status: projectStatusSchema,
  start_date: z.string().nullable(),
  desired_move_in_date: z.string().nullable(),
  expected_fee: z.number().min(0, "Fee must be non-negative").nullable(),
  broker_commission: z
    .number()
    .min(0, "Commission must be non-negative")
    .nullable(),
  commission_paid_by: z.string().nullable(),
  payment_due: z.string().nullable(),
  company_name: z.string().nullable(),
  expected_headcount: z.string().nullable(),
  contact_name: z.string().nullable(),
  contact_title: z.string().nullable(),
  contact_phone: z.string().nullable(),
  contact_email: z.string().email("Invalid email").nullable().or(z.literal("")),
  city: z.string().nullable(),
  state: z.string().nullable(),
  public_share_id: z.string().nullable(),
  created_at: z.string().nullable(),
  updated_at: z.string().nullable(),
  deleted_at: z.string().nullable(),
});

export const ProjectInsertSchema = ProjectSchema.omit({
  id: true,
  created_at: true,
  updated_at: true,
  deleted_at: true,
  public_share_id: true,
})
  .partial()
  .extend({
    clerk_user_id: z.string(),
    title: z.string().min(1, "Title is required"),
    status: projectStatusSchema,
  });

export const ProjectUpdateSchema = ProjectSchema.partial().omit({
  id: true,
  clerk_user_id: true,
  created_at: true,
});

export const ProjectDocumentSchema = z.object({
  id: z.string().uuid(),
  project_id: z.string().uuid(),
  name: z.string().min(1, "Document name is required"),
  file_type: z.string(),
  document_url: z.string().url("Invalid URL"),
  source_type: documentSourceTypeSchema,
  order_index: z.number().int().min(0),
  created_at: z.string().nullable(),
});

export const ProjectDocumentInsertSchema = ProjectDocumentSchema.omit({
  id: true,
  created_at: true,
})
  .partial()
  .extend({
    project_id: z.string().uuid(),
    name: z.string().min(1, "Document name is required"),
    file_type: z.string(),
    document_url: z.string().url("Invalid URL"),
    source_type: documentSourceTypeSchema,
    order_index: z.number().int().min(0),
  });

export const RoadmapStepSchema = z.object({
  id: z.string().uuid(),
  project_id: z.string().uuid(),
  title: z.string().min(1, "Title is required"),
  description: z.string().nullable(),
  status: roadmapStatusSchema,
  expected_date: z.string().nullable(),
  completed_date: z.string().nullable(),
  order_index: z.number().int().min(0),
  created_at: z.string().nullable(),
});

export const RoadmapStepInsertSchema = RoadmapStepSchema.omit({
  id: true,
  created_at: true,
})
  .partial()
  .extend({
    project_id: z.string().uuid(),
    title: z.string().min(1, "Title is required"),
    status: roadmapStatusSchema,
    order_index: z.number().int().min(0),
  });

export const PropertySchema = z.object({
  id: z.string().uuid(),
  project_id: z.string().uuid(),
  name: z.string().min(1, "Property name is required"),
  address: z.string().nullable(),
  sf: z.string().nullable(),
  people_capacity: z.string().nullable(),
  price_per_sf: z.string().nullable(),
  monthly_cost: z.string().nullable(),
  expected_monthly_cost: z.string().nullable(),
  contract_term: z.string().nullable(),
  availability: z.string().nullable(),
  lease_type: z.string().nullable(),
  lease_structure: z.string().nullable(),
  current_state: propertyCurrentStateSchema,
  condition: z.string().nullable(),
  cam_rate: z.string().nullable(),
  parking_rate: z.string().nullable(),
  misc_notes: z.string().nullable(),
  virtual_tour_url: z.string().url("Invalid URL").nullable().or(z.literal("")),
  suggestion: z.string().nullable(),
  flier_url: z.string().url("Invalid URL").nullable().or(z.literal("")),
  tour_datetime: z.string().nullable(),
  tour_location: z.string().nullable(),
  tour_status: tourStatusSchema.nullable(),
  status: propertyStatusSchema,
  decline_reason: z.string().nullable(),
  order_index: z.number().int().min(0),
  created_at: z.string().nullable(),
  updated_at: z.string().nullable(),
});

export const PropertyInsertSchema = PropertySchema.omit({
  id: true,
  created_at: true,
  updated_at: true,
})
  .partial()
  .extend({
    project_id: z.string().uuid(),
    name: z.string().min(1, "Property name is required"),
    current_state: propertyCurrentStateSchema,
    status: propertyStatusSchema,
    order_index: z.number().int().min(0),
  });

export const ProjectUpdateCreateSchema = z.object({
  project_id: z.string().uuid(),
  content: z.string().min(1, "Update content is required"),
  update_date: z.string().nullable(),
});

export const ClientRequirementSchema = z.object({
  project_id: z.string().uuid(),
  category: z.string().min(1, "Category is required"),
  requirement_text: z.string().min(1, "Requirement text is required"),
});

// Helper function to validate against database types
export function validateAgainstDatabase<T>(
  data: unknown,
  schema: z.ZodSchema<T>,
): { success: true; data: T } | { success: false; errors: z.ZodError } {
  const result = schema.safeParse(data);
  if (result.success) {
    return { success: true, data: result.data };
  }
  return { success: false, errors: result.error };
}

// Type guards
export function isValidProjectStatus(
  value: string,
): value is Database["public"]["Enums"]["project_status"] {
  return projectStatusSchema.safeParse(value).success;
}

export function isValidRoadmapStatus(
  value: string,
): value is Database["public"]["Enums"]["roadmap_status"] {
  return roadmapStatusSchema.safeParse(value).success;
}

export function isValidDocumentSourceType(
  value: string,
): value is Database["public"]["Enums"]["document_source_type"] {
  return documentSourceTypeSchema.safeParse(value).success;
}

export function isValidPropertyStatus(
  value: string,
): value is Database["public"]["Enums"]["property_status"] {
  return propertyStatusSchema.safeParse(value).success;
}

export function isValidPropertyCurrentState(
  value: string,
): value is Database["public"]["Enums"]["property_current_state"] {
  return propertyCurrentStateSchema.safeParse(value).success;
}

export function isValidTourStatus(
  value: string,
): value is Database["public"]["Enums"]["tour_status"] {
  return tourStatusSchema.safeParse(value).success;
}

// Form validation helpers
export function getValidationErrors(error: z.ZodError): Record<string, string> {
  const errors: Record<string, string> = {};
  error.errors.forEach((err) => {
    const path = err.path.join(".");
    errors[path] = err.message;
  });
  return errors;
}

export function formatValidationError(error: z.ZodError): string {
  return error.errors
    .map((err) => `${err.path.join(".")}: ${err.message}`)
    .join(", ");
}
