import React, { ReactNode } from 'react';

import { Footer } from './Footer/Footer';
import { Header } from './Header';
import { MainLayout } from './MainLayout/MainLayout';

// Иконки из lucide-react могут быть добавлены здесь
// На данном этапе просто используем заглушки для типов

interface LayoutProps {
  children: ReactNode;
  /** Эффект появления шапки */
  headerAppearEffect?: 'none' | 'fade-in' | 'slide-up' | 'slide-down';
  /** Статус авторизации пользователя */
  isAuthenticated?: boolean;
}

const Layout: React.FC<LayoutProps> = ({
  children,
  headerAppearEffect: _headerAppearEffect = 'none',
  isAuthenticated = false,
}) => {
  return (
    <div className="flex flex-col min-h-screen">
      <Header isAuthenticated={isAuthenticated} />
      <MainLayout>{children}</MainLayout>
      <Footer />
    </div>
  );
};

export default Layout;
