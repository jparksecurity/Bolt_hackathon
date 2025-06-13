import React, { useState } from 'react';
import { Building2, Calendar, Plus, Edit3, Trash2, X, Save, MapPin, Users, FileText, ExternalLink, Eye } from 'lucide-react';
import { useUser } from '@clerk/clerk-react';
import { useSupabaseClient } from '../lib/supabase';
import { DragDropList } from './DragDropList';
import { useProjectData } from '../hooks/useProjectData';

interface Property {
  id: string;
  name: string;
  address?: string | null;
  sf?: string | null;
  people_capacity?: string | null;
  price_per_sf?: string | null;
  monthly_cost?: string | null;
  contract_term?: string | null;
  availability?: string | null;
  lease_type?: 'Direct Lease' | 'Sublease' | 'Sub-sublease' | null;
  current_state?: 'Available' | 'Under Review' | 'Negotiating' | 'On Hold' | 'Declined' | null;
  misc_notes?: string | null;
  virtual_tour_url?: string | null;
  suggestion?: string | null;
  flier_url?: string | null;
  status: 'active' | 'new' | 'pending' | 'declined';
  decline_reason?: string | null;
  created_at: string;
  updated_at: string;
  order_index?: number | null;
}

interface PropertyFormData {
  name: string;
  address: string;
  sf: string;
  people_capacity: string;
  price_per_sf: string;
  monthly_cost: string;
  contract_term: string;
  availability: string;
  lease_type: 'Direct Lease' | 'Sublease' | 'Sub-sublease' | '';
  current_state: 'Available' | 'Under Review' | 'Negotiating' | 'On Hold' | 'Declined' | '';
  misc_notes: string;
  virtual_tour_url: string;
  suggestion: string;
  flier_url: string;
  status: 'active' | 'new' | 'pending' | 'declined';
}

interface PropertiesOfInterestProps {
  projectId?: string;
  shareId?: string;
  readonly?: boolean;
}

export const PropertiesOfInterest: React.FC<PropertiesOfInterestProps> = ({ 
  projectId, 
  shareId, 
  readonly = false 
}) => {
  const { user } = useUser();
  const supabase = useSupabaseClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProperty, setEditingProperty] = useState<Property | null>(null);
  const [formData, setFormData] = useState<PropertyFormData>({
    name: '',
    address: '',
    sf: '',
    people_capacity: '',
    price_per_sf: '',
    monthly_cost: '',
    contract_term: '',
    availability: '',
    lease_type: '',
    current_state: '',
    misc_notes: '',
    virtual_tour_url: '',
    suggestion: '',
    flier_url: '',
    status: 'new'
  });
  const [saving, setSaving] = useState(false);

  // Use the unified data hook for properties
  const { 
    data: properties, 
    loading: propertiesLoading, 
    refetch: fetchProperties 
  } = useProjectData<Property>({ 
    projectId, 
    shareId, 
    dataType: 'properties' 
  });


  const loading = propertiesLoading;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'new':
        return 'bg-blue-100 text-blue-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'declined':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getCurrentStateColor = (state: string) => {
    switch (state) {
      case 'Available':
        return 'bg-green-100 text-green-800';
      case 'Under Review':
        return 'bg-blue-100 text-blue-800';
      case 'Negotiating':
        return 'bg-orange-100 text-orange-800';
      case 'On Hold':
        return 'bg-yellow-100 text-yellow-800';
      case 'Declined':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      address: '',
      sf: '',
      people_capacity: '',
      price_per_sf: '',
      monthly_cost: '',
      contract_term: '',
      availability: '',
      lease_type: '',
      current_state: '',
      misc_notes: '',
      virtual_tour_url: '',
      suggestion: '',
      flier_url: '',
      status: 'new'
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
      address: property.address || '',
      sf: property.sf || '',
      people_capacity: property.people_capacity || '',
      price_per_sf: property.price_per_sf || '',
      monthly_cost: property.monthly_cost || '',
      contract_term: property.contract_term || '',
      availability: property.availability || '',
      lease_type: property.lease_type || '',
      current_state: property.current_state || '',
      misc_notes: property.misc_notes || '',
      virtual_tour_url: property.virtual_tour_url || '',
      suggestion: property.suggestion || '',
      flier_url: property.flier_url || '',
      status: property.status
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
        contract_term: formData.contract_term.trim() || null,
        availability: formData.availability.trim() || null,
        lease_type: formData.lease_type || null,
        current_state: formData.current_state || null,
        misc_notes: formData.misc_notes.trim() || null,
        virtual_tour_url: formData.virtual_tour_url.trim() || null,
        suggestion: formData.suggestion.trim() || null,
        flier_url: formData.flier_url.trim() || null,
        status: formData.status,
        updated_at: new Date().toISOString(),
        order_index: editingProperty ? editingProperty.order_index : properties.length
      };

      if (editingProperty) {
        // Update existing property
        const { error } = await supabase
          .from('properties')
          .update(propertyData)
          .eq('id', editingProperty.id);

        if (error) throw error;
      } else {
        // Create new property
        const { error } = await supabase
          .from('properties')
          .insert([propertyData]);

        if (error) throw error;
      }

      await fetchProperties();
      closeModal();
    } catch {
      alert('Error saving property. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (propertyId: string) => {
    if (!confirm('Are you sure you want to delete this property?') || readonly) {
      return;
    }

    try {
      const { error } = await supabase
        .from('properties')
        .delete()
        .eq('id', propertyId);

      if (error) throw error;

      await fetchProperties();
    } catch {
      alert('Error deleting property. Please try again.');
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
      order_index: index
    }));

    try {
      for (const update of updates) {
        const { error } = await supabase
          .from('properties')
          .update({ order_index: update.order_index })
          .eq('id', update.id);

        if (error) throw error;
      }

      await fetchProperties();
    } catch {
      alert('Error reordering properties. Please try again.');
      await fetchProperties(); // Refresh to get correct order
    }
  };

  const openGoogleMaps = (address: string) => {
    if (address) {
      const encodedAddress = encodeURIComponent(address);
      window.open(`https://www.google.com/maps/search/?api=1&query=${encodedAddress}`, '_blank');
    }
  };

  const openUrl = (url: string) => {
    if (url) {
      // Add https:// if no protocol is specified
      const fullUrl = url.startsWith('http') ? url : `https://${url}`;
      window.open(fullUrl, '_blank', 'noopener,noreferrer');
    }
  };

  const renderProperty = (property: Property) => {
    
    return (
      <div className="border border-gray-200 rounded-xl p-6 bg-white hover:shadow-lg transition-shadow">
        <div className="flex items-start justify-between mb-6">
          <div className="flex-1">
            <h3 className="text-xl font-bold text-gray-900 mb-3">
              {property.name}
            </h3>
            <div className="flex items-center space-x-3 mb-3">
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(property.status)}`}>
                {property.status.charAt(0).toUpperCase() + property.status.slice(1)}
              </span>
              {property.current_state && (
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${getCurrentStateColor(property.current_state)}`}>
                  {property.current_state}
                </span>
              )}
            </div>
            {property.address && (
              <button
                onClick={() => openGoogleMaps(property.address!)}
                className="flex items-center space-x-2 text-blue-600 hover:text-blue-800 transition-colors mb-4"
              >
                <MapPin className="w-4 h-4" />
                <span className="text-sm font-medium">{property.address}</span>
                <ExternalLink className="w-3 h-3" />
              </button>
            )}
          </div>
          {!readonly && (
            <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                onClick={() => openEditModal(property)}
                className="p-2 text-gray-400 hover:text-gray-600 transition-colors rounded-lg hover:bg-gray-50"
                title="Edit property"
              >
                <Edit3 className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleDelete(property.id)}
                className="p-2 text-gray-400 hover:text-red-600 transition-colors rounded-lg hover:bg-red-50"
                title="Delete property"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        {/* Property Details Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
          {property.sf && (
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                <Building2 className="w-4 h-4 text-blue-600" />
              </div>
              <div>
                <p className="text-xs text-gray-500 font-medium">Square Feet</p>
                <p className="text-sm text-gray-900 font-semibold">{property.sf}</p>
              </div>
            </div>
          )}

          {property.people_capacity && (
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                <Users className="w-4 h-4 text-green-600" />
              </div>
              <div>
                <p className="text-xs text-gray-500 font-medium"># of People</p>
                <p className="text-sm text-gray-900 font-semibold">{property.people_capacity}</p>
              </div>
            </div>
          )}

          {property.price_per_sf && (
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                <Building2 className="w-4 h-4 text-purple-600" />
              </div>
              <div>
                <p className="text-xs text-gray-500 font-medium">$ / SF</p>
                <p className="text-sm text-gray-900 font-semibold">{property.price_per_sf}</p>
              </div>
            </div>
          )}

          {property.monthly_cost && (
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                <Calendar className="w-4 h-4 text-orange-600" />
              </div>
              <div>
                <p className="text-xs text-gray-500 font-medium">$$ / Month</p>
                <p className="text-sm text-gray-900 font-semibold">{property.monthly_cost}</p>
              </div>
            </div>
          )}

          {property.contract_term && (
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center">
                <FileText className="w-4 h-4 text-indigo-600" />
              </div>
              <div>
                <p className="text-xs text-gray-500 font-medium">Contract Term</p>
                <p className="text-sm text-gray-900 font-semibold">{property.contract_term}</p>
              </div>
            </div>
          )}

          {property.availability && (
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-cyan-100 rounded-lg flex items-center justify-center">
                <Calendar className="w-4 h-4 text-cyan-600" />
              </div>
              <div>
                <p className="text-xs text-gray-500 font-medium">Availability</p>
                <p className="text-sm text-gray-900 font-semibold">{property.availability}</p>
              </div>
            </div>
          )}
        </div>

        {/* Lease Type */}
        {property.lease_type && (
          <div className="mb-4">
            <p className="text-xs text-gray-500 font-medium mb-1">Lease Type</p>
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
              {property.lease_type}
            </span>
          </div>
        )}

        {/* Misc Notes */}
        {property.misc_notes && (
          <div className="mb-4">
            <p className="text-xs text-gray-500 font-medium mb-2">Notes</p>
            <p className="text-sm text-gray-700 bg-gray-50 rounded-lg p-3">{property.misc_notes}</p>
          </div>
        )}

        {/* Suggestion */}
        {property.suggestion && (
          <div className="mb-4">
            <p className="text-xs text-gray-500 font-medium mb-2">Suggestion</p>
            <p className="text-sm text-gray-700 bg-blue-50 rounded-lg p-3 border-l-4 border-blue-400">{property.suggestion}</p>
          </div>
        )}

        {/* Action Links */}
        <div className="flex items-center space-x-4 mb-4">
          {property.virtual_tour_url && (
            <button
              onClick={() => openUrl(property.virtual_tour_url!)}
              className="flex items-center space-x-2 text-blue-600 hover:text-blue-800 transition-colors"
            >
              <Eye className="w-4 h-4" />
              <span className="text-sm font-medium">Virtual Tour</span>
            </button>
          )}
          {property.flier_url && (
            <button
              onClick={() => openUrl(property.flier_url!)}
              className="flex items-center space-x-2 text-green-600 hover:text-green-800 transition-colors"
            >
              <FileText className="w-4 h-4" />
              <span className="text-sm font-medium">Flier</span>
            </button>
          )}
        </div>

        {/* Decline Reason */}
        {property.status === 'declined' && property.decline_reason && (
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-xs text-red-600 font-medium mb-1">Decline Reason</p>
            <p className="text-sm text-red-700">{property.decline_reason}</p>
          </div>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Properties of Interest</h2>
        <div className="text-center py-8">
          <div className="text-gray-500">Loading properties...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-2">
            <Building2 className="w-5 h-5 text-gray-400" />
            <h2 className="text-xl font-semibold text-gray-900">Properties of Interest</h2>
          </div>
          {!readonly && (
            <button
              onClick={openAddModal}
              className="flex items-center space-x-2 px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Add Property</span>
            </button>
          )}
        </div>

        {properties.length === 0 ? (
          <div className="text-center py-12">
            <Building2 className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 mb-4">No properties added yet</p>
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
        ) : (
          <div className="space-y-6">
            {readonly ? (
              // Static view for readonly mode
              properties.map((property) => (
                <div key={property.id}>
                  {renderProperty(property)}
                </div>
              ))
            ) : (
              // Interactive view for authenticated mode
              <DragDropList
                items={properties}
                onReorder={handleReorder}
              >
                {(property) => renderProperty(property)}
              </DragDropList>
            )}
          </div>
        )}
      </div>

      {/* Add/Edit Modal - only show if not readonly */}
      {isModalOpen && !readonly && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">
                {editingProperty ? 'Edit Property' : 'Add Property'}
              </h3>
              <button
                onClick={closeModal}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {/* Basic Information */}
              <div>
                <h4 className="text-md font-semibold text-gray-900 mb-4">Basic Information</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Property Name *
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter property address"
                    />
                  </div>
                </div>
              </div>

              {/* Property Details */}
              <div>
                <h4 className="text-md font-semibold text-gray-900 mb-4">Property Details</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Square Feet (SF)
                    </label>
                    <input
                      type="text"
                      value={formData.sf}
                      onChange={(e) => setFormData({ ...formData, sf: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                      onChange={(e) => setFormData({ ...formData, people_capacity: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="e.g., 75-100 people"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      $ / SF
                    </label>
                    <input
                      type="text"
                      value={formData.price_per_sf}
                      onChange={(e) => setFormData({ ...formData, price_per_sf: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="e.g., $24/sq ft"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      $$ / Month
                    </label>
                    <input
                      type="text"
                      value={formData.monthly_cost}
                      onChange={(e) => setFormData({ ...formData, monthly_cost: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="e.g., $30,000/month"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Contract Term
                    </label>
                    <input
                      type="text"
                      value={formData.contract_term}
                      onChange={(e) => setFormData({ ...formData, contract_term: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="e.g., 3-5 years"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Availability
                    </label>
                    <input
                      type="text"
                      value={formData.availability}
                      onChange={(e) => setFormData({ ...formData, availability: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="e.g., Available March 2024"
                    />
                  </div>
                </div>
              </div>

              {/* Status and Type */}
              <div>
                <h4 className="text-md font-semibold text-gray-900 mb-4">Status & Type</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Lease Type
                    </label>
                    <select
                      value={formData.lease_type}
                      onChange={(e) => setFormData({ ...formData, lease_type: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select lease type</option>
                      <option value="Direct Lease">Direct Lease</option>
                      <option value="Sublease">Sublease</option>
                      <option value="Sub-sublease">Sub-sublease</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Current State
                    </label>
                    <select
                      value={formData.current_state}
                      onChange={(e) => setFormData({ ...formData, current_state: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select current state</option>
                      <option value="Available">Available</option>
                      <option value="Under Review">Under Review</option>
                      <option value="Negotiating">Negotiating</option>
                      <option value="On Hold">On Hold</option>
                      <option value="Declined">Declined</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Status
                    </label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="new">New</option>
                      <option value="active">Active</option>
                      <option value="pending">Pending</option>
                      <option value="declined">Declined</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Links and Resources */}
              <div>
                <h4 className="text-md font-semibold text-gray-900 mb-4">Links & Resources</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Virtual Tour URL
                    </label>
                    <input
                      type="url"
                      value={formData.virtual_tour_url}
                      onChange={(e) => setFormData({ ...formData, virtual_tour_url: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="https://example.com/virtual-tour"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Flier URL
                    </label>
                    <input
                      type="url"
                      value={formData.flier_url}
                      onChange={(e) => setFormData({ ...formData, flier_url: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="https://example.com/property-flier.pdf"
                    />
                  </div>
                </div>
              </div>

              {/* Notes and Suggestions */}
              <div>
                <h4 className="text-md font-semibold text-gray-900 mb-4">Additional Information</h4>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Misc Notes
                    </label>
                    <textarea
                      value={formData.misc_notes}
                      onChange={(e) => setFormData({ ...formData, misc_notes: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      rows={3}
                      placeholder="Any additional notes about this property..."
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Suggestion
                    </label>
                    <textarea
                      value={formData.suggestion}
                      onChange={(e) => setFormData({ ...formData, suggestion: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      rows={3}
                      placeholder="Recommendations or suggestions for this property..."
                    />
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving || !formData.name.trim()}
                  className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
                >
                  {saving ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      <span>{editingProperty ? 'Update' : 'Add Property'}</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};