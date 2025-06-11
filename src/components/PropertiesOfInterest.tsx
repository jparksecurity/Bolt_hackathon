import React, { useState } from 'react';
import { Building2, Calendar, Plus, Edit3, X, DollarSign, Trash2, Save, MapPin } from 'lucide-react';
import { useUser } from '@clerk/clerk-react';
import { useSupabaseClient } from '../lib/supabase';
import { DragDropList } from './DragDropList';
import { useProjectData } from '../hooks/useProjectData';

interface Property {
  id: string;
  name: string;
  size?: string | null;
  rent?: string | null;
  availability?: string | null;
  description?: string | null;
  status: 'active' | 'new' | 'pending' | 'declined';
  decline_reason?: string | null;
  lease_type?: 'Direct Lease' | 'Sublease' | 'Sub-sublease' | null;
  service_type?: 'Full Service' | 'NNN' | 'Modified Gross' | null;
  created_at: string;
  updated_at: string;
  order_index?: number | null;
}

interface PropertyFeature {
  id: string;
  property_id: string;
  feature: string;
}

interface PropertyFormData {
  name: string;
  size: string;
  rent: string;
  availability: string;
  description: string;
  status: 'active' | 'new' | 'pending' | 'declined';
  lease_type: 'Direct Lease' | 'Sublease' | 'Sub-sublease' | '';
  service_type: 'Full Service' | 'NNN' | 'Modified Gross' | '';
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
    size: '',
    rent: '',
    availability: '',
    description: '',
    status: 'new',
    lease_type: '',
    service_type: ''
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

  // Get property features if needed (for public mode we need to implement this separately)
  const [features, setFeatures] = useState<PropertyFeature[]>([]);

  // For public mode, we need to fetch features separately since our hook doesn't handle this yet
  React.useEffect(() => {
    const fetchFeatures = async () => {
      if (shareId) {
        try {
          const { data, error } = await supabase
            .rpc('get_public_property_features', { share_id: shareId });
          if (!error) {
            setFeatures(data || []);
          }
        } catch {
          // Error fetching features - use empty array
        }
      } else if (projectId && properties.length > 0) {
        // For authenticated mode, fetch features
        try {
          const propertyIds = properties.map(p => p.id);
          const { data, error } = await supabase
            .from('property_features')
            .select('*')
            .in('property_id', propertyIds);
          if (!error) {
            setFeatures(data || []);
          }
        } catch {
          // Error fetching features - use empty array
        }
      }
    };

    fetchFeatures();
  }, [shareId, projectId, properties, supabase]);

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

  const getPropertyFeatures = (propertyId: string) => {
    return features.filter(feature => feature.property_id === propertyId);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      size: '',
      rent: '',
      availability: '',
      description: '',
      status: 'new',
      lease_type: '',
      service_type: ''
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
      size: property.size || '',
      rent: property.rent || '',
      availability: property.availability || '',
      description: property.description || '',
      status: property.status,
      lease_type: property.lease_type || '',
      service_type: property.service_type || ''
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
        size: formData.size.trim() || null,
        rent: formData.rent.trim() || null,
        availability: formData.availability.trim() || null,
        description: formData.description.trim() || null,
        status: formData.status,
        lease_type: formData.lease_type || null,
        service_type: formData.service_type || null,
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

  const renderProperty = (property: Property) => {
    const propertyFeatures = getPropertyFeatures(property.id);
    
    return (
      <div className="border border-gray-200 rounded-lg p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {property.name}
            </h3>
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(property.status)}`}>
              {property.status.charAt(0).toUpperCase() + property.status.slice(1)}
            </span>
          </div>
          {!readonly && (
            <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
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
          )}
        </div>

        {/* Property Details Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
          {property.size && (
            <div className="flex items-center space-x-2">
              <MapPin className="w-4 h-4 text-gray-400" />
              <div>
                <p className="text-xs text-gray-500">Size</p>
                <p className="text-sm text-gray-900">{property.size}</p>
              </div>
            </div>
          )}

          {property.rent && (
            <div className="flex items-center space-x-2">
              <DollarSign className="w-4 h-4 text-gray-400" />
              <div>
                <p className="text-xs text-gray-500">Rent</p>
                <p className="text-sm text-gray-900">{property.rent}</p>
              </div>
            </div>
          )}

          {property.availability && (
            <div className="flex items-center space-x-2">
              <Calendar className="w-4 h-4 text-gray-400" />
              <div>
                <p className="text-xs text-gray-500">Availability</p>
                <p className="text-sm text-gray-900">{property.availability}</p>
              </div>
            </div>
          )}

          {property.lease_type && (
            <div>
              <p className="text-xs text-gray-500">Lease Type</p>
              <p className="text-sm text-gray-900">{property.lease_type}</p>
            </div>
          )}
        </div>

        {/* Service Type and Description */}
        {(property.service_type || property.description) && (
          <div className="space-y-3 mb-4">
            {property.service_type && (
              <div>
                <p className="text-xs text-gray-500">Service Type</p>
                <p className="text-sm text-gray-900">{property.service_type}</p>
              </div>
            )}
            {property.description && (
              <div>
                <p className="text-xs text-gray-500">Description</p>
                <p className="text-sm text-gray-900">{property.description}</p>
              </div>
            )}
          </div>
        )}

        {/* Features */}
        {propertyFeatures.length > 0 && (
          <div>
            <p className="text-xs text-gray-500 mb-2">Features</p>
            <div className="flex flex-wrap gap-2">
              {propertyFeatures.map((feature) => (
                <span
                  key={feature.id}
                  className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                >
                  {feature.feature}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Decline Reason */}
        {property.status === 'declined' && property.decline_reason && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
            <p className="text-xs text-red-600 font-medium">Decline Reason</p>
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
              className="flex items-center space-x-1 p-1 text-gray-400 hover:text-gray-600 transition-colors"
              title="Add property"
            >
              <Plus className="w-4 h-4" />
            </button>
          )}
        </div>

        {properties.length === 0 ? (
          <div className="text-center py-8">
            <Building2 className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No properties added yet</p>
            {!readonly && (
              <button
                onClick={openAddModal}
                className="mt-3 flex items-center space-x-2 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg hover:bg-gray-800 transition-colors mx-auto"
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
          <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
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
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {/* Form fields - simplified for brevity */}
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
              
              <div className="flex justify-end space-x-3 pt-4">
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