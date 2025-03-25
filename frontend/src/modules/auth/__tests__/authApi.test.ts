import { setupServer } from 'msw/node';
import { describe, it, expect, vi, beforeEach } from 'vitest';

import { authApi } from '../api/authApi';

import { apiService } from '@/services';
import { API_URL } from '@/shared/config/constants';
import { server } from '@/test/setup';

// Мокируем apiService для тестов
vi.mock('@/services', () => ({
  apiService: {
    post: vi.fn(),
    get: vi.fn(),
    put: vi.fn(),
  },
  logger: {
    debug: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
  },
}));

describe('authApi', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('login', () => {
    const loginData = { email: 'test@example.com', password: 'password123' };
    const mockUser = {
      id: '1',
      email: 'test@example.com',
      name: 'Test User',
      role: 'USER',
    };

    const mockResponse = {
      data: {
        user: mockUser,
        accessToken: 'mock-access-token',
        refreshToken: 'mock-refresh-token',
      },
      message: 'Login successful',
    };

    it('should call apiService.post with correct parameters', async () => {
      // Мокируем apiService.post для возврата ожидаемого ответа
      vi.mocked(apiService.post).mockResolvedValueOnce({ data: mockResponse });

      await authApi.login(loginData);

      // Проверяем, что apiService.post вызван с правильными параметрами
      expect(apiService.post).toHaveBeenCalledWith('/auth/login', loginData);
    });
  });

  describe('register', () => {
    const registerData = {
      email: 'test@example.com',
      password: 'password123',
      name: 'Test User',
      confirmPassword: 'password123',
    };

    const mockUser = {
      id: '1',
      email: 'test@example.com',
      name: 'Test User',
      role: 'USER',
    };

    const mockResponse = {
      data: {
        user: mockUser,
        accessToken: 'mock-access-token',
        refreshToken: 'mock-refresh-token',
      },
      message: 'Registration successful',
    };

    it('should call apiService.post with correct parameters', async () => {
      // Мокируем apiService.post для возврата ожидаемого ответа
      vi.mocked(apiService.post).mockResolvedValueOnce({ data: mockResponse });

      await authApi.register(registerData);

      // Проверяем, что apiService.post вызван с правильными параметрами
      expect(apiService.post).toHaveBeenCalledWith('/auth/register', registerData);
    });
  });

  describe('logout', () => {
    it('should call apiService.post with correct parameters', async () => {
      // Мокируем apiService.post для возврата ожидаемого ответа
      vi.mocked(apiService.post).mockResolvedValueOnce({
        data: {
          data: { success: true },
          message: 'Logout successful',
        },
      });

      await authApi.logout();

      // Проверяем, что apiService.post вызван с правильными параметрами
      expect(apiService.post).toHaveBeenCalledWith('/auth/logout');
    });
  });

  describe('updateProfile', () => {
    const userId = '1';
    const profileData = { name: 'Updated Name', email: 'updated@example.com' };

    const mockResponse = {
      data: {
        id: '1',
        email: 'updated@example.com',
        name: 'Updated Name',
        role: 'USER',
      },
      message: 'Profile updated successfully',
    };

    it('should call apiService.put with correct parameters', async () => {
      // Мокируем apiService.put для возврата ожидаемого ответа
      vi.mocked(apiService.put).mockResolvedValueOnce({ data: mockResponse });

      await authApi.updateProfile(userId, profileData);

      // Проверяем, что apiService.put вызван с правильными параметрами
      expect(apiService.put).toHaveBeenCalledWith(`/users/${userId}/profile`, profileData);
    });
  });

  describe('changePassword', () => {
    const userId = '1';
    const passwordData = {
      currentPassword: 'oldPassword123',
      newPassword: 'newPassword123',
      confirmPassword: 'newPassword123',
    };

    const mockResponse = {
      data: { success: true },
      message: 'Password changed successfully',
    };

    it('should call apiService.put with correct parameters', async () => {
      // Мокируем apiService.put для возврата ожидаемого ответа
      vi.mocked(apiService.put).mockResolvedValueOnce({ data: mockResponse });

      await authApi.changePassword(userId, passwordData);

      // Проверяем, что apiService.put вызван с правильными параметрами
      expect(apiService.put).toHaveBeenCalledWith(`/users/${userId}/password`, passwordData);
    });
  });

  describe('getCurrentUser', () => {
    const mockUser = {
      id: '1',
      email: 'test@example.com',
      name: 'Test User',
      role: 'USER',
    };

    const mockResponse = {
      data: mockUser,
      message: 'User fetched successfully',
    };

    it('should call apiService.get with correct path', async () => {
      // Мокируем apiService.get для возврата ожидаемого ответа
      vi.mocked(apiService.get).mockResolvedValueOnce({ data: mockResponse });

      await authApi.getCurrentUser();

      // Проверяем, что apiService.get вызван с правильным путем
      expect(apiService.get).toHaveBeenCalledWith('/auth/me');
    });
  });
});
