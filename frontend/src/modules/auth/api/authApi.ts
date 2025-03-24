import {
  LoginData,
  RegisterData,
  UpdateProfileData,
  ChangePasswordData,
  User,
  AuthResponse,
} from '../types';

import { apiService } from '@/services/api';
import { ApiResponse } from '@/shared/types/api';

/**
 * API для работы с аутентификацией
 */
export const authApi = {
  /**
   * Авторизация пользователя
   * @param loginData Данные для входа
   */
  login: (loginData: LoginData) => {
    return apiService.post<ApiResponse<AuthResponse>, LoginData>('/auth/login', loginData);
  },

  /**
   * Регистрация нового пользователя
   * @param registerData Данные для регистрации
   */
  register: (registerData: RegisterData) => {
    return apiService.post<ApiResponse<AuthResponse>, RegisterData>('/auth/register', registerData);
  },

  /**
   * Выход из системы
   */
  logout: () => {
    return apiService.post<ApiResponse<{ success: boolean }>>('/auth/logout');
  },

  /**
   * Обновление профиля пользователя
   * @param userId ID пользователя
   * @param profileData Данные для обновления профиля
   */
  updateProfile: (userId: string, profileData: UpdateProfileData) => {
    return apiService.put<ApiResponse<User>, UpdateProfileData>(
      `/users/${userId}/profile`,
      profileData
    );
  },

  /**
   * Смена пароля пользователя
   * @param userId ID пользователя
   * @param passwordData Данные для смены пароля
   */
  changePassword: (userId: string, passwordData: ChangePasswordData) => {
    return apiService.put<ApiResponse<{ success: boolean }>, ChangePasswordData>(
      `/users/${userId}/password`,
      passwordData
    );
  },

  /**
   * Обновление токена доступа
   * @param refreshToken Токен обновления
   */
  refreshToken: (refreshToken: string) => {
    return apiService.post<
      ApiResponse<{ accessToken: string; refreshToken: string }>,
      { refreshToken: string }
    >('/auth/refresh', { refreshToken });
  },

  /**
   * Получение данных текущего пользователя
   */
  getCurrentUser: () => {
    return apiService.get<ApiResponse<User>>('/auth/me');
  },

  /**
   * Запрос на сброс пароля
   * @param email - email пользователя
   */
  requestPasswordReset: (email: string) => {
    return apiService.post<ApiResponse<{ success: boolean }>>('/auth/password-reset', { email });
  },

  /**
   * Сброс пароля
   * @param token - токен сброса пароля
   * @param newPassword - новый пароль
   */
  resetPassword: (token: string, newPassword: string) => {
    return apiService.post<ApiResponse<{ success: boolean }>>(`/auth/password-reset/${token}`, {
      newPassword,
    });
  },
};
