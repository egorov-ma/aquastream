import { describe, it, expect, vi, beforeEach } from 'vitest';

import { eventsApi } from '../api/eventsApi';

import { apiService } from '@/services';

vi.mock('@/services', () => ({
  apiService: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  },
  logger: {
    debug: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
  },
}));

describe('eventsApi', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getEvents', () => {
    it('should call apiService.get with correct parameters', async () => {
      vi.mocked(apiService.get).mockResolvedValueOnce({ status: 200, data: { data: [] } } as any);
      await eventsApi.getEvents({ type: 'RAFTING', upcoming: true });
      expect(apiService.get).toHaveBeenCalledWith('/events', {
        params: { type: 'RAFTING', upcoming: true },
      });
    });
  });

  describe('createEvent', () => {
    it('should call apiService.post with correct parameters', async () => {
      vi.mocked(apiService.post).mockResolvedValueOnce({ status: 201, data: { data: {} } } as any);
      const eventData = {
        title: 'Test',
        description: 'Desc',
        startDate: '2024',
        endDate: '2024',
        location: 'Loc',
        price: 100,
        capacity: 10,
        difficulty: 'EASY',
        type: 'RAFTING',
      } as any;
      await eventsApi.createEvent(eventData);
      expect(apiService.post).toHaveBeenCalledWith('/events', expect.objectContaining({ title: 'Test' }));
    });
  });

  describe('publishEvent', () => {
    it('should call apiService.put with correct path', async () => {
      vi.mocked(apiService.put).mockResolvedValueOnce({ status: 200, data: { data: {} } } as any);
      await eventsApi.publishEvent('1');
      expect(apiService.put).toHaveBeenCalledWith('/events/1/publish');
    });
  });

  describe('cancelEvent', () => {
    it('should call apiService.put with correct path', async () => {
      vi.mocked(apiService.put).mockResolvedValueOnce({ status: 200, data: { data: {} } } as any);
      await eventsApi.cancelEvent('1');
      expect(apiService.put).toHaveBeenCalledWith('/events/1/cancel');
    });
  });

  describe('registerForEvent', () => {
    it('should call apiService.post with correct path', async () => {
      vi.mocked(apiService.post).mockResolvedValueOnce({ status: 200, data: { data: {} } } as any);
      await eventsApi.registerForEvent('1');
      expect(apiService.post).toHaveBeenCalledWith('/events/1/register');
    });
  });
});

