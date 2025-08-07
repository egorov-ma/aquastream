import { cn } from '@/lib/utils';
import React, { useId } from 'react';

import { Typography } from '../Typography';

export interface CheckboxProps {
  /**
   * Состояние переключателя (выбрано/не выбрано)
   */
  checked?: boolean;
  /**
   * Функция обратного вызова при изменении состояния
   */
  onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
  /**
   * Текстовая метка рядом с переключателем
   */
  label?: React.ReactNode;
  /**
   * Отключает переключатель
   */
  disabled?: boolean;
  /**
   * Показывает состояние ошибки
   */
  error?: boolean;
  /**
   * Размер переключателя
   */
  size?: 'small' | 'medium' | 'large';
  /**
   * Дополнительные CSS-классы
   */
  className?: string;
  /**
   * HTML id атрибут
   */
  id?: string;
  /**
   * Имя переключателя для форм
   */
  name?: string;
  /**
   * Значение переключателя
   */
  value?: string;
}

/**
 * Компонент Checkbox - переключатель для выбора значения
 */
export const Checkbox: React.FC<CheckboxProps> = ({
  checked = false,
  onChange,
  label,
  disabled = false,
  error = false,
  size = 'medium',
  className = '',
  id,
  name,
  value,
}) => {
  // Генерируем уникальный ID с помощью хука useId, если он не был передан
  const reactId = useId();
  const checkboxId = id || reactId;

  // Стили для разных размеров чекбокса
  const sizeClasses = {
    small: 'h-4 w-4',
    medium: 'h-5 w-5',
    large: 'h-6 w-6',
  };

  // Стили для метки в зависимости от размера
  const labelSizeClasses = {
    small: 'text-sm',
    medium: 'text-base',
    large: 'text-lg',
  };

  // Составляем классы для чекбокса
  const checkboxClasses = cn(
    'appearance-none',
    'rounded',
    'border',
    'transition-colors',
    'focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500',
    sizeClasses[size],
    {
      'bg-primary-600 border-primary-600 dark:bg-primary-500 dark:border-primary-500': checked && !disabled && !error,
      'bg-secondary-50 border-secondary-300 dark:bg-secondary-800 dark:border-secondary-600':
        !checked && !disabled && !error,
      'bg-secondary-200 border-secondary-200 dark:bg-secondary-700 dark:border-secondary-700':
        disabled,
      'border-error-500 dark:border-error-400': error,
      'cursor-pointer': !disabled,
      'cursor-not-allowed opacity-60': disabled,
    },
    className
  );

  // Классы для контейнера чекбокса и метки
  const containerClasses = cn('flex items-center', {
    'cursor-pointer': !disabled,
    'cursor-not-allowed opacity-60': disabled,
  });

  // Классы для видимого индикатора чекбокса (галочка)
  const indicatorClasses = cn('absolute inset-0 flex items-center justify-center', {
    'text-primary-100': checked && !disabled,
    'text-secondary-400 dark:text-secondary-500': checked && disabled,
  });

  return (
    <label htmlFor={checkboxId} className={containerClasses}>
      <div className="relative flex-shrink-0">
        <input
          type="checkbox"
          id={checkboxId}
          checked={checked}
          onChange={onChange}
          disabled={disabled}
          aria-invalid={error}
          name={name}
          value={value}
          data-testid={checkboxId}
          className={checkboxClasses}
        />
        {checked && (
          <div className={indicatorClasses}>
            <svg viewBox="0 0 24 24" fill="none" className="h-3/4 w-3/4">
              <path
                d="M5 12L10 17L19 8"
                stroke="currentColor"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
        )}
      </div>
      {label && (
        <div className="ml-2 flex items-center">
          {typeof label === 'string' ? (
            <Typography
              variant="body-2"
              color={error ? 'error' : undefined}
              className={labelSizeClasses[size]}
            >
              {label}
            </Typography>
          ) : (
            label
          )}
        </div>
      )}
    </label>
  );
};
