import React, { useState, useEffect, useCallback } from 'react';
import { Square, Calendar, Plus, Edit3, X, MessageSquare, Building2, DollarSign } from 'lucide-react';
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

  const handleDeclineProperty = async (propertyId: string) => {
    try {
      const { error } = await supabase
        .from('properties')
        .update({ 
          status: 'declined', 
          decline_reason: declineReason 
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
          decline_reason: null 
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
        <button className="flex items-center space-x-2 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg hover:bg-gray-800 transition-colors">
          <Plus className="w-4 h-4" />
          <span>Add Property</span>
        </button>
      </div>
      
      {properties.length === 0 ? (
        <div className="text-center py-12">
          <Building2 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h4 className="text-lg font-semibold text-gray-900 mb-2">No properties yet</h4>
          <p className="text-gray-600 mb-6">Start adding properties that match your client's criteria</p>
          <button className="flex items-center space-x-2 px-4 py-2 bg-gray-900 text-white text-sm rounded-lg hover:bg-gray-800 transition-colors mx-auto">
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
                  <Edit3 className="w-4 h-4 text-gray-400 cursor-pointer hover:text-gray-600 transition-colors" />
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
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    property.status === 'new' 
                      ? 'bg-blue-100 text-blue-700' 
                      : property.status === 'pending'
                      ? 'bg-yellow-100 text-yellow-700'
                      : property.status === 'declined'
                      ? 'bg-red-100 text-red-700'
                      : 'bg-green-100 text-green-700'
                  }`}>
                    {property.status.charAt(0).toUpperCase() + property.status.slice(1)}
                  </span>
                </div>
                <button className={`px-3 py-1 text-xs bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors ${
                  property.status === 'declined' ? 'opacity-50 cursor-not-allowed' : ''
                }`}>
                  See More
                </button>
              </div>
            </div>
          ))}
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