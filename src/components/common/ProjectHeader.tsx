import React, { useState, useEffect, useCallback } from "react";
import { useUser } from "@clerk/clerk-react";
import { useSupabaseClient } from "../../services/supabase";
import type { Database } from "../../types/database";
import { useProjectData } from "../../hooks/useProjectData";
import { ClientRequirementsSection } from "./ClientRequirementsSection";
import { ContactModal } from "./ContactModal";
import { Modal } from "../ui/Modal";
import { FormButton } from "../ui/FormButton";
import { nowISO } from "../../utils/dateUtils";
import { Constants } from "../../types/database";
import { ProjectInfo } from "../ProjectHeader/ProjectInfo";
import { KPICards } from "../ProjectHeader/KPICards";
import { ContactSection } from "../ProjectHeader/ContactSection";
import toast from "react-hot-toast";

// Type aliases for better readability
type ProjectRow = Database["public"]["Tables"]["projects"]["Row"];
type ProjectUpdate = Database["public"]["Tables"]["projects"]["Update"];

interface ProjectHeaderProps {
  project: ProjectRow;
  onProjectUpdate?: () => void;
  readonly?: boolean;
  shareId?: string;
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
  expected_contract_value: string;
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
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const [isBrokerContactModalOpen, setIsBrokerContactModalOpen] =
    useState(false);
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
    expected_contract_value: "",
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
      expected_contract_value:
        project.expected_contract_value?.toString() || "",
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
        expected_contract_value: projectFormData.expected_contract_value
          ? parseFloat(projectFormData.expected_contract_value)
          : null,
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
      toast.error("Error updating project. Please try again.");
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
  const hasBrokerContact = project.broker_contact_name;

  const openContactModal = () => {
    setIsContactModalOpen(true);
  };

  const openBrokerContactModal = () => {
    setIsBrokerContactModalOpen(true);
  };

  const closeContactModal = () => {
    setIsContactModalOpen(false);
  };

  const closeBrokerContactModal = () => {
    setIsBrokerContactModalOpen(false);
  };

  const saveContact = async (contactData: {
    name: string;
    title: string;
    phone: string;
    email: string;
  }) => {
    setSaving(true);
    try {
      const updateData = {
        contact_name: contactData.name.trim(),
        contact_title: contactData.title.trim() || null,
        contact_phone: contactData.phone.trim() || null,
        contact_email: contactData.email.trim() || null,
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
      toast.error("Error saving contact. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const saveBrokerContact = async (brokerData: {
    name: string;
    title: string;
    phone: string;
    email: string;
    brokerage?: string;
  }) => {
    setSaving(true);
    try {
      const updateData = {
        broker_contact_name: brokerData.name.trim(),
        broker_contact_title: brokerData.title.trim() || null,
        broker_contact_phone: brokerData.phone.trim() || null,
        broker_contact_email: brokerData.email.trim() || null,
        brokerage: brokerData.brokerage?.trim() || null,
        updated_at: nowISO(),
      };

      const { error } = await supabase
        .from("projects")
        .update(updateData)
        .eq("id", project.id);

      if (error) throw error;

      setIsBrokerContactModalOpen(false);
      onProjectUpdate?.();
    } catch {
      toast.error("Error saving broker contact. Please try again.");
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
      toast.error("Error removing contact. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const deleteBrokerContact = async () => {
    if (!confirm("Are you sure you want to remove the broker contact?")) return;

    setSaving(true);
    try {
      const updateData = {
        broker_contact_name: null,
        broker_contact_title: null,
        broker_contact_phone: null,
        broker_contact_email: null,
        brokerage: null,
        updated_at: nowISO(),
      };

      const { error } = await supabase
        .from("projects")
        .update(updateData)
        .eq("id", project.id);

      if (error) throw error;
      onProjectUpdate?.();
    } catch {
      toast.error("Error removing broker contact. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="dashboard-card p-8">
      <ProjectInfo
        project={project}
        readonly={readonly}
        onOpenProjectModal={openProjectModal}
      />

      <KPICards project={project} readonly={readonly} />

      <ContactSection
        project={project}
        readonly={readonly}
        saving={saving}
        onOpenContactModal={openContactModal}
        onOpenBrokerContactModal={openBrokerContactModal}
        onDeleteContact={deleteContact}
        onDeleteBrokerContact={deleteBrokerContact}
      />

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
                {Constants.public.Enums.project_status.map((status) => (
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
                Lease Value ($)
              </label>
              <input
                type="number"
                value={projectFormData.expected_contract_value}
                onChange={(e) =>
                  setProjectFormData({
                    ...projectFormData,
                    expected_contract_value: e.target.value,
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

      {/* Contact Modals */}
      <ContactModal
        isOpen={isContactModalOpen}
        onClose={closeContactModal}
        onSave={saveContact}
        onDelete={hasContact ? deleteContact : undefined}
        initialData={{
          name: project.contact_name || "",
          title: project.contact_title || "",
          phone: project.contact_phone || "",
          email: project.contact_email || "",
        }}
        type="contact"
        hasExistingContact={!!hasContact}
        saving={saving}
      />

      <ContactModal
        isOpen={isBrokerContactModalOpen}
        onClose={closeBrokerContactModal}
        onSave={saveBrokerContact}
        onDelete={hasBrokerContact ? deleteBrokerContact : undefined}
        initialData={{
          name: project.broker_contact_name || "",
          title: project.broker_contact_title || "",
          phone: project.broker_contact_phone || "",
          email: project.broker_contact_email || "",
          brokerage: project.brokerage || "",
        }}
        type="broker"
        hasExistingContact={!!hasBrokerContact}
        saving={saving}
      />
    </div>
  );
};
