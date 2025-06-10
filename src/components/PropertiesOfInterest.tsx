import React, { useState, useEffect, useCallback } from 'react';
import { Square, Calendar, Plus, Edit3, X, MessageSquare, Building2, DollarSign, Trash2, Save } from 'lucide-react';
import { useUser } from '@clerk/clerk-react';
import { useSupabaseClient } from '../lib/supabase';

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
  projectId: string;
}

export const PropertiesOfInterest: React.FC<PropertiesOfInterestProps> = ({ projectId }) => {
  const { user } = useUser();
  const supabase = useSupabaseClient();
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDeclineModal, setShowDeclineModal] = useState<string | null>(null);
  const [declineReason, setDeclineReason] = useState('');
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

  const fetchProperties = useCallback(async () => {
    try {
      if (!user) return;

      const { data, error } = await supabase
        .from('properties')
        .select('*')
        .eq('project_id', projectId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProperties(data || []);
    } catch (err) {
      console.error('Error fetching properties:', err);
    } finally {
      setLoading(false);
    }
  }, [user, supabase, projectId]);

  useEffect(() => {
    if (user && projectId) {
      fetchProperties();
    }
  }, [user, projectId, fetchProperties]);

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
    if (!user || !formData.name.trim()) return;

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
        updated_at: new Date().toISOString()
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
    } catch (err) {
      console.error('Error saving property:', err);
      alert('Error saving property. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (propertyId: string) => {
    if (!confirm('Are you sure you want to delete this property?')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('properties')
        .delete()
        .eq('id', propertyId);

      if (error) throw error;

      await fetchProperties();
    } catch (err) {
      console.error('Error deleting property:', err);
      alert('Error deleting property. Please try again.');
    }
  };

  const handleStatusUpdate = async (propertyId: string, newStatus: 'active' | 'new' | 'pending' | 'declined') => {
    try {
      const updateData: Partial<Property> = {
        status: newStatus,
        updated_at: new Date().toISOString(),
        decline_reason: newStatus === 'declined' ? null : undefined
      };

      const { error } = await supabase
        .from('properties')
        .update(updateData)
        .eq('id', propertyId);

      if (error) throw error;

      await fetchProperties();
    } catch (err) {
      console.error('Error updating property status:', err);
      alert('Error updating status. Please try again.');
    }
  };

  const handleDeclineProperty = async (propertyId: string) => {
    try {
      const { error } = await supabase
        .from('properties')
        .update({ 
          status: 'declined', 
          decline_reason: declineReason,
          updated_at: new Date().toISOString()
        })
        .eq('id', propertyId);

      if (error) throw error;

      setProperties(properties.map(property => 
        property.id === propertyId 
          ? { ...property, status: 'declined', decline_reason: declineReason }
          : property
      ));
      setShowDeclineModal(null);
      setDeclineReason('');
    } catch (err) {
      console.error('Error declining property:', err);
    }
  };

  const handleRestoreProperty = async (propertyId: string) => {
    try {
      const { error } = await supabase
        .from('properties')
        .update({ 
          status: 'active', 
          decline_reason: null,
          updated_at: new Date().toISOString()
        })
        .eq('id', propertyId);

      if (error) throw error;

      setProperties(properties.map(property => 
        property.id === propertyId 
          ? { ...property, status: 'active', decline_reason: null }
          : property
      ));
    } catch (err) {
      console.error('Error restoring property:', err);
    }
  };

  const openDeclineModal = (propertyId: string) => {
    setShowDeclineModal(propertyId);
    setDeclineReason('');
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
        <h3 className="text-lg font-semibold text-gray-900">Properties of Interest</h3>
        <button 
          onClick={openAddModal}
          className="flex items-center space-x-2 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg hover:bg-gray-800 transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Add Property</span>
        </button>
      </div>
      
      {properties.length === 0 ? (
        <div className="text-center py-12">
          <Building2 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h4 className="text-lg font-semibold text-gray-900 mb-2">No properties yet</h4>
          <p className="text-gray-600 mb-6">Start adding properties that match your client's criteria</p>
          <button 
            onClick={openAddModal}
            className="flex items-center space-x-2 px-4 py-2 bg-gray-900 text-white text-sm rounded-lg hover:bg-gray-800 transition-colors mx-auto"
          >
            <Plus className="w-4 h-4" />
            <span>Add First Property</span>
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {properties.map((property) => (
            <div key={property.id} className={`border border-gray-200 rounded-lg p-4 transition-all ${
              property.status === 'declined' 
                ? 'opacity-60 bg-gray-50' 
                : 'hover:shadow-md'
            }`}>
              <div className="flex items-start justify-between mb-3">
                <h4 className={`font-semibold text-gray-900 text-lg ${
                  property.status === 'declined' ? 'line-through' : ''
                }`}>
                  {property.name}
                </h4>
                <div className="flex items-center space-x-2">
                  {property.status === 'declined' ? (
                    <button
                      onClick={() => handleRestoreProperty(property.id)}
                      className="px-3 py-1.5 text-sm bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors font-medium"
                    >
                      Restore
                    </button>
                  ) : (
                    <button
                      onClick={() => openDeclineModal(property.id)}
                      className="px-3 py-1.5 text-sm bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors font-medium"
                    >
                      Decline
                    </button>
                  )}
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
              
              {property.status === 'declined' && property.decline_reason && (
                <div className="mb-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex items-start space-x-2">
                    <MessageSquare className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <span className="text-sm font-medium text-red-800">Decline Reason:</span>
                      <p className="text-sm text-red-700 mt-1">{property.decline_reason}</p>
                    </div>
                  </div>
                </div>
              )}
              
              <div className={`flex items-center space-x-6 mb-3 text-sm text-gray-600 ${
                property.status === 'declined' ? 'line-through' : ''
              }`}>
                <div className="flex items-center space-x-1">
                  <Square className="w-4 h-4" />
                  <span>{property.size || 'Size not specified'}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <DollarSign className="w-4 h-4" />
                  <span className="font-medium">{property.rent || 'Rent not specified'}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Calendar className="w-4 h-4" />
                  <span>{property.availability || 'Availability not specified'}</span>
                </div>
              </div>

              {(property.lease_type || property.service_type) && (
                <div className="flex items-center space-x-4 mb-3 text-sm">
                  {property.lease_type && (
                    <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs">
                      {property.lease_type}
                    </span>
                  )}
                  {property.service_type && (
                    <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs">
                      {property.service_type}
                    </span>
                  )}
                </div>
              )}
              
              {property.description && (
                <p className={`text-gray-700 text-sm mb-4 leading-relaxed ${
                  property.status === 'declined' ? 'line-through' : ''
                }`}>
                  {property.description}
                </p>
              )}
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span 
                    className={`px-2 py-1 text-xs rounded-full cursor-pointer ${
                      property.status === 'new' 
                        ? 'bg-blue-100 text-blue-700' 
                        : property.status === 'pending'
                        ? 'bg-yellow-100 text-yellow-700'
                        : property.status === 'declined'
                        ? 'bg-red-100 text-red-700'
                        : 'bg-green-100 text-green-700'
                    }`}
                    onClick={() => {
                      if (property.status !== 'declined') {
                                                 const statuses: ('new' | 'pending' | 'active')[] = ['new', 'pending', 'active'];
                         const currentIndex = statuses.indexOf(property.status as 'new' | 'pending' | 'active');
                        const nextStatus = statuses[(currentIndex + 1) % statuses.length];
                        handleStatusUpdate(property.id, nextStatus);
                      }
                    }}
                    title={property.status !== 'declined' ? 'Click to cycle through status' : ''}
                  >
                    {property.status.charAt(0).toUpperCase() + property.status.slice(1)}
                  </span>
                </div>
                <span className="text-xs text-gray-500">
                  Updated: {new Date(property.updated_at).toLocaleDateString()}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b">
              <h3 className="text-lg font-semibold text-gray-900">
                {editingProperty ? 'Edit Property' : 'Add New Property'}
              </h3>
              <button
                onClick={closeModal}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                    Property Name *
                  </label>
                  <input
                    id="name"
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500"
                    placeholder="Enter property name"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="size" className="block text-sm font-medium text-gray-700 mb-1">
                    Size
                  </label>
                  <input
                    id="size"
                    type="text"
                    value={formData.size}
                    onChange={(e) => setFormData(prev => ({ ...prev, size: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500"
                    placeholder="e.g., 5,000 sq ft"
                  />
                </div>

                <div>
                  <label htmlFor="rent" className="block text-sm font-medium text-gray-700 mb-1">
                    Rent
                  </label>
                  <input
                    id="rent"
                    type="text"
                    value={formData.rent}
                    onChange={(e) => setFormData(prev => ({ ...prev, rent: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500"
                    placeholder="e.g., $25/sq ft/year"
                  />
                </div>

                <div>
                  <label htmlFor="availability" className="block text-sm font-medium text-gray-700 mb-1">
                    Availability
                  </label>
                  <input
                    id="availability"
                    type="text"
                    value={formData.availability}
                    onChange={(e) => setFormData(prev => ({ ...prev, availability: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500"
                    placeholder="e.g., Available Q2 2024"
                  />
                </div>

                <div>
                  <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
                    Status
                  </label>
                  <select
                    id="status"
                    value={formData.status}
                    onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as 'active' | 'new' | 'pending' | 'declined' }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500"
                  >
                    <option value="new">New</option>
                    <option value="pending">Pending</option>
                    <option value="active">Active</option>
                    <option value="declined">Declined</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="lease_type" className="block text-sm font-medium text-gray-700 mb-1">
                    Lease Type
                  </label>
                  <select
                    id="lease_type"
                    value={formData.lease_type}
                                         onChange={(e) => setFormData(prev => ({ ...prev, lease_type: e.target.value as 'Direct Lease' | 'Sublease' | 'Sub-sublease' | '' }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500"
                  >
                    <option value="">Select lease type</option>
                    <option value="Direct Lease">Direct Lease</option>
                    <option value="Sublease">Sublease</option>
                    <option value="Sub-sublease">Sub-sublease</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="service_type" className="block text-sm font-medium text-gray-700 mb-1">
                    Service Type
                  </label>
                  <select
                    id="service_type"
                    value={formData.service_type}
                                         onChange={(e) => setFormData(prev => ({ ...prev, service_type: e.target.value as 'Full Service' | 'NNN' | 'Modified Gross' | '' }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500"
                  >
                    <option value="">Select service type</option>
                    <option value="Full Service">Full Service</option>
                    <option value="NNN">NNN</option>
                    <option value="Modified Gross">Modified Gross</option>
                  </select>
                </div>
              </div>

              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500"
                  placeholder="Enter property description"
                  rows={4}
                />
              </div>

              <div className="flex justify-end space-x-3 pt-4">
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
                  <span>{saving ? 'Saving...' : editingProperty ? 'Update Property' : 'Add Property'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Decline Modal */}
      {showDeclineModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96 max-w-90vw">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Decline Property</h3>
              <button 
                onClick={() => setShowDeclineModal(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Reason for declining (optional)
              </label>
              <textarea
                value={declineReason}
                onChange={(e) => setDeclineReason(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                rows={3}
                placeholder="Provide a reason for declining this property..."
              />
            </div>
            
            <div className="flex items-center justify-end space-x-3">
              <button
                onClick={() => setShowDeclineModal(null)}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => showDeclineModal && handleDeclineProperty(showDeclineModal)}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Decline Property
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}; 