import clsx from 'clsx';
import React, { ReactNode } from 'react';

export interface CardProps {
  /**
   * Содержимое карточки
   */
  children: ReactNode;
  /**
   * Дополнительные CSS классы
   */
  className?: string;
  /**
   * Вариант отображения карточки
   */
  variant?: 'default' | 'outlined' | 'elevated' | 'flat';
  /**
   * Убрать отступы для карточки
   */
  noPadding?: boolean;
  /**
   * Эффект анимации при наведении
   */
  hoverEffect?: 'none' | 'lift' | 'glow' | 'scale';
  /**
   * Эффект анимации при появлении
   */
  appearEffect?: 'none' | 'fade-in' | 'slide-up' | 'scale';
  /**
   * Обработчик клика по карточке
   */
  onClick?: () => void;
}

export interface CardHeaderProps {
  /**
   * Содержимое заголовка карточки
   */
  children: ReactNode;
  /**
   * Дополнительные CSS классы
   */
  className?: string;
}

export interface CardTitleProps {
  /**
   * Содержимое заголовка карточки
   */
  children: ReactNode;
  /**
   * Дополнительные CSS классы
   */
  className?: string;
}

export interface CardContentProps {
  /**
   * Содержимое тела карточки
   */
  children: ReactNode;
  /**
   * Дополнительные CSS классы
   */
  className?: string;
}

export interface CardFooterProps {
  /**
   * Содержимое футера карточки
   */
  children: ReactNode;
  /**
   * Дополнительные CSS классы
   */
  className?: string;
}

/**
 * Компонент Card - карточка для группировки содержимого
 */
export const Card: React.FC<CardProps> = ({
  children,
  className = '',
  variant = 'default',
  noPadding = false,
  hoverEffect = 'none',
  appearEffect = 'none',
  onClick,
}) => {
  // Базовые классы для всех карточек
  const baseClasses = 'rounded-lg overflow-hidden';

  // Классы для вариантов
  const variantClasses = {
    default: 'bg-white dark:bg-secondary-800 shadow',
    outlined:
      'bg-white dark:bg-secondary-800 border border-secondary-200 dark:border-secondary-700',
    elevated: 'bg-white dark:bg-secondary-800 shadow-md',
    flat: 'bg-secondary-50 dark:bg-secondary-900',
  };

  // Классы для эффектов наведения
  const hoverEffectClasses = {
    none: '',
    lift: 'transition-transform duration-300 hover:-translate-y-1',
    glow: 'transition-shadow duration-300 hover:shadow-glow dark:hover:shadow-glow',
    scale: 'transition-transform duration-300 hover:scale-[1.01]',
  };

  // Классы для эффектов появления
  const appearEffectClasses = {
    none: '',
    'fade-in': 'animate-fade-in',
    'slide-up': 'animate-slide-up',
    scale: 'animate-scale',
  };

  // Составляем финальные классы
  const cardClasses = clsx(
    baseClasses,
    variantClasses[variant],
    hoverEffectClasses[hoverEffect],
    appearEffectClasses[appearEffect],
    !noPadding && 'p-4',
    className
  );

  return (
    <div
      className={cardClasses}
      onClick={onClick}
      onKeyDown={(e) => {
        if (onClick && (e.key === 'Enter' || e.key === ' ')) {
          e.preventDefault();
          onClick();
        }
      }}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      aria-label={onClick ? 'Interactive card' : undefined}
    >
      {children}
    </div>
  );
};

/**
 * Компонент CardHeader - заголовок карточки
 */
export const CardHeader: React.FC<CardHeaderProps> = ({ children, className = '' }) => {
  const classes = clsx('flex items-center mb-4', className);
  return <div className={classes}>{children}</div>;
};

/**
 * Компонент CardTitle - название карточки
 */
export const CardTitle: React.FC<CardTitleProps> = ({ children, className = '' }) => {
  const classes = clsx('text-lg font-semibold dark:text-white', className);
  return <div className={classes}>{children}</div>;
};

/**
 * Компонент CardContent - тело карточки
 */
export const CardContent: React.FC<CardContentProps> = ({ children, className = '' }) => {
  const classes = clsx('', className);
  return <div className={classes}>{children}</div>;
};

/**
 * Компонент CardFooter - футер карточки
 */
export const CardFooter: React.FC<CardFooterProps> = ({ children, className = '' }) => {
  const classes = clsx(
    'flex items-center justify-end mt-4 pt-4 border-t border-secondary-200 dark:border-secondary-700',
    className
  );
  return <div className={classes}>{children}</div>;
};

export default Card;
