import { Calendar, Users, HelpCircle } from 'lucide-react';
import React, { useCallback, useContext } from 'react';


import HeaderScroll, { MenuContext } from './HeaderScroll';
import Logo from './Logo';
import NavigationMenu from './NavigationMenu';
import { NavItem, HeaderProps } from './types';

import { lightTheme, darkTheme } from '@/theme';

/**
 * Компонент Header - шапка сайта с навигацией и логотипом
 */
const Header: React.FC<HeaderProps> = ({
  onThemeToggle,
  theme = 'light',
  isAuthenticated = false,
  items,
  className,
}) => {
  // Определение стандартных пунктов меню, если не переданы пользовательские
  const defaultMenuItems: NavItem[] = [
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

  // Используем переданные пункты меню или стандартные
  const menuItems = items || defaultMenuItems;

  // Получаем setMenuOpen из контекста один раз на уровне компонента
  const { setMenuOpen } = useContext(MenuContext);

  // Обработчик закрытия меню
  const closeMenu = useCallback(() => {
    setMenuOpen(false);
  }, [setMenuOpen]);

  // Рендер иконки для пункта меню
  const renderIcon = useCallback((item: NavItem) => {
    if (item.id === 'calendar') return <Calendar className="w-5 h-5" />;
    if (item.id === 'team') return <Users className="w-5 h-5" />;
    if (item.id === 'participant') return <HelpCircle className="w-5 h-5" />;
    if (item.icon) return <item.icon className="w-5 h-5" />;
    return null;
  }, []);

  return (
    <HeaderScroll 
      className={className}
      scrollSettings={{
        initialVisibilityThreshold: 60,
        scrollDeltaThreshold: 50,
        hideDelay: 800,
      }}
      animationSettings={{
        stiffness: 300,
        damping: 30,
        mass: 0.8,
        opacityDuration: 0.15,
      }}
    >
      <div className={`flex items-center justify-between w-auto max-w-screen-xl mx-auto rounded-[15px] shadow-md px-5 py-3 transition-colors ${
        theme === 'dark' ? darkTheme.header : lightTheme.header
      }`}>
        {/* Логотип */}
        <div className="flex-shrink-0 mr-6">
          <Logo onClick={closeMenu} />
        </div>

        {/* Десктопное меню */}
        <div className="hidden md:block">
          <NavigationMenu
            items={menuItems}
            theme={theme}
            isAuthenticated={isAuthenticated}
            mode="text"
            onThemeToggle={onThemeToggle}
            renderIcon={renderIcon}
          />
        </div>

        {/* Мобильное меню (иконки) */}
        <div className="md:hidden">
          <NavigationMenu
            items={menuItems}
            theme={theme}
            isAuthenticated={isAuthenticated}
            mode="icon"
            onThemeToggle={onThemeToggle}
            renderIcon={renderIcon}
          />
        </div>
      </div>
    </HeaderScroll>
  );
};

export default Header;
