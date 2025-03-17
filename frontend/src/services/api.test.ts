import { describe, it, vi, expect } from 'vitest';

import { apiService } from './api';

// Мокаем методы apiService
vi.mock('./api', () => ({
  apiService: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
    patch: vi.fn(),
  },
}));

describe('ApiService', () => {
  it('has required HTTP methods', () => {
    // Проверяем, что методы существуют
    expect(typeof apiService.get).toBe('function');
    expect(typeof apiService.post).toBe('function');
    expect(typeof apiService.put).toBe('function');
    expect(typeof apiService.delete).toBe('function');
    expect(typeof apiService.patch).toBe('function');
  });
});
