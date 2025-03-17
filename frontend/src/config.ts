/**
 * Конфигурация приложения
 */

// API URL
export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

// Настройки аутентификации
export const AUTH_TOKEN_KEY = 'accessToken';
export const REFRESH_TOKEN_KEY = 'refreshToken';
export const USER_DATA_KEY = 'user';

// Настройки пагинации
export const DEFAULT_PAGE_SIZE = 10;
export const DEFAULT_PAGE = 1;

// Настройки изображений
export const DEFAULT_AVATAR = '/images/default-avatar.png';
export const DEFAULT_EVENT_IMAGE = '/images/default-event.jpg';

// Настройки времени
export const TOKEN_EXPIRATION_TIME = 60 * 60 * 1000; // 1 час в миллисекундах
export const REFRESH_TOKEN_EXPIRATION_TIME = 7 * 24 * 60 * 60 * 1000; // 7 дней в миллисекундах

// Настройки валидации
export const PASSWORD_MIN_LENGTH = 8;
export const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/;
export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Настройки темы
export const THEME_KEY = 'app_theme';
export const DEFAULT_THEME = 'light';

// Настройки языка
export const LANGUAGE_KEY = 'app_language';
export const DEFAULT_LANGUAGE = 'ru';
export const SUPPORTED_LANGUAGES = ['ru', 'en'];

// Настройки уведомлений
export const NOTIFICATION_DURATION = 5000; // 5 секунд

// Версия приложения
export const APP_VERSION = import.meta.env.VITE_APP_VERSION || '1.0.0';

// Режим разработки
export const IS_DEV = import.meta.env.DEV;
export const IS_PROD = import.meta.env.PROD;