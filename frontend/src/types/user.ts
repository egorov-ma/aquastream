/**
 * Роль пользователя
 */
export enum UserRole {
  USER = 'USER',           // Обычный пользователь
  ORGANIZER = 'ORGANIZER', // Организатор мероприятий
  ADMIN = 'ADMIN'          // Администратор
}

/**
 * Статус пользователя
 */
export enum UserStatus {
  ACTIVE = 'ACTIVE',       // Активный
  INACTIVE = 'INACTIVE',   // Неактивный
  BLOCKED = 'BLOCKED'      // Заблокирован
}

/**
 * Интерфейс пользователя
 */
export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  status: UserStatus;
  avatar?: string;
  phone?: string;
  bio?: string;
  city?: string;
  country?: string;
  birthDate?: string;
  gender?: 'MALE' | 'FEMALE' | 'OTHER';
  interests?: string[];
  socialLinks?: {
    facebook?: string;
    instagram?: string;
    twitter?: string;
    linkedin?: string;
    telegram?: string;
  };
  createdAt: string;
  updatedAt: string;
  lastLoginAt?: string;
}

/**
 * Данные для регистрации пользователя
 */
export interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
}

/**
 * Данные для входа пользователя
 */
export interface LoginData {
  email: string;
  password: string;
  rememberMe?: boolean;
}

/**
 * Ответ при успешной аутентификации
 */
export interface AuthResponse {
  user: User;
  token: string;
  refreshToken: string;
  expiresIn: number;
}

/**
 * Данные для обновления профиля пользователя
 */
export interface UpdateProfileData {
  firstName?: string;
  lastName?: string;
  phone?: string;
  bio?: string;
  city?: string;
  country?: string;
  birthDate?: string;
  gender?: 'MALE' | 'FEMALE' | 'OTHER';
  interests?: string[];
  socialLinks?: {
    facebook?: string;
    instagram?: string;
    twitter?: string;
    linkedin?: string;
    telegram?: string;
  };
}

/**
 * Данные для изменения пароля
 */
export interface ChangePasswordData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
} 