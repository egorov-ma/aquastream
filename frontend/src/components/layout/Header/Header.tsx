import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Sun, Moon } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Link, NavLink } from 'react-router-dom';

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
}

/**
 * Свойства компонента Header
 */
interface HeaderProps {
  /**
   * Элементы навигации
   */
  navItems?: NavItem[];
  /**
   * Функция обратного вызова для изменения темы
   */
  onThemeToggle?: () => void;
  /**
   * Текущая тема
   */
  theme?: 'light' | 'dark';
}

/**
 * Компонент Header - шапка сайта с навигацией и логотипом
 */
const Header: React.FC<HeaderProps> = ({ navItems = [], onThemeToggle, theme = 'light' }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isMobileView, setIsMobileView] = useState(false);
  const [headerRef, headerSize] = useElementSize<HTMLDivElement>();
  const translate = useTranslate();

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
    return item.labelKey ? translate(item.labelKey) : item.name;
  };

  return (
    <header
      ref={headerRef}
      className={`fixed top-0 left-0 right-0 z-50 shadow-md transition-colors ${
        theme === 'dark' ? darkTheme.header : lightTheme.header
      }`}
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Логотип */}
          <div className="flex-shrink-0">
            <Link
              to="/"
              className="flex items-center"
              onClick={closeMenu}
            >
              <NeoSplav className="h-8 w-auto" />
            </Link>
          </div>

          {/* Десктопное меню */}
          <nav className="hidden md:flex space-x-4">
            {navItems.map((item) => (
              <NavLink
                key={item.path}
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

            {/* Переключатель темы */}
            <button
              aria-label="Toggle theme"
              className={`p-2 rounded-full transition-colors ${
                theme === 'dark' ? darkTheme.themeToggle : lightTheme.themeToggle
              }`}
              onClick={onThemeToggle}
            >
              {theme === 'dark' ? <Sun size={20} className="text-accent-400" /> : <Moon size={20} />}
            </button>
          </nav>

          {/* Мобильная кнопка меню */}
          <div className="md:hidden flex items-center">
            <button
              aria-label="Toggle mobile menu"
              className={`p-2 rounded-md ${
                theme === 'dark' ? darkTheme.mobileMenuButton : lightTheme.mobileMenuButton
              }`}
              onClick={toggleMenu}
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Мобильное меню */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: `calc(100vh - ${headerSize.height}px)` }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className={`absolute top-16 left-0 right-0 overflow-hidden ${
              theme === 'dark' ? darkTheme.mobileMenu : lightTheme.mobileMenu
            }`}
          >
            <div className="container mx-auto px-4 py-4">
              <nav className="flex flex-col space-y-2">
                {navItems.map((item) => (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    onClick={closeMenu}
                    className={({ isActive }) => `
                      px-3 py-2 rounded-md text-base font-medium transition-colors
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

                {/* Переключатель темы в мобильном меню */}
                <div className="mt-4 flex items-center">
                  <button
                    aria-label="Toggle theme"
                    className={`flex items-center px-3 py-2 rounded-md text-base font-medium w-full ${
                      theme === 'dark' ? darkTheme.themeToggle : lightTheme.themeToggle
                    }`}
                    onClick={() => {
                      onThemeToggle?.();
                      closeMenu();
                    }}
                  >
                    <span className="mr-2">
                      {theme === 'dark' ? <Sun size={20} className="text-accent-400" /> : <Moon size={20} />}
                    </span>
                    <span>{theme === 'dark' ? 'Светлая тема' : 'Темная тема'}</span>
                  </button>
                </div>
              </nav>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

export default Header;
