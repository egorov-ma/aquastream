import React from 'react';
import { Outlet } from 'react-router-dom';
import { Box, Container } from '@mui/material';
import { Header } from '@/components/layout/Header/Header';
import { Footer } from '@/components/layout/Footer/Footer';
import styles from './MainLayout.module.css';

/**
 * Основной макет приложения, включающий хедер, футер и основное содержимое
 */
export const MainLayout: React.FC = () => {
  return (
    <Box className={styles.root}>
      <Header />
      <Box component="main" className={styles.main}>
        <Container maxWidth="lg" className={styles.container}>
          <Outlet />
        </Container>
      </Box>
      <Footer />
    </Box>
  );
}; 