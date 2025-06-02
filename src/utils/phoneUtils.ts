/**
 * Validates an Angolan phone number
 * Format: +2449[2-6]XXXXXXXX
 * Example: +244923456789
 */
export function isValidAngolanPhone(phone: string): boolean {
  const phoneRegex = /^\+2449[2-6]\d{7}$/;
  return phoneRegex.test(phone);
}

/**
 * Formats a phone number to the Angolan format
 * Input can be: 923456789, 923456789, +244923456789
 * Output: +244923456789
 */
export function formatAngolanPhone(phone: string): string {
  // Remove any non-digit characters
  const digits = phone.replace(/\D/g, '');

  // If it's already in international format, return as is
  if (phone.startsWith('+244')) {
    return phone;
  }

  // If it starts with 9, add +244
  if (digits.startsWith('9')) {
    return `+244${digits}`;
  }

  // If it's just the number without country code
  if (digits.length === 9) {
    return `+244${digits}`;
  }

  // If it's the full number without +, add it
  if (digits.length === 12) {
    return `+${digits}`;
  }

  throw new Error('Invalid phone number format');
}

/**
 * Extracts the carrier from an Angolan phone number
 * Returns: 'Unitel' | 'Movicel' | 'Africell' | 'Unknown'
 */
export function getAngolanCarrier(phone: string): 'Unitel' | 'Movicel' | 'Africell' | 'Unknown' {
  if (!isValidAngolanPhone(phone)) {
    return 'Unknown';
  }

  const prefix = phone.substring(4, 5); // Get the digit after 9

  switch (prefix) {
    case '2':
    case '3':
      return 'Unitel';
    case '4':
    case '5':
      return 'Movicel';
    case '6':
      return 'Africell';
    default:
      return 'Unknown';
  }
}

/**
 * Masks a phone number for display
 * Example: +244923456789 -> +244 923 *** 789
 */
export function maskPhoneNumber(phone: string): string {
  if (!isValidAngolanPhone(phone)) {
    return phone;
  }

  const prefix = phone.substring(0, 7); // +244923
  const suffix = phone.substring(phone.length - 3); // last 3 digits
  return `${prefix} *** ${suffix}`;
}

/**
 * Generates a test phone number for a specific carrier
 * Useful for development and testing
 */
export function generateTestPhone(carrier: 'Unitel' | 'Movicel' | 'Africell'): string {
  const prefixes = {
    Unitel: ['92', '93'],
    Movicel: ['94', '95'],
    Africell: ['96'],
  };

  const prefix = prefixes[carrier][Math.floor(Math.random() * prefixes[carrier].length)];
  const randomDigits = Math.floor(Math.random() * 10000000).toString().padStart(7, '0');
  return `+244${prefix}${randomDigits}`;
} 