import React, { ReactNode } from 'react';

import { Footer } from './Footer/Footer';
import { Header } from './Header/Header';
import { MainLayout } from './MainLayout/MainLayout';

interface LayoutProps {
  children: ReactNode;
  toggleTheme: () => void;
}

const Layout: React.FC<LayoutProps> = ({ children, toggleTheme }) => {
  return (
    <div className="flex flex-col min-h-screen">
      <Header toggleTheme={toggleTheme} />
      <MainLayout>{children}</MainLayout>
      <Footer />
    </div>
  );
};

export default Layout;
