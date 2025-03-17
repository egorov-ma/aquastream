import React from 'react';
import { Box, Container, Typography, Link } from '@mui/material';
import { useTranslation } from 'react-i18next';

/**
 * Компонент футера приложения
 */
export const Footer: React.FC = () => {
  const { t } = useTranslation();
  const currentYear = new Date().getFullYear();
  
  return (
    <Box component="footer" sx={{ 
      py: 3, 
      mt: 'auto',
      backgroundColor: (theme) => theme.palette.grey[100]
    }}>
      <Container maxWidth="lg">
        <Box sx={{ 
          display: 'flex', 
          flexDirection: { xs: 'column', sm: 'row' },
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <Typography variant="body2" color="text.secondary">
            © {currentYear} Aquastream
          </Typography>
          
          <Box sx={{ 
            display: 'flex', 
            gap: 2,
            mt: { xs: 2, sm: 0 }
          }}>
            <Link href="#" color="inherit" underline="hover">
              {t('navigation.about')}
            </Link>
            <Link href="#" color="inherit" underline="hover">
              {t('navigation.settings')}
            </Link>
          </Box>
        </Box>
      </Container>
    </Box>
  );
}; 