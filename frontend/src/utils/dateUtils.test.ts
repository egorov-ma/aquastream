import { describe, it, expect } from 'vitest';

import { formatDate, formatDateTime, getRelativeDate } from './dateUtils';

describe('dateUtils', () => {
  describe('formatDate', () => {
    it('should format date correctly', () => {
      const dateString = '2023-01-01T12:00:00Z';
      const formattedDate = formatDate(dateString);
      expect(formattedDate).toBe('01.01.2023');
    });

    it('should return empty string for invalid date', () => {
      expect(formatDate('')).toBe('');
      expect(formatDate('invalid-date')).toBe('');
    });
  });

  describe('formatDateTime', () => {
    it('should format date and time correctly', () => {
      // Учитываем часовой пояс при тестировании
      const dateString = '2023-01-01T12:00:00Z';
      const formattedDateTime = formatDateTime(dateString);
      expect(formattedDateTime).toMatch(/01\.01\.2023, \d{2}:\d{2}/);
    });
  });

  describe('getRelativeDate', () => {
    it('should return formatted date for non-special dates', () => {
      const pastDate = '2020-01-01T12:00:00Z';
      expect(getRelativeDate(pastDate)).toBe('01.01.2020');
    });
  });
});
