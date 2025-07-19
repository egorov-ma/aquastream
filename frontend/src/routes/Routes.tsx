import React, { Suspense } from 'react';
import { Outlet, Route, Routes as RouterRoutes } from 'react-router-dom';

import { MainLayout } from '@/components/layout';

// Компонент загрузки для lazy-loading
const LoadingFallback = () => (
  <div className="flex justify-center items-center min-h-screen">
    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-600"></div>
  </div>
);

// Ленивая загрузка компонентов страниц
const HomePage = React.lazy(() => import('@/pages/HomePage'));
const AboutPage = React.lazy(() => import('@/pages/AboutPage'));
const NotFoundPage = React.lazy(() => import('@/pages/NotFoundPage'));
const LoginPage = React.lazy(() => import('@/pages/LoginPage'));
const RegisterPage = React.lazy(() => import('@/pages/RegisterPage'));
const UIKitPage = React.lazy(() => import('@/pages/UIKitPage'));

const Routes: React.FC = () => {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <RouterRoutes>
        <Route
          element={
            <MainLayout>
              <Outlet />
            </MainLayout>
          }
        >
          <Route path="/" element={<HomePage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/ui-kit" element={<UIKitPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </RouterRoutes>
    </Suspense>
  );
};

export default Routes;
