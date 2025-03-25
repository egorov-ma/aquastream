import { describe, it, expect } from 'vitest';

import {
  isValidEmail,
  isValidPassword,
  isValidPhone,
  isValidUrl,
  isRequired,
  isAlpha,
  isNumeric,
  isValidNumber,
  isInRange,
  isNotPastDate,
} from '../validators';

describe('validators utils', () => {
  describe('isValidEmail', () => {
    it('should return true for valid email addresses', () => {
      expect(isValidEmail('test@example.com')).toBe(true);
      expect(isValidEmail('test.name@example.co.uk')).toBe(true);
      expect(isValidEmail('test+label@example.com')).toBe(true);
      expect(isValidEmail('123@example.com')).toBe(true);
    });

    it('should return false for invalid email addresses', () => {
      expect(isValidEmail('')).toBe(false);
      expect(isValidEmail('test')).toBe(false);
      expect(isValidEmail('test@')).toBe(false);
      expect(isValidEmail('@example.com')).toBe(false);
      expect(isValidEmail('test@example')).toBe(false);
      expect(isValidEmail('test@.com')).toBe(false);
    });
  });

  describe('isValidPassword', () => {
    it('should return true for valid passwords', () => {
      expect(isValidPassword('Password123')).toBe(true);
      expect(isValidPassword('Abcd1234')).toBe(true);
      expect(isValidPassword('Secure-P4ssword')).toBe(true);
      expect(isValidPassword('P@ssw0rd')).toBe(true);
    });

    it('should return false for invalid passwords', () => {
      expect(isValidPassword('')).toBe(false);
      expect(isValidPassword('short')).toBe(false); // Слишком короткий
      expect(isValidPassword('password')).toBe(false); // Нет цифр
      expect(isValidPassword('12345678')).toBe(false); // Нет букв
    });
  });

  describe('isValidPhone', () => {
    it('should return true for valid phone numbers', () => {
      expect(isValidPhone('+79123456789')).toBe(true);
      expect(isValidPhone('89123456789')).toBe(true);
      expect(isValidPhone('+7 (912) 345-67-89')).toBe(true);
      expect(isValidPhone('8-912-345-67-89')).toBe(true);
    });

    it('should return false for invalid phone numbers', () => {
      expect(isValidPhone('')).toBe(false);
      expect(isValidPhone('123')).toBe(false); // Слишком короткий
      expect(isValidPhone('phone')).toBe(false); // Содержит буквы
      expect(isValidPhone('+7912345678')).toBe(false); // Недостаточно цифр
      expect(isValidPhone('+791234567890')).toBe(false); // Слишком много цифр
    });
  });

  describe('isValidUrl', () => {
    it('should return true for valid URLs', () => {
      expect(isValidUrl('https://example.com')).toBe(true);
      expect(isValidUrl('http://example.com')).toBe(true);
      expect(isValidUrl('https://example.com/path')).toBe(true);
      expect(isValidUrl('https://sub.example.com')).toBe(true);
      expect(isValidUrl('https://example.com?query=value')).toBe(true);
    });

    it('should return false for invalid URLs', () => {
      expect(isValidUrl('')).toBe(false);
      expect(isValidUrl('example')).toBe(false);
      expect(isValidUrl('example.com')).toBe(false); // Без протокола
    });
  });

  describe('isRequired', () => {
    it('should return true for non-empty strings', () => {
      expect(isRequired('Hello')).toBe(true);
      expect(isRequired('  Spaces  ')).toBe(true);
      expect(isRequired('123')).toBe(true);
    });

    it('should return false for empty strings', () => {
      expect(isRequired('')).toBe(false);
      expect(isRequired('   ')).toBe(false); // Только пробелы
    });
  });

  describe('isAlpha', () => {
    it('should return true for strings with only letters', () => {
      expect(isAlpha('Hello')).toBe(true);
      expect(isAlpha('Привет')).toBe(true);
      expect(isAlpha('Hello World')).toBe(true); // С пробелами
    });

    it('should return false for strings with non-alpha characters', () => {
      expect(isAlpha('Hello123')).toBe(false);
      expect(isAlpha('Hello!')).toBe(false);
      expect(isAlpha('123')).toBe(false);
    });
  });

  describe('isNumeric', () => {
    it('should return true for strings with only numbers', () => {
      expect(isNumeric('123')).toBe(true);
      expect(isNumeric('0')).toBe(true);
      expect(isNumeric('9876543210')).toBe(true);
    });

    it('should return false for strings with non-numeric characters', () => {
      expect(isNumeric('')).toBe(true); // Пустая строка проходит проверку
      expect(isNumeric('123a')).toBe(false);
      expect(isNumeric('123.45')).toBe(false); // Точка не проходит
      expect(isNumeric('-123')).toBe(false); // Минус не проходит
    });
  });

  describe('isValidNumber', () => {
    it('should return true for valid number strings', () => {
      expect(isValidNumber('123')).toBe(true);
      expect(isValidNumber('0')).toBe(true);
      expect(isValidNumber('-123')).toBe(true);
      expect(isValidNumber('123.45')).toBe(true);
    });

    it('should return false for invalid number strings', () => {
      expect(isValidNumber('')).toBe(false);
      expect(isValidNumber('abc')).toBe(false);
      expect(isValidNumber('123abc')).toBe(false);
    });
  });

  describe('isInRange', () => {
    it('should return true for numbers within range', () => {
      expect(isInRange(5, 1, 10)).toBe(true);
      expect(isInRange(1, 1, 10)).toBe(true); // Включает нижнюю границу
      expect(isInRange(10, 1, 10)).toBe(true); // Включает верхнюю границу
    });

    it('should return false for numbers outside range', () => {
      expect(isInRange(0, 1, 10)).toBe(false);
      expect(isInRange(11, 1, 10)).toBe(false);
      expect(isInRange(-5, 1, 10)).toBe(false);
    });
  });

  describe('isNotPastDate', () => {
    it('should return true for future dates', () => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      expect(isNotPastDate(tomorrow.toISOString())).toBe(true);

      const nextMonth = new Date();
      nextMonth.setMonth(nextMonth.getMonth() + 1);
      expect(isNotPastDate(nextMonth.toISOString())).toBe(true);
    });

    it('should return true for today', () => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      expect(isNotPastDate(today.toISOString())).toBe(true);
    });

    it('should return false for past dates', () => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      expect(isNotPastDate(yesterday.toISOString())).toBe(false);

      const lastMonth = new Date();
      lastMonth.setMonth(lastMonth.getMonth() - 1);
      expect(isNotPastDate(lastMonth.toISOString())).toBe(false);
    });
  });
});
