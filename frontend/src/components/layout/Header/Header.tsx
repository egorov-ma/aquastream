import React, { useState } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import {
  AppBar,
  Box,
  Toolbar,
  IconButton,
  Typography,
  Menu,
  Container,
  Avatar,
  Button,
  Tooltip,
  MenuItem,
  Drawer,
  List,
  ListItem,
  ListItemText,
  ListItemButton,
  Divider,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import { RootState } from '@/store';
import { logout } from '@/store/slices/authSlice';
import { APP_ROUTES } from '@/config/config';
import { UserRole } from '@/types/models';
import styles from './Header.module.css';

// Навигационные пункты для всех пользователей
const publicPages = [
  { title: 'События', path: APP_ROUTES.EVENTS },
  { title: 'Календарь', path: APP_ROUTES.CALENDAR },
  { title: 'Команда', path: APP_ROUTES.TEAM },
  { title: 'Контакты', path: APP_ROUTES.CONTACTS },
  { title: 'Участнику', path: APP_ROUTES.PARTICIPANT },
];

// Дополнительные пункты для авторизованных пользователей
const userPages: Record<UserRole, Array<{ title: string; path: string }>> = {
  [UserRole.USER]: [],
  [UserRole.ORGANIZER]: [
    { title: 'Создать событие', path: APP_ROUTES.CREATE_EVENT },
  ],
  [UserRole.ADMIN]: [
    { title: 'Создать событие', path: APP_ROUTES.CREATE_EVENT },
    { title: 'Админ-панель', path: APP_ROUTES.ADMIN },
  ],
};

/**
 * Компонент хедера приложения
 */
export const Header: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { isAuthenticated, user } = useSelector((state: RootState) => state.auth);

  // Состояние для мобильного меню
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Состояние для меню пользователя
  const [anchorElUser, setAnchorElUser] = useState<null | HTMLElement>(null);

  // Обработчики для меню пользователя
  const handleOpenUserMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorElUser(event.currentTarget);
  };

  const handleCloseUserMenu = () => {
    setAnchorElUser(null);
  };

  // Обработчик для выхода из системы
  const handleLogout = () => {
    dispatch(logout());
    handleCloseUserMenu();
    navigate(APP_ROUTES.HOME);
  };

  // Получаем дополнительные пункты меню в зависимости от роли пользователя
  const additionalPages = user ? userPages[user.role] : [];

  return (
    <AppBar position="static" className={styles.header}>
      <Container maxWidth="lg">
        <Toolbar disableGutters>
          {/* Логотип для десктопа */}
          <Typography
            variant="h6"
            noWrap
            component={RouterLink}
            to={APP_ROUTES.HOME}
            className={styles.logo}
          >
            AquaStream
          </Typography>

          {/* Мобильное меню */}
          <Box className={styles.mobileMenuContainer}>
            <IconButton
              size="large"
              aria-label="меню"
              aria-controls="menu-appbar"
              aria-haspopup="true"
              onClick={() => setMobileMenuOpen(true)}
              color="inherit"
            >
              <MenuIcon />
            </IconButton>
            <Drawer
              anchor="left"
              open={mobileMenuOpen}
              onClose={() => setMobileMenuOpen(false)}
            >
              <Box
                className={styles.mobileMenu}
                role="presentation"
                onClick={() => setMobileMenuOpen(false)}
              >
                <List>
                  {publicPages.map((page) => (
                    <ListItem key={page.path} disablePadding>
                      <ListItemButton component={RouterLink} to={page.path}>
                        <ListItemText primary={page.title} />
                      </ListItemButton>
                    </ListItem>
                  ))}
                  {additionalPages.map((page) => (
                    <ListItem key={page.path} disablePadding>
                      <ListItemButton component={RouterLink} to={page.path}>
                        <ListItemText primary={page.title} />
                      </ListItemButton>
                    </ListItem>
                  ))}
                </List>
                <Divider />
                <List>
                  {!isAuthenticated ? (
                    <>
                      <ListItem disablePadding>
                        <ListItemButton component={RouterLink} to={APP_ROUTES.LOGIN}>
                          <ListItemText primary="Войти" />
                        </ListItemButton>
                      </ListItem>
                      <ListItem disablePadding>
                        <ListItemButton component={RouterLink} to={APP_ROUTES.REGISTER}>
                          <ListItemText primary="Регистрация" />
                        </ListItemButton>
                      </ListItem>
                    </>
                  ) : (
                    <>
                      <ListItem disablePadding>
                        <ListItemButton component={RouterLink} to={APP_ROUTES.PROFILE}>
                          <ListItemText primary="Профиль" />
                        </ListItemButton>
                      </ListItem>
                      <ListItem disablePadding>
                        <ListItemButton onClick={handleLogout}>
                          <ListItemText primary="Выйти" />
                        </ListItemButton>
                      </ListItem>
                    </>
                  )}
                </List>
              </Box>
            </Drawer>
          </Box>

          {/* Десктопное меню */}
          <Box className={styles.desktopMenuContainer}>
            {publicPages.map((page) => (
              <Button
                key={page.path}
                component={RouterLink}
                to={page.path}
                className={styles.navButton}
              >
                {page.title}
              </Button>
            ))}
            {additionalPages.map((page) => (
              <Button
                key={page.path}
                component={RouterLink}
                to={page.path}
                className={styles.navButton}
              >
                {page.title}
              </Button>
            ))}
          </Box>

          {/* Меню пользователя */}
          <Box className={styles.userMenuContainer}>
            {isAuthenticated ? (
              <>
                <Tooltip title="Открыть меню">
                  <IconButton onClick={handleOpenUserMenu} className={styles.userButton}>
                    {user?.avatar ? (
                      <Avatar alt={user.name} src={user.avatar} />
                    ) : (
                      <AccountCircleIcon />
                    )}
                  </IconButton>
                </Tooltip>
                <Menu
                  id="menu-appbar"
                  anchorEl={anchorElUser}
                  anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'right',
                  }}
                  keepMounted
                  transformOrigin={{
                    vertical: 'top',
                    horizontal: 'right',
                  }}
                  open={Boolean(anchorElUser)}
                  onClose={handleCloseUserMenu}
                >
                  <MenuItem
                    component={RouterLink}
                    to={APP_ROUTES.PROFILE}
                    onClick={handleCloseUserMenu}
                  >
                    <Typography textAlign="center">Профиль</Typography>
                  </MenuItem>
                  <MenuItem onClick={handleLogout}>
                    <Typography textAlign="center">Выйти</Typography>
                  </MenuItem>
                </Menu>
              </>
            ) : (
              <Box className={styles.authButtons}>
                <Button
                  component={RouterLink}
                  to={APP_ROUTES.LOGIN}
                  variant="text"
                  color="inherit"
                  className={styles.loginButton}
                >
                  Войти
                </Button>
                <Button
                  component={RouterLink}
                  to={APP_ROUTES.REGISTER}
                  variant="contained"
                  color="primary"
                  className={styles.registerButton}
                >
                  Регистрация
                </Button>
              </Box>
            )}
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
}; 