import React from 'react';

/**
 * Базовые свойства навигационного пункта
 */
export interface NavItemBase {
  /** Идентификатор пункта меню */
  id?: string;
  /** Название пункта меню */
  name: string;
  /** Путь для перехода */
  path: string;
  /** Ключ для локализации (необязательный) */
  labelKey?: string;
}

/**
 * Свойства иконки навигационного пункта
 */
export interface NavItemIcon {
  /** Иконка (необязательная) */
  icon?: React.FC<React.SVGProps<SVGSVGElement>>;
}

/**
 * Полный интерфейс для пункта навигации
 */
export type NavItem = NavItemBase & NavItemIcon;

/**
 * Базовые свойства компонента Header
 */
export interface HeaderBaseProps {
  /** Дополнительные CSS классы */
  className?: string;
}

/**
 * Свойства, связанные с темой
 */
export interface HeaderThemeProps {
  /** Функция переключения темы */
  onThemeToggle?: () => void;
  /** Текущая тема */
  theme?: 'light' | 'dark';
}

/**
 * Свойства аутентификации
 */
export interface HeaderAuthProps {
  /** Статус авторизации пользователя */
  isAuthenticated?: boolean;
}

/**
 * Свойства для управления навигацией
 */
export interface HeaderNavigationProps {
  /** Пользовательский список пунктов меню */
  items?: NavItem[];
}

/**
 * Полные свойства компонента Header
 */
export type HeaderProps = HeaderBaseProps & 
  HeaderThemeProps & 
  HeaderAuthProps & 
  HeaderNavigationProps;
