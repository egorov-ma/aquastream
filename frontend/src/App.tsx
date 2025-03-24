import { Suspense, useState } from 'react';
import { Outlet } from 'react-router-dom';

import Layout from '@/components/layout/Layout';
import { PageLoader } from '@/components/ui';

const App = () => {
  const [darkMode, setDarkMode] = useState(false);

  const toggleTheme = () => {
    setDarkMode(!darkMode);
    // При необходимости можно сохранить выбор темы в localStorage
    // localStorage.setItem('theme', !darkMode ? 'dark' : 'light');
  };

  return (
    <div className={darkMode ? 'dark' : ''}>
      <Layout toggleTheme={toggleTheme}>
        <Suspense fallback={<PageLoader />}>
          <Outlet />
        </Suspense>
      </Layout>
    </div>
  );
};

export default App;
