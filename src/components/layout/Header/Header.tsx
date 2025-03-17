import React from 'react';
import { AppBar, Toolbar, Typography, Box } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { LanguageSwitcher } from '../../ui/LanguageSwitcher';

/**
 * Компонент заголовка приложения
 */
export const Header: React.FC = () => {
  const { t } = useTranslation();
  
  return (
    <AppBar position="static">
      <Toolbar>
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          Aquastream
        </Typography>
        
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <nav>
            <Box component="ul" sx={{ 
              display: 'flex', 
              listStyle: 'none', 
              gap: 3, 
              m: 0, 
              p: 0 
            }}>
              <li>
                <Typography component="a" href="/" sx={{ color: 'white', textDecoration: 'none' }}>
                  {t('navigation.home')}
                </Typography>
              </li>
              <li>
                <Typography component="a" href="/events" sx={{ color: 'white', textDecoration: 'none' }}>
                  {t('navigation.events')}
                </Typography>
              </li>
              <li>
                <Typography component="a" href="/about" sx={{ color: 'white', textDecoration: 'none' }}>
                  {t('navigation.about')}
                </Typography>
              </li>
            </Box>
          </nav>
          
          <LanguageSwitcher />
        </Box>
      </Toolbar>
    </AppBar>
  );
}; 