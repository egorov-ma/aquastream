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
  accentColor?: string;
  fontFamily?: string;
  borderRadius?: string;
}

export interface AppTheme {
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
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
    primaryColor: options.primaryColor || '#ea4f3b', // NeoSplav primary
    secondaryColor: options.secondaryColor || '#363e53', // NeoSplav secondary
    accentColor: options.accentColor || '#dabc76', // NeoSplav accent
    fontFamily: options.fontFamily || 'Inter, system-ui, sans-serif',
    borderRadius: options.borderRadius || '0.375rem', // rounded-md
  };
};

/**
 * Классы для светлой темы компонентов UI
 */
export const lightTheme = {
  header: 'bg-white border-b border-gray-200',
  logo: 'text-primary-500',
  navItem: 'text-secondary-800 hover:text-primary-500 hover:bg-gray-100',
  activeNavItem: 'text-primary-600 font-medium',
  themeToggle: 'text-secondary-800 hover:text-primary-500 hover:bg-gray-100',
  mobileMenuButton: 'text-secondary-800 hover:text-primary-500 hover:bg-gray-100',
  mobileMenu: 'bg-white border-t border-gray-200',
};

/**
 * Классы для темной темы компонентов UI
 */
export const darkTheme = {
  header: 'bg-secondary-900',
  logo: 'text-primary-400',
  navItem: 'text-gray-300 hover:text-primary-400 hover:bg-secondary-800',
  activeNavItem: 'text-primary-400 font-medium',
  themeToggle: 'text-gray-300 hover:text-primary-400 hover:bg-secondary-800',
  mobileMenuButton: 'text-gray-300 hover:text-primary-400 hover:bg-secondary-800',
  mobileMenu: 'bg-secondary-900 border-t border-secondary-800',
};
