import React from 'react';
import { Link } from 'react-router-dom';
import { NeoSplav } from '@/components/icons';

/**
 * Свойства компонента логотипа
 */
interface LogoProps {
  /**
   * Обработчик клика по логотипу
   */
  onClick?: () => void;
  /**
   * Путь для перехода при клике
   */
  to?: string;
  /**
   * Размер логотипа
   */
  size?: 'sm' | 'md' | 'lg';
  /**
   * Дополнительные CSS-классы
   */
  className?: string;
}

/**
 * Компонент логотипа
 */
const Logo: React.FC<LogoProps> = React.memo(({
  onClick,
  to = '/',
  size = 'md',
  className,
}) => {
  // Определяем размер логотипа
  const logoSize = {
    sm: 'h-6',
    md: 'h-8',
    lg: 'h-10',
  };
  
  return (
    <Link
      to={to}
      className={`flex items-center ${className || ''}`}
      onClick={onClick}
      data-testid="logo-link"
    >
      <NeoSplav className={`${logoSize[size]} w-auto`} data-testid="logo-icon" />
    </Link>
  );
});

Logo.displayName = 'Logo';

export default Logo; 