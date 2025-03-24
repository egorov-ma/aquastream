/**
 * Типы и интерфейсы для модуля аутентификации
 */

import { ApiError } from '@/shared/types/api';

/**
 * Роли пользователей в системе
 */
export enum UserRole {
  ADMIN = 'admin',
  USER = 'user',
  GUEST = 'guest',
}

/**
 * Интерфейс пользователя
 */
export interface User {
  id: string;
  email: string;
  displayName?: string;
  firstName?: string;
  lastName?: string;
  role: UserRole | string;
  avatar?: string;
  createdAt: string;
  updatedAt: string;
}

export interface LoginData {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface RegisterData {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
  displayName?: string;
}

export interface UpdateProfileData {
  firstName?: string;
  lastName?: string;
  displayName?: string;
  avatar?: string;
}

export interface ChangePasswordData {
  currentPassword: string;
  newPassword: string;
}

export interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: string | null;
  accessToken: string | null;
  refreshToken: string | null;
}

/**
 * Ответ сервера при авторизации/регистрации
 */
export interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}

/**
 * Тип для ошибок аутентификации
 */
export interface AuthError extends ApiError {}

export interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: string | null;
  login: (data: LoginData) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (userId: string, data: UpdateProfileData) => Promise<void>;
  changePassword: (userId: string, data: ChangePasswordData) => Promise<void>;
  clearError: () => void;
}
