/**
 * Модуль для управления темой приложения.
 * Экспортирует функции и хуки для работы с темами.
 */

import {
  getStoredTheme,
  storeTheme,
  getSystemTheme,
  applyTheme,
  initializeTheme,
  toggleTheme,
  useTheme,
} from './theme';
import type { Theme } from './theme';

export type { Theme };

export {
  getStoredTheme,
  storeTheme,
  getSystemTheme,
  applyTheme,
  initializeTheme,
  toggleTheme,
  useTheme,
};

export interface ThemeOptions {
  primaryColor?: string;
  secondaryColor?: string;
  fontFamily?: string;
  borderRadius?: string;
}

export interface AppTheme {
  primaryColor: string;
  secondaryColor: string;
  fontFamily: string;
  borderRadius: string;
}

/**
 * Создает тему приложения с заданными параметрами
 * @param options Опции темы
 * @returns Объект темы
 */
export const createTheme = (options: ThemeOptions = {}): AppTheme => {
  return {
    primaryColor: options.primaryColor || '#3b82f6', // blue-500
    secondaryColor: options.secondaryColor || '#1f2937', // gray-800
    fontFamily: options.fontFamily || 'Inter, system-ui, sans-serif',
    borderRadius: options.borderRadius || '0.375rem', // rounded-md
  };
};

/**
 * Классы для светлой темы компонентов UI
 */
export const lightTheme = {
  header: 'bg-white',
  logo: 'text-blue-600',
  navItem: 'text-gray-700 hover:text-blue-600 hover:bg-gray-100',
  activeNavItem: 'text-blue-600 font-medium',
  themeToggle: 'text-gray-700 hover:text-blue-600 hover:bg-gray-100',
  mobileMenuButton: 'text-gray-700 hover:text-blue-600 hover:bg-gray-100',
  mobileMenu: 'bg-white border-t border-gray-200',
};

/**
 * Классы для темной темы компонентов UI
 */
export const darkTheme = {
  header: 'bg-gray-900',
  logo: 'text-blue-400',
  navItem: 'text-gray-300 hover:text-blue-400 hover:bg-gray-800',
  activeNavItem: 'text-blue-400 font-medium',
  themeToggle: 'text-gray-300 hover:text-blue-400 hover:bg-gray-800',
  mobileMenuButton: 'text-gray-300 hover:text-blue-400 hover:bg-gray-800',
  mobileMenu: 'bg-gray-900 border-t border-gray-700',
};
