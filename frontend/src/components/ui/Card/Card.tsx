import { cn } from '@utils/cn';
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
  variant?: 'default' | 'outlined' | 'elevated' | 'flat' | 'primary' | 'accent';
  /**
   * Убрать отступы для карточки
   */
  noPadding?: boolean;
  /**
   * Эффект анимации при наведении
   */
  hoverEffect?: 'none' | 'lift' | 'glow' | 'scale' | 'glow-accent' | 'card-hover';
  /**
   * Эффект анимации при появлении
   */
  appearEffect?: 'none' | 'fade-in' | 'slide-up' | 'scale' | 'zoom-in' | 'blur-in' | 'fade-up';
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
  const baseClasses = 'rounded-lg overflow-hidden transition-all duration-300';

  // Классы для вариантов
  const variantClasses = {
    default: 'bg-secondary-50 dark:bg-secondary-900 shadow',
    outlined:
      'bg-secondary-50 dark:bg-secondary-900 border border-secondary-200 dark:border-secondary-700',
    elevated: 'bg-secondary-50 dark:bg-secondary-900 shadow-md',
    flat: 'bg-secondary-100 dark:bg-secondary-950',
    primary: 'bg-primary-600 text-secondary-50 dark:bg-primary-700',
    accent: 'bg-accent-400 text-secondary-950 dark:bg-accent-500',
  };

  // Классы для эффектов наведения
  const hoverEffectClasses = {
    none: '',
    lift: 'transition-transform duration-300 hover:-translate-y-1 hover:shadow-lg',
    glow: 'transition-shadow duration-300 hover:shadow-glow dark:hover:shadow-glow',
    'glow-accent': 'transition-shadow duration-300 hover:shadow-glow-accent',
    scale: 'transition-transform duration-300 hover:scale-[1.01]',
    'card-hover': 'animate-card-hover',
  };

  // Классы для эффектов появления
  const appearEffectClasses = {
    none: '',
    'fade-in': 'animate-fade-in',
    'slide-up': 'animate-slide-up',
    'scale': 'animate-scale',
    'zoom-in': 'animate-zoom-in',
    'blur-in': 'animate-blur-in',
    'fade-up': 'animate-fade-up',
  };

  // Применяем hover-эффект scale для elevated варианта, если не задан другой
  const finalHoverEffect = variant === 'elevated' && hoverEffect === 'none' ? 'scale' : hoverEffect;

  // Определяем, является ли карточка интерактивной
  const isInteractive = !!onClick;

  // Составляем финальные классы
  const cardClasses = cn(
    baseClasses,
    variantClasses[variant],
    finalHoverEffect !== 'none' && hoverEffectClasses[finalHoverEffect],
    appearEffectClasses[appearEffect],
    isInteractive && 'cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2',
    !noPadding && 'p-4 md:p-6',
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
      data-testid={`card-${variant}`}
    >
      {children}
    </div>
  );
};

/**
 * Компонент CardHeader - заголовок карточки
 */
export const CardHeader: React.FC<CardHeaderProps> = ({ children, className = '' }) => {
  const classes = cn('flex items-center mb-4', className);
  return <div className={classes} data-testid="card-header">{children}</div>;
};

/**
 * Компонент CardTitle - название карточки
 */
export const CardTitle: React.FC<CardTitleProps> = ({ children, className = '' }) => {
  const classes = cn('text-lg font-semibold text-secondary-950 dark:text-secondary-50', className);
  return <div className={classes} data-testid="card-title">{children}</div>;
};

/**
 * Компонент CardContent - тело карточки
 */
export const CardContent: React.FC<CardContentProps> = ({ children, className = '' }) => {
  const classes = cn('', className);
  return <div className={classes} data-testid="card-content">{children}</div>;
};

/**
 * Компонент CardFooter - футер карточки
 */
export const CardFooter: React.FC<CardFooterProps> = ({ children, className = '' }) => {
  const classes = cn(
    'flex items-center justify-end mt-4 pt-4 border-t border-secondary-200 dark:border-secondary-700',
    className
  );
  return <div className={classes} data-testid="card-footer">{children}</div>;
};

export default Card;
