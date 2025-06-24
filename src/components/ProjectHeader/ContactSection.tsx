import React from "react";
import { User, Phone, Mail, Building, Briefcase, Edit3, X } from "lucide-react";
import type { Database } from "../../types/database";

type ProjectRow = Database["public"]["Tables"]["projects"]["Row"];

interface ContactSectionProps {
  project: ProjectRow;
  readonly?: boolean;
  saving?: boolean;
  onOpenContactModal: () => void;
  onOpenBrokerContactModal: () => void;
  onDeleteContact: () => void;
  onDeleteBrokerContact: () => void;
}

export const ContactSection: React.FC<ContactSectionProps> = ({
  project,
  readonly = false,
  saving = false,
  onOpenContactModal,
  onOpenBrokerContactModal,
  onDeleteContact,
  onDeleteBrokerContact,
}) => {
  const hasContact = project.contact_name;
  const hasBrokerContact = project.broker_contact_name;

  return (
    <>
      {/* Broker Information */}
      <div className="bg-blue-50 rounded-xl p-6 mb-8 border border-blue-200">
        <div className="flex items-center justify-between mb-4">
          <h4 className="font-bold text-blue-900 flex items-center space-x-2">
            <Briefcase className="w-5 h-5 text-blue-800" />
            <span>Your Broker</span>
          </h4>
          {!readonly && (
            <div className="flex items-center space-x-2">
              {hasBrokerContact && (
                <button
                  onClick={onDeleteBrokerContact}
                  className="p-2 text-blue-400 hover:text-red-600 transition-colors rounded-lg hover:bg-red-50"
                  title="Remove broker contact"
                  disabled={saving}
                >
                  <X className="w-4 h-4" />
                </button>
              )}
              <button
                onClick={onOpenBrokerContactModal}
                className="p-2 text-blue-400 hover:text-blue-600 transition-colors rounded-lg hover:bg-blue-100"
                title={
                  hasBrokerContact
                    ? "Edit broker contact"
                    : "Add broker contact"
                }
              >
                <Edit3 className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        {hasBrokerContact ? (
          <div className="space-y-4">
            {/* Brokerage Name */}
            {project.brokerage && (
              <div className="bg-blue-100 rounded-lg p-4 border border-blue-200">
                <div className="flex items-center space-x-3">
                  <Building className="w-5 h-5 text-blue-700" />
                  <div>
                    <p className="text-sm font-medium text-blue-700">
                      Brokerage
                    </p>
                    <p className="text-lg font-bold text-blue-900">
                      {project.brokerage}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Broker Contact Details */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-blue-800 rounded-full flex items-center justify-center">
                  <Briefcase className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="font-semibold text-blue-900">
                    {project.broker_contact_name}
                  </p>
                  {project.broker_contact_title && (
                    <p className="text-sm text-blue-700">
                      {project.broker_contact_title}
                    </p>
                  )}
                </div>
              </div>
              {project.broker_contact_phone && (
                <div className="flex items-center space-x-3">
                  <Phone className="w-5 h-5 text-blue-600" />
                  <span className="text-blue-900">
                    {project.broker_contact_phone}
                  </span>
                </div>
              )}
              {project.broker_contact_email && (
                <div className="flex items-center space-x-3">
                  <Mail className="w-5 h-5 text-blue-600" />
                  <span className="text-blue-900">
                    {project.broker_contact_email}
                  </span>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="text-center py-6">
            <Briefcase className="w-12 h-12 text-blue-300 mx-auto mb-3" />
            <p className="text-blue-600 mb-4">
              No broker information added yet
            </p>
            {!readonly && (
              <button
                onClick={onOpenBrokerContactModal}
                className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
              >
                Add Broker Info
              </button>
            )}
          </div>
        )}
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
                  onClick={onDeleteContact}
                  className="p-2 text-gray-400 hover:text-red-600 transition-colors rounded-lg hover:bg-red-50"
                  title="Remove contact"
                  disabled={saving}
                >
                  <X className="w-4 h-4" />
                </button>
              )}
              <button
                onClick={onOpenContactModal}
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
                onClick={onOpenContactModal}
                className="px-4 py-2 bg-gray-900 text-white text-sm rounded-lg hover:bg-gray-800 transition-colors"
              >
                Add Contact
              </button>
            )}
          </div>
        )}
      </div>
    </>
  );
};
