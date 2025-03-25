import { describe, it, expect, vi, beforeEach } from 'vitest';

import authReducer, {
  setUser,
  clearError,
  initAuth,
  login,
  register,
  logout,
  updateProfile,
  changePassword,
} from '../store/authSlice';
import { User } from '../types';

describe('authSlice', () => {
  // Сохранение и восстановление localStorage
  const originalLocalStorage = { ...window.localStorage };

  beforeEach(() => {
    // Очищаем localStorage перед каждым тестом
    localStorage.clear();

    // Мокируем localStorage
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(
      (key) => originalLocalStorage[key as keyof typeof originalLocalStorage] || null
    );
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation((key, value) => {
      originalLocalStorage[key as keyof typeof originalLocalStorage] = value as string;
    });
    vi.spyOn(Storage.prototype, 'removeItem').mockImplementation((key) => {
      delete originalLocalStorage[key as keyof typeof originalLocalStorage];
    });
  });

  // Исходное состояние для тестов
  const initialState = {
    user: null,
    isLoading: false,
    isAuthenticated: false,
    error: null,
    accessToken: null,
    refreshToken: null,
  };

  // Моковые данные пользователя
  const mockUser: User = {
    id: '1',
    email: 'test@example.com',
    name: 'Test User',
    role: 'USER',
  };

  describe('reducer', () => {
    it('should return the initial state', () => {
      expect(authReducer(undefined, { type: 'unknown' })).toEqual(initialState);
    });

    it('should handle setUser', () => {
      const action = setUser(mockUser);
      const newState = authReducer(initialState, action);

      expect(newState).toEqual({
        ...initialState,
        user: mockUser,
        isAuthenticated: true,
      });
    });

    it('should handle clearError', () => {
      const stateWithError = {
        ...initialState,
        error: 'Some error message',
      };

      const action = clearError();
      const newState = authReducer(stateWithError, action);

      expect(newState.error).toBeNull();
    });

    it('should handle initAuth with user in localStorage', () => {
      // Устанавливаем пользователя в localStorage
      localStorage.setItem('user', JSON.stringify(mockUser));

      const action = initAuth();
      const newState = authReducer(initialState, action);

      expect(newState).toEqual({
        ...initialState,
        user: mockUser,
        isAuthenticated: true,
      });
    });

    it('should handle initAuth without user in localStorage', () => {
      const action = initAuth();
      const newState = authReducer(initialState, action);

      expect(newState).toEqual(initialState);
    });
  });

  describe('async actions - fulfilled', () => {
    it('should handle login.fulfilled', () => {
      const payload = {
        user: mockUser,
        accessToken: 'test-access-token',
        refreshToken: 'test-refresh-token',
      };

      const action = { type: login.fulfilled.type, payload };
      const newState = authReducer(initialState, action);

      expect(newState).toEqual({
        ...initialState,
        user: mockUser,
        accessToken: 'test-access-token',
        refreshToken: 'test-refresh-token',
        isAuthenticated: true,
        isLoading: false,
      });
    });

    it('should handle register.fulfilled', () => {
      const payload = {
        user: mockUser,
        accessToken: 'test-access-token',
        refreshToken: 'test-refresh-token',
      };

      const action = { type: register.fulfilled.type, payload };
      const newState = authReducer(initialState, action);

      expect(newState).toEqual({
        ...initialState,
        user: mockUser,
        accessToken: 'test-access-token',
        refreshToken: 'test-refresh-token',
        isAuthenticated: true,
        isLoading: false,
      });
    });

    it('should handle logout.fulfilled', () => {
      const loggedInState = {
        user: mockUser,
        isLoading: false,
        isAuthenticated: true,
        error: null,
        accessToken: 'test-access-token',
        refreshToken: 'test-refresh-token',
      };

      const action = { type: logout.fulfilled.type, payload: null };
      const newState = authReducer(loggedInState, action);

      expect(newState).toEqual({
        ...initialState,
        isLoading: false,
      });
    });

    it('should handle updateProfile.fulfilled', () => {
      const updatedUser = {
        ...mockUser,
        name: 'Updated Name',
      };

      const loggedInState = {
        ...initialState,
        user: mockUser,
        isAuthenticated: true,
      };

      const action = { type: updateProfile.fulfilled.type, payload: updatedUser };
      const newState = authReducer(loggedInState, action);

      expect(newState).toEqual({
        ...loggedInState,
        user: updatedUser,
        isLoading: false,
      });
    });

    it('should handle changePassword.fulfilled', () => {
      const loggedInState = {
        ...initialState,
        user: mockUser,
        isAuthenticated: true,
        isLoading: true,
      };

      const action = { type: changePassword.fulfilled.type, payload: null };
      const newState = authReducer(loggedInState, action);

      expect(newState).toEqual({
        ...loggedInState,
        isLoading: false,
      });
    });
  });

  describe('async actions - pending', () => {
    it('should handle login.pending', () => {
      const action = { type: login.pending.type };
      const newState = authReducer(initialState, action);

      expect(newState).toEqual({
        ...initialState,
        isLoading: true,
        error: null,
      });
    });

    it('should handle register.pending', () => {
      const action = { type: register.pending.type };
      const newState = authReducer(initialState, action);

      expect(newState).toEqual({
        ...initialState,
        isLoading: true,
        error: null,
      });
    });
  });

  describe('async actions - rejected', () => {
    it('should handle login.rejected', () => {
      const errorMessage = 'Login failed';
      const action = {
        type: login.rejected.type,
        payload: errorMessage,
      };

      const newState = authReducer(initialState, action);

      expect(newState).toEqual({
        ...initialState,
        isLoading: false,
        error: errorMessage,
      });
    });

    it('should handle register.rejected', () => {
      const errorMessage = 'Registration failed';
      const action = {
        type: register.rejected.type,
        payload: errorMessage,
      };

      const newState = authReducer(initialState, action);

      expect(newState).toEqual({
        ...initialState,
        isLoading: false,
        error: errorMessage,
      });
    });
  });
});
