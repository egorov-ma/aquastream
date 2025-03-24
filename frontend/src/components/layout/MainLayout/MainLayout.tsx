import React, { ReactNode } from 'react';

/**
 * Интерфейс пропсов для MainLayout
 */
interface MainLayoutProps {
  children: ReactNode;
}

/**
 * Основной макет приложения для содержимого страницы
 */
export const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  return (
    <main className="flex-1 py-8 bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4">{children}</div>
    </main>
  );
};
