import React, { useState, useEffect } from "react";
import { Modal } from "../ui/Modal";
import { FormButton } from "../ui/FormButton";

interface ContactFormData {
  name: string;
  title: string;
  phone: string;
  email: string;
  brokerage?: string;
}

interface ContactModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: ContactFormData) => Promise<void>;
  onDelete?: () => Promise<void>;
  initialData?: Partial<ContactFormData>;
  type: "contact" | "broker";
  hasExistingContact?: boolean;
  saving?: boolean;
}

export const ContactModal: React.FC<ContactModalProps> = ({
  isOpen,
  onClose,
  onSave,
  onDelete,
  initialData = {},
  type,
  hasExistingContact = false,
  saving = false,
}) => {
  const [formData, setFormData] = useState<ContactFormData>({
    name: "",
    title: "",
    phone: "",
    email: "",
    brokerage: "",
  });

  useEffect(() => {
    if (isOpen) {
      setFormData({
        name: initialData.name || "",
        title: initialData.title || "",
        phone: initialData.phone || "",
        email: initialData.email || "",
        brokerage: initialData.brokerage || "",
      });
    }
  }, [isOpen, initialData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;
    if (type === "broker" && !formData.brokerage?.trim()) return;

    await onSave(formData);
  };

  const handleDelete = async () => {
    if (!onDelete) return;

    const confirmMessage =
      type === "broker"
        ? "Are you sure you want to remove the broker contact?"
        : "Are you sure you want to remove this contact?";

    if (confirm(confirmMessage)) {
      await onDelete();
    }
  };

  const isBroker = type === "broker";
  const title = hasExistingContact
    ? isBroker
      ? "Edit Broker Contact"
      : "Edit Contact"
    : isBroker
      ? "Add Broker Contact"
      : "Add Contact";

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} size="md">
      <form onSubmit={handleSubmit} className="space-y-4">
        {isBroker && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Brokerage *
            </label>
            <input
              type="text"
              value={formData.brokerage}
              onChange={(e) =>
                setFormData({ ...formData, brokerage: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., CBRE, JLL, Cushman & Wakefield"
              required
            />
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {isBroker ? "Broker Name" : "Contact Name"} *
          </label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder={isBroker ? "Enter broker name" : "Enter contact name"}
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Title
          </label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) =>
              setFormData({ ...formData, title: e.target.value })
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder={
              isBroker
                ? "e.g., Commercial Real Estate Broker"
                : "e.g., Head of Operations"
            }
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Phone
          </label>
          <input
            type="tel"
            value={formData.phone}
            onChange={(e) =>
              setFormData({ ...formData, phone: e.target.value })
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
            value={formData.email}
            onChange={(e) =>
              setFormData({ ...formData, email: e.target.value })
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder={
              isBroker ? "broker@company.com" : "contact@company.com"
            }
          />
        </div>

        <div className="flex justify-between pt-4">
          <div>
            {hasExistingContact && onDelete && (
              <FormButton
                variant="danger"
                onClick={handleDelete}
                disabled={saving}
                type="button"
              >
                Delete {isBroker ? "Broker" : "Contact"}
              </FormButton>
            )}
          </div>
          <div className="flex space-x-3">
            <FormButton variant="secondary" onClick={onClose} type="button">
              Cancel
            </FormButton>
            <FormButton
              type="submit"
              loading={saving}
              disabled={
                !formData.name.trim() ||
                (isBroker && !formData.brokerage?.trim())
              }
            >
              {hasExistingContact
                ? `Update ${isBroker ? "Broker" : "Contact"}`
                : `Add ${isBroker ? "Broker" : "Contact"}`}
            </FormButton>
          </div>
        </div>
      </form>
    </Modal>
  );
};
