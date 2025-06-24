import React, { useState, useEffect } from "react";
import {
  Building,
  MapPin,
  DollarSign,
  Users,
  Calendar,
  Clock,
  Plus,
  Edit3,
  Trash2,
  X,
  Save,
  ExternalLink,
  Home,
  FileText,
  CheckCircle,
  AlertCircle,
  XCircle,
} from "lucide-react";
import { useUser } from "@clerk/clerk-react";
import { useSupabaseClient } from "../../services/supabase";
import { DragDropList } from "./DragDropList";
import { useProjectData } from "../../hooks/useProjectData";
import { formatDisplayDateTime } from "../../utils/dateUtils";
import { Database } from "../../types/database";
import { useReorderState } from "../../hooks/useReorderState";
import { keyBeforeAll } from "../../utils/orderKey";
import { Constants } from "../../types/database";

interface PropertiesOfInterestProps {
  projectId?: string;
  shareId?: string;
  readonly?: boolean;
}

type Property = Database["public"]["Tables"]["properties"]["Row"];

interface PropertyFormData {
  name: string;
  address: string;
  sf: string;
  people_capacity: string;
  price_per_sf: string;
  monthly_cost: string;
  expected_monthly_cost: string;
  contract_term: string;
  availability: string;
  lease_type: string;
  lease_structure: string;
  current_state: Database["public"]["Enums"]["property_current_state"];
  condition: string;
  cam_rate: string;
  parking_rate: string;
  misc_notes: string;
  virtual_tour_url: string;
  suggestion: string;
  flier_url: string;
  tour_datetime: string;
  tour_location: string;
  tour_status: Database["public"]["Enums"]["tour_status"] | "";
  status: Database["public"]["Enums"]["property_status"];
  decline_reason: string;
}

const getStatusColor = (
  status: Database["public"]["Enums"]["property_status"],
) => {
  switch (status) {
    case "new":
      return "bg-blue-100 text-blue-800";
    case "active":
      return "bg-green-100 text-green-800";
    case "pending":
      return "bg-yellow-100 text-yellow-800";
    case "under_review":
      return "bg-purple-100 text-purple-800";
    case "negotiating":
      return "bg-orange-100 text-orange-800";
    case "on_hold":
      return "bg-gray-100 text-gray-600";
    case "declined":
      return "bg-red-100 text-red-800";
    case "accepted":
      return "bg-emerald-100 text-emerald-800";
    default:
      return "bg-gray-100 text-gray-600";
  }
};

const getCurrentStateColor = (
  state: Database["public"]["Enums"]["property_current_state"],
) => {
  switch (state) {
    case "Available":
      return "bg-green-100 text-green-800";
    case "Under Review":
      return "bg-blue-100 text-blue-800";
    case "Negotiating":
      return "bg-orange-100 text-orange-800";
    case "On Hold":
      return "bg-gray-100 text-gray-600";
    case "Declined":
      return "bg-red-100 text-red-800";
    default:
      return "bg-gray-100 text-gray-600";
  }
};

const getTourStatusIcon = (
  status: Database["public"]["Enums"]["tour_status"] | null,
) => {
  switch (status) {
    case "Scheduled":
      return { icon: Calendar, color: "text-blue-600" };
    case "Completed":
      return { icon: CheckCircle, color: "text-green-600" };
    case "Cancelled":
      return { icon: XCircle, color: "text-red-600" };
    case "Rescheduled":
      return { icon: AlertCircle, color: "text-orange-600" };
    default:
      return { icon: Clock, color: "text-gray-400" };
  }
};

export const PropertiesOfInterest: React.FC<PropertiesOfInterestProps> = ({
  projectId,
  shareId,
  readonly = false,
}) => {
  const { user } = useUser();
  const supabase = useSupabaseClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProperty, setEditingProperty] = useState<Property | null>(null);
  const [formData, setFormData] = useState<PropertyFormData>({
    name: "",
    address: "",
    sf: "",
    people_capacity: "",
    price_per_sf: "",
    monthly_cost: "",
    expected_monthly_cost: "",
    contract_term: "",
    availability: "",
    lease_type: "",
    lease_structure: "",
    current_state: "Available",
    condition: "",
    cam_rate: "",
    parking_rate: "",
    misc_notes: "",
    virtual_tour_url: "",
    suggestion: "",
    flier_url: "",
    tour_datetime: "",
    tour_location: "",
    tour_status: "",
    status: "new",
    decline_reason: "",
  });
  const [saving, setSaving] = useState(false);

  // Use unified data hook for both public and authenticated modes
  const {
    data: initialProperties,
    loading,
    refetch: fetchProperties,
  } = useProjectData<Property>({
    projectId,
    shareId,
    dataType: "properties",
  });

  // Local state for optimistic updates
  const [properties, setProperties] = useState(initialProperties);

  // Initialize reorder state first (needed for useEffect dependency)
  const { handleReorder, isReordering, reorderError, clearError } =
    useReorderState(
      properties,
      setProperties, // Now provides real optimistic updates
      {
        tableName: "properties",
        supabase,
        onSuccess: () => {
          fetchProperties();
        },
        onError: (error) => {
          console.error("Error reordering properties:", error);
          alert("Error reordering properties. Please try again.");
        },
      },
    );

  // Update local state when initial data changes (but not during reordering)
  useEffect(() => {
    if (!isReordering) {
      setProperties(initialProperties);
    }
  }, [initialProperties, isReordering]);

  const resetForm = () => {
    setFormData({
      name: "",
      address: "",
      sf: "",
      people_capacity: "",
      price_per_sf: "",
      monthly_cost: "",
      expected_monthly_cost: "",
      contract_term: "",
      availability: "",
      lease_type: "",
      lease_structure: "",
      current_state: "Available",
      condition: "",
      cam_rate: "",
      parking_rate: "",
      misc_notes: "",
      virtual_tour_url: "",
      suggestion: "",
      flier_url: "",
      tour_datetime: "",
      tour_location: "",
      tour_status: "",
      status: "new",
      decline_reason: "",
    });
    setEditingProperty(null);
  };

  const openAddModal = () => {
    resetForm();
    setIsModalOpen(true);
  };

  const openEditModal = (property: Property) => {
    setFormData({
      name: property.name,
      address: property.address || "",
      sf: property.sf || "",
      people_capacity: property.people_capacity || "",
      price_per_sf: property.price_per_sf || "",
      monthly_cost: property.monthly_cost || "",
      expected_monthly_cost: property.expected_monthly_cost || "",
      contract_term: property.contract_term || "",
      availability: property.availability || "",
      lease_type: property.lease_type || "",
      lease_structure: property.lease_structure || "",
      current_state: property.current_state,
      condition: property.condition || "",
      cam_rate: property.cam_rate || "",
      parking_rate: property.parking_rate || "",
      misc_notes: property.misc_notes || "",
      virtual_tour_url: property.virtual_tour_url || "",
      suggestion: property.suggestion || "",
      flier_url: property.flier_url || "",
      tour_datetime: property.tour_datetime
        ? new Date(property.tour_datetime).toISOString().slice(0, 16)
        : "",
      tour_location: property.tour_location || "",
      tour_status: property.tour_status || "",
      status: property.status,
      decline_reason: property.decline_reason || "",
    });
    setEditingProperty(property);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    resetForm();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !formData.name.trim() || readonly || !projectId) return;

    setSaving(true);
    try {
      const propertyData = {
        project_id: projectId,
        name: formData.name.trim(),
        address: formData.address.trim() || null,
        sf: formData.sf.trim() || null,
        people_capacity: formData.people_capacity.trim() || null,
        price_per_sf: formData.price_per_sf.trim() || null,
        monthly_cost: formData.monthly_cost.trim() || null,
        expected_monthly_cost: formData.expected_monthly_cost.trim() || null,
        contract_term: formData.contract_term.trim() || null,
        availability: formData.availability.trim() || null,
        lease_type: formData.lease_type.trim() || null,
        lease_structure: formData.lease_structure.trim() || null,
        current_state: formData.current_state,
        condition: formData.condition.trim() || null,
        cam_rate: formData.cam_rate.trim() || null,
        parking_rate: formData.parking_rate.trim() || null,
        misc_notes: formData.misc_notes.trim() || null,
        virtual_tour_url: formData.virtual_tour_url.trim() || null,
        suggestion: formData.suggestion.trim() || null,
        flier_url: formData.flier_url.trim() || null,
        tour_datetime: formData.tour_datetime
          ? new Date(formData.tour_datetime).toISOString()
          : null,
        tour_location: formData.tour_location.trim() || null,
        tour_status: formData.tour_status || null,
        status: formData.status,
        decline_reason: formData.decline_reason.trim() || null,
        order_key: editingProperty
          ? editingProperty.order_key
          : keyBeforeAll(properties),
      };

      if (editingProperty) {
        // Update existing property
        const { error } = await supabase
          .from("properties")
          .update(propertyData)
          .eq("id", editingProperty.id);

        if (error) throw error;
      } else {
        // Create new property
        const { error } = await supabase
          .from("properties")
          .insert([propertyData]);

        if (error) throw error;
      }

      await fetchProperties();
      closeModal();
    } catch (error) {
      console.error("Error saving property:", error);
      alert("Error saving property. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (propertyId: string) => {
    if (
      readonly ||
      !confirm("Are you sure you want to delete this property?")
    ) {
      return;
    }

    try {
      const { error } = await supabase
        .from("properties")
        .delete()
        .eq("id", propertyId);

      if (error) throw error;

      await fetchProperties();
    } catch (error) {
      console.error("Error deleting property:", error);
      alert("Error deleting property. Please try again.");
    }
  };

  if (loading) {
    return (
      <div className="bg-white p-6 border border-gray-200 rounded-lg">
        <div className="text-center text-gray-500">Loading properties...</div>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 border border-gray-200 rounded-lg">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-gray-900">
          Properties of Interest
        </h3>
        {!readonly && (
          <button
            onClick={openAddModal}
            className="flex items-center space-x-2 px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span className="text-sm">Add Property</span>
          </button>
        )}
      </div>

      {properties.length === 0 ? (
        <div className="text-center py-12">
          <Building className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h4 className="text-lg font-semibold text-gray-900 mb-2">
            No properties yet
          </h4>
          <p className="text-gray-600 mb-6">
            {readonly
              ? "No properties have been added to this project"
              : "Add properties to track potential office spaces"}
          </p>
          {!readonly && (
            <button
              onClick={openAddModal}
              className="flex items-center space-x-2 px-4 py-2 bg-gray-900 text-white text-sm rounded-lg hover:bg-gray-800 transition-colors mx-auto"
            >
              <Plus className="w-4 h-4" />
              <span>Add First Property</span>
            </button>
          )}
        </div>
      ) : readonly ? (
        // Static view for readonly mode
        <div className="space-y-4">
          {properties.map((property) => {
            const { icon: TourIcon, color: tourColor } = getTourStatusIcon(
              property.tour_status,
            );
            return (
              <div
                key={property.id}
                className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h4 className="text-lg font-semibold text-gray-900">
                        {property.name}
                      </h4>
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(
                          property.status,
                        )}`}
                      >
                        {property.status}
                      </span>
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded-full ${getCurrentStateColor(
                          property.current_state,
                        )}`}
                      >
                        {property.current_state}
                      </span>
                    </div>
                    {property.address && (
                      <div className="flex items-center space-x-2 text-gray-600 mb-3">
                        <MapPin className="w-4 h-4" />
                        <span className="text-sm">{property.address}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  {property.sf && (
                    <div className="flex items-center space-x-2">
                      <Home className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-600">
                        {property.sf} sq ft
                      </span>
                    </div>
                  )}
                  {property.monthly_cost && (
                    <div className="flex items-center space-x-2">
                      <DollarSign className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-600">
                        ${property.monthly_cost}/month
                      </span>
                    </div>
                  )}
                  {property.people_capacity && (
                    <div className="flex items-center space-x-2">
                      <Users className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-600">
                        {property.people_capacity} people
                      </span>
                    </div>
                  )}
                </div>

                {property.tour_datetime && (
                  <div className="flex items-center space-x-2 mb-4 p-3 bg-blue-50 rounded-lg">
                    <TourIcon className={`w-4 h-4 ${tourColor}`} />
                    <span className="text-sm font-medium text-blue-900">
                      Tour: {formatDisplayDateTime(property.tour_datetime)}
                    </span>
                    {property.tour_location && (
                      <span className="text-sm text-blue-700">
                        at {property.tour_location}
                      </span>
                    )}
                  </div>
                )}

                {property.suggestion && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
                    <div className="flex items-start space-x-2">
                      <FileText className="w-4 h-4 text-yellow-600 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-yellow-800">
                          Broker Notes:
                        </p>
                        <p className="text-sm text-yellow-700">
                          {property.suggestion}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex items-center space-x-4">
                  {property.virtual_tour_url && (
                    <a
                      href={property.virtual_tour_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center space-x-1 text-blue-600 hover:text-blue-800 text-sm"
                    >
                      <ExternalLink className="w-4 h-4" />
                      <span>Virtual Tour</span>
                    </a>
                  )}
                  {property.flier_url && (
                    <a
                      href={property.flier_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center space-x-1 text-blue-600 hover:text-blue-800 text-sm"
                    >
                      <FileText className="w-4 h-4" />
                      <span>Property Flier</span>
                    </a>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        // Interactive view for authenticated mode with drag and drop
        <DragDropList
          items={properties}
          onReorder={handleReorder}
          disabled={readonly || isReordering}
          showHandle={true}
        >
          {(property) => {
            const { icon: TourIcon, color: tourColor } = getTourStatusIcon(
              property.tour_status,
            );
            return (
              <div
                key={property.id}
                className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow group relative"
              >
                {isReordering && (
                  <div className="absolute inset-0 bg-white/50 flex items-center justify-center rounded-lg">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
                  </div>
                )}

                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h4 className="text-lg font-semibold text-gray-900">
                        {property.name}
                      </h4>
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(
                          property.status,
                        )}`}
                      >
                        {property.status}
                      </span>
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded-full ${getCurrentStateColor(
                          property.current_state,
                        )}`}
                      >
                        {property.current_state}
                      </span>
                    </div>
                    {property.address && (
                      <div className="flex items-center space-x-2 text-gray-600 mb-3">
                        <MapPin className="w-4 h-4" />
                        <span className="text-sm">{property.address}</span>
                      </div>
                    )}
                  </div>
                  {!readonly && (
                    <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => openEditModal(property)}
                        className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                        title="Edit property"
                        disabled={isReordering}
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(property.id)}
                        className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                        title="Delete property"
                        disabled={isReordering}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  {property.sf && (
                    <div className="flex items-center space-x-2">
                      <Home className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-600">
                        {property.sf} sq ft
                      </span>
                    </div>
                  )}
                  {property.monthly_cost && (
                    <div className="flex items-center space-x-2">
                      <DollarSign className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-600">
                        ${property.monthly_cost}/month
                      </span>
                    </div>
                  )}
                  {property.people_capacity && (
                    <div className="flex items-center space-x-2">
                      <Users className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-600">
                        {property.people_capacity} people
                      </span>
                    </div>
                  )}
                </div>

                {property.tour_datetime && (
                  <div className="flex items-center space-x-2 mb-4 p-3 bg-blue-50 rounded-lg">
                    <TourIcon className={`w-4 h-4 ${tourColor}`} />
                    <span className="text-sm font-medium text-blue-900">
                      Tour: {formatDisplayDateTime(property.tour_datetime)}
                    </span>
                    {property.tour_location && (
                      <span className="text-sm text-blue-700">
                        at {property.tour_location}
                      </span>
                    )}
                  </div>
                )}

                {property.suggestion && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
                    <div className="flex items-start space-x-2">
                      <FileText className="w-4 h-4 text-yellow-600 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-yellow-800">
                          Broker Notes:
                        </p>
                        <p className="text-sm text-yellow-700">
                          {property.suggestion}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {property.decline_reason && property.status === "declined" && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
                    <div className="flex items-start space-x-2">
                      <XCircle className="w-4 h-4 text-red-600 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-red-800">
                          Decline Reason:
                        </p>
                        <p className="text-sm text-red-700">
                          {property.decline_reason}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex items-center space-x-4">
                  {property.virtual_tour_url && (
                    <a
                      href={property.virtual_tour_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center space-x-1 text-blue-600 hover:text-blue-800 text-sm"
                    >
                      <ExternalLink className="w-4 h-4" />
                      <span>Virtual Tour</span>
                    </a>
                  )}
                  {property.flier_url && (
                    <a
                      href={property.flier_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center space-x-1 text-blue-600 hover:text-blue-800 text-sm"
                    >
                      <FileText className="w-4 h-4" />
                      <span>Property Flier</span>
                    </a>
                  )}
                </div>
              </div>
            );
          }}
        </DragDropList>
      )}

      {reorderError && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-red-800">{reorderError}</span>
            <button
              onClick={clearError}
              className="text-red-600 hover:text-red-800"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Add/Edit Modal - only show if not readonly */}
      {isModalOpen && !readonly && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b">
              <h3 className="text-lg font-semibold text-gray-900">
                {editingProperty ? "Edit Property" : "Add New Property"}
              </h3>
              <button
                onClick={closeModal}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {/* Basic Information */}
              <div>
                <h4 className="text-md font-semibold text-gray-900 mb-4">
                  Basic Information
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Property Name *
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500"
                      placeholder="Enter property name"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Address
                    </label>
                    <input
                      type="text"
                      value={formData.address}
                      onChange={(e) =>
                        setFormData({ ...formData, address: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500"
                      placeholder="Enter property address"
                    />
                  </div>
                </div>
              </div>

              {/* Property Details */}
              <div>
                <h4 className="text-md font-semibold text-gray-900 mb-4">
                  Property Details
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Square Feet
                    </label>
                    <input
                      type="text"
                      value={formData.sf}
                      onChange={(e) =>
                        setFormData({ ...formData, sf: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500"
                      placeholder="e.g., 15,000"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      People Capacity
                    </label>
                    <input
                      type="text"
                      value={formData.people_capacity}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          people_capacity: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500"
                      placeholder="e.g., 75-100"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Availability
                    </label>
                    <input
                      type="text"
                      value={formData.availability}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          availability: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500"
                      placeholder="e.g., Available March 2024"
                    />
                  </div>
                </div>
              </div>

              {/* Financial Information */}
              <div>
                <h4 className="text-md font-semibold text-gray-900 mb-4">
                  Financial Information
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Price per SF
                    </label>
                    <input
                      type="text"
                      value={formData.price_per_sf}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          price_per_sf: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500"
                      placeholder="e.g., $24"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Monthly Cost
                    </label>
                    <input
                      type="text"
                      value={formData.monthly_cost}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          monthly_cost: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500"
                      placeholder="e.g., 37,000"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Expected Monthly Cost
                    </label>
                    <input
                      type="text"
                      value={formData.expected_monthly_cost}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          expected_monthly_cost: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500"
                      placeholder="e.g., 35,000"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      CAM Rate
                    </label>
                    <input
                      type="text"
                      value={formData.cam_rate}
                      onChange={(e) =>
                        setFormData({ ...formData, cam_rate: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500"
                      placeholder="e.g., $3.50/sf"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Parking Rate
                    </label>
                    <input
                      type="text"
                      value={formData.parking_rate}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          parking_rate: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500"
                      placeholder="e.g., $150/month"
                    />
                  </div>
                </div>
              </div>

              {/* Lease Information */}
              <div>
                <h4 className="text-md font-semibold text-gray-900 mb-4">
                  Lease Information
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Lease Type
                    </label>
                    <select
                      value={formData.lease_type}
                      onChange={(e) =>
                        setFormData({ ...formData, lease_type: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500"
                    >
                      <option value="">Select lease type</option>
                      <option value="Direct Lease">Direct Lease</option>
                      <option value="Sublease">Sublease</option>
                      <option value="Sub-sublease">Sub-sublease</option>
                      <option value="Coworking">Coworking</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Lease Structure
                    </label>
                    <select
                      value={formData.lease_structure}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          lease_structure: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500"
                    >
                      <option value="">Select structure</option>
                      <option value="NNN">NNN</option>
                      <option value="Full Service">Full Service</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Contract Term
                    </label>
                    <input
                      type="text"
                      value={formData.contract_term}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          contract_term: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500"
                      placeholder="e.g., 3-5 years"
                    />
                  </div>
                </div>
              </div>

              {/* Status Information */}
              <div>
                <h4 className="text-md font-semibold text-gray-900 mb-4">
                  Status Information
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Status
                    </label>
                    <select
                      value={formData.status}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          status: e.target
                            .value as Database["public"]["Enums"]["property_status"],
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500"
                    >
                      {Constants.public.Enums.property_status.map((status) => (
                        <option key={status} value={status}>
                          {status.replace("_", " ")}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Current State
                    </label>
                    <select
                      value={formData.current_state}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          current_state: e.target
                            .value as Database["public"]["Enums"]["property_current_state"],
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500"
                    >
                      {Constants.public.Enums.property_current_state.map(
                        (state) => (
                          <option key={state} value={state}>
                            {state}
                          </option>
                        ),
                      )}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Condition
                    </label>
                    <select
                      value={formData.condition}
                      onChange={(e) =>
                        setFormData({ ...formData, condition: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500"
                    >
                      <option value="">Select condition</option>
                      <option value="Plug & Play">Plug & Play</option>
                      <option value="Built-out">Built-out</option>
                      <option value="White Box">White Box</option>
                      <option value="Shell Space">Shell Space</option>
                      <option value="Turnkey">Turnkey</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Tour Information */}
              <div>
                <h4 className="text-md font-semibold text-gray-900 mb-4">
                  Tour Information
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Tour Date & Time
                    </label>
                    <input
                      type="datetime-local"
                      value={formData.tour_datetime}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          tour_datetime: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Tour Location
                    </label>
                    <input
                      type="text"
                      value={formData.tour_location}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          tour_location: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500"
                      placeholder="e.g., Main lobby"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Tour Status
                    </label>
                    <select
                      value={formData.tour_status}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          tour_status: e.target
                            .value as Database["public"]["Enums"]["tour_status"],
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500"
                    >
                      <option value="">No tour scheduled</option>
                      {Constants.public.Enums.tour_status.map((status) => (
                        <option key={status} value={status}>
                          {status}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* URLs */}
              <div>
                <h4 className="text-md font-semibold text-gray-900 mb-4">
                  Links & Documents
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Virtual Tour URL
                    </label>
                    <input
                      type="url"
                      value={formData.virtual_tour_url}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          virtual_tour_url: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500"
                      placeholder="https://..."
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Property Flier URL
                    </label>
                    <input
                      type="url"
                      value={formData.flier_url}
                      onChange={(e) =>
                        setFormData({ ...formData, flier_url: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500"
                      placeholder="https://..."
                    />
                  </div>
                </div>
              </div>

              {/* Notes */}
              <div>
                <h4 className="text-md font-semibold text-gray-900 mb-4">
                  Notes & Comments
                </h4>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Broker Suggestion
                    </label>
                    <textarea
                      value={formData.suggestion}
                      onChange={(e) =>
                        setFormData({ ...formData, suggestion: e.target.value })
                      }
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500"
                      placeholder="Your recommendation or notes about this property..."
                    />
                  </div>
                  {formData.status === "declined" && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Decline Reason
                      </label>
                      <textarea
                        value={formData.decline_reason}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            decline_reason: e.target.value,
                          })
                        }
                        rows={2}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500"
                        placeholder="Why was this property declined?"
                      />
                    </div>
                  )}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Additional Notes
                    </label>
                    <textarea
                      value={formData.misc_notes}
                      onChange={(e) =>
                        setFormData({ ...formData, misc_notes: e.target.value })
                      }
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500"
                      placeholder="Any additional notes or details..."
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving || !formData.name.trim()}
                  className="flex items-center space-x-2 px-4 py-2 bg-gray-900 text-white rounded-md hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Save className="w-4 h-4" />
                  <span>
                    {saving
                      ? "Saving..."
                      : editingProperty
                        ? "Update Property"
                        : "Add Property"}
                  </span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
