import clsx from 'clsx';
import React from 'react';

import Typography from '../Typography';

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
const Checkbox: React.FC<CheckboxProps> = ({
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
  // Генерируем уникальный ID, если он не был передан
  const checkboxId = id || `checkbox-${Math.random().toString(36).substring(2, 9)}`;

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
  const checkboxClasses = clsx(
    'appearance-none',
    'rounded',
    'border',
    'transition-colors',
    'focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500',
    sizeClasses[size],
    {
      'bg-primary-600 border-primary-600': checked && !disabled && !error,
      'bg-white border-secondary-300 dark:bg-secondary-800 dark:border-secondary-600':
        !checked && !disabled && !error,
      'bg-secondary-200 border-secondary-200 dark:bg-secondary-700 dark:border-secondary-700':
        disabled,
      'border-red-500 dark:border-red-400': error,
      'cursor-pointer': !disabled,
      'cursor-not-allowed opacity-60': disabled,
    },
    className
  );

  // Классы для контейнера чекбокса и метки
  const containerClasses = clsx('flex items-center', {
    'cursor-pointer': !disabled,
    'cursor-not-allowed opacity-60': disabled,
  });

  // Классы для видимого индикатора чекбокса (галочка)
  const indicatorClasses = clsx('absolute inset-0 flex items-center justify-center text-white', {
    'text-white': checked && !disabled,
    'text-secondary-700': checked && disabled,
  });

  return (
    <label htmlFor={checkboxId} className={containerClasses}>
      <div className="relative">
        <input
          type="checkbox"
          id={checkboxId}
          checked={checked}
          onChange={onChange}
          disabled={disabled}
          aria-invalid={error}
          name={name}
          value={value}
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
        <div className="ml-2">
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

export default Checkbox;
