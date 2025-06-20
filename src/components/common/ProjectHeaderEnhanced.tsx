import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Edit3,
  Calendar,
  DollarSign,
  Building,
  User,
  MapPin,
  AlertCircle,
} from "lucide-react";
import { useSupabaseClient } from "../../services/supabase";
import type { Database } from "../../types/database";
import { Modal } from "../ui/Modal";
import { FormButton } from "../ui/FormButton";
import { formatDate } from "../../utils/dateUtils";
import { formatLocation, getStatusColor } from "../../utils/displayUtils";
import {
  ProjectUpdateSchema,
  validateAgainstDatabase,
  getValidationErrors,
  isValidProjectStatus,
} from "../../utils/validation";

// Type aliases for better readability
type ProjectRow = Database["public"]["Tables"]["projects"]["Row"];
type ProjectUpdate = Database["public"]["Tables"]["projects"]["Update"];

interface ProjectHeaderEnhancedProps {
  project: ProjectRow;
  onProjectUpdate?: () => void;
  readonly?: boolean;
  shareId?: string;
}

// Form schema for client-side validation
const ProjectFormSchema = z.object({
  title: z.string().min(1, "Title is required"),
  status: z.enum(["Active", "Pending", "Completed", "On Hold"]),
  start_date: z.string().optional(),
  desired_move_in_date: z.string().optional(),
  company_name: z.string().optional(),
  expected_headcount: z.string().optional(),
  expected_fee: z.string().optional(),
  broker_commission: z.string().optional(),
  commission_paid_by: z.string().optional(),
  payment_due: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
});

type ProjectFormData = z.infer<typeof ProjectFormSchema>;

export const ProjectHeaderEnhanced: React.FC<ProjectHeaderEnhancedProps> = ({
  project,
  onProjectUpdate,
  readonly = false,
}) => {
  const supabase = useSupabaseClient();
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  // React Hook Form with Zod validation
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isValid, isDirty },
    watch,
  } = useForm<ProjectFormData>({
    resolver: zodResolver(ProjectFormSchema),
    defaultValues: {
      title: project.title,
      status: project.status,
      start_date: project.start_date || "",
      desired_move_in_date: project.desired_move_in_date || "",
      company_name: project.company_name || "",
      expected_headcount: project.expected_headcount || "",
      expected_fee: project.expected_fee?.toString() || "",
      broker_commission: project.broker_commission?.toString() || "",
      commission_paid_by: project.commission_paid_by || "",
      payment_due: project.payment_due || "",
      city: project.city || "",
      state: project.state || "",
    },
    mode: "onChange",
  });

  // Watch status changes to provide real-time validation feedback
  const watchedStatus = watch("status");

  useEffect(() => {
    // Validate status in real-time
    if (watchedStatus && !isValidProjectStatus(watchedStatus)) {
      console.warn("Invalid project status detected:", watchedStatus);
    }
  }, [watchedStatus]);

  const openProjectModal = () => {
    // Reset form to current project values
    reset({
      title: project.title,
      status: project.status,
      start_date: project.start_date || "",
      desired_move_in_date: project.desired_move_in_date || "",
      company_name: project.company_name || "",
      expected_headcount: project.expected_headcount || "",
      expected_fee: project.expected_fee?.toString() || "",
      broker_commission: project.broker_commission?.toString() || "",
      commission_paid_by: project.commission_paid_by || "",
      payment_due: project.payment_due || "",
      city: project.city || "",
      state: project.state || "",
    });
    setIsProjectModalOpen(true);
  };

  const closeProjectModal = () => {
    setIsProjectModalOpen(false);
  };

  const onSubmit = async (formData: ProjectFormData) => {
    setSaving(true);
    try {
      // Transform form data to database update format
      const updateData: ProjectUpdate = {
        title: formData.title.trim(),
        status: formData.status,
        start_date: formData.start_date || null,
        desired_move_in_date: formData.desired_move_in_date || null,
        company_name: formData.company_name?.trim() || null,
        expected_headcount: formData.expected_headcount?.trim() || null,
        expected_fee: formData.expected_fee
          ? parseFloat(formData.expected_fee)
          : null,
        broker_commission: formData.broker_commission
          ? parseFloat(formData.broker_commission)
          : null,
        commission_paid_by: formData.commission_paid_by?.trim() || null,
        payment_due: formData.payment_due?.trim() || null,
        city: formData.city?.trim() || null,
        state: formData.state?.trim() || null,
        updated_at: new Date().toISOString(),
      };

      // Additional runtime validation
      const validation = validateAgainstDatabase(
        updateData,
        ProjectUpdateSchema,
      );
      if (!validation.success) {
        const errorMessage = getValidationErrors(validation.errors);
        console.error("Validation failed:", errorMessage);
        alert(`Validation failed: ${Object.values(errorMessage).join(", ")}`);
        return;
      }

      const { error } = await supabase
        .from("projects")
        .update(updateData)
        .eq("id", project.id);

      if (error) throw error;

      setIsProjectModalOpen(false);
      onProjectUpdate?.();
    } catch (error) {
      console.error("Error updating project:", error);
      alert("Error updating project. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  // Helper component for form field errors
  const FieldError: React.FC<{ error?: string }> = ({ error }) => {
    if (!error) return null;
    return (
      <div className="flex items-center mt-1 text-sm text-red-600">
        <AlertCircle className="w-4 h-4 mr-1" />
        {error}
      </div>
    );
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <div className="flex items-center space-x-3">
            <h1 className="text-2xl font-bold text-gray-900">
              {project.title}
            </h1>
            <span
              className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                project.status,
              )}`}
            >
              {project.status}
            </span>
            {!readonly && (
              <button
                onClick={openProjectModal}
                className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                title="Edit project details (Enhanced with validation)"
              >
                <Edit3 className="w-4 h-4" />
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
            {/* Project Timeline */}
            <div className="flex items-center space-x-2 text-gray-600">
              <Calendar className="w-4 h-4" />
              <div>
                <span className="text-sm">Start: </span>
                <span className="font-medium">
                  {project.start_date
                    ? formatDate(project.start_date)
                    : "Not set"}
                </span>
              </div>
            </div>

            <div className="flex items-center space-x-2 text-gray-600">
              <Calendar className="w-4 h-4" />
              <div>
                <span className="text-sm">Move-in: </span>
                <span className="font-medium">
                  {project.desired_move_in_date
                    ? formatDate(project.desired_move_in_date)
                    : "TBD"}
                </span>
              </div>
            </div>

            {/* Financial Information */}
            {project.expected_fee && (
              <div className="flex items-center space-x-2 text-gray-600">
                <DollarSign className="w-4 h-4" />
                <div>
                  <span className="text-sm">Expected Fee: </span>
                  <span className="font-medium">
                    ${project.expected_fee.toLocaleString()}
                  </span>
                </div>
              </div>
            )}

            {/* Company Information */}
            {project.company_name && (
              <div className="flex items-center space-x-2 text-gray-600">
                <Building className="w-4 h-4" />
                <div>
                  <span className="text-sm">Company: </span>
                  <span className="font-medium">{project.company_name}</span>
                </div>
              </div>
            )}

            {/* Contact Information */}
            {project.contact_name && (
              <div className="flex items-center space-x-2 text-gray-600">
                <User className="w-4 h-4" />
                <div>
                  <span className="text-sm">Contact: </span>
                  <span className="font-medium">
                    {project.contact_name}
                    {project.contact_title && ` (${project.contact_title})`}
                  </span>
                </div>
              </div>
            )}

            {/* Location */}
            {(project.city || project.state) && (
              <div className="flex items-center space-x-2 text-gray-600">
                <MapPin className="w-4 h-4" />
                <div>
                  <span className="text-sm">Location: </span>
                  <span className="font-medium">
                    {formatLocation(project.city, project.state)}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Project Edit Modal with Enhanced Validation */}
      <Modal
        isOpen={isProjectModalOpen}
        onClose={closeProjectModal}
        title="Edit Project Details (Enhanced)"
        size="lg"
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Basic Project Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Project Title *
              </label>
              <input
                {...register("title")}
                className={`form-input w-full px-4 py-3 rounded-lg ${
                  errors.title ? "border-red-500" : ""
                }`}
                placeholder="Enter project title"
              />
              <FieldError error={errors.title?.message} />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status *
              </label>
              <select
                {...register("status")}
                className={`form-input w-full px-4 py-3 rounded-lg ${
                  errors.status ? "border-red-500" : ""
                }`}
              >
                {(["Active", "Pending", "Completed", "On Hold"] as const).map(
                  (status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ),
                )}
              </select>
              <FieldError error={errors.status?.message} />
            </div>
          </div>

          {/* Timeline */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Start Date
              </label>
              <input
                {...register("start_date")}
                type="date"
                className="form-input w-full px-4 py-3 rounded-lg"
              />
              <FieldError error={errors.start_date?.message} />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Desired Move-in Date
              </label>
              <input
                {...register("desired_move_in_date")}
                type="date"
                className="form-input w-full px-4 py-3 rounded-lg"
              />
              <FieldError error={errors.desired_move_in_date?.message} />
            </div>
          </div>

          {/* Company Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Company Name
              </label>
              <input
                {...register("company_name")}
                className="form-input w-full px-4 py-3 rounded-lg"
                placeholder="Enter company name"
              />
              <FieldError error={errors.company_name?.message} />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Expected Headcount
              </label>
              <input
                {...register("expected_headcount")}
                className="form-input w-full px-4 py-3 rounded-lg"
                placeholder="e.g., 50-75 employees"
              />
              <FieldError error={errors.expected_headcount?.message} />
            </div>
          </div>

          {/* Financial Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Expected Fee ($)
              </label>
              <input
                {...register("expected_fee")}
                type="number"
                step="0.01"
                min="0"
                className="form-input w-full px-4 py-3 rounded-lg"
                placeholder="0.00"
              />
              <FieldError error={errors.expected_fee?.message} />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Broker Commission ($)
              </label>
              <input
                {...register("broker_commission")}
                type="number"
                step="0.01"
                min="0"
                className="form-input w-full px-4 py-3 rounded-lg"
                placeholder="0.00"
              />
              <FieldError error={errors.broker_commission?.message} />
            </div>
          </div>

          {/* Location */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                City
              </label>
              <input
                {...register("city")}
                className="form-input w-full px-4 py-3 rounded-lg"
                placeholder="Enter city"
              />
              <FieldError error={errors.city?.message} />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                State
              </label>
              <input
                {...register("state")}
                className="form-input w-full px-4 py-3 rounded-lg"
                placeholder="Enter state"
              />
              <FieldError error={errors.state?.message} />
            </div>
          </div>

          {/* Payment Information */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Payment Due
            </label>
            <input
              {...register("payment_due")}
              className="form-input w-full px-4 py-3 rounded-lg"
              placeholder="e.g., Upon lease signing, Net 30 days"
            />
            <FieldError error={errors.payment_due?.message} />
          </div>

          {/* Form Validation Status */}
          {Object.keys(errors).length > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center text-red-700">
                <AlertCircle className="w-5 h-5 mr-2" />
                <span className="font-medium">
                  Please fix the following errors:
                </span>
              </div>
              <ul className="mt-2 text-sm text-red-600 list-disc list-inside">
                {Object.entries(errors).map(([field, error]) => (
                  <li key={field}>
                    {field}: {error?.message}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Form Actions */}
          <div className="flex justify-end space-x-3 pt-4">
            <FormButton
              type="button"
              variant="secondary"
              onClick={closeProjectModal}
              disabled={saving}
            >
              Cancel
            </FormButton>
            <FormButton
              type="submit"
              variant="primary"
              loading={saving}
              disabled={!isValid || !isDirty}
            >
              {saving ? "Saving..." : "Save Changes"}
            </FormButton>
          </div>
        </form>
      </Modal>
    </div>
  );
};
