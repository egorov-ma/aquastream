import { Sun, Moon } from 'lucide-react';
import React from 'react';

import { useTheme } from '@/providers/ThemeProvider';

/**
 * Свойства компонента переключателя темы
 */
interface ThemeSwitcherProps {
  /**
   * Дополнительные CSS-классы
   */
  className?: string;
}

/**
 * Компонент для переключения между светлой и темной темами
 */
const ThemeSwitcher: React.FC<ThemeSwitcherProps> = React.memo(({ className }) => {
  const { theme, toggleTheme } = useTheme();
  const themeTitle = theme === 'dark' ? 'Светлая тема' : 'Темная тема';

  return (
    <button
      type="button"
      aria-label="Переключить тему"
      className={`p-2 rounded-full transition-colors text-gray-300 hover:text-primary hover:bg-secondary/60 ${className || ''}`}
      onClick={toggleTheme}
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
