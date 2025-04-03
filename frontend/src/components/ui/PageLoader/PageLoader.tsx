import React from 'react';

/**
 * Компонент загрузки страницы
 * Используется при асинхронной загрузке компонентов с помощью React.lazy
 */
export const PageLoader: React.FC = () => {
  return (
    <div className="flex h-[calc(100vh-var(--content-top-padding,129px))] w-full items-center justify-center">
      <div className="flex flex-col items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary-600 dark:border-primary-500 border-t-transparent" />
        <span className="mt-3 text-sm font-medium text-secondary-700 dark:text-secondary-300">
          Загрузка...
        </span>
      </div>
    </div>
  );
};

export default PageLoader;
