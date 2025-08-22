// This file contains utility functions like unique ID generation and date formatting.

export function generateUniqueId(): string {
  // Using a simple timestamp + random string for unique ID generation on the frontend
  // For backend IDs, rely on the database's auto-increment/UUID generation.
  return Date.now().toString(36) + Math.random().toString(36).substring(2, 7);
}

/**
 * Formats a Date object into a YYYY-MM-DD string.
 * @param date - The Date object to format.
 * @returns A string in "YYYY-MM-DD" format.
 */
export function formatDateToISO(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}