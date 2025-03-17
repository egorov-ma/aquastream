// Типы для модуля аутентификации

// Роли пользователей
export enum UserRole {
  USER = 'user',
  ORGANIZER = 'organizer',
  ADMIN = 'admin',
}

// Интерфейс пользователя
export interface User {
  id: string;
  email: string;
  displayName: string;
  role: string;
  createdAt: string;
  updatedAt: string;
  avatar?: string;
  phone?: string;
}

// Данные для входа
export interface LoginData {
  email: string;
  password: string;
  rememberMe?: boolean;
}

// Данные для регистрации
export interface RegisterData {
  email: string;
  password: string;
  displayName: string;
  role?: string;
}

// Данные для обновления профиля
export interface UpdateProfileData {
  displayName?: string;
  email?: string;
  avatar?: string;
  phone?: string;
}

// Данные для изменения пароля
export interface ChangePasswordData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

// Ответ аутентификации
export interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
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
