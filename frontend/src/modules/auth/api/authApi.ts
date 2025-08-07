import {
  LoginData,
  RegisterData,
  UpdateProfileData,
  ChangePasswordData,
  User,
} from '../types';

import { apiService, logger } from '@/services';
import { ApiResponse } from '@/shared/types/api';
import {
  loginDataToApi,
  registerDataToApi,
  updateProfileToApi,
  changePasswordToApi,
} from '@/api/adapters/authAdapter';
import type { UserDto } from '@/api/generated/models';
import { AuthService } from '@/api/generated/services/AuthService';

/**
 * API для работы с аутентификацией
 */
export const authApi = {
  /**
   * Авторизация пользователя
   * @param loginData Данные для входа
   */
  login: (loginData: LoginData) => {
    logger.debug('Logging in user', { username: loginData.username });
    return AuthService.login({
      requestBody: loginDataToApi(loginData),
    });
  },

  /**
   * Регистрация нового пользователя
   * @param registerData Данные для регистрации
   */
  register: (registerData: RegisterData) => {
    logger.debug('Registering new user', { username: registerData.username });
    return AuthService.register({
      requestBody: registerDataToApi(registerData),
    });
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
    return apiService.put<ApiResponse<UserDto>, ReturnType<typeof updateProfileToApi>>(
      `/users/${userId}/profile`,
      updateProfileToApi(profileData)
    );
  },

  /**
   * Смена пароля пользователя
   * @param userId ID пользователя
   * @param passwordData Данные для смены пароля
   */
  changePassword: (userId: string, passwordData: ChangePasswordData) => {
    logger.debug('Changing user password', { userId });
    return apiService.put<
      ApiResponse<{ success: boolean }>,
      ReturnType<typeof changePasswordToApi>
    >(`/users/${userId}/password`, changePasswordToApi(passwordData));
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
    return apiService.get<ApiResponse<User>>('/users/me');
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
