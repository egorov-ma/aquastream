import clsx from 'clsx';
import React, { forwardRef, useState } from 'react';

// Типы для размеров и вариантов текстового поля
export type TextFieldSize = 'sm' | 'md' | 'lg';
export type TextFieldVariant = 'outlined' | 'filled' | 'underlined' | 'floating';
export type TextFieldColor = 'primary' | 'secondary' | 'error' | 'warning' | 'success' | 'info';

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
const TextField = forwardRef<HTMLInputElement, TextFieldProps>(
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

    // Определение цветовых классов
    const colorClasses = {
      primary: {
        border: 'border-gray-300 dark:border-gray-600',
        focus:
          'focus:border-primary-500 focus:ring-primary-500 dark:focus:border-primary-400 dark:focus:ring-primary-400',
        text: 'text-primary-600 dark:text-primary-400',
      },
      secondary: {
        border: 'border-gray-300 dark:border-gray-600',
        focus:
          'focus:border-gray-500 focus:ring-gray-500 dark:focus:border-gray-400 dark:focus:ring-gray-400',
        text: 'text-gray-600 dark:text-gray-400',
      },
      error: {
        border: 'border-red-300 dark:border-red-600',
        focus:
          'focus:border-red-500 focus:ring-red-500 dark:focus:border-red-400 dark:focus:ring-red-400',
        text: 'text-red-600 dark:text-red-400',
      },
      warning: {
        border: 'border-yellow-300 dark:border-yellow-600',
        focus:
          'focus:border-yellow-500 focus:ring-yellow-500 dark:focus:border-yellow-400 dark:focus:ring-yellow-400',
        text: 'text-yellow-600 dark:text-yellow-400',
      },
      success: {
        border: 'border-green-300 dark:border-green-600',
        focus:
          'focus:border-green-500 focus:ring-green-500 dark:focus:border-green-400 dark:focus:ring-green-400',
        text: 'text-green-600 dark:text-green-400',
      },
      info: {
        border: 'border-blue-300 dark:border-blue-600',
        focus:
          'focus:border-blue-500 focus:ring-blue-500 dark:focus:border-blue-400 dark:focus:ring-blue-400',
        text: 'text-blue-600 dark:text-blue-400',
      },
    };

    // Получаем цветовые классы в зависимости от статуса ошибки
    const activeColor = error ? 'error' : color;
    const { border, focus, text } = colorClasses[activeColor];

    // Стили для разных вариантов отображения
    const variantClasses = {
      outlined: `bg-transparent border ${border} rounded-md`,
      filled: 'border-0 bg-gray-100 dark:bg-gray-700 rounded-md',
      underlined: `border-0 border-b ${border} bg-transparent rounded-none px-0`,
      floating: `bg-transparent border ${border} rounded-md pt-5`,
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
    const inputClasses = clsx(
      'w-full transition-colors duration-200 outline-none focus:ring-2 focus:ring-offset-0',
      'placeholder-gray-400 dark:placeholder-gray-500 text-gray-900 dark:text-white',
      'disabled:opacity-50 disabled:cursor-not-allowed',
      variantClasses[variant],
      sizeClasses[size],
      focus,
      variant === 'floating' ? 'placeholder-transparent' : '',
      startIcon ? 'pl-10' : '',
      endIcon ? 'pr-10' : '',
      className
    );

    // Контейнер для компонента
    const containerClasses = clsx(
      fullWidth ? 'w-full' : 'inline-block',
      appearEffectClasses[appearEffect]
    );

    // Классы для лейбла
    const labelClasses = clsx(
      'block text-sm font-medium mb-1',
      isFocused ? text : 'text-gray-700 dark:text-gray-300',
      disabled && 'opacity-50'
    );

    // Классы для плавающего лейбла
    const floatingLabelClasses = clsx(
      'absolute text-sm transition-all duration-200',
      'left-2.5 bg-white dark:bg-gray-800 px-1 pointer-events-none',
      isFocused || hasValue
        ? `${text} -translate-y-3 scale-75 origin-left`
        : 'text-gray-500 dark:text-gray-400 translate-y-2.5'
    );

    // Используем errorText как helperText при наличии ошибки
    const displayHelperText = error && errorText ? errorText : helperText;

    return (
      <div className={containerClasses}>
        {label && variant !== 'floating' && (
          <label className={labelClasses}>
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}

        <div className="relative">
          {startIcon && (
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <span className={clsx('text-gray-500 dark:text-gray-400', isFocused && text)}>
                {startIcon}
              </span>
            </div>
          )}

          <input
            ref={ref}
            className={inputClasses}
            disabled={disabled}
            required={required}
            placeholder={placeholder}
            onFocus={handleFocus}
            onBlur={handleBlur}
            onChange={handleChange}
            aria-invalid={error}
            {...(error && errorText ? { 'aria-errormessage': `${props.id}-error` } : {})}
            {...props}
          />

          {variant === 'floating' && label && (
            <label className={floatingLabelClasses}>
              {label}
              {required && <span className="text-red-500 ml-1">*</span>}
            </label>
          )}

          {endIcon && (
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
              <span className={clsx('text-gray-500 dark:text-gray-400', isFocused && text)}>
                {endIcon}
              </span>
            </div>
          )}
        </div>

        {displayHelperText && (
          <p
            id={error && props.id ? `${props.id}-error` : undefined}
            className={clsx(
              'mt-1.5 text-xs',
              error ? 'text-red-600 dark:text-red-400' : 'text-gray-500 dark:text-gray-400'
            )}
            role={error ? 'alert' : undefined}
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
