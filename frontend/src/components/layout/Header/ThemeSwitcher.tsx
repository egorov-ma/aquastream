import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { lightTheme, darkTheme } from '@/theme';

/**
 * Свойства компонента переключателя темы
 */
interface ThemeSwitcherProps {
  /**
   * Текущая тема
   */
  theme: 'light' | 'dark';
  /**
   * Обработчик переключения темы
   */
  onToggle?: () => void;
  /**
   * Дополнительные CSS-классы
   */
  className?: string;
}

/**
 * Компонент для переключения между светлой и темной темами
 */
const ThemeSwitcher: React.FC<ThemeSwitcherProps> = React.memo(({
  theme,
  onToggle,
  className,
}) => {
  const themeTitle = theme === 'dark' ? 'Светлая тема' : 'Темная тема';
  
  return (
    <button
      type="button"
      aria-label="Переключить тему"
      className={`p-2 rounded-full transition-colors ${
        theme === 'dark' ? darkTheme.themeToggle : lightTheme.themeToggle
      } ${className || ''}`}
      onClick={onToggle}
      title={themeTitle}
      data-testid="theme-switcher"
    >
      {theme === 'dark' ? (
        <Sun size={20} className="text-accent-400" data-testid="light-icon" />
      ) : (
        <Moon size={20} data-testid="dark-icon" />
      )}
    </button>
  );
});

ThemeSwitcher.displayName = 'ThemeSwitcher';

export default ThemeSwitcher; 