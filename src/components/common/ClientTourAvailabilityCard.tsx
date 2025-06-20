import React, { useState, useEffect, useCallback } from "react";
import {
  Calendar,
  Clock,
  User,
  Mail,
  MessageSquare,
  Trash2,
  Edit3,
  X,
  Save,
} from "lucide-react";
import { useUser } from "@clerk/clerk-react";
import { useSupabaseClient } from "../../services/supabase";
import { formatDateTime } from "../../utils/dateUtils";

interface TourAvailability {
  id: string;
  client_name?: string | null;
  client_email?: string | null;
  proposed_datetime: string;
  notes?: string | null;
  created_at: string;
}

interface ClientTourAvailabilityCardProps {
  projectId: string;
}


export const ClientTourAvailabilityCard: React.FC<
  ClientTourAvailabilityCardProps
> = ({ projectId }) => {
  const { user } = useUser();
  const supabase = useSupabaseClient();
  const [availabilities, setAvailabilities] = useState<TourAvailability[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editDateTime, setEditDateTime] = useState("");
  const [saving, setSaving] = useState(false);

  const fetchAvailabilities = useCallback(async () => {
    if (!user || !projectId) return;

    try {
      const { data, error } = await supabase
        .from("client_tour_availability")
        .select("*")
        .eq("project_id", projectId)
        .order("proposed_datetime", { ascending: true });

      if (error) throw error;
      setAvailabilities(data || []);
    } catch (error) {
      console.error("Error fetching tour availabilities:", error);
    } finally {
      setLoading(false);
    }
  }, [user, projectId, supabase]);

  useEffect(() => {
    fetchAvailabilities();
  }, [fetchAvailabilities]);

  const handleDelete = async (id: string) => {
    if (
      !confirm("Are you sure you want to delete this availability request?")
    ) {
      return;
    }

    try {
      const { error } = await supabase
        .from("client_tour_availability")
        .delete()
        .eq("id", id);

      if (error) throw error;
      await fetchAvailabilities();
    } catch (error) {
      console.error("Error deleting availability:", error);
      alert("Failed to delete availability. Please try again.");
    }
  };

  const handleEdit = (availability: TourAvailability) => {
    setEditingId(availability.id);
    // Convert to local datetime format for input
    const date = new Date(availability.proposed_datetime);
    const localDateTime = new Date(
      date.getTime() - date.getTimezoneOffset() * 60000,
    )
      .toISOString()
      .slice(0, 16);
    setEditDateTime(localDateTime);
  };

  const handleSaveEdit = async () => {
    if (!editingId || !editDateTime) return;

    setSaving(true);
    try {
      const { error } = await supabase
        .from("client_tour_availability")
        .update({
          proposed_datetime: new Date(editDateTime).toISOString(),
        })
        .eq("id", editingId);

      if (error) throw error;

      setEditingId(null);
      setEditDateTime("");
      await fetchAvailabilities();
    } catch (error) {
      console.error("Error updating availability:", error);
      alert("Failed to update availability. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditDateTime("");
  };


  const groupAvailabilitiesByClient = () => {
    const grouped: { [key: string]: TourAvailability[] } = {};

    availabilities.forEach((availability) => {
      const key =
        availability.client_email || availability.client_name || "Anonymous";
      if (!grouped[key]) {
        grouped[key] = [];
      }
      grouped[key].push(availability);
    });

    return grouped;
  };

  if (loading) {
    return (
      <div className="dashboard-card p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Client Tour Availability
        </h3>
        <div className="text-center py-8">
          <div className="text-gray-500">Loading availability requests...</div>
        </div>
      </div>
    );
  }

  if (availabilities.length === 0) {
    return (
      <div className="dashboard-card p-6">
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
            <Calendar className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              Client Tour Availability
            </h3>
            <p className="text-gray-600 text-sm">
              Client availability requests will appear here
            </p>
          </div>
        </div>
        <div className="text-center py-8">
          <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">No availability requests yet</p>
          <p className="text-gray-400 text-sm mt-2">
            Clients can submit their availability through the shared project
            link
          </p>
        </div>
      </div>
    );
  }

  const groupedAvailabilities = groupAvailabilitiesByClient();

  return (
    <div className="dashboard-card p-6">
      <div className="flex items-center space-x-3 mb-6">
        <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
          <Calendar className="w-5 h-5 text-white" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            Client Tour Availability
          </h3>
          <p className="text-gray-600 text-sm">
            {availabilities.length} availability request
            {availabilities.length !== 1 ? "s" : ""} from clients
          </p>
        </div>
      </div>

      <div className="space-y-6">
        {Object.entries(groupedAvailabilities).map(
          ([clientKey, clientAvailabilities]) => {
            const firstAvailability = clientAvailabilities[0];
            const hasContactInfo =
              firstAvailability.client_name || firstAvailability.client_email;

            return (
              <div
                key={clientKey}
                className="border border-gray-200 rounded-lg p-4"
              >
                {/* Client Header */}
                <div className="flex items-center space-x-3 mb-4 pb-3 border-b border-gray-100">
                  <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                    <User className="w-4 h-4 text-gray-600" />
                  </div>
                  <div className="flex-1">
                    {hasContactInfo ? (
                      <div>
                        {firstAvailability.client_name && (
                          <h4 className="font-medium text-gray-900">
                            {firstAvailability.client_name}
                          </h4>
                        )}
                        {firstAvailability.client_email && (
                          <div className="flex items-center space-x-1 text-sm text-gray-600">
                            <Mail className="w-3 h-3" />
                            <span>{firstAvailability.client_email}</span>
                          </div>
                        )}
                      </div>
                    ) : (
                      <h4 className="font-medium text-gray-900">
                        Anonymous Client
                      </h4>
                    )}
                  </div>
                  <span className="text-xs text-gray-500">
                    {clientAvailabilities.length} time
                    {clientAvailabilities.length !== 1 ? "s" : ""}
                  </span>
                </div>

                {/* Availability Times */}
                <div className="space-y-3">
                  {clientAvailabilities.map((availability) => {
                    const { dateStr, timeStr } = formatDateTime(
                      availability.proposed_datetime,
                    );
                    const isEditing = editingId === availability.id;

                    return (
                      <div
                        key={availability.id}
                        className="flex items-center justify-between bg-gray-50 rounded-lg p-3"
                      >
                        <div className="flex-1">
                          {isEditing ? (
                            <div className="flex items-center space-x-3">
                              <input
                                type="datetime-local"
                                value={editDateTime}
                                onChange={(e) =>
                                  setEditDateTime(e.target.value)
                                }
                                className="px-3 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                              />
                              <div className="flex items-center space-x-2">
                                <button
                                  onClick={handleSaveEdit}
                                  disabled={saving}
                                  className="p-1 text-green-600 hover:text-green-800 transition-colors"
                                  title="Save changes"
                                >
                                  <Save className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={handleCancelEdit}
                                  className="p-1 text-gray-600 hover:text-gray-800 transition-colors"
                                  title="Cancel editing"
                                >
                                  <X className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                          ) : (
                            <div className="flex items-center space-x-4">
                              <div className="flex items-center space-x-2">
                                <Calendar className="w-4 h-4 text-blue-600" />
                                <span className="font-medium text-gray-900">
                                  {dateStr}
                                </span>
                              </div>
                              <div className="flex items-center space-x-2">
                                <Clock className="w-4 h-4 text-green-600" />
                                <span className="text-gray-700">{timeStr}</span>
                              </div>
                            </div>
                          )}

                          {availability.notes && !isEditing && (
                            <div className="flex items-start space-x-2 mt-2">
                              <MessageSquare className="w-4 h-4 text-gray-400 mt-0.5" />
                              <p className="text-sm text-gray-600">
                                {availability.notes}
                              </p>
                            </div>
                          )}
                        </div>

                        {!isEditing && (
                          <div className="flex items-center space-x-2 ml-4">
                            <button
                              onClick={() => handleEdit(availability)}
                              className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                              title="Edit time"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(availability.id)}
                              className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                              title="Delete availability"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Show notes for the first availability if it exists and we're not editing */}
                {firstAvailability.notes && !editingId && (
                  <div className="mt-4 pt-3 border-t border-gray-100">
                    <div className="flex items-start space-x-2">
                      <MessageSquare className="w-4 h-4 text-gray-400 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-gray-700">
                          Client Notes:
                        </p>
                        <p className="text-sm text-gray-600">
                          {firstAvailability.notes}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          },
        )}
      </div>
    </div>
  );
};
