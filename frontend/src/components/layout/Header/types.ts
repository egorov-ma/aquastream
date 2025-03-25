import React from 'react';

/**
 * Интерфейс для пункта навигации
 */
export interface NavItem {
  /** Название пункта меню */
  name: string;
  /** Путь для перехода */
  path: string;
  /** Опциональная иконка */
  icon?: React.FC<{ className?: string }>;
  /** Опциональный бейдж с уведомлением */
  badge?: {
    content: string | number;
    color: 'primary' | 'secondary' | 'error' | 'warning' | 'info' | 'success';
  };
  /** Ключ для локализации (необязательный) */
  labelKey?: string;
}

/**
 * Интерфейс для props компонента Header
 */
export interface HeaderProps {
  /** Функция переключения темы */
  toggleTheme?: () => void;
  /** Пользовательский список пунктов меню */
  items?: NavItem[];
  /** Дополнительные CSS классы */
  className?: string;
  /** Показывать мобильное меню внизу экрана */
  mobileMenuAsFooter?: boolean;
  /** Прозрачный фон */
  transparent?: boolean;
  /** Выравнивание меню */
  alignment?: 'start' | 'center' | 'end' | 'between' | 'around' | 'evenly';
  /** Эффект появления */
  appearEffect?: 'none' | 'fade-in' | 'slide-up' | 'slide-down';
}
