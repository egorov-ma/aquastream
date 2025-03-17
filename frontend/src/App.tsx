import { ThemeProvider, CssBaseline } from '@mui/material';
import React, { useEffect } from 'react';
import { useDispatch } from 'react-redux';

import { initAuth } from '@/modules/auth/store/authSlice';
import Routes from '@/routes/Routes';
import theme from '@/theme/theme';

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
      <Routes />
    </ThemeProvider>
  );
};

export default App;
