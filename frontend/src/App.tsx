import { Suspense } from 'react';
import { Outlet } from 'react-router-dom';

import Layout from '@/components/layout/Layout';
import { PageLoader } from '@/components/ui';
import { useAppSelector } from '@/hooks/redux';
import { selectUserState } from '@/store/slices/userSlice';
import { useTheme } from '@/providers/ThemeProvider';

const App = () => {
  const { theme } = useTheme();
  const userState = useAppSelector(selectUserState);
  const isAuthenticated = !!userState.currentUser;

  return (
    <div className={theme === 'dark' ? 'dark' : ''}>
      <Layout headerAppearEffect="fade-in" isAuthenticated={isAuthenticated}>
        <Suspense fallback={<PageLoader />}>
          <Outlet />
        </Suspense>
      </Layout>
    </div>
  );
};

export default App;
