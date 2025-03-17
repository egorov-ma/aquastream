import { describe, it, expect } from 'vitest';

import {
  isValidEmail,
  isValidPassword,
  isRequired,
  isValidPhone,
  isValidUrl,
  isAlpha,
  isNumeric,
  isValidNumber,
  isInRange,
  isNotPastDate,
} from './validators';

describe('Validators', () => {
  describe('isValidEmail', () => {
    it('returns true for valid emails', () => {
      expect(isValidEmail('test@example.com')).toBe(true);
      expect(isValidEmail('user.name@domain.co.uk')).toBe(true);
    });

    it('returns false for invalid emails', () => {
      expect(isValidEmail('test@')).toBe(false);
      expect(isValidEmail('test@domain')).toBe(false);
      expect(isValidEmail('testdomain.com')).toBe(false);
      expect(isValidEmail('')).toBe(false);
    });
  });

  describe('isValidPassword', () => {
    it('returns true for valid passwords', () => {
      expect(isValidPassword('password123')).toBe(true);
      expect(isValidPassword('SecurePass1')).toBe(true);
    });

    it('returns false for invalid passwords', () => {
      expect(isValidPassword('pass')).toBe(false); // слишком короткий
      expect(isValidPassword('password')).toBe(false); // нет цифры
      expect(isValidPassword('12345678')).toBe(false); // только цифры
      expect(isValidPassword('')).toBe(false);
    });
  });

  describe('isRequired', () => {
    it('returns true for non-empty values', () => {
      expect(isRequired('text')).toBe(true);
      expect(isRequired('a')).toBe(true);
    });

    it('returns false for empty values', () => {
      expect(isRequired('')).toBe(false);
      expect(isRequired('   ')).toBe(false);
    });
  });

  describe('isValidPhone', () => {
    it('returns true for valid phone numbers', () => {
      expect(isValidPhone('+79001234567')).toBe(true);
      expect(isValidPhone('89001234567')).toBe(true);
      expect(isValidPhone('+7(900)123-45-67')).toBe(true);
    });

    it('returns false for invalid phone numbers', () => {
      expect(isValidPhone('phone')).toBe(false);
      expect(isValidPhone('123')).toBe(false);
      expect(isValidPhone('')).toBe(false);
    });
  });

  describe('isValidUrl', () => {
    it('returns true for valid URLs', () => {
      expect(isValidUrl('https://example.com')).toBe(true);
      expect(isValidUrl('http://localhost:3000')).toBe(true);
    });

    it('returns false for invalid URLs', () => {
      expect(isValidUrl('example')).toBe(false);
      expect(isValidUrl('example.com')).toBe(false); // нет протокола
      expect(isValidUrl('')).toBe(false);
    });
  });

  describe('isAlpha', () => {
    it('returns true for strings with only letters', () => {
      expect(isAlpha('text')).toBe(true);
      expect(isAlpha('Текст')).toBe(true);
      expect(isAlpha('Text with spaces')).toBe(true);
    });

    it('returns false for strings with non-letters', () => {
      expect(isAlpha('text123')).toBe(false);
      expect(isAlpha('text!')).toBe(false);
      expect(isAlpha('123')).toBe(false);
    });
  });

  describe('isNumeric', () => {
    it('returns true for strings with only numbers', () => {
      expect(isNumeric('123')).toBe(true);
      expect(isNumeric('0')).toBe(true);
    });

    it('returns false for strings with non-numbers', () => {
      expect(isNumeric('123a')).toBe(false);
      expect(isNumeric('12.3')).toBe(false);
      expect(isNumeric('-123')).toBe(false);
    });
  });

  describe('isValidNumber', () => {
    it('returns true for valid numbers', () => {
      expect(isValidNumber('123')).toBe(true);
      expect(isValidNumber('12.3')).toBe(true);
      expect(isValidNumber('-123')).toBe(true);
      expect(isValidNumber('0')).toBe(true);
    });

    it('returns false for invalid numbers', () => {
      expect(isValidNumber('123a')).toBe(false);
      expect(isValidNumber('text')).toBe(false);
      expect(isValidNumber('')).toBe(false);
    });
  });

  describe('isInRange', () => {
    it('returns true for values in range', () => {
      expect(isInRange(5, 1, 10)).toBe(true);
      expect(isInRange(1, 1, 10)).toBe(true); // граничное значение
      expect(isInRange(10, 1, 10)).toBe(true); // граничное значение
    });

    it('returns false for values out of range', () => {
      expect(isInRange(0, 1, 10)).toBe(false);
      expect(isInRange(11, 1, 10)).toBe(false);
    });
  });

  describe('isNotPastDate', () => {
    it('returns true for future dates', () => {
      // Создаем дату в будущем
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 1);
      expect(isNotPastDate(futureDate.toISOString())).toBe(true);
    });

    it('returns true for today', () => {
      // Сегодняшняя дата
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      expect(isNotPastDate(today.toISOString())).toBe(true);
    });

    it('returns false for past dates', () => {
      // Создаем дату в прошлом
      const pastDate = new Date();
      pastDate.setDate(pastDate.getDate() - 1);
      expect(isNotPastDate(pastDate.toISOString())).toBe(false);
    });
  });
});
