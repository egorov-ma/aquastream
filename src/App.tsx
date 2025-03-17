import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import CircularProgress from '@mui/material/CircularProgress';
import Box from '@mui/material/Box';

// i18n
import './i18n';

// Импортируем MainLayout
import { MainLayout } from './components/layout/MainLayout';

// Создаём тему
const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
});

// Ленивая загрузка страниц для code splitting
const HomePage = lazy(() => import('./pages/HomePage'));
// Добавьте другие страницы по аналогии
// const LoginPage = lazy(() => import('@/pages/LoginPage/LoginPage'));
// const EventsPage = lazy(() => import('@/pages/EventsPage/EventsPage'));

/**
 * Компонент для отображения загрузки при ленивой загрузке
 */
const LoadingFallback = () => (
  <Box
    display="flex"
    justifyContent="center"
    alignItems="center"
    height="100vh"
  >
    <CircularProgress />
  </Box>
);

/**
 * Корневой компонент приложения
 */
const App: React.FC = () => {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <BrowserRouter>
        <MainLayout>
          <Suspense fallback={<LoadingFallback />}>
            <Routes>
              <Route path="/" element={<HomePage />} />
              {/* Добавьте другие маршруты по аналогии */}
              {/* <Route path="/login" element={<LoginPage />} /> */}
              {/* <Route path="/events" element={<EventsPage />} /> */}
              
              {/* Маршрут по умолчанию, если ни один из путей не совпал */}
              <Route path="*" element={<div>Страница не найдена</div>} />
            </Routes>
          </Suspense>
        </MainLayout>
      </BrowserRouter>
    </ThemeProvider>
  );
};

export default App; 