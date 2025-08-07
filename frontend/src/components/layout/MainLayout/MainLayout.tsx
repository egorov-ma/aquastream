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
    <main
      className="flex-1 pb-8 bg-gray-50 dark:bg-gray-900"
      data-testid="main-layout"
    >
      <div className="container max-w-full md:max-w-screen-md mx-auto px-4">{children}</div>
    </main>
  );
};
