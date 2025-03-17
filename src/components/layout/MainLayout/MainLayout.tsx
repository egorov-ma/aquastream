import React from 'react';
import { Box } from '@mui/material';
import { Header } from '../Header';
import { Footer } from '../Footer';

interface MainLayoutProps {
  children: React.ReactNode;
}

/**
 * Основной макет приложения
 * Включает в себя заголовок, основное содержимое и футер
 */
export const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  return (
    <Box sx={{ 
      display: 'flex', 
      flexDirection: 'column',
      minHeight: '100vh'
    }}>
      <Header />
      
      <Box component="main" sx={{ 
        flexGrow: 1,
        py: 3
      }}>
        {children}
      </Box>
      
      <Footer />
    </Box>
  );
}; 