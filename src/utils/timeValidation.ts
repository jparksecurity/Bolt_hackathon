/**
 * Time validation utilities for business rules
 */
import { DateTime } from "luxon";

/**
 * Validates if a time is within tour scheduling hours
 * Business hours: 9:00 AM - 5:00 PM
 * Latest tour start: 4:30 PM (allows 30-minute tour to finish by 5:00 PM)
 * @param timeString - Time in HH:mm format
 * @returns boolean
 */
export const isWithinBusinessHours = (timeString: string): boolean => {
  if (!timeString) return false;

  const time = DateTime.fromFormat(timeString, "HH:mm");
  if (!time.isValid) return false;

  const startTime = DateTime.fromObject({ hour: 9, minute: 0 });
  const endTime = DateTime.fromObject({ hour: 16, minute: 30 }); // 4:30 PM

  return time >= startTime && time <= endTime; // 9:00 AM to 4:30 PM
};

/**
 * Validates if time is in 30-minute intervals
 * @param timeString - Time in HH:mm format
 * @returns boolean
 */
export const isThirtyMinuteInterval = (timeString: string): boolean => {
  if (!timeString) return false;

  const time = DateTime.fromFormat(timeString, "HH:mm");
  if (!time.isValid) return false;

  return time.minute % 30 === 0;
};
