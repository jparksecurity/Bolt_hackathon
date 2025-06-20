import React, { useState, useEffect, useCallback } from "react";
import {
  Edit3,
  Calendar,
  DollarSign,
  Info,
  Building,
  User,
  Phone,
  Mail,
  MapPin,
  X,
} from "lucide-react";
import { useUser } from "@clerk/clerk-react";
import { useSupabaseClient } from "../../services/supabase";
import type { Database } from "../../types/database";
import { useProjectData } from "../../hooks/useProjectData";
import { ClientRequirementsSection } from "./ClientRequirementsSection";
import { Modal } from "../ui/Modal";
import { FormButton } from "../ui/FormButton";
import { formatDate, nowISO } from "../../utils/dateUtils";
import { formatLocation, getStatusColor } from "../../utils/displayUtils";
import { PROJECT_STATUSES } from "../../utils/validation";

// Type aliases for better readability
type ProjectRow = Database["public"]["Tables"]["projects"]["Row"];
type ProjectUpdate = Database["public"]["Tables"]["projects"]["Update"];

interface ProjectHeaderProps {
  project: ProjectRow;
  onProjectUpdate?: () => void;
  readonly?: boolean;
  shareId?: string;
}

interface ContactFormData {
  name: string;
  title: string;
  phone: string;
  email: string;
}

interface Requirement {
  id: string;
  category: string;
  requirement_text: string;
}

interface ProjectFormData {
  title: string;
  status: Database["public"]["Enums"]["project_status"];
  start_date: string;
  desired_move_in_date: string;
  company_name: string;
  expected_headcount: string;
  expected_fee: string;
  broker_commission: string;
  commission_paid_by: string;
  payment_due: string;
  city: string;
  state: string;
}

interface RequirementFormData {
  category: string;
  requirement_text: string;
}

export const ProjectHeader: React.FC<ProjectHeaderProps> = ({
  project,
  onProjectUpdate,
  readonly = false,
  shareId,
}) => {
  const { user } = useUser();
  const supabase = useSupabaseClient();
  const [showTooltip, setShowTooltip] = useState(false);
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const [contactFormData, setContactFormData] = useState<ContactFormData>({
    name: "",
    title: "",
    phone: "",
    email: "",
  });
  const [requirements, setRequirements] = useState<Requirement[]>([]);
  const [loading, setLoading] = useState(true);
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const [projectFormData, setProjectFormData] = useState<ProjectFormData>({
    title: "",
    status: "Pending" as Database["public"]["Enums"]["project_status"],
    start_date: "",
    desired_move_in_date: "",
    company_name: "",
    expected_headcount: "",
    expected_fee: "",
    broker_commission: "",
    commission_paid_by: "",
    payment_due: "",
    city: "",
    state: "",
  });

  // Contact data is now directly in project object

  const {
    data: publicRequirements,
    loading: publicRequirementsLoading,
    refetch: refetchRequirements,
  } = useProjectData<Requirement>({
    shareId: readonly && shareId ? shareId : undefined,
    projectId: !readonly ? project.id : undefined,
    dataType: "requirements",
  });

  const fetchRequirements = useCallback(async () => {
    try {
      setRequirements(publicRequirements);
      setLoading(publicRequirementsLoading);
    } catch {
      // Error fetching requirements - use empty array
    }
  }, [publicRequirements, publicRequirementsLoading]);

  useEffect(() => {
    if (readonly || (user && project.id)) {
      fetchRequirements();
    }
  }, [user, project.id, fetchRequirements, readonly]);

  const resetProjectForm = () => {
    setProjectFormData({
      title: project.title,
      status: project.status as Database["public"]["Enums"]["project_status"],
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
  };

  const openProjectModal = () => {
    resetProjectForm();
    setIsProjectModalOpen(true);
  };

  const closeProjectModal = () => {
    setIsProjectModalOpen(false);
  };

  const saveProject = async () => {
    setSaving(true);
    try {
      // Use the generated Update type for type safety
      const updateData: ProjectUpdate = {
        title: projectFormData.title.trim(),
        status: projectFormData.status,
        start_date: projectFormData.start_date || null,
        desired_move_in_date: projectFormData.desired_move_in_date || null,
        company_name: projectFormData.company_name.trim() || null,
        expected_headcount: projectFormData.expected_headcount.trim() || null,
        expected_fee: projectFormData.expected_fee
          ? parseFloat(projectFormData.expected_fee)
          : null,
        broker_commission: projectFormData.broker_commission
          ? parseFloat(projectFormData.broker_commission)
          : null,
        commission_paid_by: projectFormData.commission_paid_by.trim() || null,
        payment_due: projectFormData.payment_due.trim() || null,
        city: projectFormData.city.trim() || null,
        state: projectFormData.state.trim() || null,
        updated_at: nowISO(),
      };

      const { error } = await supabase
        .from("projects")
        .update(updateData)
        .eq("id", project.id);

      if (error) throw error;

      setIsProjectModalOpen(false);
      onProjectUpdate?.();
    } catch {
      alert("Error updating project. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleRequirementSave = async (
    formData: RequirementFormData,
    editingId?: string,
  ) => {
    const requirementData = {
      project_id: project.id,
      category: formData.category,
      requirement_text: formData.requirement_text.trim(),
    };

    if (editingId) {
      const { error } = await supabase
        .from("client_requirements")
        .update(requirementData)
        .eq("id", editingId);

      if (error) throw error;
    } else {
      const { error } = await supabase
        .from("client_requirements")
        .insert([requirementData]);

      if (error) throw error;
    }

    await refetchRequirements();
  };

  const handleRequirementDelete = async (requirementId: string) => {
    const { error } = await supabase
      .from("client_requirements")
      .delete()
      .eq("id", requirementId);

    if (error) throw error;
    await refetchRequirements();
  };

  const hasContact = project.contact_name;

  const resetContactForm = () => {
    setContactFormData({
      name: project.contact_name || "",
      title: project.contact_title || "",
      phone: project.contact_phone || "",
      email: project.contact_email || "",
    });
  };

  const openContactModal = () => {
    resetContactForm();
    setIsContactModalOpen(true);
  };

  const closeContactModal = () => {
    setIsContactModalOpen(false);
  };

  const saveContact = async () => {
    if (!contactFormData.name.trim()) return;

    setSaving(true);
    try {
      const updateData = {
        contact_name: contactFormData.name.trim(),
        contact_title: contactFormData.title.trim() || null,
        contact_phone: contactFormData.phone.trim() || null,
        contact_email: contactFormData.email.trim() || null,
        updated_at: nowISO(),
      };

      const { error } = await supabase
        .from("projects")
        .update(updateData)
        .eq("id", project.id);

      if (error) throw error;

      setIsContactModalOpen(false);
      onProjectUpdate?.();
    } catch {
      alert("Error saving contact. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const deleteContact = async () => {
    if (!confirm("Are you sure you want to remove this contact?")) return;

    setSaving(true);
    try {
      const updateData = {
        contact_name: null,
        contact_title: null,
        contact_phone: null,
        contact_email: null,
        updated_at: nowISO(),
      };

      const { error } = await supabase
        .from("projects")
        .update(updateData)
        .eq("id", project.id);

      if (error) throw error;
      onProjectUpdate?.();
    } catch {
      alert("Error removing contact. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const locationDisplay = formatLocation(project.city, project.state);

  return (
    <div className="dashboard-card p-8">
      <div className="flex items-start justify-between mb-8">
        <div className="flex-1">
          <div className="flex items-center space-x-4 mb-4">
            <h1 className="text-3xl font-bold text-gray-900">
              {project.title}
            </h1>
            {locationDisplay && (
              <div className="flex items-center space-x-1 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                <MapPin className="w-3 h-3" />
                <span>{locationDisplay}</span>
              </div>
            )}
            {!readonly && (
              <button
                onClick={openProjectModal}
                className="p-2 text-gray-400 hover:text-gray-800 transition-colors rounded-lg hover:bg-gray-50"
              >
                <Edit3 className="w-5 h-5" />
              </button>
            )}
          </div>
          <div className="flex items-center space-x-4">
            <span
              className={`px-4 py-2 text-white rounded-full font-semibold text-sm ${getStatusColor(
                project.status,
              )}`}
            >
              {project.status}
            </span>
            {project.company_name && (
              <div className="flex items-center space-x-2 text-gray-600">
                <Building className="w-4 h-4" />
                <span className="font-medium">{project.company_name}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Project metrics */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
        <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-6 border border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center">
              <Calendar className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-gray-700 text-sm font-medium">Start Date</p>
              <p className="text-gray-900 font-bold text-lg">
                {formatDate(project.start_date) || "Not set"}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 border border-blue-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
              <MapPin className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-blue-700 text-sm font-medium">
                Desired Move-in
              </p>
              <p className="text-blue-900 font-bold text-lg">
                {formatDate(project.desired_move_in_date) || "Not set"}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-6 border border-green-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-green-700 text-sm font-medium">
                Estimated Tenant Fee
              </p>
              <p className="text-green-900 font-bold text-lg">
                $
                {project.expected_fee
                  ? project.expected_fee.toLocaleString()
                  : "0"}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-6 border border-gray-200 relative">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gray-700 rounded-lg flex items-center justify-center">
              <Info className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1">
              <p className="text-gray-700 text-sm font-medium">
                Broker Commission
              </p>
              <p className="text-gray-900 font-bold text-lg">
                $
                {project.broker_commission
                  ? project.broker_commission.toLocaleString()
                  : "0"}
              </p>
              {project.commission_paid_by && (
                <p className="text-sm font-semibold text-blue-700 mt-1">
                  Paid by {project.commission_paid_by}
                </p>
              )}
            </div>
            {project.broker_commission && project.broker_commission > 0 && (
              <div
                className="relative"
                onMouseEnter={() => setShowTooltip(true)}
                onMouseLeave={() => setShowTooltip(false)}
              >
                <Info className="w-4 h-4 text-gray-400 cursor-help hover:text-gray-600 transition-colors" />
                {showTooltip && (
                  <div className="absolute bottom-full right-0 mb-2 w-64 bg-gray-900 text-white text-xs rounded-lg p-3 shadow-lg z-10">
                    <div className="space-y-1">
                      <div className="font-medium text-gray-300">
                        Commission Details:
                      </div>
                      <div>
                        • Amount: $
                        {project.broker_commission?.toLocaleString() || "0"}
                      </div>
                      <div>
                        • Paid by: {project.commission_paid_by || "TBD"}
                      </div>
                      <div>• Payment due: {project.payment_due || "TBD"}</div>
                    </div>
                    <div className="absolute top-full right-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-6 border border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gray-600 rounded-lg flex items-center justify-center">
              <User className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-gray-700 text-sm font-medium">Head Count</p>
              <p className="text-gray-900 font-bold text-lg">
                {project.expected_headcount || "Not set"}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Contact Information */}
      <div className="bg-gray-50 rounded-xl p-6 mb-8 border border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h4 className="font-bold text-gray-900 flex items-center space-x-2">
            <User className="w-5 h-5 text-gray-800" />
            <span>Primary Contact</span>
          </h4>
          {!readonly && (
            <div className="flex items-center space-x-2">
              {hasContact && (
                <button
                  onClick={deleteContact}
                  className="p-2 text-gray-400 hover:text-red-600 transition-colors rounded-lg hover:bg-red-50"
                  title="Remove contact"
                  disabled={saving}
                >
                  <X className="w-4 h-4" />
                </button>
              )}
              <button
                onClick={openContactModal}
                className="p-2 text-gray-400 hover:text-gray-600 transition-colors rounded-lg hover:bg-gray-100"
                title={hasContact ? "Edit contact" : "Add contact"}
              >
                <Edit3 className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        {hasContact ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center">
                <User className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="font-semibold text-gray-900">
                  {project.contact_name}
                </p>
                {project.contact_title && (
                  <p className="text-sm text-gray-600">
                    {project.contact_title}
                  </p>
                )}
              </div>
            </div>
            {project.contact_phone && (
              <div className="flex items-center space-x-3">
                <Phone className="w-5 h-5 text-gray-400" />
                <span className="text-gray-900">{project.contact_phone}</span>
              </div>
            )}
            {project.contact_email && (
              <div className="flex items-center space-x-3">
                <Mail className="w-5 h-5 text-gray-400" />
                <span className="text-gray-900">{project.contact_email}</span>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-6">
            <User className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 mb-4">
              No contact information added yet
            </p>
            {!readonly && (
              <button
                onClick={openContactModal}
                className="px-4 py-2 bg-gray-900 text-white text-sm rounded-lg hover:bg-gray-800 transition-colors"
              >
                Add Contact
              </button>
            )}
          </div>
        )}
      </div>

      {/* Client Requirements Section */}
      <ClientRequirementsSection
        requirements={requirements}
        loading={loading}
        readonly={readonly}
        onSave={handleRequirementSave}
        onDelete={handleRequirementDelete}
      />

      {/* Project Edit Modal */}
      <Modal
        isOpen={isProjectModalOpen}
        onClose={closeProjectModal}
        title="Edit Project Details"
        size="lg"
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            saveProject();
          }}
          className="space-y-6"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Project Title
              </label>
              <input
                type="text"
                value={projectFormData.title}
                onChange={(e) =>
                  setProjectFormData({
                    ...projectFormData,
                    title: e.target.value,
                  })
                }
                className="form-input w-full px-4 py-3 rounded-lg"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Status
              </label>
              <select
                value={projectFormData.status}
                onChange={(e) =>
                  setProjectFormData({
                    ...projectFormData,
                    status: e.target
                      .value as Database["public"]["Enums"]["project_status"],
                  })
                }
                className="form-input w-full px-4 py-3 rounded-lg"
              >
                {PROJECT_STATUSES.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Company Name
              </label>
              <input
                type="text"
                value={projectFormData.company_name}
                onChange={(e) =>
                  setProjectFormData({
                    ...projectFormData,
                    company_name: e.target.value,
                  })
                }
                className="form-input w-full px-4 py-3 rounded-lg"
                placeholder="Enter company name"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                City
              </label>
              <input
                type="text"
                value={projectFormData.city}
                onChange={(e) =>
                  setProjectFormData({
                    ...projectFormData,
                    city: e.target.value,
                  })
                }
                className="form-input w-full px-4 py-3 rounded-lg"
                placeholder="e.g., San Francisco"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                State
              </label>
              <input
                type="text"
                value={projectFormData.state}
                onChange={(e) =>
                  setProjectFormData({
                    ...projectFormData,
                    state: e.target.value,
                  })
                }
                className="form-input w-full px-4 py-3 rounded-lg"
                placeholder="e.g., CA"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Start Date
              </label>
              <input
                type="date"
                value={projectFormData.start_date}
                onChange={(e) =>
                  setProjectFormData({
                    ...projectFormData,
                    start_date: e.target.value,
                  })
                }
                className="form-input w-full px-4 py-3 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Desired Move-in Date
              </label>
              <input
                type="date"
                value={projectFormData.desired_move_in_date}
                onChange={(e) =>
                  setProjectFormData({
                    ...projectFormData,
                    desired_move_in_date: e.target.value,
                  })
                }
                className="form-input w-full px-4 py-3 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Expected Headcount
              </label>
              <input
                type="text"
                value={projectFormData.expected_headcount}
                onChange={(e) =>
                  setProjectFormData({
                    ...projectFormData,
                    expected_headcount: e.target.value,
                  })
                }
                className="form-input w-full px-4 py-3 rounded-lg"
                placeholder="e.g., 75-100 employees"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Estimated Tenant Fee ($)
              </label>
              <input
                type="number"
                value={projectFormData.expected_fee}
                onChange={(e) =>
                  setProjectFormData({
                    ...projectFormData,
                    expected_fee: e.target.value,
                  })
                }
                className="form-input w-full px-4 py-3 rounded-lg"
                min="0"
                step="0.01"
                placeholder="0.00"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Broker Commission ($)
              </label>
              <input
                type="number"
                value={projectFormData.broker_commission}
                onChange={(e) =>
                  setProjectFormData({
                    ...projectFormData,
                    broker_commission: e.target.value,
                  })
                }
                className="form-input w-full px-4 py-3 rounded-lg"
                min="0"
                step="0.01"
                placeholder="0.00"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Commission Paid By
              </label>
              <input
                type="text"
                value={projectFormData.commission_paid_by}
                onChange={(e) =>
                  setProjectFormData({
                    ...projectFormData,
                    commission_paid_by: e.target.value,
                  })
                }
                className="form-input w-full px-4 py-3 rounded-lg"
                placeholder="e.g., Landlord, Tenant"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Payment Due
              </label>
              <input
                type="text"
                value={projectFormData.payment_due}
                onChange={(e) =>
                  setProjectFormData({
                    ...projectFormData,
                    payment_due: e.target.value,
                  })
                }
                className="form-input w-full px-4 py-3 rounded-lg"
                placeholder="e.g., Upon lease signing, 30 days after closing"
              />
            </div>
          </div>

          <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
            <FormButton variant="secondary" onClick={closeProjectModal}>
              Cancel
            </FormButton>
            <FormButton
              type="submit"
              loading={saving}
              disabled={!projectFormData.title.trim()}
            >
              Save Changes
            </FormButton>
          </div>
        </form>
      </Modal>

      {/* Contact Edit Modal */}
      <Modal
        isOpen={isContactModalOpen}
        onClose={closeContactModal}
        title={hasContact ? "Edit Contact" : "Add Contact"}
        size="md"
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            saveContact();
          }}
          className="space-y-4"
        >
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Contact Name *
            </label>
            <input
              type="text"
              value={contactFormData.name}
              onChange={(e) =>
                setContactFormData({ ...contactFormData, name: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter contact name"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Title
            </label>
            <input
              type="text"
              value={contactFormData.title}
              onChange={(e) =>
                setContactFormData({
                  ...contactFormData,
                  title: e.target.value,
                })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., Head of Operations"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Phone
            </label>
            <input
              type="tel"
              value={contactFormData.phone}
              onChange={(e) =>
                setContactFormData({
                  ...contactFormData,
                  phone: e.target.value,
                })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="(555) 123-4567"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email
            </label>
            <input
              type="email"
              value={contactFormData.email}
              onChange={(e) =>
                setContactFormData({
                  ...contactFormData,
                  email: e.target.value,
                })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="contact@company.com"
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <FormButton variant="secondary" onClick={closeContactModal}>
              Cancel
            </FormButton>
            <FormButton
              type="submit"
              loading={saving}
              disabled={!contactFormData.name.trim()}
            >
              {hasContact ? "Update Contact" : "Add Contact"}
            </FormButton>
          </div>
        </form>
      </Modal>
    </div>
  );
};
