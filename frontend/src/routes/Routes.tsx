import { Box, CircularProgress } from '@mui/material';
import React, { Suspense } from 'react';
import { Route, Routes as RouterRoutes, Navigate } from 'react-router-dom';

// Компонент загрузки для lazy-loading
const LoadingFallback = () => (
  <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
    <CircularProgress />
  </Box>
);

// Ленивая загрузка компонентов страниц
const HomePage = React.lazy(() => import('../pages/HomePage/HomePage'));

// Временный главный макет
const MainLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => <Box>{children}</Box>;

const Routes: React.FC = () => {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <RouterRoutes>
        <Route
          path="/"
          element={
            <MainLayout>
              <HomePage />
            </MainLayout>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </RouterRoutes>
    </Suspense>
  );
};

export default Routes;
