/**
 * Utility functions for formatting data display
 */

/**
 * Formats a number as USD currency
 * @param amount - The amount to format, can be null
 * @returns Formatted currency string or 'N/A' if amount is null/undefined
 */
export const formatCurrency = (amount: number | null): string => {
  if (!amount) return 'N/A'
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount)
}

/**
 * Formats a date string for display
 * @param dateString - ISO date string or null
 * @returns Formatted date string or 'N/A' if dateString is null/undefined
 */
export const formatDate = (dateString: string | null): string => {
  if (!dateString) return 'N/A'
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}