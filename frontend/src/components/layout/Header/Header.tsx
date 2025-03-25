import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Sun, Moon, UserCircle, Calendar, Users, Info, MapPin, HelpCircle, FileText, BookOpen } from 'lucide-react';
import { useState, useEffect, useRef, useCallback } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';

import { useTranslate } from '@/hooks';
import { useElementSize } from '@/hooks/useElementSize';
import { lightTheme, darkTheme } from '@/theme';
import { NeoSplav } from '@/components/icons';

/**
 * Интерфейс для пункта навигации
 */
export interface NavItem {
  /** Идентификатор пункта меню */
  id?: string;
  /** Название пункта меню */
  name: string;
  /** Путь для перехода */
  path: string;
  /** Ключ для локализации (необязательный) */
  labelKey?: string;
  /** Иконка (необязательная) */
  icon?: React.FC<React.SVGProps<SVGSVGElement>>;
}

/**
 * Свойства компонента Header
 */
interface HeaderProps {
  /**
   * Функция обратного вызова для изменения темы
   */
  onThemeToggle?: () => void;
  /**
   * Текущая тема
   */
  theme?: 'light' | 'dark';
  /**
   * Статус авторизации пользователя
   */
  isAuthenticated?: boolean;
}

/**
 * Компонент Header - шапка сайта с навигацией и логотипом
 */
const Header: React.FC<HeaderProps> = ({ onThemeToggle, theme = 'light', isAuthenticated = false }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isMobileView, setIsMobileView] = useState(false);
  const [headerRef, headerSize] = useElementSize<HTMLDivElement>();
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const scrollThreshold = 50; // Увеличиваем порог скролла
  const scrollDirectionThreshold = 50; // Минимальное изменение скролла для реакции
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const translate = useTranslate();
  const location = useLocation();

  // Определение пунктов меню
  const menuItems: NavItem[] = [
    {
      id: 'calendar',
      name: 'Календарь',
      path: '/calendar',
      labelKey: 'menu.calendar',
      icon: Calendar,
    },
    {
      id: 'team',
      name: 'Команда',
      path: '/team',
      labelKey: 'menu.team',
      icon: Users,
    },
    {
      id: 'participant',
      name: 'Участнику',
      path: '/participant',
      labelKey: 'menu.participant',
      icon: HelpCircle,
    },
  ];

  // Определяем путь для пункта "Профиль" в зависимости от статуса авторизации
  const profilePath = isAuthenticated ? '/profile' : '/login';
  const profileName = isAuthenticated ? 'Профиль' : 'Вход';
  const profileLabelKey = isAuthenticated ? 'menu.profile' : 'menu.login';

  // Отслеживание направления скролла для показа/скрытия меню с дебаунсом
  const handleScroll = useCallback(() => {
    // Не реагируем на скролл, если открыто мобильное меню
    if (isMenuOpen) return;
    
    const currentScrollY = window.scrollY;
    
    // Всегда показываем меню в верхней части страницы
    if (currentScrollY < scrollThreshold) {
      setIsVisible(true);
    } else {
      // Реагируем только на значительное изменение
      const deltaY = currentScrollY - lastScrollY;
      
      if (Math.abs(deltaY) > scrollDirectionThreshold) {
        setIsVisible(deltaY < 0); // true при скролле вверх, false при скролле вниз
        setLastScrollY(currentScrollY);
      }
    }
  }, [lastScrollY, isMenuOpen, scrollThreshold, scrollDirectionThreshold]);

  // Отслеживание скролла с дебаунсом
  useEffect(() => {
    const onScroll = () => {
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
      
      scrollTimeoutRef.current = setTimeout(() => {
        handleScroll();
      }, 50); // Дебаунс в 100мс
    };
    
    window.addEventListener('scroll', onScroll, { passive: true });
    
    return () => {
      window.removeEventListener('scroll', onScroll);
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, [handleScroll]);
  
  // При смене страницы скроллим наверх
  useEffect(() => {
    window.scrollTo(0, 0);
    setIsVisible(true);
  }, [location.pathname]);

  // Определяет, является ли текущий вид мобильным
  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobileView(window.innerWidth < 768);
    };

    // Проверяем при загрузке
    checkIfMobile();

    // Добавляем слушатель изменения размера окна
    window.addEventListener('resize', checkIfMobile);

    // Удаляем слушатель при размонтировании
    return () => {
      window.removeEventListener('resize', checkIfMobile);
    };
  }, []);

  // Закрываем меню при переходе с мобильного на десктопный вид
  useEffect(() => {
    if (!isMobileView && isMenuOpen) {
      setIsMenuOpen(false);
    }
  }, [isMobileView, isMenuOpen]);

  // Блокируем прокрутку страницы при открытом мобильном меню
  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }

    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [isMenuOpen]);

  // Обработчик открытия/закрытия меню
  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  // Обработчик закрытия меню
  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  // Функция для получения отображаемого имени пункта меню (с учетом локализации)
  const getItemDisplayName = (item: NavItem): string => {
    if (item.labelKey) {
      return translate(item.labelKey);
    }
    return item.name;
  };

  // Рендер иконки для пункта меню
  const renderIcon = (item: NavItem) => {
    if (item.id === 'calendar') return <Calendar className="w-5 h-5" />;
    if (item.id === 'team') return <Users className="w-5 h-5" />;
    if (item.id === 'participant') return <HelpCircle className="w-5 h-5" />;
    return null;
  };

  return (
    <motion.header
      ref={headerRef}
      className={`fixed top-0 left-0 right-0 z-50 flex justify-center pt-6 px-4`}
      initial={{ y: 0 }}
      animate={{ y: isVisible ? 0 : '-100%' }}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
      style={{ height: 'var(--header-height, 85px)' }}
    >
      <div className={`flex items-center justify-between w-auto max-w-screen-xl mx-auto rounded-[15px] shadow-md px-5 py-3 transition-colors ${
        theme === 'dark' ? darkTheme.header : lightTheme.header
      }`}>
        {/* Логотип */}
        <div className="flex-shrink-0 mr-6">
          <Link
            to="/"
            className="flex items-center"
            onClick={closeMenu}
          >
            <NeoSplav className="h-8 w-auto" />
          </Link>
        </div>

        {/* Десктопное меню */}
        <nav className="hidden md:flex space-x-3 items-center">
          {/* Пункты меню */}
          {menuItems.map((item) => (
            <NavLink
              key={item.id}
              to={item.path}
              className={({ isActive }) => `
                px-3 py-2 rounded-md text-sm font-medium transition-colors
                ${
                  theme === 'dark'
                    ? isActive
                      ? darkTheme.activeNavItem
                      : darkTheme.navItem
                    : isActive
                      ? lightTheme.activeNavItem
                      : lightTheme.navItem
                }
              `}
            >
              {getItemDisplayName(item)}
            </NavLink>
          ))}
          
          {/* Пункт "Профиль" */}
          <NavLink
            to={profilePath}
            className={({ isActive }) => `
              px-3 py-2 rounded-md text-sm font-medium transition-colors
              ${
                theme === 'dark'
                  ? isActive
                    ? darkTheme.activeNavItem
                    : darkTheme.navItem
                  : isActive
                    ? lightTheme.activeNavItem
                    : lightTheme.navItem
              }
            `}
            title={profileName}
          >
            <UserCircle className="w-5 h-5" />
          </NavLink>

          {/* Переключатель темы */}
          <button
            aria-label="Toggle theme"
            className={`p-2 ml-1 rounded-full transition-colors ${
              theme === 'dark' ? darkTheme.themeToggle : lightTheme.themeToggle
            }`}
            onClick={onThemeToggle}
            title={theme === 'dark' ? 'Светлая тема' : 'Темная тема'}
          >
            {theme === 'dark' ? <Sun size={20} className="text-accent-400" /> : <Moon size={20} />}
          </button>
        </nav>

        {/* Мобильное меню (иконки) */}
        <nav className="md:hidden flex items-center space-x-2">
          {/* Иконки пунктов меню */}
          {menuItems.map((item) => (
            <NavLink
              key={item.id}
              to={item.path}
              className={({ isActive }) => `
                p-2 rounded-md transition-colors
                ${
                  theme === 'dark'
                    ? isActive
                      ? darkTheme.activeNavItem
                      : darkTheme.navItem
                    : isActive
                      ? lightTheme.activeNavItem
                      : lightTheme.navItem
                }
              `}
              title={getItemDisplayName(item)}
            >
              {renderIcon(item)}
            </NavLink>
          ))}
          
          {/* Пункт "Профиль" */}
          <NavLink
            to={profilePath}
            className={({ isActive }) => `
              p-2 rounded-md transition-colors
              ${
                theme === 'dark'
                  ? isActive
                    ? darkTheme.activeNavItem
                    : darkTheme.navItem
                  : isActive
                    ? lightTheme.activeNavItem
                    : lightTheme.navItem
              }
            `}
            title={profileName}
          >
            <UserCircle className="w-5 h-5" />
          </NavLink>

          {/* Переключатель темы */}
          <button
            aria-label="Toggle theme"
            className={`p-2 rounded-full transition-colors ${
              theme === 'dark' ? darkTheme.themeToggle : lightTheme.themeToggle
            }`}
            onClick={onThemeToggle}
            title={theme === 'dark' ? 'Светлая тема' : 'Темная тема'}
          >
            {theme === 'dark' ? <Sun size={20} className="text-accent-400" /> : <Moon size={20} />}
          </button>
        </nav>
      </div>
    </motion.header>
  );
};

export default Header;
