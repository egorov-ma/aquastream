import clsx from 'clsx';
import React, { forwardRef, useCallback, useId, useState } from 'react';

export type InputSize = 'sm' | 'md' | 'lg';
export type InputVariant = 'outlined' | 'filled' | 'underlined' | 'floating';
export type InputColor =
  | 'primary'
  | 'secondary'
  | 'accent'
  | 'error'
  | 'warning'
  | 'success'
  | 'info';

export interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  /** Лейбл поля ввода */
  label?: string;
  /** Сообщение об ошибке */
  error?: string;
  /** Подсказка под полем ввода */
  helperText?: string;
  /** Вариант отображения */
  variant?: InputVariant;
  /** Цвет акцента */
  color?: InputColor;
  /** Размер поля ввода */
  size?: InputSize;
  /** Растягивать на всю ширину */
  fullWidth?: boolean;
  /** Иконка слева */
  leftIcon?: React.ReactNode;
  /** Иконка справа */
  rightIcon?: React.ReactNode;
  /** Дополнительный класс для обёртки */
  wrapperClassName?: string;
  /** Дополнительный класс для input */
  inputClassName?: string;
  /** Отображать кнопку очистки */
  clearable?: boolean;
  /** Обработчик очистки */
  onClear?: () => void;
  /** Эффект появления */
  appearEffect?: 'none' | 'fade' | 'slide' | 'scale';
}

/**
 * Унифицированный компонент поля ввода
 */
export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      error,
      helperText,
      variant = 'outlined',
      color = 'primary',
      size = 'md',
      fullWidth = false,
      leftIcon,
      rightIcon,
      wrapperClassName,
      inputClassName,
      clearable = false,
      onClear,
      id,
      disabled,
      value,
      onChange,
      appearEffect = 'none',
      ...props
    },
    ref
  ) => {
    const reactId = useId();
    const elementId = id || reactId;

    const [isFocused, setIsFocused] = useState(false);
    const [hasValue, setHasValue] = useState(Boolean(value || props.defaultValue));

    const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
      setIsFocused(true);
      props.onFocus?.(e);
    };

    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
      setIsFocused(false);
      setHasValue(Boolean(e.target.value));
      props.onBlur?.(e);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setHasValue(Boolean(e.target.value));
      onChange?.(e);
    };

    const handleClear = useCallback(() => {
      onClear?.();

      if (onChange) {
        const pseudoEvent = {
          target: { value: '' } as HTMLInputElement,
          currentTarget: { value: '' } as HTMLInputElement,
        } as React.ChangeEvent<HTMLInputElement>;
        onChange(pseudoEvent);
      }
      setHasValue(false);
    }, [onChange, onClear]);

    const hasError = Boolean(error);
    const activeColor = hasError ? 'error' : color;

    const variantClasses: Record<InputVariant, string> = {
      outlined: clsx(
        'bg-transparent border rounded-md',
        hasError ? 'border-error-300 dark:border-error-600' : 'border-secondary-300 dark:border-secondary-600'
      ),
      filled: 'border-0 bg-secondary-100 dark:bg-secondary-800 rounded-md',
      underlined: clsx(
        'border-0 border-b bg-transparent rounded-none px-0',
        hasError ? 'border-error-300 dark:border-error-600' : 'border-secondary-300 dark:border-secondary-600'
      ),
      floating: clsx(
        'bg-transparent border rounded-md pt-5',
        hasError ? 'border-error-300 dark:border-error-600' : 'border-secondary-300 dark:border-secondary-600'
      ),
    };

    const sizeClasses: Record<InputSize, string> = {
      sm: 'py-1 px-2 text-sm',
      md: 'py-2 px-3 text-base',
      lg: 'py-3 px-4 text-lg',
    };

    const appearEffectClasses = {
      none: '',
      fade: 'animate-fade-in',
      slide: 'animate-slide-up',
      scale: 'animate-scale',
    };

    const showClearButton = clearable && value && !disabled;

    const inputClasses = clsx(
      'w-full transition-colors duration-200 outline-none focus:ring-2 focus:ring-offset-0',
      'placeholder-secondary-400 dark:placeholder-secondary-500 text-secondary-950 dark:text-secondary-50',
      'disabled:opacity-50 disabled:cursor-not-allowed',
      variantClasses[variant],
      sizeClasses[size],
      {
        'focus:border-primary-500 focus:ring-primary-500 dark:focus:border-primary-400 dark:focus:ring-primary-400':
          !hasError && color === 'primary',
        'focus:border-secondary-700 focus:ring-secondary-700 dark:focus:border-secondary-600 dark:focus:ring-secondary-600':
          !hasError && color === 'secondary',
        'focus:border-accent-500 focus:ring-accent-500 dark:focus:border-accent-400 dark:focus:ring-accent-400':
          !hasError && color === 'accent',
        'focus:border-success-500 focus:ring-success-500 dark:focus:border-success-400 dark:focus:ring-success-400':
          !hasError && color === 'success',
        'focus:border-warning-500 focus:ring-warning-500 dark:focus:border-warning-400 dark:focus:ring-warning-400':
          !hasError && color === 'warning',
        'focus:border-info-500 focus:ring-info-500 dark:focus:border-info-400 dark:focus:ring-info-400':
          !hasError && color === 'info',
        'focus:border-error-500 focus:ring-error-500 dark:focus:border-error-400 dark:focus:ring-error-400': hasError,
      },
      variant === 'floating' ? 'placeholder-transparent' : '',
      leftIcon ? 'pl-10' : '',
      (rightIcon || showClearButton) ? 'pr-10' : '',
      inputClassName
    );

    const containerClasses = clsx(
      'flex flex-col',
      fullWidth ? 'w-full' : 'inline-block',
      appearEffectClasses[appearEffect],
      wrapperClassName
    );

    const labelClasses = clsx(
      'block text-sm font-medium mb-1',
      isFocused
        ? {
            'text-primary-600 dark:text-primary-400': activeColor === 'primary',
            'text-secondary-800 dark:text-secondary-400': activeColor === 'secondary',
            'text-accent-600 dark:text-accent-400': activeColor === 'accent',
            'text-success-600 dark:text-success-400': activeColor === 'success',
            'text-warning-600 dark:text-warning-400': activeColor === 'warning',
            'text-info-600 dark:text-info-400': activeColor === 'info',
            'text-error-600 dark:text-error-400': activeColor === 'error',
          }
        : 'text-secondary-800 dark:text-secondary-300',
      disabled && 'opacity-50'
    );

    const floatingLabelClasses = clsx(
      'absolute text-sm transition-all duration-200',
      'left-2.5 bg-secondary-50 dark:bg-secondary-900 px-1 pointer-events-none',
      isFocused || hasValue
        ? clsx('-translate-y-3 scale-75 origin-left', {
            'text-primary-600 dark:text-primary-400': activeColor === 'primary',
            'text-secondary-800 dark:text-secondary-400': activeColor === 'secondary',
            'text-accent-600 dark:text-accent-400': activeColor === 'accent',
            'text-success-600 dark:text-success-400': activeColor === 'success',
            'text-warning-600 dark:text-warning-400': activeColor === 'warning',
            'text-info-600 dark:text-info-400': activeColor === 'info',
            'text-error-600 dark:text-error-400': activeColor === 'error',
          })
        : 'text-secondary-500 dark:text-secondary-400 translate-y-2.5'
    );

    const displayHelperText = error ? error : helperText;

    return (
      <div className={containerClasses}>
        {label && variant !== 'floating' && (
          <label htmlFor={elementId} className={labelClasses} data-testid={`${elementId}-label`}>
            {label}
          </label>
        )}

        <div className="relative">
          {leftIcon && (
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 text-secondary-500">
              {leftIcon}
            </div>
          )}

          <input
            ref={ref}
            id={elementId}
            className={inputClasses}
            disabled={disabled}
            value={value}
            onFocus={handleFocus}
            onBlur={handleBlur}
            onChange={handleChange}
            {...props}
          />

          {variant === 'floating' && label && (
            <label htmlFor={elementId} className={floatingLabelClasses} data-testid={`${elementId}-floating-label`}>
              {label}
            </label>
          )}

          {showClearButton && (
            <button
              type="button"
              onClick={handleClear}
              className="absolute inset-y-0 right-0 flex items-center pr-3 text-secondary-400 hover:text-secondary-600 dark:hover:text-secondary-300 transition-colors"
              data-testid={`${elementId}-clear-button`}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          )}

          {rightIcon && !showClearButton && (
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 text-secondary-500">
              {rightIcon}
            </div>
          )}
        </div>

        {displayHelperText && (
          <p
            className={clsx(
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

Input.displayName = 'Input';

export default Input;
