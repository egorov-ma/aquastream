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
