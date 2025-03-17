import React, { useEffect } from 'react';
import { ThemeProvider, CssBaseline } from '@mui/material';
import { AppRoutes } from '@/routes/Routes';
import theme from '@/theme/theme';
import { useDispatch } from 'react-redux';
import { initAuth } from '@/modules/auth/store/authSlice';
import '@/styles/global.css';

/**
 * Корневой компонент приложения
 */
const App: React.FC = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    // Инициализируем состояние аутентификации из localStorage
    dispatch(initAuth());
  }, [dispatch]);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AppRoutes />
    </ThemeProvider>
  );
};

export default App; 