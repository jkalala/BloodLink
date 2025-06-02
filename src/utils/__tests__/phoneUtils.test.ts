import {
  isValidAngolanPhone,
  formatAngolanPhone,
  getAngolanCarrier,
  maskPhoneNumber,
  generateTestPhone,
} from '../phoneUtils';

describe('Phone Number Utilities', () => {
  describe('isValidAngolanPhone', () => {
    it('should validate correct Angolan phone numbers', () => {
      expect(isValidAngolanPhone('+244923456789')).toBe(true);
      expect(isValidAngolanPhone('+244933456789')).toBe(true);
      expect(isValidAngolanPhone('+244943456789')).toBe(true);
      expect(isValidAngolanPhone('+244953456789')).toBe(true);
      expect(isValidAngolanPhone('+244963456789')).toBe(true);
    });

    it('should reject invalid phone numbers', () => {
      expect(isValidAngolanPhone('+244913456789')).toBe(false); // Invalid prefix
      expect(isValidAngolanPhone('+24492345678')).toBe(false);  // Too short
      expect(isValidAngolanPhone('+2449234567890')).toBe(false); // Too long
      expect(isValidAngolanPhone('244923456789')).toBe(false);  // Missing +
      expect(isValidAngolanPhone('+24492345678a')).toBe(false); // Invalid character
    });
  });

  describe('formatAngolanPhone', () => {
    it('should format various input formats correctly', () => {
      expect(formatAngolanPhone('923456789')).toBe('+244923456789');
      expect(formatAngolanPhone('+244923456789')).toBe('+244923456789');
      expect(formatAngolanPhone('244923456789')).toBe('+244923456789');
    });

    it('should throw error for invalid formats', () => {
      expect(() => formatAngolanPhone('123456789')).toThrow();
      expect(() => formatAngolanPhone('abc')).toThrow();
      expect(() => formatAngolanPhone('')).toThrow();
    });
  });

  describe('getAngolanCarrier', () => {
    it('should identify carriers correctly', () => {
      expect(getAngolanCarrier('+244923456789')).toBe('Unitel');
      expect(getAngolanCarrier('+244933456789')).toBe('Unitel');
      expect(getAngolanCarrier('+244943456789')).toBe('Movicel');
      expect(getAngolanCarrier('+244953456789')).toBe('Movicel');
      expect(getAngolanCarrier('+244963456789')).toBe('Africell');
    });

    it('should return Unknown for invalid numbers', () => {
      expect(getAngolanCarrier('+244913456789')).toBe('Unknown');
      expect(getAngolanCarrier('invalid')).toBe('Unknown');
    });
  });

  describe('maskPhoneNumber', () => {
    it('should mask phone numbers correctly', () => {
      expect(maskPhoneNumber('+244923456789')).toBe('+244 923 *** 789');
      expect(maskPhoneNumber('+244933456789')).toBe('+244 933 *** 789');
    });

    it('should return original string for invalid numbers', () => {
      expect(maskPhoneNumber('invalid')).toBe('invalid');
      expect(maskPhoneNumber('+244913456789')).toBe('+244913456789');
    });
  });

  describe('generateTestPhone', () => {
    it('should generate valid test phone numbers', () => {
      const unitelPhone = generateTestPhone('Unitel');
      const movicelPhone = generateTestPhone('Movicel');
      const africellPhone = generateTestPhone('Africell');

      expect(isValidAngolanPhone(unitelPhone)).toBe(true);
      expect(isValidAngolanPhone(movicelPhone)).toBe(true);
      expect(isValidAngolanPhone(africellPhone)).toBe(true);

      expect(getAngolanCarrier(unitelPhone)).toBe('Unitel');
      expect(getAngolanCarrier(movicelPhone)).toBe('Movicel');
      expect(getAngolanCarrier(africellPhone)).toBe('Africell');
    });
  });
}); 