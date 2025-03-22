import { apiService } from './api';

import { LoginData, RegisterData, UpdateProfileData, User } from '@/modules/auth/types';

// Интерфейс для ответа аутентификации
export interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}

/**
 * Сервис для работы с аутентификацией пользователей
 */
export class AuthService {
  /**
   * Вход пользователя в систему
   * @param data Данные для входа (email, пароль)
   * @returns Promise с ответом аутентификации
   */
  static async login(data: LoginData): Promise<{ data: AuthResponse }> {
    return apiService.post<AuthResponse>('/auth/login', data);
  }

  /**
   * Регистрация нового пользователя
   * @param data Данные для регистрации (имя, email, пароль и т.д.)
   * @returns Promise с ответом аутентификации
   */
  static async register(data: RegisterData): Promise<{ data: AuthResponse }> {
    return apiService.post<AuthResponse>('/auth/register', data);
  }

  /**
   * Выход пользователя из системы
   * @returns Promise с результатом операции
   */
  static async logout(): Promise<{ data: { success: boolean } }> {
    return apiService.post<{ success: boolean }>('/auth/logout');
  }

  /**
   * Обновление токена доступа
   * @param refreshToken Токен обновления
   * @returns Promise с новыми токенами
   */
  static async refreshToken(refreshToken: string): Promise<{ data: AuthResponse }> {
    return apiService.post<AuthResponse>('/auth/refresh', { refreshToken });
  }

  /**
   * Получение данных текущего пользователя
   * @returns Promise с данными пользователя
   */
  static async getCurrentUser(): Promise<{ data: User }> {
    return apiService.get<User>('/auth/me');
  }

  /**
   * Обновление профиля пользователя
   * @param userId ID пользователя
   * @param data Данные для обновления профиля
   * @returns Promise с обновленными данными пользователя
   */
  static async updateProfile(userId: string, data: UpdateProfileData): Promise<{ data: User }> {
    return apiService.put<User>(`/users/${userId}`, data);
  }

  /**
   * Изменение пароля пользователя
   * @param userId ID пользователя
   * @param currentPassword Текущий пароль
   * @param newPassword Новый пароль
   * @returns Promise с результатом операции
   */
  static async changePassword(
    userId: string,
    currentPassword: string,
    newPassword: string
  ): Promise<{ data: { success: boolean } }> {
    return apiService.post<{ success: boolean }>(`/users/${userId}/change-password`, {
      currentPassword,
      newPassword,
    });
  }

  /**
   * Запрос на сброс пароля
   * @param email - email пользователя
   * @returns Promise с ответом от API
   */
  static async requestPasswordReset(email: string) {
    return apiService.post('/auth/password-reset', { email });
  }

  /**
   * Сброс пароля
   * @param token - токен сброса пароля
   * @param newPassword - новый пароль
   * @returns Promise с ответом от API
   */
  static async resetPassword(token: string, newPassword: string) {
    return apiService.post(`/auth/password-reset/${token}`, { newPassword });
  }
}
