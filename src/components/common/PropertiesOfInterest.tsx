import React, { useState, useEffect, useCallback } from "react";
import {
  Building,
  MapPin,
  Users,
  DollarSign,
  Calendar,
  Plus,
  Edit3,
  Trash2,
  X,
  Save,
  ExternalLink,
  Car,
  Clock,
  CheckCircle,
  AlertCircle,
  XCircle,
} from "lucide-react";
import { useUser } from "@clerk/clerk-react";
import { useSupabaseClient } from "../../services/supabase";
import { DragDropList } from "./DragDropList";
import { useProjectData } from "../../hooks/useProjectData";
import { formatDate } from "../../utils/dateUtils";

interface PropertiesOfInterestProps {
  projectId?: string;
  shareId?: string;
  readonly?: boolean;
}

interface Property {
  id: string;
  name: string;
  address?: string | null;
  sf?: string | null;
  people_capacity?: string | null;
  price_per_sf?: string | null;
  monthly_cost?: string | null;
  expected_monthly_cost?: string | null;
  contract_term?: string | null;
  availability?: string | null;
  lease_type?: string | null;
  lease_structure?: string | null;
  current_state?: string | null;
  condition?: string | null;
  cam_rate?: string | null;
  parking_rate?: string | null;
  misc_notes?: string | null;
  virtual_tour_url?: string | null;
  suggestion?: string | null;
  flier_url?: string | null;
  tour_datetime?: string | null;
  tour_location?: string | null;
  tour_status?: string | null;
  status: string;
  decline_reason?: string | null;
  order_index?: number | null;
  created_at: string;
  updated_at: string;
}

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
  current_state: string;
  condition: string;
  cam_rate: string;
  parking_rate: string;
  misc_notes: string;
  virtual_tour_url: string;
  suggestion: string;
  flier_url: string;
  tour_datetime: string;
  tour_location: string;
  tour_status: string;
  status: string;
  decline_reason: string;
}

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
    current_state: "",
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
    data: properties,
    loading,
    refetch: fetchProperties,
  } = useProjectData<Property>({
    projectId,
    shareId,
    dataType: "properties",
  });

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
      current_state: "",
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
      current_state: property.current_state || "",
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
    if (!user || !formData.name.trim() || readonly) return;

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
        lease_type: formData.lease_type || null,
        lease_structure: formData.lease_structure || null,
        current_state: formData.current_state || null,
        condition: formData.condition || null,
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
        order_index: editingProperty
          ? editingProperty.order_index
          : properties.length,
        updated_at: new Date().toISOString(),
      };

      if (editingProperty) {
        const { error } = await supabase
          .from("properties")
          .update(propertyData)
          .eq("id", editingProperty.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("properties")
          .insert([propertyData]);

        if (error) throw error;
      }

      await fetchProperties();
      closeModal();
    } catch {
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
    } catch {
      alert("Error deleting property. Please try again.");
    }
  };

  const handleReorder = async (oldIndex: number, newIndex: number) => {
    if (readonly) return;

    // Optimistically update the UI
    const sortedProperties = [...properties].sort((a, b) => {
      const aOrder = a.order_index ?? 999999;
      const bOrder = b.order_index ?? 999999;
      return aOrder - bOrder;
    });

    const reorderedProperties = [...sortedProperties];
    const [removed] = reorderedProperties.splice(oldIndex, 1);
    reorderedProperties.splice(newIndex, 0, removed);

    // Update order_index for all properties
    const updates = reorderedProperties.map((property, index) => ({
      id: property.id,
      order_index: index,
    }));

    try {
      // Update each property's order_index in the database
      for (const update of updates) {
        const { error } = await supabase
          .from("properties")
          .update({ order_index: update.order_index })
          .eq("id", update.id);

        if (error) throw error;
      }

      // Refresh the data
      await fetchProperties();
    } catch {
      alert("Error reordering properties. Please try again.");
      // Refresh on error to revert optimistic update
      await fetchProperties();
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800";
      case "new":
        return "bg-blue-100 text-blue-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "declined":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getCurrentStateColor = (state: string) => {
    switch (state) {
      case "Available":
        return "bg-green-100 text-green-800";
      case "Under Review":
        return "bg-blue-100 text-blue-800";
      case "Negotiating":
        return "bg-purple-100 text-purple-800";
      case "On Hold":
        return "bg-yellow-100 text-yellow-800";
      case "Declined":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getTourStatusIcon = (status: string) => {
    switch (status) {
      case "Scheduled":
        return <Clock className="w-4 h-4 text-blue-600" />;
      case "Completed":
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case "Cancelled":
        return <XCircle className="w-4 h-4 text-red-600" />;
      case "Rescheduled":
        return <AlertCircle className="w-4 h-4 text-yellow-600" />;
      default:
        return null;
    }
  };

  const openUrl = (url: string) => {
    if (url) {
      window.open(url, "_blank", "noopener,noreferrer");
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
              : "Add properties of interest to track your options"}
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
          {properties.map((property) => (
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
                    {property.current_state && (
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded-full ${getCurrentStateColor(
                          property.current_state,
                        )}`}
                      >
                        {property.current_state}
                      </span>
                    )}
                  </div>
                  {property.address && (
                    <div className="flex items-center space-x-2 text-gray-600 mb-3">
                      <MapPin className="w-4 h-4" />
                      <span className="text-sm">{property.address}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Property Details Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                {property.sf && (
                  <div className="flex items-center space-x-2">
                    <Building className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-600">
                      {property.sf} sq ft
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
                {property.price_per_sf && (
                  <div className="flex items-center space-x-2">
                    <DollarSign className="w-4 h-4 text-green-600" />
                    <span className="text-sm text-gray-600">
                      {property.price_per_sf}/sq ft
                    </span>
                  </div>
                )}
                {property.monthly_cost && (
                  <div className="flex items-center space-x-2">
                    <DollarSign className="w-4 h-4 text-blue-600" />
                    <span className="text-sm text-gray-600">
                      {property.monthly_cost}/month
                    </span>
                  </div>
                )}
                {property.expected_monthly_cost && (
                  <div className="flex items-center space-x-2">
                    <DollarSign className="w-4 h-4 text-purple-600" />
                    <span className="text-sm text-gray-600">
                      Expected: {property.expected_monthly_cost}/month
                    </span>
                  </div>
                )}
                {property.cam_rate && (
                  <div className="flex items-center space-x-2">
                    <Building className="w-4 h-4 text-yellow-600" />
                    <span className="text-sm text-gray-600">
                      CAM: {property.cam_rate}/sq ft
                    </span>
                  </div>
                )}
                {property.parking_rate && (
                  <div className="flex items-center space-x-2">
                    <Car className="w-4 h-4 text-gray-600" />
                    <span className="text-sm text-gray-600">
                      Parking: {property.parking_rate}/sq ft
                    </span>
                  </div>
                )}
                {property.availability && (
                  <div className="flex items-center space-x-2">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-600">
                      {property.availability}
                    </span>
                  </div>
                )}
              </div>

              {/* Tour Information */}
              {(property.tour_datetime ||
                property.tour_status ||
                property.tour_location) && (
                <div className="bg-blue-50 rounded-lg p-4 mb-4">
                  <h5 className="font-medium text-blue-900 mb-2 flex items-center space-x-2">
                    <Calendar className="w-4 h-4" />
                    <span>Tour Information</span>
                    {property.tour_status &&
                      getTourStatusIcon(property.tour_status)}
                  </h5>
                  <div className="space-y-1 text-sm text-blue-800">
                    {property.tour_datetime && (
                      <div>
                        <strong>Date & Time:</strong>{" "}
                        {formatDate(property.tour_datetime.split("T")[0])} at{" "}
                        {new Date(property.tour_datetime).toLocaleTimeString(
                          [],
                          {
                            hour: "2-digit",
                            minute: "2-digit",
                          },
                        )}
                      </div>
                    )}
                    {property.tour_location && (
                      <div>
                        <strong>Location:</strong> {property.tour_location}
                      </div>
                    )}
                    {property.tour_status && (
                      <div>
                        <strong>Status:</strong> {property.tour_status}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Additional Information */}
              {(property.lease_type ||
                property.lease_structure ||
                property.condition ||
                property.contract_term) && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 text-sm">
                  {property.lease_type && (
                    <div>
                      <span className="font-medium text-gray-700">
                        Lease Type:
                      </span>{" "}
                      <span className="text-gray-600">{property.lease_type}</span>
                    </div>
                  )}
                  {property.lease_structure && (
                    <div>
                      <span className="font-medium text-gray-700">
                        Structure:
                      </span>{" "}
                      <span className="text-gray-600">
                        {property.lease_structure}
                      </span>
                    </div>
                  )}
                  {property.condition && (
                    <div>
                      <span className="font-medium text-gray-700">
                        Condition:
                      </span>{" "}
                      <span className="text-gray-600">{property.condition}</span>
                    </div>
                  )}
                  {property.contract_term && (
                    <div>
                      <span className="font-medium text-gray-700">
                        Contract Term:
                      </span>{" "}
                      <span className="text-gray-600">
                        {property.contract_term}
                      </span>
                    </div>
                  )}
                </div>
              )}

              {/* Notes and Suggestions */}
              {property.misc_notes && (
                <div className="mb-4">
                  <h5 className="font-medium text-gray-700 mb-1">Notes:</h5>
                  <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded">
                    {property.misc_notes}
                  </p>
                </div>
              )}

              {property.suggestion && (
                <div className="mb-4">
                  <h5 className="font-medium text-gray-700 mb-1">
                    Broker Suggestion:
                  </h5>
                  <p className="text-sm text-gray-600 bg-yellow-50 p-3 rounded border-l-4 border-yellow-400">
                    {property.suggestion}
                  </p>
                </div>
              )}

              {property.decline_reason && (
                <div className="mb-4">
                  <h5 className="font-medium text-red-700 mb-1">
                    Decline Reason:
                  </h5>
                  <p className="text-sm text-red-600 bg-red-50 p-3 rounded border-l-4 border-red-400">
                    {property.decline_reason}
                  </p>
                </div>
              )}

              {/* Action Links */}
              <div className="flex items-center space-x-4 pt-4 border-t border-gray-200">
                {property.virtual_tour_url && (
                  <button
                    onClick={() => openUrl(property.virtual_tour_url!)}
                    className="flex items-center space-x-1 text-blue-600 hover:text-blue-800 text-sm"
                  >
                    <ExternalLink className="w-4 h-4" />
                    <span>Virtual Tour</span>
                  </button>
                )}
                {property.flier_url && (
                  <button
                    onClick={() => openUrl(property.flier_url!)}
                    className="flex items-center space-x-1 text-green-600 hover:text-green-800 text-sm"
                  >
                    <ExternalLink className="w-4 h-4" />
                    <span>Property Flier</span>
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        // Interactive view for authenticated mode
        <DragDropList items={properties} onReorder={handleReorder}>
          {(property) => (
            <div
              key={property.id}
              className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow group"
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
                    {property.current_state && (
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded-full ${getCurrentStateColor(
                          property.current_state,
                        )}`}
                      >
                        {property.current_state}
                      </span>
                    )}
                  </div>
                  {property.address && (
                    <div className="flex items-center space-x-2 text-gray-600 mb-3">
                      <MapPin className="w-4 h-4" />
                      <span className="text-sm">{property.address}</span>
                    </div>
                  )}
                </div>
                <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => openEditModal(property)}
                    className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                    title="Edit property"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(property.id)}
                    className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                    title="Delete property"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Property Details Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                {property.sf && (
                  <div className="flex items-center space-x-2">
                    <Building className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-600">
                      {property.sf} sq ft
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
                {property.price_per_sf && (
                  <div className="flex items-center space-x-2">
                    <DollarSign className="w-4 h-4 text-green-600" />
                    <span className="text-sm text-gray-600">
                      {property.price_per_sf}/sq ft
                    </span>
                  </div>
                )}
                {property.monthly_cost && (
                  <div className="flex items-center space-x-2">
                    <DollarSign className="w-4 h-4 text-blue-600" />
                    <span className="text-sm text-gray-600">
                      {property.monthly_cost}/month
                    </span>
                  </div>
                )}
                {property.expected_monthly_cost && (
                  <div className="flex items-center space-x-2">
                    <DollarSign className="w-4 h-4 text-purple-600" />
                    <span className="text-sm text-gray-600">
                      Expected: {property.expected_monthly_cost}/month
                    </span>
                  </div>
                )}
                {property.cam_rate && (
                  <div className="flex items-center space-x-2">
                    <Building className="w-4 h-4 text-yellow-600" />
                    <span className="text-sm text-gray-600">
                      CAM: {property.cam_rate}/sq ft
                    </span>
                  </div>
                )}
                {property.parking_rate && (
                  <div className="flex items-center space-x-2">
                    <Car className="w-4 h-4 text-gray-600" />
                    <span className="text-sm text-gray-600">
                      Parking: {property.parking_rate}/sq ft
                    </span>
                  </div>
                )}
                {property.availability && (
                  <div className="flex items-center space-x-2">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-600">
                      {property.availability}
                    </span>
                  </div>
                )}
              </div>

              {/* Tour Information */}
              {(property.tour_datetime ||
                property.tour_status ||
                property.tour_location) && (
                <div className="bg-blue-50 rounded-lg p-4 mb-4">
                  <h5 className="font-medium text-blue-900 mb-2 flex items-center space-x-2">
                    <Calendar className="w-4 h-4" />
                    <span>Tour Information</span>
                    {property.tour_status &&
                      getTourStatusIcon(property.tour_status)}
                  </h5>
                  <div className="space-y-1 text-sm text-blue-800">
                    {property.tour_datetime && (
                      <div>
                        <strong>Date & Time:</strong>{" "}
                        {formatDate(property.tour_datetime.split("T")[0])} at{" "}
                        {new Date(property.tour_datetime).toLocaleTimeString(
                          [],
                          {
                            hour: "2-digit",
                            minute: "2-digit",
                          },
                        )}
                      </div>
                    )}
                    {property.tour_location && (
                      <div>
                        <strong>Location:</strong> {property.tour_location}
                      </div>
                    )}
                    {property.tour_status && (
                      <div>
                        <strong>Status:</strong> {property.tour_status}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Additional Information */}
              {(property.lease_type ||
                property.lease_structure ||
                property.condition ||
                property.contract_term) && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 text-sm">
                  {property.lease_type && (
                    <div>
                      <span className="font-medium text-gray-700">
                        Lease Type:
                      </span>{" "}
                      <span className="text-gray-600">{property.lease_type}</span>
                    </div>
                  )}
                  {property.lease_structure && (
                    <div>
                      <span className="font-medium text-gray-700">
                        Structure:
                      </span>{" "}
                      <span className="text-gray-600">
                        {property.lease_structure}
                      </span>
                    </div>
                  )}
                  {property.condition && (
                    <div>
                      <span className="font-medium text-gray-700">
                        Condition:
                      </span>{" "}
                      <span className="text-gray-600">{property.condition}</span>
                    </div>
                  )}
                  {property.contract_term && (
                    <div>
                      <span className="font-medium text-gray-700">
                        Contract Term:
                      </span>{" "}
                      <span className="text-gray-600">
                        {property.contract_term}
                      </span>
                    </div>
                  )}
                </div>
              )}

              {/* Notes and Suggestions */}
              {property.misc_notes && (
                <div className="mb-4">
                  <h5 className="font-medium text-gray-700 mb-1">Notes:</h5>
                  <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded">
                    {property.misc_notes}
                  </p>
                </div>
              )}

              {property.suggestion && (
                <div className="mb-4">
                  <h5 className="font-medium text-gray-700 mb-1">
                    Broker Suggestion:
                  </h5>
                  <p className="text-sm text-gray-600 bg-yellow-50 p-3 rounded border-l-4 border-yellow-400">
                    {property.suggestion}
                  </p>
                </div>
              )}

              {property.decline_reason && (
                <div className="mb-4">
                  <h5 className="font-medium text-red-700 mb-1">
                    Decline Reason:
                  </h5>
                  <p className="text-sm text-red-600 bg-red-50 p-3 rounded border-l-4 border-red-400">
                    {property.decline_reason}
                  </p>
                </div>
              )}

              {/* Action Links */}
              <div className="flex items-center space-x-4 pt-4 border-t border-gray-200">
                {property.virtual_tour_url && (
                  <button
                    onClick={() => openUrl(property.virtual_tour_url!)}
                    className="flex items-center space-x-1 text-blue-600 hover:text-blue-800 text-sm"
                  >
                    <ExternalLink className="w-4 h-4" />
                    <span>Virtual Tour</span>
                  </button>
                )}
                {property.flier_url && (
                  <button
                    onClick={() => openUrl(property.flier_url!)}
                    className="flex items-center space-x-1 text-green-600 hover:text-green-800 text-sm"
                  >
                    <ExternalLink className="w-4 h-4" />
                    <span>Property Flier</span>
                  </button>
                )}
              </div>
            </div>
          )}
        </DragDropList>
      )}

      {/* Add/Edit Modal */}
      {isModalOpen && !readonly && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
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
                      placeholder="e.g., Downtown Tech Tower"
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
                      placeholder="e.g., 123 Main Street, Downtown"
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
                      Square Feet (SF)
                    </label>
                    <input
                      type="text"
                      value={formData.sf}
                      onChange={(e) =>
                        setFormData({ ...formData, sf: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500"
                      placeholder="e.g., 15,000 sq ft"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      # of People
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
                      placeholder="e.g., 75-100 people"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Ask Rate ( $ /SF)
                    </label>
                    <input
                      type="text"
                      value={formData.price_per_sf}
                      onChange={(e) =>
                        setFormData({ ...formData, price_per_sf: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500"
                      placeholder="e.g., $24/sq ft"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      $ / Month Lease
                    </label>
                    <input
                      type="text"
                      value={formData.monthly_cost}
                      onChange={(e) =>
                        setFormData({ ...formData, monthly_cost: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500"
                      placeholder="e.g., $30,000/month"
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
                      placeholder="e.g., $28,000/month"
                    />
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
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      CAM Rate ($/SF)
                    </label>
                    <input
                      type="text"
                      value={formData.cam_rate}
                      onChange={(e) =>
                        setFormData({ ...formData, cam_rate: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500"
                      placeholder="e.g., $3.50/sq ft"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Parking Rate ($/SF)
                    </label>
                    <input
                      type="text"
                      value={formData.parking_rate}
                      onChange={(e) =>
                        setFormData({ ...formData, parking_rate: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500"
                      placeholder="e.g., $2.00/sq ft"
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
                        setFormData({ ...formData, availability: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500"
                      placeholder="e.g., Available March 2024"
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

              {/* Status Information */}
              <div>
                <h4 className="text-md font-semibold text-gray-900 mb-4">
                  Status Information
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Status
                    </label>
                    <select
                      value={formData.status}
                      onChange={(e) =>
                        setFormData({ ...formData, status: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500"
                    >
                      <option value="new">New</option>
                      <option value="active">Active</option>
                      <option value="pending">Pending</option>
                      <option value="declined">Declined</option>
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
                          current_state: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500"
                    >
                      <option value="">Select state</option>
                      <option value="Available">Available</option>
                      <option value="Under Review">Under Review</option>
                      <option value="Negotiating">Negotiating</option>
                      <option value="On Hold">On Hold</option>
                      <option value="Declined">Declined</option>
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
                      placeholder="e.g., Meet at main lobby"
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
                          tour_status: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500"
                    >
                      <option value="">Select status</option>
                      <option value="Scheduled">Scheduled</option>
                      <option value="Completed">Completed</option>
                      <option value="Cancelled">Cancelled</option>
                      <option value="Rescheduled">Rescheduled</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Links */}
              <div>
                <h4 className="text-md font-semibold text-gray-900 mb-4">
                  Links & Resources
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
                  Additional Information
                </h4>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Notes
                    </label>
                    <textarea
                      value={formData.misc_notes}
                      onChange={(e) =>
                        setFormData({ ...formData, misc_notes: e.target.value })
                      }
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500"
                      placeholder="Additional notes about this property..."
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Broker Suggestion
                    </label>
                    <textarea
                      value={formData.suggestion}
                      onChange={(e) =>
                        setFormData({ ...formData, suggestion: e.target.value })
                      }
                      rows={2}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500"
                      placeholder="Your recommendation for this property..."
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
                        placeholder="Reason for declining this property..."
                      />
                    </div>
                  )}
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