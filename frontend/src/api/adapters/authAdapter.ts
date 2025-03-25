/**
 * Адаптер для преобразования между интерфейсами аутентификации и сгенерированными моделями API
 */

import { UserDto, LoginRequest, RegisterRequest } from '../generated/models';

import {
  User,
  LoginData,
  RegisterData,
  UpdateProfileData,
  ChangePasswordData,
} from '@/modules/auth/types';

/**
 * Преобразует UserDto из API в User для фронтенда
 */
export function apiToUser(apiUser: UserDto): User {
  return {
    id: apiUser.id || '',
    username: apiUser.username || '',
    email: apiUser.email || '',
    displayName: apiUser.displayName,
    avatar: apiUser.avatar,
    role: (apiUser.role as User['role']) || 'USER',
    createdAt: apiUser.createdAt,
  };
}

/**
 * Преобразует LoginData для фронтенда в LoginRequest для API
 */
export function loginDataToApi(data: LoginData): LoginRequest {
  return {
    email: data.email,
    password: data.password,
    rememberMe: data.rememberMe,
  };
}

/**
 * Преобразует RegisterData для фронтенда в RegisterRequest для API
 */
export function registerDataToApi(data: RegisterData): RegisterRequest {
  return {
    username: data.username,
    email: data.email,
    password: data.password,
    displayName: data.displayName,
  };
}

/**
 * Преобразует UpdateProfileData для фронтенда в объект для API
 * Примечание: в мок-схеме нет модели для обновления профиля, поэтому используем Record
 */
export function updateProfileToApi(data: UpdateProfileData): Record<string, string | undefined> {
  const result: Record<string, string | undefined> = {};

  if (data.username) result.username = data.username;
  if (data.displayName) result.displayName = data.displayName;
  if (data.avatar) result.avatar = data.avatar;

  return result;
}

/**
 * Преобразует ChangePasswordData для фронтенда в объект для API
 * Примечание: в мок-схеме нет модели для смены пароля, поэтому используем Record
 */
export function changePasswordToApi(data: ChangePasswordData): Record<string, string> {
  return {
    currentPassword: data.currentPassword,
    newPassword: data.newPassword,
    confirmPassword: data.confirmPassword,
  };
}
