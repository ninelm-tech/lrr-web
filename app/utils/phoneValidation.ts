/**
 * Phone number validation utilities
 */

/**
 * Validates Nigerian phone numbers
 * Only accepts local format: 0XXXXXXXXXX (11 digits total)
 * 
 * @param phoneNumber - The phone number to validate
 * @returns true if valid Nigerian number, false otherwise
 */
export function isValidNigerianPhoneNumber(phoneNumber: string): boolean {
  if (!phoneNumber) return false;

  // Remove all spaces
  let cleaned = phoneNumber.replace(/\s/g, "");

  // Must start with 0 and have exactly 11 digits
  if (!/^0\d{10}$/.test(cleaned)) {
    return false;
  }

  // Validate first digit after 0 is 7, 8, or 9 (valid in Nigeria)
  const secondDigit = cleaned.charAt(1);
  if (!/^[789]$/.test(secondDigit)) {
    return false;
  }

  return true;
}

/**
 * Formats Nigerian phone number (no change needed - already in correct format)
 * @param phoneNumber - The phone number to format
 * @returns Formatted number or original if invalid
 */
export function formatNigerianPhoneNumber(phoneNumber: string): string {
  if (!isValidNigerianPhoneNumber(phoneNumber)) {
    return phoneNumber;
  }
  // Remove spaces and return as-is (already in 0XXXXXXXXXX format)
  return phoneNumber.replace(/\s/g, "");
}

/**
 * Get user-friendly error message for phone number validation
 * @param phoneNumber - The invalid phone number
 * @returns Error message
 */
export function getPhoneNumberErrorMessage(phoneNumber: string): string {
  if (!phoneNumber) {
    return "Phone number is required";
  }

  if (phoneNumber.length < 11) {
    return "Phone number must be 11 digits (e.g., 08012345678)";
  }

  if (phoneNumber.length > 14) {
    return "Phone number is too long";
  }

  if (!phoneNumber.startsWith("0")) {
    return "Phone number must start with 0 (e.g., 08012345678)";
  }

  // Check if second digit is valid (7, 8, or 9)
  const cleaned = phoneNumber.replace(/\s/g, "");
  if (cleaned.length > 1) {
    const secondDigit = cleaned.charAt(1);
    if (!/^[789]$/.test(secondDigit)) {
      return "Second digit must be 7, 8, or 9 (e.g., 08012345678)";
    }
  }

  return "Please enter a valid Nigerian phone number (e.g., 08012345678)";
}
