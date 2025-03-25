import React, { ReactNode } from 'react';

import { Footer } from './Footer/Footer';
import { Header } from './Header';
import type { NavItem } from './Header';
import { MainLayout } from './MainLayout/MainLayout';

// Иконки из lucide-react могут быть добавлены здесь
// На данном этапе просто используем заглушки для типов

interface LayoutProps {
  children: ReactNode;
  toggleTheme: () => void;
  /** Пользовательские пункты меню */
  navItems?: NavItem[];
  /** Эффект появления шапки */
  headerAppearEffect?: 'none' | 'fade-in' | 'slide-up' | 'slide-down';
}

const Layout: React.FC<LayoutProps> = ({
  children,
  toggleTheme,
  navItems,
  headerAppearEffect = 'none',
}) => {
  return (
    <div className="flex flex-col min-h-screen">
      <Header onThemeToggle={toggleTheme} navItems={navItems} />
      <MainLayout>{children}</MainLayout>
      <Footer />
    </div>
  );
};

export default Layout;
