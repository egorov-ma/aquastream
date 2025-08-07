import { Suspense, useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';

import Layout from '@/components/layout/Layout';
import { PageLoader } from '@/components/ui';
import { useAppSelector } from '@/hooks/redux';
import { selectUserState } from '@/store/slices/userSlice';
import { initializeTheme } from '@/theme';

const App = () => {
  const [darkMode, setDarkMode] = useState(false);
  const userState = useAppSelector(selectUserState);
  const isAuthenticated = !!userState.currentUser;

  // Получаем тему из localStorage при загрузке
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
      setDarkMode(true);
    }
  }, []);

  // Инициализация темы и удаление обработчиков при размонтировании
  useEffect(() => {
    const cleanup = initializeTheme();
    return () => {
      cleanup && cleanup();
    };
  }, []);

  const toggleTheme = () => {
    setDarkMode(!darkMode);
    // Сохраняем выбор темы в localStorage
    localStorage.setItem('theme', !darkMode ? 'dark' : 'light');
  };

  return (
    <div className={darkMode ? 'dark' : ''}>
      <Layout 
        toggleTheme={toggleTheme} 
        headerAppearEffect="fade-in"
        isAuthenticated={isAuthenticated}
        theme={darkMode ? 'dark' : 'light'}
      >
        <Suspense fallback={<PageLoader />}>
          <Outlet />
        </Suspense>
      </Layout>
    </div>
  );
};

export default App;
