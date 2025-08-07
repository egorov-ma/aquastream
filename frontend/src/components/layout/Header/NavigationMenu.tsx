import { UserCircle } from 'lucide-react';
import React, { useContext } from 'react';

import { MenuContext } from './HeaderScroll';
import NavigationItem from './NavigationItem';
import ThemeSwitcher from './ThemeSwitcher';
import { NavItem } from './types';

import { useTranslate } from '@/hooks';


/**
 * Свойства компонента навигационного меню
 */
interface NavigationMenuProps {
  /**
   * Список элементов меню
   */
  items: NavItem[];
  /**
   * Текущая тема
   */
  theme: 'light' | 'dark';
  /**
   * Статус авторизации пользователя
   */
  isAuthenticated: boolean;
  /**
   * Режим отображения (текст, иконки или оба)
   */
  mode?: 'text' | 'icon' | 'both';
  /**
   * Обработчик переключения темы
   */
  onThemeToggle?: () => void;
  /**
   * Функция для рендеринга иконок
   */
  renderIcon?: (item: NavItem) => React.ReactNode;
  /**
   * Дополнительные CSS-классы
   */
  className?: string;
}

/**
 * Компонент для отображения навигационного меню
 */
const NavigationMenu: React.FC<NavigationMenuProps> = React.memo(({
  items,
  theme,
  isAuthenticated,
  mode = 'text',
  onThemeToggle,
  renderIcon,
  className,
}) => {
  const translate = useTranslate();
  const { setMenuOpen } = useContext(MenuContext);

  // Функция для получения отображаемого имени пункта меню
  const getItemDisplayName = React.useCallback((item: NavItem): string => {
    if (item.labelKey) {
      return translate(item.labelKey);
    }
    return item.name;
  }, [translate]);

  // Обработчик клика по навигационному элементу
  const handleNavigationClick = React.useCallback(() => {
    // Закрываем меню при клике по ссылке
    setMenuOpen(false);
  }, [setMenuOpen]);

  // Определяем путь для пункта "Профиль" в зависимости от статуса авторизации
  const profilePath = isAuthenticated ? '/profile' : '/login';
  const profileName = isAuthenticated ? 'Профиль' : 'Вход';
  const profileLabelKey = isAuthenticated ? 'menu.profile' : 'menu.login';
  
  // Создаем пункт "Профиль"
  const profileItem: NavItem = {
    id: 'profile',
    name: profileName,
    path: profilePath,
    labelKey: profileLabelKey,
    icon: UserCircle
  };

  return (
    <nav className={`flex items-center space-x-3 ${className || ''}`} data-testid="navigation-menu">
      {/* Пункты меню */}
      {items.map((item) => (
        <NavigationItem
          key={item.id || item.path}
          item={item}
          mode={mode}
          displayName={getItemDisplayName(item)}
          renderIcon={renderIcon}
          onClick={handleNavigationClick}
        />
      ))}
      
      {/* Пункт "Профиль" */}
      <NavigationItem
        item={profileItem}
        mode={mode}
        displayName={getItemDisplayName(profileItem)}
        renderIcon={mode === 'text' ? undefined : () => <UserCircle className="w-5 h-5" />}
        onClick={handleNavigationClick}
      />

      {/* Переключатель темы */}
      <ThemeSwitcher theme={theme} onToggle={onThemeToggle} />
    </nav>
  );
});

NavigationMenu.displayName = 'NavigationMenu';

export default NavigationMenu; 