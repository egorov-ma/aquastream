// Типы для модуля аутентификации

// Роли пользователей
export enum UserRole {
  USER = 'user',
  ORGANIZER = 'organizer',
  ADMIN = 'admin',
}

// Интерфейс пользователя
export interface User {
  id: string | number;
  username: string;
  email?: string;
  name?: string;
  displayName?: string;
  avatar?: string;
  role?: string;
  permissions?: string[];
  createdAt?: string;
  updatedAt?: string;
  [key: string]: unknown;
}

// Данные для входа
export interface LoginData {
  username: string;
  password: string;
  rememberMe?: boolean;
  [key: string]: unknown;
}

// Данные для регистрации
export interface RegisterData {
  username: string;
  email: string;
  password: string;
  displayName?: string;
  name?: string;
  firstName?: string;
  lastName?: string;
  role?: string;
  [key: string]: unknown;
}

// Данные для обновления профиля
export interface UpdateProfileData {
  name?: string;
  displayName?: string;
  avatar?: string;
  [key: string]: unknown;
}

// Данные для изменения пароля
export interface ChangePasswordData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

// Ответ аутентификации для API
export interface AuthResponseData {
  user: User;
  accessToken: string;
  refreshToken: string;
  [key: string]: unknown;
}

// Ответ аутентификации для локального тестирования
export interface AuthResponse {
  user: User;
  token?: string;
  accessToken?: string;
  refreshToken?: string;
  [key: string]: unknown;
}

// Состояние аутентификации
export interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}
