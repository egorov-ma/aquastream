import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  AppBar, 
  Toolbar, 
  Box, 
  Container, 
  IconButton, 
  Menu, 
  MenuItem, 
  Avatar, 
  Divider,
  Drawer,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  useMediaQuery,
  useTheme
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import EventIcon from '@mui/icons-material/Event';
import GroupIcon from '@mui/icons-material/Group';
import BookIcon from '@mui/icons-material/Book';
import ContactsIcon from '@mui/icons-material/Contacts';
import InfoIcon from '@mui/icons-material/Info';
import LogoutIcon from '@mui/icons-material/Logout';
import LoginIcon from '@mui/icons-material/Login';
import { useAuth } from '../../contexts/AuthContext';
import { Typography, Button } from '../ui';

const Header = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuAnchor, setUserMenuAnchor] = useState(null);
  
  const userMenuOpen = Boolean(userMenuAnchor);
  
  // Навигационные ссылки
  const navLinks = [
    { name: 'Мероприятия', path: '/', icon: <EventIcon /> },
    { name: 'Команда', path: '/team', icon: <GroupIcon /> },
    { name: 'Журнал', path: '/journal', icon: <BookIcon /> },
    { name: 'Контакты', path: '/contacts', icon: <ContactsIcon /> },
    { name: 'Участнику', path: '/participant', icon: <InfoIcon /> }
  ];
  
  // Эффект для отслеживания скролла
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);
  
  const handleUserMenuOpen = (event) => {
    setUserMenuAnchor(event.currentTarget);
  };
  
  const handleUserMenuClose = () => {
    setUserMenuAnchor(null);
  };
  
  const handleLogout = () => {
    handleUserMenuClose();
    logout();
  };
  
  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };
  
  return (
    <>
      {/* Верхняя панель с информацией */}
      <Box 
        sx={{ 
          bgcolor: 'primary.dark', 
          color: 'white', 
          py: 0.5,
          display: { xs: 'none', sm: 'block' } 
        }}
      >
        <Container>
          <Box sx={{ display: 'flex', justifyContent: 'center' }}>
            <Typography variant="body2">
              Путешествуй вместе с 
              <Link to="https://www.neoflex.ru" target="_blank" rel="noopener noreferrer" style={{ color: theme.palette.secondary.main, marginLeft: '4px', textDecoration: 'none' }}>
              Neoflex
              </Link>
              . Вступай в нашу группу
              <Link to="https://t.me/neosplav" target="_blank" rel="noopener noreferrer" style={{ color: theme.palette.secondary.main, marginLeft: '4px', textDecoration: 'none' }}>
                NeoSplav
              </Link>
              .
            </Typography>
          </Box>
        </Container>
      </Box>
      
      {/* Основной хедер */}
      <AppBar 
        position="sticky" 
        sx={{ 
          bgcolor: scrolled ? 'white' : 'transparent', 
          boxShadow: scrolled ? 1 : 'none',
          transition: 'all 0.3s ease'
        }}
      >
        <Container>
          <Toolbar disableGutters sx={{ py: 1 }}>
            {/* Логотип */}
            <Link to="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center' }}>
              <Typography 
                variant="h5" 
                sx={{ 
                  fontWeight: 700,
                  color: scrolled ? 'primary.main' : 'white',
                  textShadow: scrolled ? 'none' : '0 2px 4px rgba(0,0,0,0.3)',
                  mr: 1
                }}
              >
                <span style={{ color: theme.palette.secondary.main }}>✦</span> NeoSplav
              </Typography>
            </Link>
            
            <Box sx={{ flexGrow: 1 }} />
            
            {/* Десктопная навигация */}
            {!isMobile && (
              <Box sx={{ display: 'flex', gap: 1 }}>
                {navLinks.map((link) => (
                  <Button 
                    key={link.name}
                    component={Link} 
                    to={link.path}
                    variant="text"
                    color={scrolled ? 'primary' : 'inherit'}
                    sx={{ 
                      fontWeight: location.pathname === link.path ? 700 : 500,
                      color: scrolled ? (location.pathname === link.path ? 'primary.main' : 'text.primary') : 'white',
                      textShadow: scrolled ? 'none' : '0 1px 2px rgba(0,0,0,0.3)',
                    }}
                  >
                    {link.name}
                  </Button>
                ))}
              </Box>
            )}
            
            {/* Кнопка профиля или входа */}
            <Box sx={{ ml: 2 }}>
              {isAuthenticated ? (
                <>
                  <IconButton 
                    onClick={handleUserMenuOpen}
                    sx={{
                      padding: 0,
                      border: scrolled ? '2px solid #e0e0e0' : '2px solid rgba(255,255,255,0.6)',
                    }}
                  >
                    <Avatar 
                      alt={user?.name} 
                      src="/static/images/avatar/1.jpg" 
                      sx={{ width: 40, height: 40 }}
                    />
                  </IconButton>
                  <Menu
                    anchorEl={userMenuAnchor}
                    open={userMenuOpen}
                    onClose={handleUserMenuClose}
                    transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                    anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
                    PaperProps={{
                      sx: { width: 220, mt: 1 }
                    }}
                  >
                    <Box sx={{ px: 2, py: 1 }}>
                      <Typography variant="subtitle1" fontWeight="bold">
                        {user?.name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {user?.email}
                      </Typography>
                    </Box>
                    <Divider />
                    <MenuItem component={Link} to="/profile">
                      Мой профиль
                    </MenuItem>
                    <MenuItem component={Link} to="/my-events">
                      Мои мероприятия
                    </MenuItem>
                    <Divider />
                    <MenuItem onClick={handleLogout}>
                      <ListItemIcon>
                        <LogoutIcon fontSize="small" />
                      </ListItemIcon>
                      Выйти
                    </MenuItem>
                  </Menu>
                </>
              ) : (
                <Button
                  component={Link}
                  to="/auth"
                  variant="contained"
                  color={scrolled ? 'primary' : 'secondary'}
                  startIcon={<LoginIcon />}
                >
                  Войти
                </Button>
              )}
            </Box>
            
            {/* Кнопка мобильного меню */}
            {isMobile && (
              <IconButton 
                edge="end" 
                onClick={toggleMobileMenu}
                sx={{ 
                  ml: 1,
                  color: scrolled ? 'text.primary' : 'white' 
                }}
              >
                <MenuIcon />
              </IconButton>
            )}
          </Toolbar>
        </Container>
      </AppBar>
      
      {/* Мобильное меню (Drawer) */}
      <Drawer
        anchor="right"
        open={mobileMenuOpen}
        onClose={toggleMobileMenu}
        PaperProps={{
          sx: { width: 280 }
        }}
      >
        <Box sx={{ py: 2, px: 1 }}>
          <Box sx={{ textAlign: 'center', mb: 2 }}>
            <Typography variant="h6" color="primary" fontWeight="bold">
              <span style={{ color: theme.palette.secondary.main }}>✦</span> NeoSplav
            </Typography>
          </Box>
          
          <Divider sx={{ mb: 2 }} />
          
          <List>
            {navLinks.map((link) => (
              <ListItem 
                key={link.name} 
                component={Link} 
                to={link.path}
                onClick={toggleMobileMenu}
                button
                selected={location.pathname === link.path}
                sx={{ 
                  borderRadius: 1,
                  mb: 0.5,
                  '&.Mui-selected': {
                    backgroundColor: 'rgba(0, 168, 232, 0.1)',
                  }
                }}
              >
                <ListItemIcon>
                  {link.icon}
                </ListItemIcon>
                <ListItemText primary={link.name} />
              </ListItem>
            ))}
            
            <Divider sx={{ my: 2 }} />
            
            {isAuthenticated ? (
              <>
                <ListItem sx={{ px: 3 }}>
                  <Box>
                    <Typography variant="subtitle2" fontWeight="bold">
                      {user?.name}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {user?.email}
                    </Typography>
                  </Box>
                </ListItem>
                <ListItem 
                  button
                  component={Link}
                  to="/profile"
                  onClick={toggleMobileMenu}
                  sx={{ borderRadius: 1 }}
                >
                  <ListItemText primary="Мой профиль" />
                </ListItem>
                <ListItem 
                  button
                  component={Link}
                  to="/my-events"
                  onClick={toggleMobileMenu}
                  sx={{ borderRadius: 1 }}
                >
                  <ListItemText primary="Мои мероприятия" />
                </ListItem>
                <ListItem 
                  button
                  onClick={() => {
                    toggleMobileMenu();
                    logout();
                  }}
                  sx={{ borderRadius: 1 }}
                >
                  <ListItemIcon>
                    <LogoutIcon />
                  </ListItemIcon>
                  <ListItemText primary="Выйти" />
                </ListItem>
              </>
            ) : (
              <ListItem>
                <Button
                  component={Link}
                  to="/auth"
                  variant="contained"
                  color="primary"
                  fullWidth
                  onClick={toggleMobileMenu}
                  startIcon={<LoginIcon />}
                >
                  Войти
                </Button>
              </ListItem>
            )}
          </List>
        </Box>
      </Drawer>
    </>
  );
};

export default Header; 