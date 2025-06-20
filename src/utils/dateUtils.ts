/**
 * Utility functions for date formatting and manipulation
 */

/**
 * Formats a date string consistently across the application
 * @param dateString - The date string to format (YYYY-MM-DD format)
 * @returns Formatted date string or null if input is null/undefined
 */
export const formatDate = (
  dateString: string | null | undefined,
): string | null => {
  if (!dateString) return null;
  return new Date(dateString + "T00:00:00").toLocaleDateString();
};

/**
 * Formats a date string with specific locale options
 * @param dateString - The date string to format (YYYY-MM-DD format)
 * @param options - Intl.DateTimeFormatOptions for custom formatting
 * @returns Formatted date string or null if input is null/undefined
 */
export const formatDateWithOptions = (
  dateString: string | null | undefined,
  options: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "short",
    day: "numeric",
  },
): string | null => {
  if (!dateString) return null;
  return new Date(dateString + "T00:00:00").toLocaleDateString(
    "en-US",
    options,
  );
};

/**
 * Returns current date in YYYY-MM-DD using local timezone (en-CA format)
 */
export const getCurrentDateString = (): string => {
  return new Date().toLocaleDateString("en-CA");
};

/**
 * Formats datetime for tour availability display
 * @param datetime - ISO datetime string
 * @returns Object with dateStr and timeStr for flexible display
 */
export const formatDateTime = (datetime: string) => {
  const date = new Date(datetime);
  const dateStr = date.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
  const timeStr = date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
  return { dateStr, timeStr };
};

/**
 * Formats datetime as a single display string for lists
 * @param datetime - ISO datetime string  
 * @returns Formatted string like "Thu, Jun 20, 2024 at 2:30 PM"
 */
export const formatDisplayDateTime = (datetime: string): string => {
  const { dateStr, timeStr } = formatDateTime(datetime);
  return `${dateStr} at ${timeStr}`;
};
