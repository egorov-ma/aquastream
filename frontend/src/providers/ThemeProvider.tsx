import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';

import { storeTheme, applyTheme, initializeTheme, getSystemTheme } from '@/theme';
import type { Theme } from '@/theme';

interface ThemeContextValue {
  theme: 'light' | 'dark';
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

interface ThemeProviderProps {
  children: ReactNode;
  defaultTheme?: Theme;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children, defaultTheme = 'light' }) => {
  const [theme, setThemeState] = useState<'light' | 'dark'>(defaultTheme === 'system' ? getSystemTheme() : defaultTheme);

  useEffect(() => {
    const stored = localStorage.getItem('theme') as Theme | null;
    const initial = stored || defaultTheme;
    setTheme(initial);
    const cleanup = initializeTheme();
    return () => {
      cleanup && cleanup();
    };
  }, [defaultTheme]);

  const setTheme = (newTheme: Theme) => {
    storeTheme(newTheme);
    applyTheme(newTheme);
    setThemeState(newTheme === 'system' ? getSystemTheme() : newTheme);
  };

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  return <ThemeContext.Provider value={{ theme, setTheme, toggleTheme }}>{children}</ThemeContext.Provider>;
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
};

export default ThemeProvider;
