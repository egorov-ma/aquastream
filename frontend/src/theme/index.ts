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
  header: 'bg-[#1E2841] rounded-xl',
  logo: 'text-primary-500',
  navItem: 'text-gray-300 hover:text-primary-400 hover:bg-secondary-800/60 rounded-md',
  activeNavItem: 'text-primary-400 bg-secondary-800/30 font-medium rounded-md',
  themeToggle: 'text-gray-300 hover:text-primary-400 hover:bg-secondary-800/60',
  mobileMenuButton: 'text-gray-300 hover:text-primary-400 hover:bg-secondary-800/60',
  mobileMenu: 'bg-[#1E2841] border-t border-secondary-800',
};

/**
 * Классы для темной темы компонентов UI
 */
export const darkTheme = {
  header: 'bg-[#1E2841] rounded-xl',
  logo: 'text-primary-400',
  navItem: 'text-gray-300 hover:text-primary-400 hover:bg-secondary-800/60 rounded-md',
  activeNavItem: 'text-primary-400 bg-secondary-800/30 font-medium rounded-md',
  themeToggle: 'text-gray-300 hover:text-primary-400 hover:bg-secondary-800/60',
  mobileMenuButton: 'text-gray-300 hover:text-primary-400 hover:bg-secondary-800/60',
  mobileMenu: 'bg-[#1E2841] border-t border-secondary-800',
};
