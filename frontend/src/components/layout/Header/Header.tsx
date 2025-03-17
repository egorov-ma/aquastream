import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import DashboardIcon from '@mui/icons-material/Dashboard';
import ExitToAppIcon from '@mui/icons-material/ExitToApp';
import MenuIcon from '@mui/icons-material/Menu';
import PersonIcon from '@mui/icons-material/Person';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  IconButton,
  Box,
  Menu,
  MenuItem,
  Container,
  Avatar,
  useMediaQuery,
  useTheme,
  Drawer,
  List,
  ListItem,
  ListItemText,
  Divider,
} from '@mui/material';
import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link as RouterLink, useNavigate } from 'react-router-dom';

import styles from './Header.module.css';

import { logout } from '@/modules/auth/store/authSlice';
import { APP_ROUTES } from '@/shared/config';
import { AppDispatch } from '@/store';
import { RootState } from '@/store';

/**
 * Компонент шапки приложения
 */
export const Header: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  // Состояние для управления выпадающим меню пользователя
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  // Состояние для управления мобильным меню
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Получаем данные о пользователе из Redux store
  const { isAuthenticated, user } = useSelector((state: RootState) => state.auth);

  /**
   * Обработчик открытия меню пользователя
   */
  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  /**
   * Обработчик закрытия меню пользователя
   */
  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  /**
   * Обработчик выхода из системы
   */
  const handleLogout = () => {
    handleMenuClose();
    void dispatch(logout());
    navigate(APP_ROUTES.HOME);
  };

  /**
   * Обработчик перехода к профилю пользователя
   */
  const handleProfileClick = () => {
    handleMenuClose();
    navigate(APP_ROUTES.PROFILE);
  };

  /**
   * Обработчик перехода в панель администратора
   */
  const handleAdminClick = () => {
    handleMenuClose();
    navigate(APP_ROUTES.ADMIN);
  };

  /**
   * Обработчик открытия/закрытия мобильного меню
   */
  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  /**
   * Компонент навигационных ссылок
   */
  const navLinks = (
    <>
      <Button
        component={RouterLink}
        to={APP_ROUTES.EVENTS}
        color="inherit"
        className={styles.navButton}
      >
        События
      </Button>
      <Button
        component={RouterLink}
        to={APP_ROUTES.CALENDAR}
        color="inherit"
        className={styles.navButton}
      >
        Календарь
      </Button>
      <Button
        component={RouterLink}
        to={APP_ROUTES.TEAM}
        color="inherit"
        className={styles.navButton}
      >
        Команда
      </Button>
      <Button
        component={RouterLink}
        to={APP_ROUTES.CONTACTS}
        color="inherit"
        className={styles.navButton}
      >
        Контакты
      </Button>
      <Button
        component={RouterLink}
        to={APP_ROUTES.PARTICIPANT}
        color="inherit"
        className={styles.navButton}
      >
        Участнику
      </Button>
    </>
  );

  /**
   * Компонент мобильного меню
   */
  const mobileMenu = (
    <Drawer
      anchor="right"
      open={mobileMenuOpen}
      onClose={toggleMobileMenu}
      className={styles.drawer}
    >
      <Box className={styles.drawerContent}>
        <List>
          <ListItem component={RouterLink} to={APP_ROUTES.EVENTS} onClick={toggleMobileMenu}>
            <ListItemText primary="События" />
          </ListItem>
          <ListItem component={RouterLink} to={APP_ROUTES.CALENDAR} onClick={toggleMobileMenu}>
            <ListItemText primary="Календарь" />
          </ListItem>
          <ListItem component={RouterLink} to={APP_ROUTES.TEAM} onClick={toggleMobileMenu}>
            <ListItemText primary="Команда" />
          </ListItem>
          <ListItem component={RouterLink} to={APP_ROUTES.CONTACTS} onClick={toggleMobileMenu}>
            <ListItemText primary="Контакты" />
          </ListItem>
          <ListItem component={RouterLink} to={APP_ROUTES.PARTICIPANT} onClick={toggleMobileMenu}>
            <ListItemText primary="Участнику" />
          </ListItem>
        </List>
        <Divider />
        <List>
          {isAuthenticated ? (
            <>
              <ListItem
                onClick={() => {
                  toggleMobileMenu();
                  navigate(APP_ROUTES.PROFILE);
                }}
              >
                <ListItemText primary="Профиль" />
              </ListItem>
              {user && user.role === 'admin' && (
                <ListItem
                  onClick={() => {
                    toggleMobileMenu();
                    navigate(APP_ROUTES.ADMIN);
                  }}
                >
                  <ListItemText primary="Администрирование" />
                </ListItem>
              )}
              <ListItem
                onClick={() => {
                  toggleMobileMenu();
                  handleLogout();
                }}
              >
                <ListItemText primary="Выйти" />
              </ListItem>
            </>
          ) : (
            <>
              <ListItem component={RouterLink} to={APP_ROUTES.LOGIN} onClick={toggleMobileMenu}>
                <ListItemText primary="Войти" />
              </ListItem>
              <ListItem component={RouterLink} to={APP_ROUTES.REGISTER} onClick={toggleMobileMenu}>
                <ListItemText primary="Регистрация" />
              </ListItem>
            </>
          )}
        </List>
      </Box>
    </Drawer>
  );

  return (
    <AppBar position="sticky" className={styles.header}>
      <Container maxWidth="lg">
        <Toolbar disableGutters className={styles.toolbar}>
          {/* Логотип */}
          <Typography
            variant="h6"
            component={RouterLink}
            to={APP_ROUTES.HOME}
            className={styles.logo}
          >
            AquaStream
          </Typography>

          {/* Навигационные ссылки (отображаются только на десктопе) */}
          {!isMobile && <Box className={styles.navLinks}>{navLinks}</Box>}

          {/* Кнопки авторизации/профиля пользователя */}
          <Box className={styles.authButtons}>
            {isAuthenticated ? (
              <>
                <IconButton
                  onClick={handleMenuOpen}
                  color="inherit"
                  aria-label="account of current user"
                  aria-controls="menu-appbar"
                  aria-haspopup="true"
                >
                  {user?.avatar ? (
                    <Avatar src={user.avatar} alt={user.email} className={styles.avatar} />
                  ) : (
                    <AccountCircleIcon />
                  )}
                </IconButton>
                <Menu
                  id="menu-appbar"
                  anchorEl={anchorEl}
                  anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'right',
                  }}
                  keepMounted
                  transformOrigin={{
                    vertical: 'top',
                    horizontal: 'right',
                  }}
                  open={open}
                  onClose={handleMenuClose}
                >
                  <MenuItem onClick={handleProfileClick}>
                    <PersonIcon fontSize="small" className={styles.menuIcon} />
                    Профиль
                  </MenuItem>
                  {user && user.role === 'admin' && (
                    <MenuItem onClick={handleAdminClick}>
                      <DashboardIcon fontSize="small" className={styles.menuIcon} />
                      Администрирование
                    </MenuItem>
                  )}
                  <MenuItem onClick={handleLogout}>
                    <ExitToAppIcon fontSize="small" className={styles.menuIcon} />
                    Выйти
                  </MenuItem>
                </Menu>
              </>
            ) : (
              <>
                {!isMobile && (
                  <>
                    <Button
                      component={RouterLink}
                      to={APP_ROUTES.LOGIN}
                      color="inherit"
                      className={styles.authButton}
                    >
                      Войти
                    </Button>
                    <Button
                      component={RouterLink}
                      to={APP_ROUTES.REGISTER}
                      variant="contained"
                      color="secondary"
                      className={styles.authButton}
                    >
                      Регистрация
                    </Button>
                  </>
                )}
              </>
            )}

            {/* Кнопка мобильного меню */}
            {isMobile && (
              <IconButton
                color="inherit"
                aria-label="open drawer"
                edge="end"
                onClick={toggleMobileMenu}
              >
                <MenuIcon />
              </IconButton>
            )}
          </Box>
        </Toolbar>
      </Container>
      {mobileMenu}
    </AppBar>
  );
};
