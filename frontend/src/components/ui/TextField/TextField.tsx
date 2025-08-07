import { cn } from '@utils/cn';
import React, { forwardRef, useState, useId } from 'react';

// Типы для размеров и вариантов текстового поля
export type TextFieldSize = 'sm' | 'md' | 'lg';
export type TextFieldVariant = 'outlined' | 'filled' | 'underlined' | 'floating';
export type TextFieldColor = 'primary' | 'secondary' | 'accent' | 'error' | 'warning' | 'success' | 'info';

/**
 * Интерфейс пропсов TextField
 */
export interface TextFieldProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  /** Иконка в начале поля ввода */
  startIcon?: React.ReactNode;
  /** Иконка в конце поля ввода */
  endIcon?: React.ReactNode;
  /** Вариант отображения */
  variant?: TextFieldVariant;
  /** Цвет акцента */
  color?: TextFieldColor;
  /** Размер */
  size?: TextFieldSize;
  /** Растягивать на всю ширину контейнера */
  fullWidth?: boolean;
  /** Обязательное поле */
  required?: boolean;
  /** Отключено ли поле */
  disabled?: boolean;
  /** Наличие ошибки */
  error?: boolean;
  /** Текст ошибки (отображается как helperText при error=true) */
  errorText?: React.ReactNode;
  /** Текст-подсказка под полем */
  helperText?: React.ReactNode;
  /** Метка поля */
  label?: string;
  /** Дополнительные классы */
  className?: string;
  /** Анимация появления */
  appearEffect?: 'none' | 'fade' | 'slide' | 'scale';
}

/**
 * TextField - компонент для ввода текста с использованием Tailwind CSS
 */
export const TextField = forwardRef<HTMLInputElement, TextFieldProps>(
  (
    {
      variant = 'outlined',
      color = 'primary',
      size = 'md',
      fullWidth = true,
      required = false,
      disabled = false,
      error = false,
      errorText,
      helperText,
      label,
      placeholder,
      startIcon,
      endIcon,
      className = '',
      appearEffect = 'none',
      onFocus,
      onBlur,
      ...props
    },
    ref
  ) => {
    const reactId = useId();
    const elementId = props.id || reactId;

    // Локальное состояние для отслеживания фокуса
    const [isFocused, setIsFocused] = useState(false);
    const [hasValue, setHasValue] = useState(Boolean(props.value || props.defaultValue));

    // Обработчики фокуса и изменения значения
    const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
      setIsFocused(true);
      onFocus?.(e);
    };

    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
      setIsFocused(false);
      setHasValue(Boolean(e.target.value));
      onBlur?.(e);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setHasValue(Boolean(e.target.value));
      props.onChange?.(e);
    };

    // Получаем активный цвет
    const activeColor = error ? 'error' : color;

    // Стили для разных вариантов отображения
    const variantClasses = {
      outlined: cn(
        'bg-transparent border rounded-md',
        error ? 'border-error-300 dark:border-error-600' : 'border-secondary-300 dark:border-secondary-600'
      ),
      filled: 'border-0 bg-secondary-100 dark:bg-secondary-800 rounded-md',
      underlined: cn(
        'border-0 border-b bg-transparent rounded-none px-0',
        error ? 'border-error-300 dark:border-error-600' : 'border-secondary-300 dark:border-secondary-600'
      ),
      floating: cn(
        'bg-transparent border rounded-md pt-5',
        error ? 'border-error-300 dark:border-error-600' : 'border-secondary-300 dark:border-secondary-600'
      ),
    };

    // Стили для разных размеров
    const sizeClasses = {
      sm: 'py-1 px-2 text-sm',
      md: 'py-2 px-3 text-base',
      lg: 'py-3 px-4 text-lg',
    };

    // Классы для эффектов появления
    const appearEffectClasses = {
      none: '',
      fade: 'animate-fade-in',
      slide: 'animate-slide-up',
      scale: 'animate-scale',
    };

    // Базовые стили для инпута
    const inputClasses = cn(
      'w-full transition-colors duration-200 outline-none focus:ring-2 focus:ring-offset-0',
      'placeholder-secondary-400 dark:placeholder-secondary-500 text-secondary-950 dark:text-secondary-50',
      'disabled:opacity-50 disabled:cursor-not-allowed',
      variantClasses[variant],
      sizeClasses[size],
      {
          'focus:border-primary-500 focus:ring-primary-500 dark:focus:border-primary-400 dark:focus:ring-primary-400': !error && color === 'primary',
          'focus:border-secondary-700 focus:ring-secondary-700 dark:focus:border-secondary-600 dark:focus:ring-secondary-600': !error && color === 'secondary',
          'focus:border-accent-500 focus:ring-accent-500 dark:focus:border-accent-400 dark:focus:ring-accent-400': !error && color === 'accent',
          'focus:border-success-500 focus:ring-success-500 dark:focus:border-success-400 dark:focus:ring-success-400': !error && color === 'success',
          'focus:border-warning-500 focus:ring-warning-500 dark:focus:border-warning-400 dark:focus:ring-warning-400': !error && color === 'warning',
          'focus:border-info-500 focus:ring-info-500 dark:focus:border-info-400 dark:focus:ring-info-400': !error && color === 'info',
          'focus:border-error-500 focus:ring-error-500 dark:focus:border-error-400 dark:focus:ring-error-400': error,
      },
      variant === 'floating' ? 'placeholder-transparent' : '',
      startIcon ? 'pl-10' : '',
      endIcon ? 'pr-10' : '',
      className
    );

    // Контейнер для компонента
    const containerClasses = cn(
      fullWidth ? 'w-full' : 'inline-block',
      appearEffectClasses[appearEffect]
    );

    // Классы для лейбла
    const labelClasses = cn(
      'block text-sm font-medium mb-1',
      isFocused ? {
          'text-primary-600 dark:text-primary-400': activeColor === 'primary',
          'text-secondary-800 dark:text-secondary-400': activeColor === 'secondary',
          'text-accent-600 dark:text-accent-400': activeColor === 'accent',
          'text-success-600 dark:text-success-400': activeColor === 'success',
          'text-warning-600 dark:text-warning-400': activeColor === 'warning',
          'text-info-600 dark:text-info-400': activeColor === 'info',
          'text-error-600 dark:text-error-400': activeColor === 'error',
      } : 'text-secondary-800 dark:text-secondary-300',
      disabled && 'opacity-50'
    );

    // Классы для плавающего лейбла
    const floatingLabelClasses = cn(
      'absolute text-sm transition-all duration-200',
      'left-2.5 bg-secondary-50 dark:bg-secondary-900 px-1 pointer-events-none',
      isFocused || hasValue
        ? cn(
            '-translate-y-3 scale-75 origin-left',
            {
                'text-primary-600 dark:text-primary-400': activeColor === 'primary',
                'text-secondary-800 dark:text-secondary-400': activeColor === 'secondary',
                'text-accent-600 dark:text-accent-400': activeColor === 'accent',
                'text-success-600 dark:text-success-400': activeColor === 'success',
                'text-warning-600 dark:text-warning-400': activeColor === 'warning',
                'text-info-600 dark:text-info-400': activeColor === 'info',
                'text-error-600 dark:text-error-400': activeColor === 'error',
            }
          )
        : 'text-secondary-500 dark:text-secondary-400 translate-y-2.5'
    );

    // Используем errorText как helperText при наличии ошибки
    const displayHelperText = error && errorText ? errorText : helperText;

    return (
      <div className={containerClasses}>
        {label && variant !== 'floating' && (
          <label htmlFor={elementId} className={labelClasses}>
            {label}
            {required && <span className="text-error-500 ml-1">*</span>}
          </label>
        )}

        <div className="relative">
          {startIcon && (
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <span className={cn('text-secondary-500 dark:text-secondary-400', isFocused && {
                  'text-primary-600 dark:text-primary-400': activeColor === 'primary',
                  'text-secondary-800 dark:text-secondary-400': activeColor === 'secondary',
                  'text-accent-600 dark:text-accent-400': activeColor === 'accent',
                  'text-success-600 dark:text-success-400': activeColor === 'success',
                  'text-warning-600 dark:text-warning-400': activeColor === 'warning',
                  'text-info-600 dark:text-info-400': activeColor === 'info',
                  'text-error-600 dark:text-error-400': activeColor === 'error',
              })}>
                {startIcon}
              </span>
            </div>
          )}

          <input
            ref={ref}
            id={elementId}
            className={inputClasses}
            disabled={disabled}
            required={required}
            placeholder={placeholder}
            onFocus={handleFocus}
            onBlur={handleBlur}
            onChange={handleChange}
            aria-invalid={error}
            {...(error && errorText ? { 'aria-errormessage': `${elementId}-error` } : {})}
            {...props}
          />

          {variant === 'floating' && label && (
            <label htmlFor={elementId} className={floatingLabelClasses}>
              {label}
              {required && <span className="text-error-500 ml-1">*</span>}
            </label>
          )}

          {endIcon && (
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
              <span className={cn('text-secondary-500 dark:text-secondary-400', isFocused && {
                  'text-primary-600 dark:text-primary-400': activeColor === 'primary',
                  'text-secondary-800 dark:text-secondary-400': activeColor === 'secondary',
                  'text-accent-600 dark:text-accent-400': activeColor === 'accent',
                  'text-success-600 dark:text-success-400': activeColor === 'success',
                  'text-warning-600 dark:text-warning-400': activeColor === 'warning',
                  'text-info-600 dark:text-info-400': activeColor === 'info',
                  'text-error-600 dark:text-error-400': activeColor === 'error',
              })}>
                {endIcon}
              </span>
            </div>
          )}
        </div>

        {displayHelperText && (
          <p
            id={`${elementId}-error`}
            className={cn(
              'text-xs mt-1',
              error ? 'text-error-600 dark:text-error-500' : 'text-secondary-600 dark:text-secondary-400'
            )}
            data-testid={`${elementId}-helper-text`}
          >
            {displayHelperText}
          </p>
        )}
      </div>
    );
  }
);

TextField.displayName = 'TextField';

export default TextField;
