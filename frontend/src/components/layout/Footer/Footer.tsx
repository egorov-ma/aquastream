import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { Box, Container, Grid, Typography, Link, IconButton } from '@mui/material';
import FacebookIcon from '@mui/icons-material/Facebook';
import InstagramIcon from '@mui/icons-material/Instagram';
import TelegramIcon from '@mui/icons-material/Telegram';
import { APP_ROUTES } from '@/config/config';
import styles from './Footer.module.css';

/**
 * Компонент футера приложения
 */
export const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <Box component="footer" className={styles.footer}>
      <Container maxWidth="lg">
        <Grid container spacing={4}>
          {/* Логотип и описание */}
          <Grid item xs={12} sm={6} md={4}>
            <Typography
              variant="h6"
              component={RouterLink}
              to={APP_ROUTES.HOME}
              className={styles.logo}
            >
              AquaStream
            </Typography>
            <Typography variant="body2" className={styles.description}>
              Организация сплавов и водных мероприятий. Присоединяйтесь к нашим событиям или создайте свое!
            </Typography>
          </Grid>

          {/* Навигация */}
          <Grid item xs={12} sm={6} md={4}>
            <Typography variant="h6" className={styles.sectionTitle}>
              Навигация
            </Typography>
            <Box className={styles.navLinks}>
              <Link component={RouterLink} to={APP_ROUTES.EVENTS} className={styles.link}>
                События
              </Link>
              <Link component={RouterLink} to={APP_ROUTES.CALENDAR} className={styles.link}>
                Календарь
              </Link>
              <Link component={RouterLink} to={APP_ROUTES.TEAM} className={styles.link}>
                Команда
              </Link>
              <Link component={RouterLink} to={APP_ROUTES.CONTACTS} className={styles.link}>
                Контакты
              </Link>
              <Link component={RouterLink} to={APP_ROUTES.PARTICIPANT} className={styles.link}>
                Участнику
              </Link>
            </Box>
          </Grid>

          {/* Контакты */}
          <Grid item xs={12} sm={6} md={4}>
            <Typography variant="h6" className={styles.sectionTitle}>
              Контакты
            </Typography>
            <Typography variant="body2" className={styles.contactItem}>
              Телефон: +7 (123) 456-78-90
            </Typography>
            <Typography variant="body2" className={styles.contactItem}>
              Email: info@aquastream.ru
            </Typography>
            <Typography variant="body2" className={styles.contactItem}>
              Адрес: г. Москва, ул. Примерная, д. 123
            </Typography>
            <Box className={styles.socialLinks}>
              <IconButton
                aria-label="facebook"
                component="a"
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className={styles.socialButton}
              >
                <FacebookIcon />
              </IconButton>
              <IconButton
                aria-label="instagram"
                component="a"
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className={styles.socialButton}
              >
                <InstagramIcon />
              </IconButton>
              <IconButton
                aria-label="telegram"
                component="a"
                href="https://t.me/aquastream"
                target="_blank"
                rel="noopener noreferrer"
                className={styles.socialButton}
              >
                <TelegramIcon />
              </IconButton>
            </Box>
          </Grid>
        </Grid>

        {/* Копирайт */}
        <Box className={styles.copyright}>
          <Typography variant="body2">
            © {currentYear} AquaStream. Все права защищены.
          </Typography>
        </Box>
      </Container>
    </Box>
  );
}; 