/**
 * Utility functions for date formatting and manipulation using Luxon
 * All functions normalize to local timezone handling for consistent user experience
 */
import { DateTime } from "luxon";

// Common format constants
const INPUT_DATETIME_FORMAT = "yyyy-MM-dd'T'HH:mm";
const DISPLAY_DATE_FORMAT = "ccc, MMM d, yyyy";
const DISPLAY_TIME_FORMAT = "h:mm a";

/**
 * Formats a date string consistently across the application
 * @param dateString - The date string to format (YYYY-MM-DD format)
 * @returns Formatted date string or null if input is null/undefined
 */
export const formatDate = (
  dateString: string | null | undefined,
): string | null => {
  if (!dateString) return null;

  const dt = DateTime.fromISO(dateString);
  if (!dt.isValid) return null;

  return dt.toLocaleString(DateTime.DATE_SHORT);
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

  const dt = DateTime.fromISO(dateString);
  if (!dt.isValid) return null;

  // Combine Luxon's DATE_SHORT with custom options for type safety
  return dt.toLocaleString({ ...DateTime.DATE_SHORT, ...options });
};

/**
 * Returns current date in YYYY-MM-DD format in local timezone
 */
export const getCurrentDateString = (): string => {
  const date = DateTime.now().toISODate();
  return date || "";
};

/**
 * Formats datetime for tour availability display
 * @param datetime - ISO datetime string
 * @returns Object with dateStr and timeStr for flexible display
 */
export const formatDateTime = (datetime: string) => {
  const dt = DateTime.fromISO(datetime);

  if (!dt.isValid) {
    return { dateStr: "Invalid date", timeStr: "Invalid time" };
  }

  const dateStr = dt.toFormat(DISPLAY_DATE_FORMAT); // "Thu, Jun 20, 2024"
  const timeStr = dt.toFormat(DISPLAY_TIME_FORMAT); // "2:30 PM"

  return { dateStr, timeStr };
};

/**
 * Formats datetime as a single display string for lists
 * @param datetime - ISO datetime string
 * @returns Formatted string like "Thu, Jun 20, 2024 at 2:30 PM"
 */
export const formatDisplayDateTime = (datetime: string): string => {
  const dt = DateTime.fromISO(datetime);

  if (!dt.isValid) {
    return "Invalid date";
  }

  const dateStr = dt.toFormat(DISPLAY_DATE_FORMAT);
  const timeStr = dt.toFormat(DISPLAY_TIME_FORMAT);
  return `${dateStr} at ${timeStr}`;
};

/**
 * Converts a datetime-local input value to ISO string for database storage
 * Keeps the local timezone information for proper user experience
 * @param dateTimeLocal - Value from datetime-local input (YYYY-MM-DDTHH:mm)
 * @returns ISO string in local timezone
 */
export const dateTimeLocalToISO = (dateTimeLocal: string): string => {
  if (!dateTimeLocal) return "";

  const dt = DateTime.fromISO(dateTimeLocal, { zone: "local" });
  if (!dt.isValid) return "";

  return dt.toISO() || "";
};

/**
 * Converts an ISO datetime string to datetime-local input format
 * @param isoString - ISO datetime string
 * @returns datetime-local format (YYYY-MM-DDTHH:mm)
 */
export const isoToDateTimeLocal = (isoString: string): string => {
  if (!isoString) return "";

  const dt = DateTime.fromISO(isoString);
  if (!dt.isValid) return "";

  return dt.toFormat(INPUT_DATETIME_FORMAT);
};

/**
 * Returns current timestamp in ISO format (local timezone)
 * Use this instead of new Date().toISOString()
 */
export const nowISO = (): string => {
  const iso = DateTime.now().toISO();
  return iso || "";
};
