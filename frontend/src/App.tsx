import { Suspense, useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';

import Layout from '@/components/layout/Layout';
import { PageLoader } from '@/components/ui';
import { useNavigation } from '@/hooks';

const App = () => {
  const [darkMode, setDarkMode] = useState(false);

  // Получаем пункты меню из хука
  const { navItems } = useNavigation();

  // Получаем тему из localStorage при загрузке
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
      setDarkMode(true);
    }
  }, []);

  const toggleTheme = () => {
    setDarkMode(!darkMode);
    // Сохраняем выбор темы в localStorage
    localStorage.setItem('theme', !darkMode ? 'dark' : 'light');
  };

  return (
    <div className={darkMode ? 'dark' : ''}>
      <Layout toggleTheme={toggleTheme} navItems={navItems} headerAppearEffect="fade-in">
        <Suspense fallback={<PageLoader />}>
          <Outlet />
        </Suspense>
      </Layout>
    </div>
  );
};

export default App;
