/**
 * Global Luxon configuration for consistent date/time handling across the application
 * Normalizes to local timezone handling for optimal user experience
 */
import { Settings } from "luxon";

/**
 * Initialize Luxon with project-wide defaults
 * Call this once at application startup
 */
export const initializeLuxon = () => {
  // Set default locale - change if needed for internationalization
  Settings.defaultLocale = "en-US";

  // Keep local timezone as default for user-centric operations
  // This ensures datetime-local inputs and user interactions remain consistent
  Settings.defaultZone = "local";

  // Optional: Enable more detailed invalid date messages for debugging
  Settings.throwOnInvalid = false;
};
