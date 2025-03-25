import {
  LoginData,
  RegisterData,
  UpdateProfileData,
  ChangePasswordData,
  User,
  AuthResponse,
} from '../types';

import { apiService, logger } from '@/services';
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
    logger.debug('Logging in user', { email: loginData.email });
    return apiService.post<ApiResponse<AuthResponse>, LoginData>('/auth/login', loginData);
  },

  /**
   * Регистрация нового пользователя
   * @param registerData Данные для регистрации
   */
  register: (registerData: RegisterData) => {
    logger.debug('Registering new user', { email: registerData.email });
    return apiService.post<ApiResponse<AuthResponse>, RegisterData>('/auth/register', registerData);
  },

  /**
   * Выход из системы
   */
  logout: () => {
    logger.debug('Logging out user');
    return apiService.post<ApiResponse<{ success: boolean }>>('/auth/logout');
  },

  /**
   * Обновление профиля пользователя
   * @param userId ID пользователя
   * @param profileData Данные для обновления профиля
   */
  updateProfile: (userId: string, profileData: UpdateProfileData) => {
    logger.debug('Updating user profile', { userId, ...profileData });
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
    logger.debug('Changing user password', { userId });
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
    logger.debug('Refreshing token');
    return apiService.post<
      ApiResponse<{ accessToken: string; refreshToken: string }>,
      { refreshToken: string }
    >('/auth/refresh', { refreshToken });
  },

  /**
   * Получение данных текущего пользователя
   */
  getCurrentUser: () => {
    logger.debug('Getting current user data');
    return apiService.get<ApiResponse<User>>('/auth/me');
  },

  /**
   * Запрос на сброс пароля
   * @param email - email пользователя
   */
  requestPasswordReset: (email: string) => {
    logger.debug('Requesting password reset', { email });
    return apiService.post<ApiResponse<{ success: boolean }>>('/auth/password-reset', { email });
  },

  /**
   * Сброс пароля
   * @param token - токен сброса пароля
   * @param newPassword - новый пароль
   */
  resetPassword: (token: string, newPassword: string) => {
    logger.debug('Resetting password with token');
    return apiService.post<ApiResponse<{ success: boolean }>>(`/auth/password-reset/${token}`, {
      newPassword,
    });
  },
};
