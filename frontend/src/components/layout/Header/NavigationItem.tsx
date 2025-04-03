import React from 'react';
import { NavLink } from 'react-router-dom';
import { lightTheme, darkTheme } from '@/theme';
import { NavItem } from './types';

/**
 * Свойства компонента навигационного пункта
 */
interface NavigationItemProps {
  /**
   * Данные пункта меню
   */
  item: NavItem;
  /**
   * Режим отображения
   */
  mode?: 'text' | 'icon' | 'both';
  /**
   * Текущая тема
   */
  theme: 'light' | 'dark';
  /**
   * Отображаемое имя пункта
   */
  displayName: string;
  /**
   * Рендер-функция для иконки (если не указана в item)
   */
  renderIcon?: (item: NavItem) => React.ReactNode;
  /**
   * Дополнительные CSS-классы
   */
  className?: string;
  /**
   * Обработчик клика по пункту меню
   */
  onClick?: () => void;
}

/**
 * Компонент для отображения навигационного пункта меню
 */
const NavigationItem: React.FC<NavigationItemProps> = React.memo(({
  item,
  mode = 'text',
  theme,
  displayName,
  renderIcon,
  className,
  onClick,
}) => {
  // Функция для рендеринга содержимого пункта меню
  const renderContent = () => {
    if (mode === 'icon') {
      return renderIcon?.(item) || (item.icon && <item.icon className="w-5 h-5" />);
    }
    
    if (mode === 'both') {
      return (
        <div className="flex items-center gap-2">
          {renderIcon?.(item) || (item.icon && <item.icon className="w-5 h-5" />)}
          <span>{displayName}</span>
        </div>
      );
    }
    
    return displayName;
  };

  // CSS классы для пункта меню в зависимости от текущей темы и активности
  const getLinkClasses = ({ isActive }: { isActive: boolean }) => `
    ${mode === 'icon' ? 'p-2' : 'px-3 py-2'} 
    rounded-md 
    ${mode === 'text' ? 'text-sm font-medium' : ''} 
    transition-colors
    ${
      theme === 'dark'
        ? isActive
          ? darkTheme.activeNavItem
          : darkTheme.navItem
        : isActive
          ? lightTheme.activeNavItem
          : lightTheme.navItem
    }
    ${className || ''}
  `;

  // Обработчик клика с вызовом внешнего обработчика
  const handleClick = (e: React.MouseEvent) => {
    onClick?.();
  };

  return (
    <NavLink
      to={item.path}
      className={getLinkClasses}
      title={mode === 'icon' ? displayName : undefined}
      data-testid={`nav-item-${item.id || item.path.replace(/\//g, '-')}`}
      onClick={handleClick}
    >
      {renderContent()}
    </NavLink>
  );
});

NavigationItem.displayName = 'NavigationItem';

export default NavigationItem; 