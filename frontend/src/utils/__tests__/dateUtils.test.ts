import { describe, it, expect } from 'vitest';

import {
  formatDate,
  formatDateTime,
  formatDateRange,
  getDaysDifference,
  getRelativeDate,
  isFutureDate,
} from '../dateUtils';

describe('dateUtils', () => {
  describe('formatDate', () => {
    it('should format a date string in the Russian format', () => {
      expect(formatDate('2023-07-15')).toBe('15.07.2023');
    });

    it('should return empty string for invalid date', () => {
      expect(formatDate('invalid-date')).toBe('');
    });

    it('should handle empty input', () => {
      expect(formatDate('')).toBe('');
    });
  });

  describe('formatDateTime', () => {
    it('should format a datetime string with Russian format', () => {
      // Note: The test might need adjustment depending on the actual implementation
      const formatted = formatDateTime('2023-07-15T14:30:00');
      expect(formatted).toContain('15.07.2023');
      expect(formatted).toContain('14:30');
    });

    it('should return empty string for invalid datetime', () => {
      expect(formatDateTime('invalid-datetime')).toBe('');
    });

    it('should handle empty input', () => {
      expect(formatDateTime('')).toBe('');
    });
  });

  describe('formatDateRange', () => {
    it('should format a date range with both start and end dates', () => {
      const formatted = formatDateRange('2023-07-15', '2023-07-18');
      expect(formatted).toBe('15.07.2023 - 18.07.2023');
    });

    it('should return only the start date if no end date is provided', () => {
      expect(formatDateRange('2023-07-15')).toBe('15.07.2023');
    });

    it('should format same-day range with time', () => {
      const formatted = formatDateRange('2023-07-15T10:00:00', '2023-07-15T14:00:00');
      expect(formatted).toContain('15.07.2023');
      expect(formatted).toContain('10:00');
      expect(formatted).toContain('14:00');
    });

    it('should return empty string if start date is invalid', () => {
      expect(formatDateRange('')).toBe('');
    });
  });

  describe('getDaysDifference', () => {
    it('should calculate correct difference between dates', () => {
      // Creating fixed dates to avoid timezone issues
      const date1 = new Date(2023, 6, 15).toISOString(); // July 15, 2023
      const date2 = new Date(2023, 6, 18).toISOString(); // July 18, 2023

      expect(getDaysDifference(date1, date2)).toBe(3);
    });

    it('should return days difference with current date if second date not provided', () => {
      const pastDate = new Date();
      pastDate.setDate(pastDate.getDate() - 5);

      // We can't test exact value as it depends on current date
      expect(getDaysDifference(pastDate.toISOString())).toBeGreaterThanOrEqual(5);
    });
  });

  describe('getRelativeDate', () => {
    it('should return "Сегодня" for today', () => {
      const today = new Date();
      expect(getRelativeDate(today.toISOString())).toBe('Сегодня');
    });

    it('should return "Вчера" for yesterday', () => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      expect(getRelativeDate(yesterday.toISOString())).toBe('Вчера');
    });

    it('should return "Завтра" for tomorrow', () => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      expect(getRelativeDate(tomorrow.toISOString())).toBe('Завтра');
    });

    it('should return formatted date for other dates', () => {
      const nextWeek = new Date();
      nextWeek.setDate(nextWeek.getDate() + 7);
      expect(getRelativeDate(nextWeek.toISOString())).toMatch(/\d{2}\.\d{2}\.\d{4}/);
    });
  });

  describe('isFutureDate', () => {
    it('should return true for future dates', () => {
      const futureDate = new Date();
      futureDate.setFullYear(futureDate.getFullYear() + 1);
      expect(isFutureDate(futureDate.toISOString())).toBe(true);
    });

    it('should return false for past dates', () => {
      const pastDate = new Date();
      pastDate.setFullYear(pastDate.getFullYear() - 1);
      expect(isFutureDate(pastDate.toISOString())).toBe(false);
    });
  });
});
