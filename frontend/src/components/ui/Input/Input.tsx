import clsx from 'clsx';
import { forwardRef, InputHTMLAttributes, ReactNode } from 'react';

export interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
  /**
   * Лейбл поля ввода
   */
  label?: string;
  /**
   * Сообщение об ошибке
   */
  error?: string;
  /**
   * Подсказка под полем ввода
   */
  helperText?: string;
  /**
   * Размер поля ввода
   */
  size?: 'sm' | 'md' | 'lg';
  /**
   * Иконка слева от поля ввода
   */
  leftIcon?: ReactNode;
  /**
   * Иконка справа от поля ввода
   */
  rightIcon?: ReactNode;
  /**
   * Флаг, полностью растягивающий поле ввода
   */
  fullWidth?: boolean;
  /**
   * Дополнительный класс для обертки
   */
  wrapperClassName?: string;
  /**
   * Дополнительный класс для поля ввода
   */
  inputClassName?: string;
}

/**
 * Поле ввода - основной компонент для ввода текста
 */
export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      error,
      helperText,
      size = 'md',
      leftIcon,
      rightIcon,
      fullWidth = false,
      wrapperClassName,
      inputClassName,
      disabled,
      id,
      ...props
    },
    ref
  ) => {
    const uniqueId = id || `input-${Math.random().toString(36).substring(2, 9)}`;

    // Базовые классы для враппера
    const wrapperClasses = clsx('flex flex-col', fullWidth ? 'w-full' : '', wrapperClassName);

    // Базовые классы для поля ввода
    const baseInputClasses =
      'bg-white dark:bg-gray-900 border rounded-md focus:outline-none transition-colors';

    // Размер поля ввода
    const sizeClasses = {
      sm: 'text-xs py-1 px-2',
      md: 'text-sm py-2 px-3',
      lg: 'text-base py-3 px-4',
    };

    // Классы состояния
    const stateClasses = {
      normal:
        'border-gray-300 dark:border-gray-700 focus:ring-1 focus:ring-primary-500 focus:border-primary-500 dark:focus:border-primary-500',
      error:
        'border-red-500 focus:ring-1 focus:ring-red-500 focus:border-red-500 dark:border-red-500 dark:focus:border-red-500',
      disabled: 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 cursor-not-allowed',
    };

    // Классы с иконками
    const iconClasses = {
      left: leftIcon ? 'pl-9' : '',
      right: rightIcon ? 'pr-9' : '',
    };

    // Компоновка классов для поля ввода
    const inputClasses = clsx(
      baseInputClasses,
      sizeClasses[size],
      error ? stateClasses.error : stateClasses.normal,
      disabled ? stateClasses.disabled : '',
      iconClasses.left,
      iconClasses.right,
      'w-full',
      inputClassName
    );

    return (
      <div className={wrapperClasses}>
        {label && (
          <label
            htmlFor={uniqueId}
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
          >
            {label}
          </label>
        )}

        <div className="relative">
          {leftIcon && (
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-500">
              {leftIcon}
            </div>
          )}

          <input ref={ref} id={uniqueId} className={inputClasses} disabled={disabled} {...props} />

          {rightIcon && (
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-gray-500">
              {rightIcon}
            </div>
          )}
        </div>

        {(error || helperText) && (
          <div className="mt-1">
            {error ? (
              <p className="text-xs text-red-600 dark:text-red-400">{error}</p>
            ) : helperText ? (
              <p className="text-xs text-gray-500 dark:text-gray-400">{helperText}</p>
            ) : null}
          </div>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input;
