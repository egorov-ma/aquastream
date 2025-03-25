import React, { ReactNode } from 'react';

import { Footer } from './Footer/Footer';
import { Header } from './Header';
import { MainLayout } from './MainLayout/MainLayout';

// Иконки из lucide-react могут быть добавлены здесь
// На данном этапе просто используем заглушки для типов

interface LayoutProps {
  children: ReactNode;
  toggleTheme: () => void;
  /** Эффект появления шапки */
  headerAppearEffect?: 'none' | 'fade-in' | 'slide-up' | 'slide-down';
  /** Статус авторизации пользователя */
  isAuthenticated?: boolean;
  /** Текущая тема */
  theme?: 'light' | 'dark';
}

const Layout: React.FC<LayoutProps> = ({
  children,
  toggleTheme,
  headerAppearEffect = 'none',
  isAuthenticated = false,
  theme = 'light',
}) => {
  return (
    <div className="flex flex-col min-h-screen">
      <Header onThemeToggle={toggleTheme} isAuthenticated={isAuthenticated} theme={theme} />
      <MainLayout>{children}</MainLayout>
      <Footer />
    </div>
  );
};

export default Layout;
