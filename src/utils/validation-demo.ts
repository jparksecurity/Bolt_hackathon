// Validation System Demo
// This file demonstrates the power of our type-safe validation system

import {
  validateAgainstDatabase,
  ProjectInsertSchema,
  ProjectDocumentInsertSchema,
  isValidProjectStatus,
  isValidDocumentSourceType,
  getValidationErrors,
  formatValidationError,
} from "./validation";

// ✅ Valid project data
const validProject = {
  clerk_user_id: "user_123",
  title: "Tech Startup Office Lease",
  status: "Active" as const,
  company_name: "InnovateCorp",
  expected_fee: 15000,
  broker_commission: 2500,
  city: "San Francisco",
  state: "CA",
};

// ❌ Invalid project data
const invalidProject = {
  clerk_user_id: "", // Empty required field
  title: "", // Empty required field
  status: "InvalidStatus", // Invalid enum value
  expected_fee: -1000, // Negative number
  contact_email: "not-an-email", // Invalid email format
};

// Demo function to show validation in action
export function runValidationDemo() {
  console.log("🎯 Database Type Validation Demo\n");

  // 1. Valid Project Validation
  console.log("1️⃣ Testing VALID project data:");
  const validResult = validateAgainstDatabase(
    validProject,
    ProjectInsertSchema,
  );
  if (validResult.success) {
    console.log("✅ Validation passed! Data is safe for database insertion.");
    console.log("   Validated data:", validResult.data);
  } else {
    console.log("❌ Unexpected validation failure");
  }

  console.log("\n" + "=".repeat(50) + "\n");

  // 2. Invalid Project Validation
  console.log("2️⃣ Testing INVALID project data:");
  const invalidResult = validateAgainstDatabase(
    invalidProject,
    ProjectInsertSchema,
  );
  if (!invalidResult.success) {
    console.log("❌ Validation failed (as expected):");
    const errors = getValidationErrors(invalidResult.errors);
    Object.entries(errors).forEach(([field, message]) => {
      console.log(`   ${field}: ${message}`);
    });

    console.log("\n📝 Formatted error message:");
    console.log("   " + formatValidationError(invalidResult.errors));
  }

  console.log("\n" + "=".repeat(50) + "\n");

  // 3. Type Guards Demo
  console.log("3️⃣ Testing type guards:");

  const statuses = ["Active", "Pending", "InvalidStatus", "Completed"];
  statuses.forEach((status) => {
    const isValid = isValidProjectStatus(status);
    console.log(`   "${status}": ${isValid ? "✅ Valid" : "❌ Invalid"}`);
  });

  console.log("\n" + "=".repeat(50) + "\n");

  // 4. Document Validation Demo
  console.log("4️⃣ Testing document validation:");

  const validDocument = {
    project_id: "proj_123",
    name: "Lease Agreement.pdf",
    file_type: "pdf",
    document_url: "https://example.com/lease.pdf",
    source_type: "google_drive" as const,
    order_index: 0,
  };

  const docResult = validateAgainstDatabase(
    validDocument,
    ProjectDocumentInsertSchema,
  );
  console.log(
    `   Document validation: ${docResult.success ? "✅ Valid" : "❌ Invalid"}`,
  );

  if (!docResult.success) {
    console.log("   Errors:", getValidationErrors(docResult.errors));
  }

  // 5. Source Type Validation
  console.log("\n5️⃣ Testing document source types:");
  const sourceTypes = [
    "google_drive",
    "onedrive",
    "upload",
    "url",
    "invalid_source",
  ];
  sourceTypes.forEach((source) => {
    const isValid = isValidDocumentSourceType(source);
    console.log(`   "${source}": ${isValid ? "✅ Valid" : "❌ Invalid"}`);
  });

  console.log("\n🎉 Demo completed! This shows how our validation system:");
  console.log("   • Prevents invalid data from reaching the database");
  console.log("   • Provides clear, actionable error messages");
  console.log("   • Ensures type safety at runtime");
  console.log("   • Works seamlessly with TypeScript");
}

// Example of how to use in a React component
export function useProjectValidation() {
  const validateProjectData = (data: unknown) => {
    const result = validateAgainstDatabase(data, ProjectInsertSchema);

    if (!result.success) {
      // Return user-friendly error messages
      return {
        isValid: false,
        errors: getValidationErrors(result.errors),
        summary: formatValidationError(result.errors),
      };
    }

    return {
      isValid: true,
      data: result.data,
      errors: {},
      summary: "",
    };
  };

  return { validateProjectData };
}

// Type-safe form helpers
export const FormValidationHelpers = {
  // Check if a project status is valid before setting it
  setProjectStatus: (status: string) => {
    if (isValidProjectStatus(status)) {
      return status; // TypeScript knows this is a valid enum value
    }
    throw new Error(`Invalid project status: ${status}`);
  },

  // Validate form data before submission
  validateFormData: <T>(
    data: unknown,
    schema: Parameters<typeof validateAgainstDatabase>[1],
  ): data is T => {
    const result = validateAgainstDatabase(data, schema);
    return result.success;
  },

  // Get field-specific error for UI display
  getFieldError: (errors: Record<string, string>, fieldName: string) => {
    return errors[fieldName] || null;
  },
};

// Example usage in component:
/*
const ProjectForm = () => {
  const { validateProjectData } = useProjectValidation();
  
  const handleSubmit = (formData: any) => {
    const validation = validateProjectData(formData);
    
    if (!validation.isValid) {
      // Show errors to user
      setErrors(validation.errors);
      return;
    }
    
    // Data is guaranteed to be valid - safe to submit
    submitToDatabase(validation.data);
  };
};
*/
