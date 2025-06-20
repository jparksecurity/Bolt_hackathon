/**
 * Utility functions for display formatting and styling
 */

/**
 * Format location display from city and state
 */
export const formatLocation = (
  city?: string | null,
  state?: string | null,
): string | null => {
  if (!city && !state) return null;
  if (city && state) return `${city}, ${state}`;
  if (city) return city;
  if (state) return state;
  return null;
};

/**
 * Get CSS classes for project status badges
 */
export const getStatusColor = (status: string): string => {
  switch (status) {
    case "Active":
      return "status-active";
    case "Pending":
      return "status-pending";
    case "Completed":
      return "status-completed";
    case "On Hold":
      return "status-on-hold";
    default:
      return "bg-gray-500";
  }
};
