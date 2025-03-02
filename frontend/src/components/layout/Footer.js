import React from 'react';
import { Link } from 'react-router-dom';
import { Box, Container, Grid, Divider, IconButton, useTheme } from '@mui/material';
import FacebookIcon from '@mui/icons-material/Facebook';
import TwitterIcon from '@mui/icons-material/Twitter';
import InstagramIcon from '@mui/icons-material/Instagram';
import TelegramIcon from '@mui/icons-material/Telegram';
import GitHubIcon from '@mui/icons-material/GitHub';
import { Typography } from '../ui';

const Footer = () => {
  const theme = useTheme();
  const currentYear = new Date().getFullYear();
  
  return (
    <Box 
      component="footer" 
      sx={{ 
        bgcolor: 'background.paper',
        borderTop: '1px solid',
        borderColor: 'divider',
        py: 6,
        mt: 6
      }}
    >
      <Container>
        <Grid container spacing={4}>
          {/* Логотип и описание */}
          <Grid item xs={12} md={4}>
            <Box sx={{ mb: 2 }}>
              <Typography variant="h5" fontWeight="bold" color="primary">
                <span style={{ color: theme.palette.secondary.main }}>✦</span> NeoSplav
              </Typography>
            </Box>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Мы, AquaStream, являемся лидерами в планировании уникальных сплавов, предлагая индивидуальные маршруты для каждого клиента. Наш опыт и профессиональный подход гарантируют незабываемые поездки и безопасность на любом маршруте.
            </Typography>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <IconButton size="small" color="primary" component="a" href="https://facebook.com" target="_blank">
                <FacebookIcon fontSize="small" />
              </IconButton>
              <IconButton size="small" color="primary" component="a" href="https://twitter.com" target="_blank">
                <TwitterIcon fontSize="small" />
              </IconButton>
              <IconButton size="small" color="primary" component="a" href="https://instagram.com" target="_blank">
                <InstagramIcon fontSize="small" />
              </IconButton>
              <IconButton size="small" color="primary" component="a" href="https://t.me/neosplav" target="_blank">
                <TelegramIcon fontSize="small" />
              </IconButton>
              <IconButton size="small" color="primary" component="a" href="https://github.com/egorov-ma/aquastream" target="_blank">
                <GitHubIcon fontSize="small" />
              </IconButton>
            </Box>
          </Grid>
          
          {/* Навигация */}
          <Grid item xs={12} sm={6} md={2}>
            <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 2 }}>
              Навигация
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Link to="/" style={{ color: 'inherit', textDecoration: 'none' }}>
                <Typography variant="body2" color="text.secondary" sx={{ '&:hover': { color: 'primary.main' } }}>
                  Главная
                </Typography>
              </Link>
              <Link to="/team" style={{ color: 'inherit', textDecoration: 'none' }}>
                <Typography variant="body2" color="text.secondary" sx={{ '&:hover': { color: 'primary.main' } }}>
                  Команда
                </Typography>
              </Link>
              <Link to="/journal" style={{ color: 'inherit', textDecoration: 'none' }}>
                <Typography variant="body2" color="text.secondary" sx={{ '&:hover': { color: 'primary.main' } }}>
                  Журнал
                </Typography>
              </Link>
              <Link to="/contacts" style={{ color: 'inherit', textDecoration: 'none' }}>
                <Typography variant="body2" color="text.secondary" sx={{ '&:hover': { color: 'primary.main' } }}>
                  Контакты
                </Typography>
              </Link>
            </Box>
          </Grid>
          
          {/* Информация */}
          <Grid item xs={12} sm={6} md={3}>
            <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 2 }}>
              Информация
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Link to="/terms" style={{ color: 'inherit', textDecoration: 'none' }}>
                <Typography variant="body2" color="text.secondary" sx={{ '&:hover': { color: 'primary.main' } }}>
                  Условия использования
                </Typography>
              </Link>
              <Link to="/privacy" style={{ color: 'inherit', textDecoration: 'none' }}>
                <Typography variant="body2" color="text.secondary" sx={{ '&:hover': { color: 'primary.main' } }}>
                  Политика конфиденциальности
                </Typography>
              </Link>
              <Link to="/faq" style={{ color: 'inherit', textDecoration: 'none' }}>
                <Typography variant="body2" color="text.secondary" sx={{ '&:hover': { color: 'primary.main' } }}>
                  ЧаВо
                </Typography>
              </Link>
              <Link to="/ui-kit" style={{ color: 'inherit', textDecoration: 'none' }}>
                <Typography variant="body2" color="text.secondary" sx={{ '&:hover': { color: 'primary.main' } }}>
                  UI Kit
                </Typography>
              </Link>
            </Box>
          </Grid>
          
          {/* Контакты */}
          <Grid item xs={12} md={3}>
            <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 2 }}>
              Контакты
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Typography variant="body2" color="text.secondary">
                Email: info@neosplav.ru
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Телефон: +7 (800) 123-45-67
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Адрес: г. Москва, ул. Примерная, д. 123
              </Typography>
            </Box>
          </Grid>
        </Grid>
        
        <Divider sx={{ my: 4 }} />
        
        <Box sx={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>
          <Typography variant="body2" color="text.secondary">
            &copy; {currentYear} AquaStream. Все права защищены.
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Разработано с <span style={{ color: theme.palette.error.main }}>❤</span> для путешественников
          </Typography>
        </Box>
      </Container>
    </Box>
  );
};

export default Footer; 