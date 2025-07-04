import React, { useState } from "react";
import {
  Calendar,
  Send,
  CheckCircle,
  AlertCircle,
  User,
  Mail,
  MessageSquare,
  X,
} from "lucide-react";
import {
  formatDisplayDateTime,
  dateTimeLocalToISO,
} from "../../utils/dateUtils";
import {
  isWithinBusinessHours,
  isThirtyMinuteInterval,
} from "../../utils/timeValidation";
import { useSupabaseClient } from "../../services/supabase";
import { DateTime } from "luxon";

interface SelectedDateTime {
  date: string;
  time: string;
  datetime: string;
}

interface ClientTourAvailabilityModalProps {
  isOpen: boolean;
  onClose: () => void;
  shareId: string;
}

export const ClientTourAvailabilityModal: React.FC<
  ClientTourAvailabilityModalProps
> = ({ isOpen, onClose, shareId }) => {
  const supabase = useSupabaseClient();
  const [selectedDateTime, setSelectedDateTime] = useState("");
  const [selectedDateTimes, setSelectedDateTimes] = useState<
    SelectedDateTime[]
  >([]);
  const [clientName, setClientName] = useState("");
  const [clientEmail, setClientEmail] = useState("");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Get min and max datetime for the input using Luxon
  const getMinDateTime = () => {
    return DateTime.now().toFormat("yyyy-MM-dd'T'09:00");
  };

  const getMaxDateTime = () => {
    return DateTime.now().plus({ years: 1 }).toFormat("yyyy-MM-dd'T'16:30");
  };

  const addDateTime = () => {
    if (!selectedDateTime) {
      setError("Please select a date and time.");
      return;
    }

    // Parse the datetime using Luxon
    const dt = DateTime.fromISO(selectedDateTime);
    if (!dt.isValid) {
      setError("Invalid date and time selected.");
      return;
    }

    // Extract time for validation
    const timeString = dt.toFormat("HH:mm");

    // Validate business hours using utility function
    if (!isWithinBusinessHours(timeString)) {
      setError(
        "Please select a time between 9:00 AM and 4:30 PM (tours must finish by 5:00 PM).",
      );
      return;
    }

    // Validate 30-minute intervals using utility function
    if (!isThirtyMinuteInterval(timeString)) {
      setError(
        "Please select a time in 30-minute intervals (e.g., 9:00, 9:30, 10:00).",
      );
      return;
    }

    const datetime = dateTimeLocalToISO(selectedDateTime);

    // Check if this datetime is already selected
    const exists = selectedDateTimes.some(
      (selectedDt) => selectedDt.datetime === datetime,
    );
    if (exists) {
      setError("This date and time combination is already selected.");
      return;
    }

    const newDateTime: SelectedDateTime = {
      date: dt.toISODate() || "",
      time: timeString,
      datetime: datetime,
    };

    setSelectedDateTimes([...selectedDateTimes, newDateTime]);
    setSelectedDateTime("");
    setError(null);
  };

  const removeDateTime = (datetime: string) => {
    setSelectedDateTimes(
      selectedDateTimes.filter((dt) => dt.datetime !== datetime),
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (selectedDateTimes.length === 0) {
      setError("Please add at least one date and time.");
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      // Convert selected datetimes to ISO strings - they're already in ISO format
      const proposedSlots = selectedDateTimes.map((dt) => dt.datetime);

      const { error } = await supabase.rpc("submit_client_tour_availability", {
        _share_id: shareId,
        _proposed_slots: proposedSlots,
        _client_name: clientName.trim() || undefined,
        _client_email: clientEmail.trim() || undefined,
        _notes: notes.trim() || undefined,
      });

      if (error) {
        throw new Error(error.message || "Failed to submit availability");
      }

      setSubmitted(true);
      // Reset form
      setSelectedDateTime("");
      setSelectedDateTimes([]);
      setClientName("");
      setClientEmail("");
      setNotes("");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to submit availability",
      );
    } finally {
      setSubmitting(false);
    }
  };

  const resetAndClose = () => {
    setSelectedDateTime("");
    setSelectedDateTimes([]);
    setClientName("");
    setClientEmail("");
    setNotes("");
    setSubmitted(false);
    setError(null);
    onClose();
  };

  if (!isOpen) return null;

  if (submitted) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
          <div className="p-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-green-900">
                  Availability Submitted!
                </h3>
                <p className="text-green-700 text-sm">
                  Your tour availability has been sent to the broker.
                </p>
              </div>
            </div>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setSubmitted(false)}
                className="px-4 py-2 text-green-600 hover:text-green-800 font-medium text-sm"
              >
                Submit More Times
              </button>
              <button
                onClick={resetAndClose}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
              <Calendar className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                Tour Availability
              </h3>
              <p className="text-gray-600 text-sm">
                Let us know when you're available for property tours
              </p>
            </div>
          </div>
          <button
            onClick={resetAndClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Contact Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <User className="w-4 h-4 inline mr-1" />
                Your Name (Optional)
              </label>
              <input
                type="text"
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter your name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Mail className="w-4 h-4 inline mr-1" />
                Email (Optional)
              </label>
              <input
                type="email"
                value={clientEmail}
                onChange={(e) => setClientEmail(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="your.email@example.com"
              />
            </div>
          </div>

          {/* Date and Time Selection */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="font-medium text-gray-900 mb-4">
              Add Available Date & Time
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Calendar className="w-4 h-4 inline mr-1" />
                  Date & Time (business hours: 9:00 AM - 5:00 PM)
                </label>
                <input
                  type="datetime-local"
                  value={selectedDateTime}
                  onChange={(e) => setSelectedDateTime(e.target.value)}
                  min={getMinDateTime()}
                  max={getMaxDateTime()}
                  step="1800"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Select date and time"
                />
              </div>
              <div>
                <button
                  type="button"
                  onClick={addDateTime}
                  disabled={!selectedDateTime}
                  className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Add Time
                </button>
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Business hours: 9:00 AM - 5:00 PM. Latest tour start: 4:30 PM
              (30-minute tours)
            </p>
          </div>

          {/* Selected Date Times */}
          {selectedDateTimes.length > 0 && (
            <div>
              <h4 className="font-medium text-gray-900 mb-3">
                Selected Available Times ({selectedDateTimes.length})
              </h4>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {selectedDateTimes.map((dt, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between bg-blue-50 border border-blue-200 rounded-lg p-3"
                  >
                    <span className="text-blue-900 font-medium">
                      {formatDisplayDateTime(dt.datetime)}
                    </span>
                    <button
                      type="button"
                      onClick={() => removeDateTime(dt.datetime)}
                      className="text-blue-600 hover:text-red-600 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <MessageSquare className="w-4 h-4 inline mr-1" />
              Additional Notes (Optional)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Any specific preferences or requirements for the tour..."
            />
          </div>

          {/* Error Message */}
          {error && (
            <div className="flex items-center space-x-2 text-red-600 bg-red-50 border border-red-200 rounded-md p-3">
              <AlertCircle className="w-5 h-5" />
              <span className="text-sm">{error}</span>
            </div>
          )}

          {/* Submit Button */}
          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={resetAndClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting || selectedDateTimes.length === 0}
              className="flex items-center space-x-2 px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Submitting...</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>Submit Availability</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
