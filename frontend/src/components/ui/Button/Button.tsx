import { cn } from '@/lib/utils';
import React from 'react';

import { ButtonProps, ButtonSize } from './Button.types';

// Добавляем компонент спиннера для состояния loading
const Spinner: React.FC<{ sizeClass: string }> = ({ sizeClass }) => (
  <svg
    className={`animate-spin -ml-1 mr-3 ${sizeClass} text-current`}
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
  >
    <circle
      className="opacity-25"
      cx="12"
      cy="12"
      r="10"
      stroke="currentColor"
      strokeWidth="4"
    ></circle>
    <path
      className="opacity-75"
      fill="currentColor"
      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
    ></path>
  </svg>
);

/**
 * Кнопка - базовый UI компонент для взаимодействия пользователя
 */
export const Button: React.FC<ButtonProps> = ({
  children,
  className,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  disabled = false,
  loading = false,
  type = 'button',
  onClick,
  ...props
}) => {
  const baseClasses =
    'inline-flex items-center justify-center rounded-md font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-secondary-900';

  const variantClasses: Record<string, string> = {
    primary:
      'bg-primary-600 text-secondary-50 hover:bg-primary-700 focus:ring-primary-500 active:bg-primary-800 dark:bg-primary-500 dark:hover:bg-primary-600 dark:focus:ring-primary-400 dark:active:bg-primary-700',
    secondary:
      'bg-secondary-700 text-secondary-50 hover:bg-secondary-800 focus:ring-secondary-600 active:bg-secondary-900 dark:bg-secondary-600 dark:hover:bg-secondary-700 dark:focus:ring-secondary-500 dark:active:bg-secondary-800',
    outline:
      'bg-transparent border border-primary-600 text-primary-600 hover:bg-primary-50 dark:text-primary-400 dark:border-primary-400 dark:hover:bg-primary-900/20 focus:ring-primary-500 active:bg-primary-100 dark:active:bg-primary-900/30',
    danger:
      'bg-error-600 text-secondary-50 hover:bg-error-700 focus:ring-error-500 active:bg-error-800 dark:focus:ring-error-400',
    accent:
      'bg-accent-400 text-secondary-950 hover:bg-accent-500 focus:ring-accent-300 active:bg-accent-600 dark:focus:ring-accent-200',
    ghost:
      'bg-transparent text-secondary-700 hover:bg-secondary-100 focus:ring-secondary-500 active:bg-secondary-200 dark:text-secondary-300 dark:hover:bg-secondary-700 dark:focus:ring-secondary-400 dark:active:bg-secondary-600',
  };

  const sizeClasses: Record<ButtonSize, string> = {
    sm: 'text-sm px-3 py-1.5',
    md: 'text-base px-4 py-2',
    lg: 'text-lg px-6 py-3',
  };

  const spinnerSizeClasses: Record<ButtonSize, string> = {
    sm: 'h-4 w-4',
    md: 'h-5 w-5',
    lg: 'h-6 w-6',
  };

  const widthClass = fullWidth ? 'w-full' : '';
  const isDisabled = disabled || loading;
  const disabledClass = isDisabled ? 'opacity-50 cursor-not-allowed' : '';

  const normalizedSize = size;

  const buttonClasses = cn(
    baseClasses,
    variantClasses[variant === 'outlined' ? 'outline' : variant],
    sizeClasses[size],
    widthClass,
    disabledClass,
    className
  );

  return (
    <button
      type={type}
      className={buttonClasses}
      disabled={isDisabled}
      onClick={onClick}
      data-testid={`button-${variant}`}
      {...props}
    >
      {loading && <Spinner sizeClass={spinnerSizeClasses[normalizedSize]} />}
      {children}
    </button>
  );
};
