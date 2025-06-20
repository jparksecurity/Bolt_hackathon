import React, { useState } from "react";
import {
  Calendar,
  Clock,
  Send,
  CheckCircle,
  AlertCircle,
  User,
  Mail,
  MessageSquare,
} from "lucide-react";
import { getCurrentDateString } from "../../utils/dateUtils";

interface ClientAvailabilitySectionProps {
  shareId: string;
}

interface TimeSlot {
  time: string;
  label: string;
}

export const ClientAvailabilitySection: React.FC<
  ClientAvailabilitySectionProps
> = ({ shareId }) => {
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedSlots, setSelectedSlots] = useState<Set<string>>(new Set());
  const [clientName, setClientName] = useState("");
  const [clientEmail, setClientEmail] = useState("");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Generate 30-minute time slots from 9:00 AM to 5:00 PM
  const generateTimeSlots = (): TimeSlot[] => {
    const slots: TimeSlot[] = [];
    for (let hour = 9; hour <= 17; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        if (hour === 17 && minute > 0) break; // Stop at 5:00 PM

        const time24 = `${hour.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")}`;
        const ampm = hour >= 12 ? "PM" : "AM";
        const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
        const label = `${displayHour}:${minute.toString().padStart(2, "0")} ${ampm}`;

        slots.push({ time: time24, label });
      }
    }
    return slots;
  };

  const timeSlots = generateTimeSlots();

  const handleSlotToggle = (time: string) => {
    const newSelectedSlots = new Set(selectedSlots);
    if (newSelectedSlots.has(time)) {
      newSelectedSlots.delete(time);
    } else {
      newSelectedSlots.add(time);
    }
    setSelectedSlots(newSelectedSlots);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedDate || selectedSlots.size === 0) {
      setError("Please select a date and at least one time slot.");
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      // Convert selected slots to ISO datetime strings
      const proposedSlots = Array.from(selectedSlots).map((time) => {
        const datetime = new Date(`${selectedDate}T${time}:00`);
        return datetime.toISOString();
      });

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/submit-client-tour-availability`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            shareId,
            clientName: clientName.trim() || undefined,
            clientEmail: clientEmail.trim() || undefined,
            proposedSlots,
            notes: notes.trim() || undefined,
          }),
        },
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to submit availability");
      }

      setSubmitted(true);
      // Reset form
      setSelectedDate("");
      setSelectedSlots(new Set());
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

  if (submitted) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-lg p-6">
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center">
            <CheckCircle className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-green-900">
              Availability Submitted Successfully!
            </h3>
            <p className="text-green-700">
              Your tour availability has been sent to the broker. They will
              contact you soon to confirm the tour schedule.
            </p>
          </div>
        </div>
        <button
          onClick={() => setSubmitted(false)}
          className="text-green-600 hover:text-green-800 font-medium text-sm"
        >
          Submit Additional Times
        </button>
      </div>
    );
  }

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
      <div className="flex items-center space-x-3 mb-6">
        <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
          <Calendar className="w-6 h-6 text-white" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-blue-900">
            I'm Available for Tours During These Times
          </h3>
          <p className="text-blue-700 text-sm">
            Let us know when you're available for property tours. Select a date
            and your preferred time slots.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Contact Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-blue-900 mb-2">
              <User className="w-4 h-4 inline mr-1" />
              Your Name (Optional)
            </label>
            <input
              type="text"
              value={clientName}
              onChange={(e) => setClientName(e.target.value)}
              className="w-full px-3 py-2 border border-blue-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              placeholder="Enter your name"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-blue-900 mb-2">
              <Mail className="w-4 h-4 inline mr-1" />
              Email (Optional)
            </label>
            <input
              type="email"
              value={clientEmail}
              onChange={(e) => setClientEmail(e.target.value)}
              className="w-full px-3 py-2 border border-blue-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              placeholder="your.email@example.com"
            />
          </div>
        </div>

        {/* Date Selection */}
        <div>
          <label className="block text-sm font-medium text-blue-900 mb-2">
            <Calendar className="w-4 h-4 inline mr-1" />
            Select Date *
          </label>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            min={getCurrentDateString()}
            className="w-full md:w-auto px-3 py-2 border border-blue-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            required
          />
        </div>

        {/* Time Slot Selection */}
        {selectedDate && (
          <div>
            <label className="block text-sm font-medium text-blue-900 mb-3">
              <Clock className="w-4 h-4 inline mr-1" />
              Available Time Slots * (Select multiple)
            </label>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-2">
              {timeSlots.map((slot) => (
                <button
                  key={slot.time}
                  type="button"
                  onClick={() => handleSlotToggle(slot.time)}
                  className={`px-3 py-2 text-sm rounded-md border transition-colors ${
                    selectedSlots.has(slot.time)
                      ? "bg-blue-600 text-white border-blue-600"
                      : "bg-white text-blue-900 border-blue-300 hover:bg-blue-100"
                  }`}
                >
                  {slot.label}
                </button>
              ))}
            </div>
            {selectedSlots.size > 0 && (
              <p className="text-sm text-blue-700 mt-2">
                {selectedSlots.size} time slot
                {selectedSlots.size !== 1 ? "s" : ""} selected
              </p>
            )}
          </div>
        )}

        {/* Notes */}
        <div>
          <label className="block text-sm font-medium text-blue-900 mb-2">
            <MessageSquare className="w-4 h-4 inline mr-1" />
            Additional Notes (Optional)
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            className="w-full px-3 py-2 border border-blue-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
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
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={submitting || !selectedDate || selectedSlots.size === 0}
            className="flex items-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
  );
};
